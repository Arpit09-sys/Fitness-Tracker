const express = require('express');
const { addProgress, getProgress, updateProgress, deleteProgress } = require('../controllers/progressController');
const protect = require('../middleware/auth');
const router = express.Router();

router.use(protect);

router.post('/', addProgress);
router.get('/', getProgress);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

module.exports = router;
