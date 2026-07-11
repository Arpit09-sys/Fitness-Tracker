const Workout = require('../models/Workout');

// @desc    Add a workout
// @route   POST /api/workout
exports.addWorkout = async (req, res) => {
    try {
        const { name, duration, notes, date } = req.body;

        if (!name || !duration) {
            return res.status(400).json({ success: false, error: 'Workout name and duration are required' });
        }

        const workout = await Workout.create({
            user: req.user.id,
            name,
            duration,
            notes: notes || '',
            date: date || Date.now()
        });

        res.status(201).json({ success: true, data: workout });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all workouts for user
// @route   GET /api/workout
exports.getWorkouts = async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, count: workouts.length, data: workouts });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
