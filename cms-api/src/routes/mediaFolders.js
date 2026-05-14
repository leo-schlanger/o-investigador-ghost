const express = require('express');
const router = express.Router();
const mediaFolderController = require('../controllers/mediaFolderController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateRequest');
const { createFolderSchema } = require('../validators/schemas');

router.get('/', protect, mediaFolderController.listFolders);
router.post('/', protect, validateBody(createFolderSchema), mediaFolderController.createFolder);
router.put('/:id', protect, mediaFolderController.updateFolder);
router.delete('/:id', protect, mediaFolderController.deleteFolder);

module.exports = router;
