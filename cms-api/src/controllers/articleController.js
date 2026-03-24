const ghostApi = require('../services/ghostApi');
const {
    ARTICLE_TYPES,
    getArticleTypeTag,
    removeTypeTags,
    findAuthorByEmail,
    createGhostUserDirect,
    updateGhostUserDirect,
    GHOST_ROLES
} = require('../services/ghostApi');
const { ArticleRevision } = require('../models');
const logger = require('../utils/logger');

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

        // Validate and sanitize inputs
        const validStatuses = ['all', 'draft', 'published', 'scheduled'];
        const sanitizedStatus = validStatuses.includes(status) ? status : 'all';

        const sanitizedPage = Math.max(1, parseInt(page) || 1);
        const sanitizedLimit = Math.min(100, Math.max(1, parseInt(limit) || 15));

        // Sanitize search (remove dangerous characters, limit length)
        const sanitizedSearch = (search || '').slice(0, 100).replace(/[<>'"]/g, '');

        const options = {
            status: sanitizedStatus,
            search: sanitizedSearch,
            page: sanitizedPage,
            limit: sanitizedLimit
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
        logger.error('Error listing articles:', err);
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
        logger.error('Error getting article:', err);
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
            return res
                .status(400)
                .json({ error: 'Invalid status. Must be: draft, published, or scheduled' });
        }

        if (data.status === 'scheduled' && !data.published_at) {
            return res.status(400).json({ error: 'Scheduled posts require a publish date' });
        }

        if (data.visibility && !['public', 'members', 'paid'].includes(data.visibility)) {
            return res
                .status(400)
                .json({ error: 'Invalid visibility. Must be: public, members, or paid' });
        }

        // Validate article type if provided
        if (data.article_type && !ARTICLE_TYPES[data.article_type]) {
            return res.status(400).json({
                error: 'Invalid article type. Must be: cronica, reportagem, or opiniao'
            });
        }

        // Handle author assignment
        if (data.authors && req.user?.role !== 'admin') {
            // Non-admin cannot set custom authors
            delete data.authors;
            logger.warn('Non-admin user attempted to set authors', { userId: req.user?.id });
        }

        // Auto-assign author based on logged-in user's email if no authors specified
        if (!data.authors && req.user?.email) {
            const ghostAuthor = await findAuthorByEmail(req.user.email);
            if (ghostAuthor) {
                data.authors = [{ id: ghostAuthor.id, email: ghostAuthor.email }];
                logger.info('Auto-assigned author from user email', {
                    userId: req.user.id,
                    ghostAuthorId: ghostAuthor.id
                });
            } else {
                logger.warn('No matching Ghost author found for user', {
                    userId: req.user.id,
                    email: req.user.email
                });
            }
        }

        // Process article type (add tag)
        data = processArticleType(data);

        const post = await ghostApi.createPost(data);
        const article = ghostApi.transformGhostPost(post);

        res.status(201).json(article);
    } catch (err) {
        logger.error('Error creating article:', err);
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
            return res
                .status(400)
                .json({ error: 'Invalid status. Must be: draft, published, or scheduled' });
        }

        if (data.status === 'scheduled' && !data.published_at) {
            return res.status(400).json({ error: 'Scheduled posts require a publish date' });
        }

        if (data.visibility && !['public', 'members', 'paid'].includes(data.visibility)) {
            return res
                .status(400)
                .json({ error: 'Invalid visibility. Must be: public, members, or paid' });
        }

        // Validate article type if provided
        if (data.article_type && !ARTICLE_TYPES[data.article_type]) {
            return res.status(400).json({
                error: 'Invalid article type. Must be: cronica, reportagem, or opiniao'
            });
        }

        // Only admin can change authors - remove if not admin
        if (data.authors && req.user?.role !== 'admin') {
            delete data.authors;
            logger.warn('Non-admin user attempted to change authors', { userId: req.user?.id });
        }

        // Save revision before updating (non-blocking)
        try {
            const currentPost = await ghostApi.getPost(id);
            if (currentPost) {
                // Get the next revision number
                const lastRevision = await ArticleRevision.findOne({
                    where: { articleId: id },
                    order: [['revisionNumber', 'DESC']]
                });
                const revisionNumber = (lastRevision?.revisionNumber || 0) + 1;

                // Save the current state as a revision
                await ArticleRevision.create({
                    articleId: id,
                    userId: req.user?.id || null,
                    userName: req.user?.name || 'Unknown',
                    title: currentPost.title,
                    content: currentPost.html || currentPost.mobiledoc,
                    excerpt: currentPost.custom_excerpt || currentPost.excerpt,
                    featureImage: currentPost.feature_image,
                    status: currentPost.status,
                    revisionNumber
                });

                // Clean old revisions (keep only 50)
                await ArticleRevision.cleanOldRevisions(id, 50);
            }
        } catch (revErr) {
            logger.error('Error saving revision:', revErr);
            // Continue with update even if revision save fails
        }

        // Process article type (add tag)
        data = processArticleType(data);

        const post = await ghostApi.updatePost(id, data);
        const article = ghostApi.transformGhostPost(post);

        res.json(article);
    } catch (err) {
        logger.error('Error updating article:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Article not found' });
        }
        if (err.message && err.message.includes('UpdateCollisionError')) {
            return res.status(409).json({
                error: 'Update conflict: the article was modified by another user. Please refresh and try again.'
            });
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
        logger.error('Error deleting article:', err);
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

        res.json(
            tags.map((tag) => ({
                id: tag.id,
                name: tag.name,
                slug: tag.slug,
                description: tag.description,
                count: tag.count ? tag.count.posts : 0
            }))
        );
    } catch (err) {
        logger.error('Error getting tags:', err);
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

        res.json(
            authors.map((author) => ({
                id: author.id,
                name: author.name,
                slug: author.slug,
                email: author.email,
                profile_image: author.profile_image
            }))
        );
    } catch (err) {
        logger.error('Error getting authors:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Check sync status between local users and Ghost authors
 * GET /api/articles/authors/sync-status
 * Admin only - shows which users need to be created in Ghost
 */
exports.getAuthorSyncStatus = async (req, res) => {
    try {
        const { User } = require('../models');

        // Get all local users
        const localUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role']
        });

        // Get all Ghost authors
        const ghostAuthors = await ghostApi.listAuthors();
        const ghostEmails = ghostAuthors.map((a) => a.email?.toLowerCase()).filter(Boolean);

        // Find users without Ghost accounts
        const syncStatus = localUsers.map((user) => {
            const ghostAuthor = ghostAuthors.find(
                (a) => a.email?.toLowerCase() === user.email.toLowerCase()
            );

            return {
                localUser: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                },
                ghostAuthor: ghostAuthor
                    ? {
                          id: ghostAuthor.id,
                          name: ghostAuthor.name,
                          email: ghostAuthor.email,
                          slug: ghostAuthor.slug
                      }
                    : null,
                synced: !!ghostAuthor
            };
        });

        const unsynced = syncStatus.filter((s) => !s.synced);
        const synced = syncStatus.filter((s) => s.synced);

        res.json({
            total: syncStatus.length,
            synced: synced.length,
            unsynced: unsynced.length,
            users: syncStatus,
            message:
                unsynced.length > 0
                    ? `${unsynced.length} user(s) need to be added as staff in Ghost CMS`
                    : 'All users are synced with Ghost'
        });
    } catch (err) {
        logger.error('Error checking author sync status:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Sync all local users to Ghost (create missing users)
 * POST /api/articles/authors/sync
 * Admin only - creates Ghost users for all local users that don't exist in Ghost
 */
exports.syncAuthorsToGhost = async (req, res) => {
    try {
        // Only admin can sync users
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Only admin can sync users to Ghost' });
        }

        const { User, sequelize } = require('../models');

        // Get all local users with their password hashes and avatars
        const localUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'password', 'role', 'avatar']
        });

        // Get all Ghost authors
        const ghostAuthors = await ghostApi.listAuthors();

        const results = [];

        for (const user of localUsers) {
            const ghostAuthor = ghostAuthors.find(
                (a) => a.email?.toLowerCase() === user.email.toLowerCase()
            );

            if (ghostAuthor) {
                // User exists in Ghost - check if we need to update avatar
                if (user.avatar && !ghostAuthor.profile_image) {
                    try {
                        await updateGhostUserDirect(
                            user.email,
                            { avatar: user.avatar },
                            sequelize
                        );
                        results.push({
                            email: user.email,
                            name: user.name,
                            status: 'avatar_updated',
                            message: 'Avatar synced to Ghost'
                        });
                        logger.info('Updated Ghost user avatar', { email: user.email });
                    } catch (err) {
                        results.push({
                            email: user.email,
                            name: user.name,
                            status: 'avatar_error',
                            message: err.message
                        });
                    }
                } else {
                    results.push({
                        email: user.email,
                        name: user.name,
                        status: 'already_exists',
                        message: 'User already exists in Ghost'
                    });
                }
                continue;
            }

            try {
                // Create user in Ghost with same password hash and avatar
                const ghostUser = await createGhostUserDirect(
                    {
                        name: user.name,
                        email: user.email,
                        password: user.password, // bcrypt hash is compatible
                        role: user.role,
                        avatar: user.avatar || null
                    },
                    sequelize
                );

                results.push({
                    email: user.email,
                    name: user.name,
                    status: 'created',
                    ghostId: ghostUser.id,
                    message: 'User created successfully in Ghost'
                });

                logger.info('Created Ghost user', { email: user.email, ghostId: ghostUser.id });
            } catch (err) {
                results.push({
                    email: user.email,
                    name: user.name,
                    status: 'error',
                    message: err.message
                });

                logger.error('Failed to create Ghost user', { email: user.email, error: err.message });
            }
        }

        const created = results.filter((r) => r.status === 'created').length;
        const existing = results.filter((r) => r.status === 'already_exists').length;
        const errors = results.filter((r) => r.status === 'error').length;

        res.json({
            message: `Sync complete: ${created} created, ${existing} already existed, ${errors} errors`,
            results
        });
    } catch (err) {
        logger.error('Error syncing authors to Ghost:', err);
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
        logger.error('Error getting article types:', err);
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
                const exists = existingTags.some((t) => t.slug === typeData.slug);

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
        logger.error('Error initializing article types:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Get revision history for an article
 * GET /api/articles/:id/revisions
 */
exports.getRevisions = async (req, res) => {
    try {
        const { id } = req.params;

        const revisions = await ArticleRevision.findAll({
            where: { articleId: id },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'revisionNumber', 'title', 'userName', 'status', 'createdAt']
        });

        res.json(revisions);
    } catch (err) {
        logger.error('Error getting revisions:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Get a specific revision
 * GET /api/articles/:id/revisions/:revisionId
 */
exports.getRevision = async (req, res) => {
    try {
        const { id, revisionId } = req.params;

        const revision = await ArticleRevision.findOne({
            where: { id: revisionId, articleId: id }
        });

        if (!revision) {
            return res.status(404).json({ error: 'Revision not found' });
        }

        res.json(revision);
    } catch (err) {
        logger.error('Error getting revision:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};

/**
 * Restore an article to a previous revision
 * POST /api/articles/:id/revisions/:revisionId/restore
 */
exports.restoreRevision = async (req, res) => {
    try {
        const { id, revisionId } = req.params;

        const revision = await ArticleRevision.findOne({
            where: { id: revisionId, articleId: id }
        });

        if (!revision) {
            return res.status(404).json({ error: 'Revision not found' });
        }

        // Save current state before restoring
        const currentPost = await ghostApi.getPost(id);
        if (currentPost) {
            const lastRevision = await ArticleRevision.findOne({
                where: { articleId: id },
                order: [['revisionNumber', 'DESC']]
            });
            const revisionNumber = (lastRevision?.revisionNumber || 0) + 1;

            await ArticleRevision.create({
                articleId: id,
                userId: req.user?.id || null,
                userName: req.user?.name || 'Unknown',
                title: currentPost.title,
                content: currentPost.html || currentPost.mobiledoc,
                excerpt: currentPost.custom_excerpt || currentPost.excerpt,
                featureImage: currentPost.feature_image,
                status: currentPost.status,
                revisionNumber
            });
        }

        // Restore the revision
        const updateData = {
            title: revision.title,
            html: revision.content,
            custom_excerpt: revision.excerpt,
            feature_image: revision.featureImage
        };

        const post = await ghostApi.updatePost(id, updateData);
        const article = ghostApi.transformGhostPost(post);

        res.json({
            message: 'Article restored successfully',
            article
        });
    } catch (err) {
        logger.error('Error restoring revision:', err);
        res.status(500).json({ error: extractErrorMessage(err) });
    }
};
