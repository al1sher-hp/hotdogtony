const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all users (boss/super-admin)
router.get('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { role } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }

        // Boss can only see employees
        if (req.user.role === 'boss') {
            query.role = 'employee';
        }

        const users = await User.find(query)
            .select('-password -magicLinkToken -magicLinkExpires')
            .sort({ createdAt: -1 });

        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

// Create user (boss for employees, super-admin for all)
router.post('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !role) {
            console.log('⚠️ User creation failed: Missing fields', { name: !!name, email: !!email, role: !!role });
            return res.status(400).json({
                error: 'Ism, email va huquq (role) kiritilishi shart'
            });
        }

        // Boss can only create employees
        if (req.user.role === 'boss' && role !== 'employee') {
            return res.status(403).json({
                error: 'Boss can only create employee accounts'
            });
        }

        // Password required for staff roles
        if (['employee', 'boss', 'super-admin'].includes(role) && !password) {
            console.log(`⚠️ User creation failed: Missing password for staff role (${role})`);
            return res.status(400).json({
                error: 'Xodim akkaunti uchun parol kiritilishi shart'
            });
        }

        // Check if email already exists
        const normalizedEmail = email.toLowerCase().trim();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            console.log(`⚠️ User creation failed: Email already exists (${normalizedEmail}) with role: ${existingUser.role}`);
            return res.status(400).json({
                error: `Bu email allaqachon ro'yxatdan o'tgan (${existingUser.role} sifatida). Iltimos, boshqa email kiriting yoki mavjudini o'chiring.`
            });
        }

        const user = new User({
            name,
            email,
            password,
            role
        });

        await user.save();

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({ user: userResponse });
    } catch (error) {
        console.error('Create user error:', error);

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            const value = error.keyValue[field];

            // Try to find who is using this email to give a better error
            const culprit = await User.findOne({ email: value });
            if (culprit) {
                return res.status(400).json({
                    error: `Bu ${field} allaqachon band. Egasi: "${culprit.name}", Roli: "${culprit.role}".`
                });
            }
            return res.status(400).json({ error: `Bu ${field} allaqachon ro'yxatdan o'tgan.` });
        }

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }

        res.status(500).json({ error: 'Foydalanuvchini yaratishda xatolik: ' + error.message });
    }
});

// Update user
router.patch('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'email', 'password', 'role'];
        const requestedUpdates = Object.keys(updates);

        // Boss can only update employees
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (req.user.role === 'boss' && userToUpdate.role !== 'employee') {
            return res.status(403).json({
                error: 'Boss can only update employee accounts'
            });
        }

        // Apply updates
        requestedUpdates.forEach(key => {
            if (allowedUpdates.includes(key)) {
                // Only update password if it's not empty
                if (key === 'password' && (!updates[key] || updates[key] === '')) {
                    return;
                }
                userToUpdate[key] = updates[key];
            }
        });

        await userToUpdate.save();

        // Remove password from response
        const userResponse = userToUpdate.toObject();
        delete userResponse.password;

        res.json({ user: userResponse });
    } catch (error) {
        console.error('Update user error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }

        if (error.code === 11000) {
            return res.status(400).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan' });
        }

        res.status(500).json({ error: 'Foydalanuvchini yangilashda xatolik yuz berdi' });
    }
});

// Delete user
router.delete('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Boss can only delete employees
        if (req.user.role === 'boss' && user.role !== 'employee') {
            return res.status(403).json({
                error: 'Boss can only delete employee accounts'
            });
        }

        // Prevent deleting yourself
        if (user._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Toggle favorite item (customer)
router.patch('/favorites/toggle', auth, roleCheck('customer'), async (req, res) => {
    try {
        const { menuItemId } = req.body;

        if (!menuItemId) {
            return res.status(400).json({ error: 'Menu item ID is required' });
        }

        const user = await User.findById(req.user._id);
        const index = user.favoriteItems.indexOf(menuItemId);

        if (index > -1) {
            // Remove from favorites
            user.favoriteItems.splice(index, 1);
        } else {
            // Add to favorites
            user.favoriteItems.push(menuItemId);
        }

        await user.save();
        await user.populate('favoriteItems');

        res.json({
            favoriteItems: user.favoriteItems,
            message: index > -1 ? 'Removed from favorites' : 'Added to favorites'
        });
    } catch (error) {
        console.error('Toggle favorite error:', error);
        res.status(500).json({ error: 'Failed to toggle favorite' });
    }
});

module.exports = router;
