const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, age, gender, height, weight, activityLevel, goal } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, age, gender, height, weight, activityLevel, goal },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
