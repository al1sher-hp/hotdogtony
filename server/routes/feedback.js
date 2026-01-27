const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Submit feedback (customer)
router.post('/', async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        if (!orderId || !rating) {
            return res.status(400).json({
                error: 'Order ID and rating are required'
            });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        }

        // Check if order exists
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Check if feedback already exists
        if (order.feedback) {
            return res.status(400).json({ error: 'Feedback already submitted for this order' });
        }

        // Create feedback
        const feedback = new Feedback({
            order: orderId,
            rating,
            comment: comment || ''
        });

        await feedback.save();

        // Update order with feedback reference
        order.feedback = feedback._id;
        await order.save();

        res.status(201).json({ feedback });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ error: 'Failed to submit feedback' });
    }
});

// Get all feedback (boss)
router.get('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { rating, limit = 100 } = req.query;
        let query = {};

        if (rating) {
            query.rating = parseInt(rating);
        }

        const feedbacks = await Feedback.find(query)
            .populate({
                path: 'order',
                populate: {
                    path: 'items.menuItem'
                }
            })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit));

        // Calculate average rating
        const avgRating = feedbacks.length > 0
            ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
            : 0;

        res.json({
            feedbacks,
            stats: {
                total: feedbacks.length,
                averageRating: avgRating.toFixed(1)
            }
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

// Get feedback for specific order
router.get('/order/:orderId', async (req, res) => {
    try {
        const feedback = await Feedback.findOne({ order: req.params.orderId })
            .populate('order');

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        res.json({ feedback });
    } catch (error) {
        console.error('Get order feedback error:', error);
        res.status(500).json({ error: 'Failed to get feedback' });
    }
});

// Delete feedback (super-admin only)
router.delete('/:id', auth, roleCheck('super-admin'), async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }
        res.json({ message: 'Feedback deleted successfully' });
    } catch (error) {
        console.error('Delete feedback error:', error);
        res.status(500).json({ error: 'Failed to delete feedback' });
    }
});

module.exports = router;
