const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, mediaController.listMedia);
router.post('/upload', protect, mediaController.uploadMedia);
router.delete('/:id', protect, mediaController.deleteMedia);

module.exports = router;
