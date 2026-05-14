const express = require('express');
const router = express.Router();
const mediaTagController = require('../controllers/mediaTagController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const { createTagSchema } = require('../validators/schemas');

router.get('/', protect, mediaTagController.listTags);
router.get('/suggestions', protect, mediaTagController.getSuggestions);
router.post('/', protect, validateBody(createTagSchema), mediaTagController.createTag);
router.post('/get-or-create', protect, validateBody(createTagSchema), mediaTagController.getOrCreate);
router.delete('/:id', protect, mediaTagController.deleteTag);

module.exports = router;
