const GhostAdminAPI = require('@tryghost/admin-api');

// Initialize the Ghost Admin API client
let ghostApi = null;

try {
    if (process.env.GHOST_API_URL && process.env.GHOST_API_KEY) {
        ghostApi = new GhostAdminAPI({
            url: process.env.GHOST_API_URL,
            key: process.env.GHOST_API_KEY,
            version: 'v5.0'
        });
        // Ghost Admin API initialized
    } else {
        console.warn('GHOST_API_URL or GHOST_API_KEY not provided. Ghost API is disabled.');
    }
} catch (err) {
    console.error('Failed to initialize Ghost Admin API:', err);
}

/**
 * Check if Ghost API is available
 */
exports.isAvailable = () => !!ghostApi;

/**
 * List posts from Ghost with optional filters and pagination
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (draft, published, scheduled, all)
 * @param {number} options.limit - Number of posts to return
 * @param {number} options.page - Page number
 * @param {string} options.filter - Ghost filter string
 * @param {string} options.search - Search in title
 * @returns {Promise<Object>} - { posts: [], meta: { pagination } }
 */
exports.listPosts = async (options = {}) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const queryOptions = {
            include: 'tags,authors',
            limit: options.limit || 15,
            page: options.page || 1,
            order: 'updated_at DESC'
        };

        // Handle status filter
        if (options.status && options.status !== 'all') {
            queryOptions.filter = `status:${options.status}`;
        }

        // Handle search
        if (options.search) {
            const searchFilter = `title:~'${options.search}'`;
            queryOptions.filter = queryOptions.filter
                ? `${queryOptions.filter}+${searchFilter}`
                : searchFilter;
        }

        // Additional custom filter
        if (options.filter) {
            queryOptions.filter = queryOptions.filter
                ? `${queryOptions.filter}+${options.filter}`
                : options.filter;
        }

        const result = await ghostApi.posts.browse(queryOptions);

        return {
            posts: result,
            meta: result.meta
        };
    } catch (err) {
        console.error('Error listing posts from Ghost:', err);
        throw err;
    }
};

/**
 * Get a single post by ID from Ghost
 * @param {string} id - Post ID or slug
 * @param {Object} options - Options (e.g., { by: 'slug' })
 * @returns {Promise<Object>} - Post object
 */
exports.getPost = async (id, options = {}) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const queryOptions = {
            include: 'tags,authors'
        };

        let post;
        if (options.by === 'slug') {
            post = await ghostApi.posts.read({ slug: id, ...queryOptions });
        } else {
            post = await ghostApi.posts.read({ id, ...queryOptions });
        }

        return post;
    } catch (err) {
        console.error(`Error getting post ${id} from Ghost:`, err);
        throw err;
    }
};

/**
 * Create a new post in Ghost
 * @param {Object} data - Post data
 * @returns {Promise<Object>} - Created post
 */
exports.createPost = async (data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const postPayload = buildGhostPayload(data);
        const post = await ghostApi.posts.add(postPayload, { source: 'html' });
                return post;
    } catch (err) {
        console.error('Error creating post in Ghost:', err);
        throw err;
    }
};

/**
 * Update an existing post in Ghost
 * @param {string} id - Post ID
 * @param {Object} data - Post data to update
 * @returns {Promise<Object>} - Updated post
 */
exports.updatePost = async (id, data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        // First, get the current post to retrieve updated_at
        const existingPost = await ghostApi.posts.read({ id });

        const postPayload = buildGhostPayload(data);
        postPayload.id = id;
        postPayload.updated_at = existingPost.updated_at;

        const post = await ghostApi.posts.edit(postPayload, { source: 'html' });
                return post;
    } catch (err) {
        console.error(`Error updating post ${id} in Ghost:`, err);
        throw err;
    }
};

/**
 * Delete a post from Ghost
 * @param {string} id - Post ID
 * @returns {Promise<boolean>} - True if successful
 */
