const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

router.get('/', tagController.list);
router.post('/', tagController.create);
router.get('/:id', tagController.get);
router.put('/:id', tagController.update);
router.delete('/:id', tagController.delete);

module.exports = router;
