const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.me);
router.get('/users', protect, authController.listUsers);
router.delete('/users/:id', protect, authController.deleteUser);

module.exports = router;
