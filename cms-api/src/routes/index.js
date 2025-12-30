const express = require('express');
const router = express.Router();

const articleRoutes = require('./articles');
const authRoutes = require('./auth');
const mediaRoutes = require('./media');

router.use('/articles', articleRoutes);
router.use('/auth', authRoutes);
router.use('/media', mediaRoutes);

module.exports = router;
