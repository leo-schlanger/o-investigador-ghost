const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, mediaController.uploadMedia);

module.exports = router;
