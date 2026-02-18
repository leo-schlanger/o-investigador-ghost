const express = require('express');
const router = express.Router();

const articleRoutes = require('./articles');
const authRoutes = require('./auth');
const mediaRoutes = require('./media');
const settingsRoutes = require('./settings');
const publicRoutes = require('./public');

router.use('/articles', articleRoutes);
router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);
router.use('/settings', settingsRoutes);
router.use('/public', publicRoutes);

module.exports = router;
