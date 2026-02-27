const ghostApi = require('../services/ghostApi');

/**
 * List articles from Ghost
 * GET /api/articles
 * Query params: status, search, page, limit
 */
exports.list = async (req, res) => {
    try {
        const { status, search, page, limit } = req.query;

        const options = {
            status: status || 'all',
            search: search || '',
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 15
        };

        const result = await ghostApi.listPosts(options);

        // Transform posts to frontend format
        const articles = result.posts.map(ghostApi.transformGhostPost);

        res.json({
            articles,
            meta: result.meta
        });
    } catch (err) {
        console.error('Error listing articles:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get a single article from Ghost
 * GET /api/articles/:id
 */
exports.get = async (req, res) => {
    try {
        const { id } = req.params;

        const post = await ghostApi.getPost(id);
        const article = ghostApi.transformGhostPost(post);

        res.json(article);
    } catch (err) {
        console.error('Error getting article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new article in Ghost
 * POST /api/articles
 */
exports.create = async (req, res) => {
    try {
        const data = req.body;

        // Validate required fields
        if (!data.title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const post = await ghostApi.createPost(data);
        const article = ghostApi.transformGhostPost(post);

        res.status(201).json(article);
    } catch (err) {
        console.error('Error creating article:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing article in Ghost
 * PUT /api/articles/:id
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const post = await ghostApi.updatePost(id, data);
        const article = ghostApi.transformGhostPost(post);

        res.json(article);
    } catch (err) {
        console.error('Error updating article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete an article from Ghost
 * DELETE /api/articles/:id
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        await ghostApi.deletePost(id);

        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        console.error('Error deleting article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get all tags from Ghost
 * GET /api/articles/tags
 */
exports.getTags = async (req, res) => {
    try {
        const tags = await ghostApi.listTags();

        res.json(tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            count: tag.count ? tag.count.posts : 0
        })));
    } catch (err) {
        console.error('Error getting tags:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get all authors from Ghost
 * GET /api/articles/authors
 */
exports.getAuthors = async (req, res) => {
    try {
        const authors = await ghostApi.listAuthors();

        res.json(authors.map(author => ({
            id: author.id,
            name: author.name,
            slug: author.slug,
            email: author.email,
            profile_image: author.profile_image
        })));
    } catch (err) {
        console.error('Error getting authors:', err);
        res.status(500).json({ error: err.message });
    }
};
