const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false
    },
    name: {
        type: String,
        required: [true, 'Please provide your name']
    },
    age: {
        type: Number,
        min: 10,
        max: 100
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    height: {
        type: Number, // in cm
        min: 50,
        max: 300
    },
    weight: {
        type: Number, // in kg
        min: 20,
        max: 500
    },
    activityLevel: {
        type: String,
        enum: ['sedentary', 'light', 'moderate', 'active'],
        default: 'sedentary'
    },
    goal: {
        type: String,
        enum: ['lose', 'gain', 'maintain'],
        default: 'maintain'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
