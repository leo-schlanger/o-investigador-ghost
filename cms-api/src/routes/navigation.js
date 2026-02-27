const express = require('express');
const router = express.Router();
const navigationController = require('../controllers/navigationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Only admins can manage navigation
router.get('/', protect, navigationController.get);
router.put('/', protect, authorize('admin'), navigationController.update);

module.exports = router;
