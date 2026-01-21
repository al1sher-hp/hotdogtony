const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendMagicLink } = require('../utils/emailService');
const auth = require('../middleware/auth');

// Send magic link to customer
router.post('/send-magic-link', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email and name are required' });
        }

        // Generate magic link token
        const magicToken = uuidv4();
        const magicExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Find or create customer
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                role: 'customer',
                magicLinkToken: magicToken,
                magicLinkExpires: magicExpires
            });
        } else {
            user.magicLinkToken = magicToken;
            user.magicLinkExpires = magicExpires;
            user.name = name; // Update name if changed
        }

        await user.save();

        // Send email
        await sendMagicLink(email, magicToken);

        res.json({
            message: 'Magic link sent to your email',
            email
        });
    } catch (error) {
        console.error('Send magic link error:', error);
        res.status(500).json({ error: 'Failed to send magic link' });
    }
});

// Verify magic link and login
router.get('/verify-magic-link/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with valid token
        const user = await User.findOne({
            magicLinkToken: token,
            magicLinkExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired magic link' });
        }

        // Clear magic link token
        user.magicLinkToken = undefined;
        user.magicLinkExpires = undefined;
        await user.save();

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Verify magic link error:', error);
        res.status(500).json({ error: 'Failed to verify magic link' });
    }
});

// Login for employee/boss/super-admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email });

        if (!user || user.role === 'customer') {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
                favoriteItems: req.user.favoriteItems
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

module.exports = router;
