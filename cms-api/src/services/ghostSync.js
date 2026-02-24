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
        console.warn('GHOST_API_URL or GHOST_API_KEY not provided. Ghost Sync is disabled.');
    }
} catch (err) {
    console.error('Failed to initialize Ghost Admin API:', err);
}

/**
 * Synchronizes an article from the custom CMS to Ghost CMS
 * @param {Object} articleData - The article data from our local DB
 * @param {String} existingGhostId - The Ghost ID if it's an update, null/undefined if creation
 * @returns {Promise<String|null>} - Returns the Ghost Post ID or null if failed/disabled
 */
exports.syncArticleToGhost = async (articleData, existingGhostId = null) => {
    if (!ghostApi) return null;

    try {
        const postPayload = {
            title: articleData.title,
            // Convert simple text to HTML/mobiledoc or leverage Ghost's HTML fallback (lexical is default in v5)
            html: articleData.content || '',
            status: articleData.status === 'published' ? 'published' : 'draft',
            feature_image: articleData.feature_image || null
        };

        let result;

        if (existingGhostId) {
            // Include ID to update
            postPayload.id = existingGhostId;
            // Ghost requires the updated_at field when updating natively, but the JS SDK handles 
            // fetching and updating if you pass id, though sometimes it's better to fetch first:
            const existingPost = await ghostApi.posts.read({ id: existingGhostId });
            postPayload.updated_at = existingPost.updated_at;

            result = await ghostApi.posts.edit(postPayload);
            console.log(`Successfully updated post in Ghost (ID: ${result.id})`);
        } else {
            // Create new post
            result = await ghostApi.posts.add(postPayload);
            console.log(`Successfully created post in Ghost (ID: ${result.id})`);
        }

        return result.id;
    } catch (err) {
        console.error('Error syncing article to Ghost:', err);
        return null;
    }
};

/**
 * Deletes an article from Ghost CMS natively
 * @param {String} ghostId - The ID of the post in Ghost
 * @returns {Promise<Boolean>} - True if successful, false otherwise
 */
exports.deleteArticleFromGhost = async (ghostId) => {
    if (!ghostApi || !ghostId) return false;

    try {
        await ghostApi.posts.delete({ id: ghostId });
        console.log(`Successfully deleted post in Ghost (ID: ${ghostId})`);
        return true;
    } catch (err) {
        console.error('Error deleting article from Ghost:', err);
        return false;
    }
};
