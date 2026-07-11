const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    weight: {
        type: Number, // in kg
        required: [true, 'Please provide your weight']
    },
    workoutCompleted: {
        type: Boolean,
        default: false
    },
    waterIntake: {
        type: Number, // in ml
        default: 0
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Progress', progressSchema);
