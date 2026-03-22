const express = require('express');
const router = express.Router();
const mediaTagController = require('../controllers/mediaTagController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, mediaTagController.listTags);
router.get('/suggestions', protect, mediaTagController.getSuggestions);
router.post('/', protect, mediaTagController.createTag);
router.post('/get-or-create', protect, mediaTagController.getOrCreate);
router.delete('/:id', protect, mediaTagController.deleteTag);

module.exports = router;
