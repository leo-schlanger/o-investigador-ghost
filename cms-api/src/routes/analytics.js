const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { PostView, ViewLog, User } = require('../models');
const ghostApi = require('../services/ghostApi');
const { protect, authorize } = require('../middleware/authMiddleware');

// All analytics routes require authentication
router.use(protect);
router.use(authorize('admin', 'editor'));

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        // Total views
        const totalViewsResult = await PostView.sum('viewCount');
        const totalViews = totalViewsResult || 0;

        // Views today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const viewsToday = await ViewLog.count({
            where: {
                viewedAt: { [Op.gte]: today }
            }
        });

        // Views this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const viewsWeek = await ViewLog.count({
            where: {
                viewedAt: { [Op.gte]: weekAgo }
            }
        });

        // Views this month
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const viewsMonth = await ViewLog.count({
            where: {
                viewedAt: { [Op.gte]: monthAgo }
            }
        });

        // Total articles from Ghost CMS
        let articlesCount = 0;
        try {
            if (ghostApi.isAvailable()) {
                const result = await ghostApi.listPosts({ limit: 1, status: 'published' });
                articlesCount = result.meta?.pagination?.total || 0;
            }
        } catch (ghostErr) {
            console.warn('Could not fetch articles count from Ghost:', ghostErr.message);
        }

        // Total users
        const usersCount = await User.count();

        res.json({
            totalViews,
            viewsToday,
            viewsWeek,
            viewsMonth,
            articlesCount,
            usersCount
        });
    } catch (err) {
        console.error('Analytics stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get top articles
router.get('/top-articles', async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));
        const period = req.query.period || 'all';

        let whereClause = {};

        if (period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
            }

            if (startDate) {
                whereClause.lastViewedAt = { [Op.gte]: startDate };
            }
        }

        const topArticles = await PostView.findAll({
            where: whereClause,
            order: [['viewCount', 'DESC']],
            limit,
            attributes: ['postId', 'postSlug', 'postTitle', 'viewCount', 'lastViewedAt']
        });

        res.json(topArticles);
    } catch (err) {
        console.error('Top articles error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get views by country
router.get('/views-by-country', async (req, res) => {
    try {
        const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 10, 100));

        const viewsByCountry = await ViewLog.findAll({
            attributes: [
                'country',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'views']
            ],
            where: {
                country: { [Op.ne]: null }
            },
            group: ['country'],
            order: [[require('sequelize').literal('views'), 'DESC']],
            limit,
            raw: true
        });

        res.json(viewsByCountry);
    } catch (err) {
        console.error('Views by country error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get views over time (for charts)
router.get('/views-timeline', async (req, res) => {
    try {
        const days = Math.max(1, Math.min(parseInt(req.query.days, 10) || 30, 365));

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const viewsTimeline = await ViewLog.findAll({
            attributes: [
                [require('sequelize').fn('DATE', require('sequelize').col('viewed_at')), 'date'],
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'views']
            ],
            where: {
                viewedAt: { [Op.gte]: startDate }
            },
            group: [require('sequelize').fn('DATE', require('sequelize').col('viewed_at'))],
            order: [
                [require('sequelize').fn('DATE', require('sequelize').col('viewed_at')), 'ASC']
            ],
            raw: true
        });

        // Fill in missing days with 0 views
        const result = [];
        const dateMap = new Map(viewsTimeline.map((v) => [v.date, parseInt(v.views)]));

        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                views: dateMap.get(dateStr) || 0
            });
        }

        res.json(result);
    } catch (err) {
        console.error('Views timeline error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
