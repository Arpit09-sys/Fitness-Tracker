const express = require('express');
const { uploadPhoto, getPhotos } = require('../controllers/photoController');
const protect = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

router.use(protect);

// Upload front and side photos
router.post('/', upload.fields([
    { name: 'frontPhoto', maxCount: 1 },
    { name: 'sidePhoto', maxCount: 1 }
]), uploadPhoto);

router.get('/', getPhotos);

module.exports = router;
