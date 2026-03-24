const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Tags, Authors and Types routes (must be before /:id to avoid conflict)
router.get('/tags', protect, articleController.getTags);
router.get('/authors', protect, articleController.getAuthors);
router.get('/authors/sync-status', protect, articleController.getAuthorSyncStatus);
router.post('/authors/sync', protect, articleController.syncAuthorsToGhost);
router.get('/types', protect, articleController.getTypes);
router.post('/types/init', protect, articleController.initTypes);

// CRUD routes
router.get('/', protect, articleController.list);
router.post('/', protect, articleController.create);
router.get('/:id', protect, articleController.get);
router.put('/:id', protect, articleController.update);
router.delete('/:id', protect, articleController.delete);

// Revision routes
router.get('/:id/revisions', protect, articleController.getRevisions);
router.get('/:id/revisions/:revisionId', protect, articleController.getRevision);
router.post('/:id/revisions/:revisionId/restore', protect, articleController.restoreRevision);

module.exports = router;