exports.deletePost = async (id) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        await ghostApi.posts.delete({ id });
                return true;
    } catch (err) {
        console.error(`Error deleting post ${id} from Ghost:`, err);
        throw err;
    }
};

/**
 * List all tags from Ghost
 * @returns {Promise<Array>} - Array of tags
 */
exports.listTags = async () => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const tags = await ghostApi.tags.browse({ limit: 'all', order: 'name ASC' });
        return tags;
    } catch (err) {
        console.error('Error listing tags from Ghost:', err);
        throw err;
    }
};

/**
 * List all authors from Ghost
 * @returns {Promise<Array>} - Array of authors
 */
exports.listAuthors = async () => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const authors = await ghostApi.users.browse({ limit: 'all' });
        return authors;
    } catch (err) {
        console.error('Error listing authors from Ghost:', err);
        throw err;
    }
};

/**
 * Build Ghost API payload from frontend data
 * @param {Object} data - Frontend data
 * @returns {Object} - Ghost API payload
 */
function buildGhostPayload(data) {
    const payload = {};

    // Required fields
    if (data.title !== undefined) payload.title = data.title;
    if (data.html !== undefined) payload.html = data.html;
    if (data.content !== undefined) payload.html = data.content; // Alias for backwards compat

    // Optional fields
    if (data.slug !== undefined) payload.slug = data.slug;
    if (data.custom_excerpt !== undefined) payload.custom_excerpt = data.custom_excerpt;
    if (data.excerpt !== undefined) payload.custom_excerpt = data.excerpt; // Alias
    if (data.feature_image !== undefined) payload.feature_image = data.feature_image || null;
    if (data.meta_title !== undefined) payload.meta_title = data.meta_title || null;
    if (data.meta_description !== undefined) payload.meta_description = data.meta_description || null;

    // Status handling
    if (data.status !== undefined) {
        payload.status = data.status;
    }

    // Visibility
    if (data.visibility !== undefined) {
        payload.visibility = data.visibility;
    }

    // Published date (for scheduled posts)
    if (data.published_at !== undefined) {
        payload.published_at = data.published_at;
    }

    // Tags - can be array of names or objects with id/name
    if (data.tags !== undefined) {
        if (Array.isArray(data.tags)) {
            payload.tags = data.tags.map(tag => {
                if (typeof tag === 'string') {
                    return { name: tag };
                }
                return tag;
            });
        }
    }

    // Authors
    if (data.authors !== undefined) {
        if (Array.isArray(data.authors)) {
            payload.authors = data.authors.map(author => {
                if (typeof author === 'string') {
                    return { email: author };
                }
                return author;
            });
        }
    }

    return payload;
}

// ============================================
// ARTICLE TYPES (Cronica, Reportagem, Opiniao)
// ============================================

/**
 * Article type definitions
 * Maps internal type keys to Ghost tag names
 */
const ARTICLE_TYPES = {
    cronica: { name: 'Tipo: Cronica', slug: 'tipo-cronica', label: 'Cronica' },
    reportagem: { name: 'Tipo: Reportagem', slug: 'tipo-reportagem', label: 'Reportagem' },
    opiniao: { name: 'Tipo: Opiniao', slug: 'tipo-opiniao', label: 'Opiniao' }
};

exports.ARTICLE_TYPES = ARTICLE_TYPES;

/**
 * Extract article type from tags array
 * @param {Array} tags - Array of tag objects
 * @returns {string|null} - Article type key (cronica, reportagem, opiniao) or null
 */
exports.extractArticleType = (tags) => {
    if (!tags || !Array.isArray(tags)) return null;

    for (const [typeKey, typeData] of Object.entries(ARTICLE_TYPES)) {
        const hasType = tags.some(tag =>
            tag.name === typeData.name ||
            tag.slug === typeData.slug
        );
        if (hasType) return typeKey;
    }

    return null;
};

/**
 * Get article type tag object for Ghost API
 * @param {string} typeKey - Article type key (cronica, reportagem, opiniao)
 * @returns {Object|null} - Tag object for Ghost API or null
 */
