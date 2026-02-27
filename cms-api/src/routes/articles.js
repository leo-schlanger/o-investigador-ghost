const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { protect } = require('../middleware/authMiddleware');

// Tags and Authors routes (must be before /:id to avoid conflict)
router.get('/tags', protect, articleController.getTags);
router.get('/authors', protect, articleController.getAuthors);

// CRUD routes
router.get('/', protect, articleController.list);
router.post('/', protect, articleController.create);
router.get('/:id', protect, articleController.get);
router.put('/:id', protect, articleController.update);
router.delete('/:id', protect, articleController.delete);

module.exports = router;
