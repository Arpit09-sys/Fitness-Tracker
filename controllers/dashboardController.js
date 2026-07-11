const User = require('../models/User');
const Progress = require('../models/Progress');

// @desc    Get dashboard data (BMI, BMR, calories, water goal, recent progress)
// @route   GET /api/dashboard
exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Calculate BMI
        let bmi = null;
        let bmiCategory = '';
        if (user.height && user.weight) {
            const heightInMeters = user.height / 100;
            bmi = parseFloat((user.weight / (heightInMeters * heightInMeters)).toFixed(1));

            if (bmi < 18.5) bmiCategory = 'Underweight';
            else if (bmi < 25) bmiCategory = 'Normal';
            else if (bmi < 30) bmiCategory = 'Overweight';
            else bmiCategory = 'Obese';
        }

        // Calculate BMR using Mifflin-St Jeor Equation
        let bmr = null;
        let dailyCalories = null;
        if (user.height && user.weight && user.age && user.gender) {
            if (user.gender === 'Male') {
                bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
            } else {
                bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
            }
            bmr = Math.round(bmr);

            // Activity level multiplier
            const multipliers = {
                sedentary: 1.2,
                light: 1.375,
                moderate: 1.55,
                active: 1.725
            };
            const multiplier = multipliers[user.activityLevel] || 1.2;
            dailyCalories = Math.round(bmr * multiplier);
        }

        // Calculate daily water goal (weight in kg * 35ml)
        let waterGoal = null;
        if (user.weight) {
            waterGoal = Math.round(user.weight * 35);
        }

        // Get recent 5 progress entries
        const recentProgress = await Progress.find({ user: req.user.id })
            .sort({ date: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    name: user.name,
                    weight: user.weight,
                    height: user.height,
                    age: user.age,
                    gender: user.gender,
                    activityLevel: user.activityLevel,
                    goal: user.goal
                },
                bmi,
                bmiCategory,
                bmr,
                dailyCalories,
                waterGoal,
                recentProgress
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
