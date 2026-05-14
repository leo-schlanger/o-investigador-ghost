const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');
const { validateQuery } = require('../middleware/validateRequest');
const { articleQuerySchema } = require('../validators/schemas');

// Tags, Authors and Types routes (must be before /:id to avoid conflict)
router.get('/tags', protect, articleController.getTags);
router.get('/authors', protect, articleController.getAuthors);
router.get('/authors/sync-status', protect, articleController.getAuthorSyncStatus);
router.post('/authors/sync', protect, articleController.syncAuthorsToGhost);
router.get('/types', protect, articleController.getTypes);
router.post('/types/init', protect, articleController.initTypes);

// CRUD routes
router.get('/', protect, validateQuery(articleQuerySchema), articleController.list);
router.post('/', protect, auditLog('create', 'article', {
    getDetails: (req) => ({ title: req.body.title })
}), articleController.create);
router.get('/:id', protect, articleController.get);
router.put('/:id', protect, auditLog('update', 'article'), articleController.update);
router.delete('/:id', protect, auditLog('delete', 'article'), articleController.delete);

// Revision routes
router.get('/:id/revisions', protect, articleController.getRevisions);
router.get('/:id/revisions/:revisionId', protect, articleController.getRevision);
router.post('/:id/revisions/:revisionId/restore', protect, articleController.restoreRevision);

module.exports = router;
