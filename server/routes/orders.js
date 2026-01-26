const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { generateOrderQR, verifyQRCode } = require('../utils/qrGenerator');

// Create new order (customer)
router.post('/', async (req, res) => {
    try {
        const { customerName, customerEmail, items } = req.body;

        if (!customerName || !items || items.length === 0) {
            return res.status(400).json({ error: 'Customer name and items are required' });
        }

        // Calculate total price and validate items
        let totalPrice = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.menuItemId);

            if (!menuItem) {
                return res.status(404).json({ error: `Menu item not found: ${item.menuItemId}` });
            }

            if (!menuItem.available) {
                return res.status(400).json({ error: `${menuItem.name} is not available` });
            }

            orderItems.push({
                menuItem: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price
            });

            totalPrice += menuItem.price * item.quantity;
        }

        // Get daily number (count orders from today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyOrderCount = await Order.countDocuments({
            createdAt: { $gte: today }
        });

        const dailyNumber = dailyOrderCount + 1;

        // Generate final QR data first
        const qrCode = `HDS-${uuidv4()}`;

        // Create final order object
        const order = new Order({
            customerName,
            customerEmail: customerEmail || undefined,
            items: orderItems,
            totalPrice,
            dailyNumber,
            qrCode: qrCode
        });

        await order.save();
        await order.populate('items.menuItem');

        // Note: No socket emission here to prevent fake/unpaid orders from showing on dashboard

        res.status(201).json({
            order,
            qrCode // Plain code
        });
    } catch (error) {
        console.error('Create order error details:', error);
        res.status(500).json({
            error: 'Failed to create order',
            message: error.message
        });
    }
});

// Get orders for display screen (PUBLIC - no auth required)
router.get('/display', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

        const preparingOrders = await Order.find({
            status: 'preparing',
            createdAt: { $gte: today }
        })
            .select('dailyNumber customerName status')
            .sort({ createdAt: -1 })
            .limit(20);

        const readyOrders = await Order.find({
            status: 'ready',
            readyAt: { $gte: oneMinuteAgo } // Only show orders ready in the last 60 seconds
        })
            .select('dailyNumber customerName status readyAt')
            .sort({ readyAt: -1 })
            .limit(10);

        res.json({ preparing: preparingOrders, ready: readyOrders });
    } catch (error) {
        console.error('Get display orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get all orders (role-based)
router.get('/', auth, async (req, res) => {
    try {
        const { status, limit = 50 } = req.query;
        let query = {};

        // Filter based on role
        if (req.user.role === 'customer') {
            query.customerEmail = req.user.email;
        } else if (status) {
            query.status = status;
        }

        const orders = await Order.find(query)
            .populate('items.menuItem')
            .populate('feedback')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

// Get single order
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.menuItem')
            .populate('feedback');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({ order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Failed to get order' });
    }
});

// Confirm order (employee/boss)
router.patch('/:id/confirm', auth, roleCheck(['employee', 'boss', 'super-admin']), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status !== 'pending') {
            return res.status(400).json({ error: 'Order already confirmed' });
        }

        order.status = 'preparing';
        order.confirmedAt = new Date();
        await order.save();

        await order.populate('items.menuItem');

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('orderUpdated', order);
        }

        res.json({ order });
    } catch (error) {
        console.error('Confirm order error:', error);
        res.status(500).json({ error: 'Failed to confirm order' });
    }
});

// Mark order as ready (employee/boss)
router.patch('/:id/ready', auth, roleCheck(['employee', 'boss', 'super-admin']), async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.status === 'ready' || order.status === 'completed') {
            return res.status(400).json({ error: 'Order already ready or completed' });
        }

        order.status = 'ready';
        order.readyAt = new Date();
        await order.save();

        await order.populate('items.menuItem');

        // Emit socket event
        if (req.app.get('io')) {
            req.app.get('io').emit('orderReady', order);
        }

        res.json({ order });
    } catch (error) {
        console.error('Mark ready error:', error);
        res.status(500).json({ error: 'Failed to mark order as ready' });
    }
});

// Verify QR code
router.post('/verify-qr', auth, roleCheck(['employee', 'boss', 'super-admin']), async (req, res) => {
    try {
        const { qrData } = req.body;

        if (!qrData) {
            return res.status(400).json({ error: 'QR data is required' });
        }

        // Verify QR code
        const parsed = verifyQRCode(qrData);

        // Find order
        const order = await Order.findById(parsed.orderId)
            .populate('items.menuItem');

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.qrCode !== parsed.code) {
            return res.status(400).json({ error: 'Invalid QR code' });
        }

        // If order is pending, automatically confirm it and set to preparing
        if (order.status === 'pending') {
            order.status = 'preparing';
            order.confirmedAt = new Date();
            await order.save();

            // Emit socket event for real-time updates
            if (req.app.get('io')) {
                req.app.get('io').emit('orderUpdated', order);
            }
        }

        res.json({
            order,
            valid: true,
            statusChanged: true
        });
    } catch (error) {
        console.error('Verify QR error:', error);
        res.status(400).json({ error: error.message || 'Invalid QR code' });
    }
});

// Get customer orders (for profile)
router.get('/my/orders', auth, roleCheck('customer'), async (req, res) => {
    try {
        const orders = await Order.find({ customerEmail: req.user.email })
            .populate('items.menuItem')
            .populate('feedback')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ orders });
    } catch (error) {
        console.error('Get customer orders error:', error);
        res.status(500).json({ error: 'Failed to get orders' });
    }
});

module.exports = router;
