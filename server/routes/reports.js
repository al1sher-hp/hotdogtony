const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get statistics (boss)
router.get('/stats', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { period = 'daily' } = req.query; // daily, weekly, monthly

        let startDate = new Date();

        // Set start date based on period
        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'monthly') {
            startDate.setDate(1);
            startDate.setHours(0, 0, 0, 0);
        }

        // Get orders in period
        const orders = await Order.find({
            createdAt: { $gte: startDate }
        }).populate('items.menuItem');

        // Calculate statistics
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);

        const completedOrders = orders.filter(o => o.status === 'completed').length;
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        const preparingOrders = orders.filter(o => o.status === 'preparing').length;
        const readyOrders = orders.filter(o => o.status === 'ready').length;

        // Get popular items
        const itemCounts = {};
        orders.forEach(order => {
            order.items.forEach(item => {
                const itemName = item.menuItem.name;
                itemCounts[itemName] = (itemCounts[itemName] || 0) + item.quantity;
            });
        });

        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Get feedback statistics
        const feedbacks = await Feedback.find({
            createdAt: { $gte: startDate }
        });

        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
            : 0;

        // Hourly distribution (for charts)
        const hourlyOrders = Array(24).fill(0);
        orders.forEach(order => {
            const hour = new Date(order.createdAt).getHours();
            hourlyOrders[hour]++;
        });

        // Daily revenue (last 7 days for weekly/monthly)
        const dailyRevenue = [];
        if (period === 'weekly' || period === 'monthly') {
            const days = period === 'weekly' ? 7 : 30;
            for (let i = days - 1; i >= 0; i--) {
                const dayStart = new Date();
                dayStart.setDate(dayStart.getDate() - i);
                dayStart.setHours(0, 0, 0, 0);

                const dayEnd = new Date(dayStart);
                dayEnd.setHours(23, 59, 59, 999);

                const dayOrders = orders.filter(o =>
                    o.createdAt >= dayStart && o.createdAt <= dayEnd
                );

                const revenue = dayOrders.reduce((sum, o) => sum + o.totalPrice, 0);

                dailyRevenue.push({
                    date: dayStart.toISOString().split('T')[0],
                    revenue,
                    orders: dayOrders.length
                });
            }
        }

        res.json({
            period,
            stats: {
                totalOrders,
                totalRevenue,
                averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
                completedOrders,
                pendingOrders,
                preparingOrders,
                readyOrders,
                averageRating: avgRating.toFixed(1),
                totalFeedbacks: feedbacks.length
            },
            popularItems,
            hourlyOrders,
            dailyRevenue: period !== 'daily' ? dailyRevenue : []
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to get statistics' });
    }
});

// Export data (boss) - Returns JSON for Excel/PDF conversion on frontend
router.get('/export', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { period = 'monthly', type = 'orders' } = req.query;

        let startDate = new Date();

        if (period === 'daily') {
            startDate.setHours(0, 0, 0, 0);
        } else if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'monthly') {
            startDate.setDate(1);
        }

        if (type === 'orders') {
            const orders = await Order.find({
                createdAt: { $gte: startDate }
            }).populate('items.menuItem');

            const exportData = orders.map(order => ({
                orderNumber: order.dailyNumber,
                customerName: order.customerName,
                items: order.items.map(i => `${i.menuItem.name} x${i.quantity}`).join(', '),
                totalPrice: order.totalPrice,
                status: order.status,
                createdAt: order.createdAt,
                readyAt: order.readyAt || 'N/A'
            }));

            res.json({ exportData, period, type });
        } else if (type === 'feedback') {
            const feedbacks = await Feedback.find({
                createdAt: { $gte: startDate }
            }).populate({
                path: 'order',
                populate: 'items.menuItem'
            });

            const exportData = feedbacks.map(feedback => ({
                orderNumber: feedback.order.dailyNumber,
                customerName: feedback.order.customerName,
                rating: feedback.rating,
                comment: feedback.comment || 'No comment',
                createdAt: feedback.createdAt
            }));

            res.json({ exportData, period, type });
        }
    } catch (error) {
        console.error('Export data error:', error);
        res.status(500).json({ error: 'Failed to export data' });
    }
});

module.exports = router;
