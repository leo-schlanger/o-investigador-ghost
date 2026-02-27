const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, tagController.list);
router.post('/', protect, tagController.create);
router.get('/:id', protect, tagController.get);
router.put('/:id', protect, tagController.update);
router.delete('/:id', protect, tagController.delete);

module.exports = router;
