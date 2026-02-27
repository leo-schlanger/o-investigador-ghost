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
        console.log('Ghost Admin API initialized successfully');
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
        console.log(`Successfully created post in Ghost (ID: ${post.id})`);
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
        console.log(`Successfully updated post in Ghost (ID: ${post.id})`);
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
        console.log(`Successfully deleted post in Ghost (ID: ${id})`);
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

/**
 * Transform Ghost post to frontend format
 * @param {Object} post - Ghost post object
 * @returns {Object} - Frontend-friendly post object
 */
exports.transformGhostPost = (post) => {
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
        tags: post.tags || [],
        authors: post.authors || [],
        // Computed fields
        reading_time: post.reading_time,
        url: post.url
    };
};
