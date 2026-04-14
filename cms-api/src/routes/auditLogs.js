const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const db = require('../models');
const { Op } = require('sequelize');

// Admin only - list audit logs
router.get('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 50, action, resource, userId } = req.query;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (action) where.action = action;
        if (resource) where.resource = resource;
        if (userId) where.userId = userId;

        const { count, rows } = await db.AuditLog.findAndCountAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: Math.min(parseInt(limit), 100),
            offset
        });

        res.json({
            logs: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                pages: Math.ceil(count / parseInt(limit))
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

module.exports = router;