exports.getArticleTypeTag = (typeKey) => {
    const typeData = ARTICLE_TYPES[typeKey];
    if (!typeData) return null;

    return { name: typeData.name, slug: typeData.slug };
};

/**
 * Remove type tags from tags array
 * @param {Array} tags - Array of tag objects or strings
 * @returns {Array} - Tags without type tags
 */
exports.removeTypeTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return [];

    const typeNames = Object.values(ARTICLE_TYPES).map(t => t.name);
    const typeSlugs = Object.values(ARTICLE_TYPES).map(t => t.slug);

    return tags.filter(tag => {
        const tagName = typeof tag === 'string' ? tag : tag.name;
        const tagSlug = typeof tag === 'string' ? tag : tag.slug;

        return !typeNames.includes(tagName) && !typeSlugs.includes(tagSlug);
    });
};

/**
 * Transform Ghost post to frontend format
 * @param {Object} post - Ghost post object
 * @returns {Object} - Frontend-friendly post object
 */
exports.transformGhostPost = (post) => {
    const tags = post.tags || [];
    const articleType = exports.extractArticleType(tags);

    return {
        id: post.id,
        title: post.title,
        slug: post.slug,
        html: post.html,
        excerpt: post.custom_excerpt || post.excerpt,
        feature_image: post.feature_image,
        status: post.status,
        visibility: post.visibility,
        meta_title: post.meta_title,
        meta_description: post.meta_description,
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        tags: tags,
        authors: post.authors || [],
        // Computed fields
        reading_time: post.reading_time,
        url: post.url,
        // Article type (cronica, reportagem, opiniao)
        article_type: articleType,
        article_type_label: articleType ? ARTICLE_TYPES[articleType].label : null
    };
};

// ============================================
// PAGES (Static Pages)
// ============================================

/**
 * List pages from Ghost
 */
exports.listPages = async (options = {}) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const queryOptions = {
            include: 'tags,authors',
            limit: options.limit || 'all',
            page: options.page || 1,
            order: 'updated_at DESC'
        };

        if (options.status && options.status !== 'all') {
            queryOptions.filter = `status:${options.status}`;
        }

        if (options.search) {
            const searchFilter = `title:~'${options.search}'`;
            queryOptions.filter = queryOptions.filter
                ? `${queryOptions.filter}+${searchFilter}`
                : searchFilter;
        }

        const result = await ghostApi.pages.browse(queryOptions);
        return {
            pages: result,
            meta: result.meta
        };
    } catch (err) {
        console.error('Error listing pages from Ghost:', err);
        throw err;
    }
};

/**
 * Get a single page by ID
 */
exports.getPage = async (id, options = {}) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const queryOptions = { include: 'tags,authors' };
        let page;
        if (options.by === 'slug') {
            page = await ghostApi.pages.read({ slug: id, ...queryOptions });
        } else {
            page = await ghostApi.pages.read({ id, ...queryOptions });
        }
        return page;
    } catch (err) {
        console.error(`Error getting page ${id} from Ghost:`, err);
        throw err;
    }
};

/**
 * Create a new page in Ghost
 */
exports.createPage = async (data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const pagePayload = buildGhostPayload(data);
        const page = await ghostApi.pages.add(pagePayload, { source: 'html' });
                return page;
    } catch (err) {
        console.error('Error creating page in Ghost:', err);
        throw err;
    }
};

/**
 * Update an existing page in Ghost
 */
exports.updatePage = async (id, data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const existingPage = await ghostApi.pages.read({ id });
        const pagePayload = buildGhostPayload(data);
        pagePayload.id = id;
        pagePayload.updated_at = existingPage.updated_at;

        const page = await ghostApi.pages.edit(pagePayload, { source: 'html' });
                return page;
    } catch (err) {
        console.error(`Error updating page ${id} in Ghost:`, err);
        throw err;
    }
};

/**
 * Delete a page from Ghost
 */
