const Photo = require('../models/Photo');

// @desc    Upload progress photos
// @route   POST /api/photos
exports.uploadPhoto = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ success: false, error: 'Please upload at least one photo' });
        }

        const photoData = {
            user: req.user.id
        };

        // Get file paths from multer
        if (req.files.frontPhoto) {
            photoData.frontPhoto = '/uploads/' + req.files.frontPhoto[0].filename;
        }
        if (req.files.sidePhoto) {
            photoData.sidePhoto = '/uploads/' + req.files.sidePhoto[0].filename;
        }

        const photo = await Photo.create(photoData);

        res.status(201).json({ success: true, data: photo });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Get all photos for user
// @route   GET /api/photos
exports.getPhotos = async (req, res) => {
    try {
        const photos = await Photo.find({ user: req.user.id }).sort({ uploadDate: -1 });
        res.status(200).json({ success: true, count: photos.length, data: photos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
