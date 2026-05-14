const ghostApi = require('../services/ghostApi');
const logger = require('../utils/logger');
const apiResponse = require('../utils/apiResponse');

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

        apiResponse.success(res, {
            pages,
            meta: result.meta
        });
    } catch (err) {
        logger.error('Error listing pages:', err);
        apiResponse.error(res, err.message);
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
        apiResponse.success(res, transformed);
    } catch (err) {
        logger.error('Error getting page:', err);
        if (err.message && err.message.includes('not found')) {
            return apiResponse.notFound(res, 'Page');
        }
        apiResponse.error(res, err.message);
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
            return apiResponse.error(res, 'Title is required', 400);
        }

        const page = await ghostApi.createPage(data);
        const transformed = ghostApi.transformGhostPost(page);

        apiResponse.success(res, transformed, 201);
    } catch (err) {
        logger.error('Error creating page:', err);
        apiResponse.error(res, err.message, 400);
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

        apiResponse.success(res, transformed);
    } catch (err) {
        logger.error('Error updating page:', err);
        if (err.message && err.message.includes('not found')) {
            return apiResponse.notFound(res, 'Page');
        }
        apiResponse.error(res, err.message, 400);
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
        apiResponse.success(res, { message: 'Page deleted successfully' });
    } catch (err) {
        logger.error('Error deleting page:', err);
        if (err.message && err.message.includes('not found')) {
            return apiResponse.notFound(res, 'Page');
        }
        apiResponse.error(res, err.message);
    }
};
