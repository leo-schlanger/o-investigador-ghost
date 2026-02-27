const express = require('express');
const router = express.Router();
const pageController = require('../controllers/pageController');

router.get('/', pageController.list);
router.post('/', pageController.create);
router.get('/:id', pageController.get);
router.put('/:id', pageController.update);
router.delete('/:id', pageController.delete);

module.exports = router;
