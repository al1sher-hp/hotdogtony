const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    date: {
        type: String, // YYYY-MM-DD
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Counter', counterSchema);
