const express = require('express');
const { addWorkout, getWorkouts } = require('../controllers/workoutController');
const protect = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.post('/', addWorkout);
router.get('/', getWorkouts);

module.exports = router;
