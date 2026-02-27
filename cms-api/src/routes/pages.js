const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, pageController.list);
router.post('/', protect, pageController.create);
router.get('/:id', protect, pageController.get);
router.put('/:id', protect, pageController.update);
router.delete('/:id', protect, pageController.delete);

module.exports = router;
