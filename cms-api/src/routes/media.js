const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');

// Static routes first
router.get('/', protect, mediaController.listMedia);
router.post('/upload', protect, mediaController.uploadMedia);
router.put('/bulk-move', protect, mediaController.bulkMove);
router.put('/bulk-add-tags', protect, mediaController.bulkAddTags);

// Parameterized routes last
router.get('/:id', protect, mediaController.getMedia);
router.put('/:id', protect, mediaController.updateMedia);
router.delete('/:id', protect, mediaController.deleteMedia);

module.exports = router;
