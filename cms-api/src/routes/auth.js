const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { auditLog } = require('../middleware/auditMiddleware');

// Public
router.post('/register', auditLog('register', 'auth', {
    getDetails: (req) => ({ email: req.body.email })
}), authController.register);
router.post('/login', auditLog('login', 'auth', {
    getDetails: (req) => ({ email: req.body.email })
}), authController.login);

// Protected (Any authenticated user)
router.get('/me', protect, authController.me);
router.put('/me', protect, auditLog('update_profile', 'user'), authController.updateMe);

// Protected (Admin ONLY)
router.get('/users', protect, authorize('admin'), authController.listUsers);
router.post('/users', protect, authorize('admin'), auditLog('create', 'user', {
    getDetails: (req) => ({ email: req.body.email, role: req.body.role })
}), authController.createUser);
router.put('/users/:id', protect, authorize('admin'), auditLog('update', 'user'), authController.updateUser);
router.delete('/users/:id', protect, authorize('admin'), auditLog('delete', 'user'), authController.deleteUser);

module.exports = router;
