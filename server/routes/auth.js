const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { sendMagicLink } = require('../utils/emailService');
const auth = require('../middleware/auth');

// Customer Register (Email + Password)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Ism, email va parol kiritilishi shart' });
        }

        if (password.length < 4) {
            return res.status(400).json({ error: 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak' });
        }

        // Check if email exists
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                error: `Bu email allaqachon ro'yxatdan o'tgan (${existingUser.role === 'customer' ? 'mijoz' : 'xodim'} sifatida).`
            });
        }

        // Create customer
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password,
            role: 'customer'
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
        }
        res.status(500).json({ error: 'Ro\'yxatdan o\'tishda xatolik' });
    }
});

// Customer Login (Email + Password)
router.post('/customer-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email va parol kiritilishi shart' });
        }

        // Find customer
        const user = await User.findOne({
            email: email.toLowerCase().trim(),
            role: 'customer'
        });

        if (!user) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
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
        console.error('Customer login error:', error);
        res.status(500).json({ error: 'Kirishda xatolik' });
    }
});

// Send magic link (optional - may not work without email config)
router.post('/send-magic-link', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email || !name) {
            return res.status(400).json({ error: 'Email va ism kiritilishi shart' });
        }

        // Check if email service is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
            return res.status(400).json({
                error: 'Email xizmati sozlanmagan. Iltimos, parol bilan ro\'yxatdan o\'ting.'
            });
        }

        const magicToken = uuidv4();
        const magicExpires = new Date(Date.now() + 15 * 60 * 1000);

        let user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            user = new User({
                email: email.toLowerCase().trim(),
                name: name.trim(),
                role: 'customer',
                magicLinkToken: magicToken,
                magicLinkExpires: magicExpires
            });
        } else {
            user.magicLinkToken = magicToken;
            user.magicLinkExpires = magicExpires;
            user.name = name.trim();
        }

        await user.save();
        await sendMagicLink(email, magicToken);

        res.json({ message: 'Magic link emailingizga yuborildi', email });
    } catch (error) {
        console.error('Send magic link error:', error);
        res.status(500).json({ error: 'Magic link yuborishda xatolik. Iltimos, parol bilan ro\'yxatdan o\'ting.' });
    }
});

// Verify magic link
router.get('/verify-magic-link/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({
            magicLinkToken: token,
            magicLinkExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Link yaroqsiz yoki muddati tugagan' });
        }

        user.magicLinkToken = undefined;
        user.magicLinkExpires = undefined;
        await user.save();

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
        res.status(500).json({ error: 'Verification xatosi' });
    }
});

// Staff Login (employee/boss/super-admin)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email va parol kiritilishi shart' });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

        if (user.role === 'customer') {
            return res.status(401).json({ error: 'Xodim akkaunti emas. Iltimos, mijoz login sahifasidan foydalaning.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Email yoki parol noto\'g\'ri' });
        }

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
        res.status(500).json({ error: 'Kirishda xatolik' });
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
        res.status(500).json({ error: 'Foydalanuvchi ma\'lumotlarini olishda xatolik' });
    }
});

module.exports = router;
