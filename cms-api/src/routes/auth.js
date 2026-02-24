const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected (Any authenticated user)
router.get('/me', protect, authController.me);
router.put('/me', protect, authController.updateMe);

// Protected (Admin ONLY)
router.get('/users', protect, authorize('admin'), authController.listUsers);
router.post('/users', protect, authorize('admin'), authController.createUser);
router.put('/users/:id', protect, authorize('admin'), authController.updateUser);
router.delete('/users/:id', protect, authorize('admin'), authController.deleteUser);

module.exports = router;
