const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const geoip = require('geoip-lite');
const { Settings, PostView, ViewLog } = require('../models');
const contactController = require('../controllers/contactController');

// Rate limiter for contact form (3 requests per hour per IP)
const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        success: false,
        error: 'Muitas mensagens enviadas. Tente novamente em 1 hora.'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Public endpoint for ad settings (no auth required)
router.get('/ads-config', async (req, res) => {
    try {
        const settings = await Settings.findAll({
            where: {
                key: ['adsEnabled', 'adsenseClientId', 'adSlots']
            }
        });

        const config = {};
        settings.forEach(setting => {
            if (setting.key === 'adSlots') {
                try {
                    config[setting.key] = JSON.parse(setting.value);
                } catch (e) {
                    config[setting.key] = {};
                }
            } else if (setting.key === 'adsEnabled') {
                config[setting.key] = setting.value === 'true';
            } else {
                config[setting.key] = setting.value;
            }
        });

        // Set defaults
        config.adsEnabled = config.adsEnabled || false;
        config.adsenseClientId = config.adsenseClientId || '';
        config.adSlots = config.adSlots || {};

        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Track post view
router.post('/track-view', async (req, res) => {
    try {
        const { postId, postSlug, postTitle } = req.body;

        if (!postId) {
            return res.status(400).json({ error: 'postId is required' });
        }

        // Get client IP for geolocation
        const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
            || req.headers['x-real-ip']
            || req.socket?.remoteAddress
            || '';

        // Get geolocation (only country/city, IP is not stored)
        let country = null;
        let city = null;

        if (clientIp && clientIp !== '127.0.0.1' && !clientIp.startsWith('192.168.')) {
            const geo = geoip.lookup(clientIp);
            if (geo) {
                country = geo.country || null;
                city = geo.city || null;
            }
        }

        // Upsert: update if exists, create if not
        const [postView, created] = await PostView.findOrCreate({
            where: { postId },
            defaults: {
                postId,
                postSlug: postSlug || '',
                postTitle: postTitle || '',
                viewCount: 1,
                lastViewedAt: new Date()
            }
        });

        if (!created) {
            await postView.update({
                viewCount: postView.viewCount + 1,
                lastViewedAt: new Date(),
                postSlug: postSlug || postView.postSlug,
                postTitle: postTitle || postView.postTitle
            });
        }

        // Store individual view log with geolocation (non-blocking)
        ViewLog.create({
            postId,
            postSlug: postSlug || '',
            country,
            city,
            viewedAt: new Date()
        }).catch(err => console.error('ViewLog error:', err));

        res.json({ success: true, views: created ? 1 : postView.viewCount + 1 });
    } catch (err) {
        console.error('Error tracking view:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get most viewed posts
router.get('/most-viewed', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        const period = req.query.period || 'all'; // 'day', 'week', 'month', 'all'

        let whereClause = {};

        // Filter by time period
        if (period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'day':
                    startDate = new Date(now.setDate(now.getDate() - 1));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }

            if (startDate) {
                whereClause.lastViewedAt = {
                    [require('sequelize').Op.gte]: startDate
                };
            }
        }

        const mostViewed = await PostView.findAll({
            where: whereClause,
            order: [['viewCount', 'DESC']],
            limit,
            attributes: ['postId', 'postSlug', 'postTitle', 'viewCount', 'lastViewedAt']
        });

        res.json(mostViewed);
    } catch (err) {
        console.error('Error fetching most viewed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Contact form submission
router.post('/contact', contactLimiter, contactController.submitContact);

// Contact service status (for debugging)
router.get('/contact/status', contactController.getStatus);

module.exports = router;