exports.deletePage = async (id) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        await ghostApi.pages.delete({ id });
                return true;
    } catch (err) {
        console.error(`Error deleting page ${id} from Ghost:`, err);
        throw err;
    }
};

// ============================================
// TAGS (Full CRUD)
// ============================================

/**
 * Get a single tag by ID or slug
 */
exports.getTag = async (id, options = {}) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        let tag;
        if (options.by === 'slug') {
            tag = await ghostApi.tags.read({ slug: id });
        } else {
            tag = await ghostApi.tags.read({ id });
        }
        return tag;
    } catch (err) {
        console.error(`Error getting tag ${id} from Ghost:`, err);
        throw err;
    }
};

/**
 * Create a new tag in Ghost
 */
exports.createTag = async (data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const tagPayload = {
            name: data.name,
            slug: data.slug || undefined,
            description: data.description || null,
            feature_image: data.feature_image || null,
            meta_title: data.meta_title || null,
            meta_description: data.meta_description || null
        };

        const tag = await ghostApi.tags.add(tagPayload);
                return tag;
    } catch (err) {
        console.error('Error creating tag in Ghost:', err);
        throw err;
    }
};

/**
 * Update an existing tag in Ghost
 */
exports.updateTag = async (id, data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const existingTag = await ghostApi.tags.read({ id });

        const tagPayload = {
            id,
            updated_at: existingTag.updated_at,
            name: data.name !== undefined ? data.name : existingTag.name,
            slug: data.slug !== undefined ? data.slug : existingTag.slug,
            description: data.description !== undefined ? data.description : existingTag.description,
            feature_image: data.feature_image !== undefined ? data.feature_image : existingTag.feature_image,
            meta_title: data.meta_title !== undefined ? data.meta_title : existingTag.meta_title,
            meta_description: data.meta_description !== undefined ? data.meta_description : existingTag.meta_description
        };

        const tag = await ghostApi.tags.edit(tagPayload);
                return tag;
    } catch (err) {
        console.error(`Error updating tag ${id} in Ghost:`, err);
        throw err;
    }
};

/**
 * Delete a tag from Ghost
 */
exports.deleteTag = async (id) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        await ghostApi.tags.delete({ id });
                return true;
    } catch (err) {
        console.error(`Error deleting tag ${id} from Ghost:`, err);
        throw err;
    }
};

// ============================================
// SETTINGS (Navigation, Site settings)
// ============================================

/**
 * Get site settings from Ghost (includes navigation)
 */
exports.getSettings = async () => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const settings = await ghostApi.settings.browse();
        return settings;
    } catch (err) {
        console.error('Error getting settings from Ghost:', err);
        throw err;
    }
};

/**
 * Update site settings in Ghost
 */
exports.updateSettings = async (data) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const settings = await ghostApi.settings.edit(data);
                return settings;
    } catch (err) {
        console.error('Error updating settings in Ghost:', err);
        throw err;
    }
};

/**
 * Get navigation settings
 */
exports.getNavigation = async () => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const settings = await ghostApi.settings.browse();
        return {
            navigation: settings.navigation || [],
            secondary_navigation: settings.secondary_navigation || []
        };
    } catch (err) {
        console.error('Error getting navigation from Ghost:', err);
        throw err;
    }
};

/**
 * Update navigation settings
 */
exports.updateNavigation = async (navigation, secondaryNavigation) => {
    if (!ghostApi) {
        throw new Error('Ghost API is not configured');
    }

    try {
        const updateData = [];

        if (navigation !== undefined) {
            updateData.push({ key: 'navigation', value: JSON.stringify(navigation) });
        }

        if (secondaryNavigation !== undefined) {
            updateData.push({ key: 'secondary_navigation', value: JSON.stringify(secondaryNavigation) });
        }

        const settings = await ghostApi.settings.edit(updateData);
                return settings;
    } catch (err) {
        console.error('Error updating navigation in Ghost:', err);
        throw err;
    }
};
