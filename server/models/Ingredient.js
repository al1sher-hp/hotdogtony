const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    unit: {
        type: String,
        required: true,
        enum: ['kg', 'g', 'l', 'ml', 'pcs']
    },
    currentStock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    minStock: {
        type: Number,
        required: true,
        min: 0,
        default: 10
    },
    maxStock: {
        type: Number,
        required: true,
        min: 0,
        default: 100
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Virtual for stock status
ingredientSchema.virtual('stockStatus').get(function () {
    if (this.currentStock <= this.minStock) return 'low';
    if (this.currentStock >= this.maxStock) return 'full';
    return 'normal';
});

// Ensure virtuals are included in JSON
ingredientSchema.set('toJSON', { virtuals: true });
ingredientSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Ingredient', ingredientSchema);
