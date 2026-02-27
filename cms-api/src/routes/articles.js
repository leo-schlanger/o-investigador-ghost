const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

// Tags and Authors routes (must be before /:id to avoid conflict)
router.get('/tags', articleController.getTags);
router.get('/authors', articleController.getAuthors);

// CRUD routes
router.get('/', articleController.list);
router.post('/', articleController.create);
router.get('/:id', articleController.get);
router.put('/:id', articleController.update);
router.delete('/:id', articleController.delete);

module.exports = router;
