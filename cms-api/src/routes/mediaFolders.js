const express = require('express');
const router = express.Router();
const mediaFolderController = require('../controllers/mediaFolderController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, mediaFolderController.listFolders);
router.post('/', protect, mediaFolderController.createFolder);
router.put('/:id', protect, mediaFolderController.updateFolder);
router.delete('/:id', protect, mediaFolderController.deleteFolder);

module.exports = router;
