const ghostApi = require('../services/ghostApi');
const logger = require('../utils/logger');

/**
 * List pages from Ghost
 * GET /api/pages
 */
exports.list = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;

        const options = {
            status: status || 'all',
            search: search || '',
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 'all'
        };

        const result = await ghostApi.listPages(options);
        const pages = result.pages.map(ghostApi.transformGhostPost);

        res.json({
            pages,
            meta: result.meta
        });
    } catch (err) {
        logger.error('Error listing pages:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get a single page
 * GET /api/pages/:id
 */
exports.get = async (req, res) => {
    try {
        const { id } = req.params;
        const page = await ghostApi.getPage(id);
        const transformed = ghostApi.transformGhostPost(page);
        res.json(transformed);
    } catch (err) {
        logger.error('Error getting page:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new page
 * POST /api/pages
 */
exports.create = async (req, res) => {
    try {
        const data = req.body;

        if (!data.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const page = await ghostApi.createPage(data);
        const transformed = ghostApi.transformGhostPost(page);

        res.status(201).json(transformed);
    } catch (err) {
        logger.error('Error creating page:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing page
 * PUT /api/pages/:id
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const page = await ghostApi.updatePage(id, data);
        const transformed = ghostApi.transformGhostPost(page);

        res.json(transformed);
    } catch (err) {
        logger.error('Error updating page:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete a page
 * DELETE /api/pages/:id
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await ghostApi.deletePage(id);
        res.json({ message: 'Page deleted successfully' });
    } catch (err) {
        logger.error('Error deleting page:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Page not found' });
        }
        res.status(500).json({ error: err.message });
    }
};
