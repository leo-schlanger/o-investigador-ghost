const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { protect } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');
const { validateQuery, validateBody } = require('../middleware/validateRequest');
const { mediaQuerySchema, bulkMoveSchema, bulkAddTagsSchema } = require('../validators/schemas');

// Static routes first
router.get('/', protect, validateQuery(mediaQuerySchema), mediaController.listMedia);
router.post('/upload', protect, auditLog('upload', 'media'), mediaController.uploadMedia);
router.put('/bulk-move', protect, validateBody(bulkMoveSchema), mediaController.bulkMove);
router.put('/bulk-add-tags', protect, validateBody(bulkAddTagsSchema), mediaController.bulkAddTags);

// Parameterized routes last
router.get('/:id', protect, mediaController.getMedia);
router.put('/:id', protect, mediaController.updateMedia);
router.delete('/:id', protect, auditLog('delete', 'media'), mediaController.deleteMedia);

module.exports = router;
