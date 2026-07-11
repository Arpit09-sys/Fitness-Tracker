const Progress = require('../models/Progress');

// @desc    Add progress entry
// @route   POST /api/progress
exports.addProgress = async (req, res) => {
    try {
        const { date, weight, workoutCompleted, waterIntake, notes } = req.body;

        if (!weight) {
            return res.status(400).json({ success: false, error: 'Weight is required' });
        }

        const progress = await Progress.create({
            user: req.user.id,
            date: date || Date.now(),
            weight,
            workoutCompleted: workoutCompleted || false,
            waterIntake: waterIntake || 0,
            notes: notes || ''
        });

        res.status(201).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all progress entries for user
// @route   GET /api/progress
exports.getProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user.id }).sort({ date: -1 });
        res.status(200).json({ success: true, count: progress.length, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update progress entry
// @route   PUT /api/progress/:id
exports.updateProgress = async (req, res) => {
    try {
        let progress = await Progress.findById(req.params.id);

        if (!progress) {
            return res.status(404).json({ success: false, error: 'Progress entry not found' });
        }

        // Check ownership
        if (progress.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        progress = await Progress.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Delete progress entry
// @route   DELETE /api/progress/:id
exports.deleteProgress = async (req, res) => {
    try {
        const progress = await Progress.findById(req.params.id);

        if (!progress) {
            return res.status(404).json({ success: false, error: 'Progress entry not found' });
        }

        // Check ownership
        if (progress.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        await progress.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
