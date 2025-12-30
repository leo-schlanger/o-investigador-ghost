const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');

router.get('/', articleController.list);
router.post('/', articleController.create);
router.get('/:id', articleController.get);
router.put('/:id', articleController.update);
router.delete('/:id', articleController.delete);

module.exports = router;
