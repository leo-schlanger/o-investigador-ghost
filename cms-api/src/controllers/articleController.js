const ghostApi = require('../services/ghostApi');
const { ARTICLE_TYPES, getArticleTypeTag, removeTypeTags } = require('../services/ghostApi');

/**
 * Extract a meaningful error message from Ghost API errors
 * @param {Error} err - The error object
 * @returns {string} - A user-friendly error message
 */
const extractErrorMessage = (err) => {
    // Ghost API errors often have nested structure
    if (err.context) {
        return err.context;
    }

    if (err.message) {
        // Handle specific Ghost error patterns
        if (err.message.includes('ValidationError')) {
            const match = err.message.match(/ValidationError: (.+)/);
            return match ? `Validation error: ${match[1]}` : 'Validation failed';
        }

        if (err.message.includes('duplicate')) {
            return 'A record with this slug already exists';
        }

        if (err.message.includes('UpdateCollisionError')) {
            return 'Update conflict: the article was modified by another user';
        }

        return err.message;
    }

    return 'An unexpected error occurred';
};

/**
 * List articles from Ghost
 * GET /api/articles
 * Query params: status, search, page, limit, type
 */
exports.list = async (req, res) => {
    try {
        const { status, search, page, limit, type } = req.query;

        const options = {
            status: status || 'all',
            search: search || '',
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 15
        };

        // Add filter by article type (via tag)
        if (type && ARTICLE_TYPES[type]) {
            options.filter = `tag:${ARTICLE_TYPES[type].slug}`;
        }

        const result = await ghostApi.listPosts(options);

        // Transform posts to frontend format
        const articles = result.posts.map(ghostApi.transformGhostPost);

        res.json({
            articles,
            meta: result.meta
        });
    } catch (err) {
        console.error('Error listing articles:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
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
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Process article type and add corresponding tag
 * @param {Object} data - Request body data
 * @returns {Object} - Modified data with type tag added
 */
const processArticleType = (data) => {
    const articleType = data.article_type;

    // Initialize tags array if not present
    if (!data.tags) {
        data.tags = [];
    }

    // Remove any existing type tags first
    data.tags = removeTypeTags(data.tags);

    // Add new type tag if specified
    if (articleType && ARTICLE_TYPES[articleType]) {
        const typeTag = getArticleTypeTag(articleType);
        if (typeTag) {
            data.tags.push(typeTag.name);
        }
    }

    // Remove article_type from data (Ghost doesn't need it)
    delete data.article_type;

    return data;
};

/**
 * Create a new article in Ghost
 * POST /api/articles
 */
exports.create = async (req, res) => {
    try {
        let data = { ...req.body };

        // Validate required fields with specific messages
        if (!data.title || data.title.trim() === '') {
            return res.status(400).json({ error: 'Title is required' });
        }

        if (data.title.length > 255) {
            return res.status(400).json({ error: 'Title must be less than 255 characters' });
        }

        if (data.slug && data.slug.length > 191) {
            return res.status(400).json({ error: 'Slug must be less than 191 characters' });
        }

        if (data.status && !['draft', 'published', 'scheduled'].includes(data.status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: draft, published, or scheduled' });
        }

        if (data.status === 'scheduled' && !data.published_at) {
            return res.status(400).json({ error: 'Scheduled posts require a publish date' });
        }

        if (data.visibility && !['public', 'members', 'paid'].includes(data.visibility)) {
            return res.status(400).json({ error: 'Invalid visibility. Must be: public, members, or paid' });
        }

        // Validate article type if provided
        if (data.article_type && !ARTICLE_TYPES[data.article_type]) {
            return res.status(400).json({
                error: 'Invalid article type. Must be: cronica, reportagem, or opiniao'
            });
        }

        // Process article type (add tag)
        data = processArticleType(data);

        const post = await ghostApi.createPost(data);
        const article = ghostApi.transformGhostPost(post);

        res.status(201).json(article);
    } catch (err) {
        console.error('Error creating article:', err);
        res.status(400).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Update an existing article in Ghost
 * PUT /api/articles/:id
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        let data = { ...req.body };

        // Validate fields if provided
        if (data.title !== undefined && data.title.trim() === '') {
            return res.status(400).json({ error: 'Title cannot be empty' });
        }

        if (data.title && data.title.length > 255) {
            return res.status(400).json({ error: 'Title must be less than 255 characters' });
        }

        if (data.slug && data.slug.length > 191) {
            return res.status(400).json({ error: 'Slug must be less than 191 characters' });
        }

        if (data.status && !['draft', 'published', 'scheduled'].includes(data.status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: draft, published, or scheduled' });
        }

        if (data.status === 'scheduled' && !data.published_at) {
            return res.status(400).json({ error: 'Scheduled posts require a publish date' });
        }

        if (data.visibility && !['public', 'members', 'paid'].includes(data.visibility)) {
            return res.status(400).json({ error: 'Invalid visibility. Must be: public, members, or paid' });
        }

        // Validate article type if provided
        if (data.article_type && !ARTICLE_TYPES[data.article_type]) {
            return res.status(400).json({
                error: 'Invalid article type. Must be: cronica, reportagem, or opiniao'
            });
        }

        // Process article type (add tag)
        data = processArticleType(data);

        const post = await ghostApi.updatePost(id, data);
        const article = ghostApi.transformGhostPost(post);

        res.json(article);
    } catch (err) {
        console.error('Error updating article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (err.message && err.message.includes('UpdateCollisionError')) {
            return res.status(409).json({ error: 'Update conflict: the article was modified by another user. Please refresh and try again.' });
        }
        res.status(400).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Delete an article from Ghost
 * DELETE /api/articles/:id
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Article ID is required' });
        }

        await ghostApi.deletePost(id);

        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        console.error('Error deleting article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        res.status(500).json({ error: extractErrorMessage(err) });
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
        res.status(500).json({ error: extractErrorMessage(err) });
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
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Get available article types
 * GET /api/articles/types
 */
exports.getTypes = async (req, res) => {
    try {
        const types = Object.entries(ARTICLE_TYPES).map(([key, data]) => ({
            value: key,
            label: data.label,
            tagName: data.name,
            tagSlug: data.slug
        }));

        res.json(types);
    } catch (err) {
        console.error('Error getting article types:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Initialize article type tags in Ghost
 * POST /api/articles/types/init
 * Creates the 3 article type tags if they don't exist
 */
exports.initTypes = async (req, res) => {
    try {
        const results = [];

        for (const [key, typeData] of Object.entries(ARTICLE_TYPES)) {
            try {
                // Check if tag already exists
                const existingTags = await ghostApi.listTags();
                const exists = existingTags.some(t => t.slug === typeData.slug);

                if (exists) {
                    results.push({
                        type: key,
                        status: 'exists',
                        message: `Tag "${typeData.name}" already exists`
                    });
                } else {
                    // Create the tag
                    await ghostApi.createTag({
                        name: typeData.name,
                        slug: typeData.slug,
                        description: `Artigos do tipo ${typeData.label}`
                    });

                    results.push({
                        type: key,
                        status: 'created',
                        message: `Tag "${typeData.name}" created successfully`
                    });
                }
            } catch (tagErr) {
                results.push({
                    type: key,
                    status: 'error',
                    message: tagErr.message
                });
            }
        }

        res.json({
            message: 'Article type tags initialization complete',
            results
        });
    } catch (err) {
        console.error('Error initializing article types:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};
