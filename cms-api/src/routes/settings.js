const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Anyone authenticated can read settings
router.get('/', protect, settingsController.getSettings);

// Only admins can update settings
router.put('/', protect, authorize('admin'), settingsController.updateSettings);

module.exports = router;
