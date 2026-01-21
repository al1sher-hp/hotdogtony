const express = require('express');
const router = express.Router();
const MenuItem = require('../models/MenuItem');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { uploadToImgBB } = require('../utils/imgbbUpload');

// Get all menu items (public)
router.get('/', async (req, res) => {
    try {
        const { category, available } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (available !== undefined) {
            query.available = available === 'true';
        }

        const menuItems = await MenuItem.find(query)
            .populate('ingredients')
            .sort({ category: 1, name: 1 });

        res.json({ menuItems });
    } catch (error) {
        console.error('Get menu items error:', error);
        res.status(500).json({ error: 'Failed to get menu items' });
    }
});

// Get single menu item (public)
router.get('/:id', async (req, res) => {
    try {
        const menuItem = await MenuItem.findById(req.params.id)
            .populate('ingredients');

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ menuItem });
    } catch (error) {
        console.error('Get menu item error:', error);
        res.status(500).json({ error: 'Failed to get menu item' });
    }
});

// Upload image to ImgBB (boss)
router.post('/upload-image', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'Image is required' });
        }

        const result = await uploadToImgBB(image);

        res.json({
            imageUrl: result.url,
            thumb: result.thumb
        });
    } catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Create menu item (boss)
router.post('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { name, description, price, category, image, ingredients } = req.body;

        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({
                error: 'Name, description, price, category, and image are required'
            });
        }

        const menuItem = new MenuItem({
            name,
            description,
            price,
            category,
            image,
            ingredients: ingredients || []
        });

        await menuItem.save();
        await menuItem.populate('ingredients');

        res.status(201).json({ menuItem });
    } catch (error) {
        console.error('Create menu item error:', error);
        res.status(500).json({ error: 'Failed to create menu item' });
    }
});

// Update menu item (boss)
router.patch('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'description', 'price', 'category', 'image', 'ingredients', 'available'];
        const requestedUpdates = Object.keys(updates);

        const isValidOperation = requestedUpdates.every(update =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('ingredients');

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ menuItem });
    } catch (error) {
        console.error('Update menu item error:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
});

// Delete menu item (boss)
router.delete('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        console.error('Delete menu item error:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
});

module.exports = router;
