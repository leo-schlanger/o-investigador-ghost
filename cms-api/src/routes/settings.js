const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

// Anyone authenticated can read settings
router.get('/', protect, settingsController.getSettings);

// Only admins can update settings
router.put('/', protect, authorize('admin'), auditLog('update', 'settings', {
    getDetails: (req) => ({ keys: Object.keys(req.body) })
}), settingsController.updateSettings);

module.exports = router;
