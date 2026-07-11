const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please provide workout name']
    },
    duration: {
        type: Number, // in minutes
        required: [true, 'Please provide duration']
    },
    notes: {
        type: String,
        maxlength: 500
    },
    date: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Workout', workoutSchema);
