const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// Get all ingredients (boss)
router.get('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { stockStatus } = req.query;

        const ingredients = await Ingredient.find().sort({ name: 1 });

        // Filter by stock status if requested
        let filteredIngredients = ingredients;
        if (stockStatus) {
            filteredIngredients = ingredients.filter(ing =>
                ing.stockStatus === stockStatus
            );
        }

        res.json({ ingredients: filteredIngredients });
    } catch (error) {
        console.error('Get ingredients error:', error);
        res.status(500).json({ error: 'Failed to get ingredients' });
    }
});

// Create ingredient (boss)
router.post('/', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const { name, unit, currentStock, minStock, maxStock } = req.body;

        if (!name || !unit) {
            return res.status(400).json({
                error: 'Name and unit are required'
            });
        }

        const ingredient = new Ingredient({
            name,
            unit,
            currentStock: currentStock || 0,
            minStock: minStock || 10,
            maxStock: maxStock || 100
        });

        await ingredient.save();

        res.status(201).json({ ingredient });
    } catch (error) {
        console.error('Create ingredient error:', error);

        if (error.code === 11000) {
            return res.status(400).json({ error: 'Ingredient already exists' });
        }

        res.status(500).json({ error: 'Failed to create ingredient' });
    }
});

// Update ingredient (boss)
router.patch('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const updates = req.body;
        const allowedUpdates = ['name', 'unit', 'currentStock', 'minStock', 'maxStock'];
        const requestedUpdates = Object.keys(updates);

        const isValidOperation = requestedUpdates.every(update =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        updates.lastUpdated = new Date();

        const ingredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({ ingredient });
    } catch (error) {
        console.error('Update ingredient error:', error);
        res.status(500).json({ error: 'Failed to update ingredient' });
    }
});

// Delete ingredient (boss)
router.delete('/:id', auth, roleCheck(['boss', 'super-admin']), async (req, res) => {
    try {
        const ingredient = await Ingredient.findByIdAndDelete(req.params.id);

        if (!ingredient) {
            return res.status(404).json({ error: 'Ingredient not found' });
        }

        res.json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        console.error('Delete ingredient error:', error);
        res.status(500).json({ error: 'Failed to delete ingredient' });
    }
});

module.exports = router;
