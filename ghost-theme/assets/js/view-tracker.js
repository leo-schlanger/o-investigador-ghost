/**
 * View Tracker - Tracks post views and fetches most viewed posts
 */
(function() {
    'use strict';

    // Determine API URL based on environment
    const isProduction = window.location.hostname !== 'localhost';
    const apiBaseUrl = isProduction
        ? 'https://api.jornalinvestigador.pt'
        : 'http://localhost:3001';

    /**
     * Track a view for the current post
     */
    function trackView() {
        // Check if we're on a post page
        const postMeta = document.querySelector('meta[property="og:type"][content="article"]');
        if (!postMeta) return;

        // Get post data from the page
        const postIdMeta = document.querySelector('meta[name="post-id"]');
        const urlMeta = document.querySelector('meta[property="og:url"]');
        const titleMeta = document.querySelector('meta[property="og:title"]');

        // Extract post ID from URL if not in meta
        let postId = postIdMeta ? postIdMeta.content : null;
        const postUrl = urlMeta ? urlMeta.content : window.location.href;
        const postTitle = titleMeta ? titleMeta.content : document.title;

        // Extract slug from URL
        const urlParts = postUrl.split('/').filter(p => p);
        const postSlug = urlParts[urlParts.length - 1] || '';

        // Use slug as postId if no meta tag
        if (!postId) {
            postId = postSlug;
        }

        if (!postId) return;

        // Check if already tracked in this session
        const sessionKey = `viewed_${postId}`;
        if (sessionStorage.getItem(sessionKey)) return;

        // Track the view
        fetch(`${apiBaseUrl}/api/public/track-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postId,
                postSlug,
                postTitle
            })
        })
        .then(response => response.json())
        .then(() => {
            sessionStorage.setItem(sessionKey, 'true');
        })
        .catch(err => {
            console.error('Error tracking view:', err);
        });
    }

    /**
     * Load and display most viewed posts
     */
    function loadMostViewed() {
        const container = document.getElementById('most-viewed-list');
        if (!container) return;

        fetch(`${apiBaseUrl}/api/public/most-viewed?limit=5`)
            .then(response => response.json())
            .then(posts => {
                if (!posts || posts.length === 0) {
                    // Keep fallback content
                    return;
                }

                // Clear container
                container.replaceChildren();

                posts.forEach((post, index) => {
                    const li = document.createElement('li');
                    li.className = 'flex gap-2 border-b border-neutral-200 pb-2 last:border-0 group';

                    const number = document.createElement('span');
                    number.className = 'text-brand-accent font-black text-sm sm:text-base md:text-lg';
                    number.textContent = `${index + 1}.`;

                    const link = document.createElement('a');
                    link.href = `/${post.postSlug}/`;
                    link.className = 'font-bold text-xs sm:text-sm md:text-base lg:text-lg hover:text-brand-accent transition-colors line-clamp-2';
                    link.textContent = post.postTitle;

                    li.appendChild(number);
                    li.appendChild(link);
                    container.appendChild(li);
                });
            })
            .catch(err => {
                console.error('Error loading most viewed:', err);
                // Keep fallback content on error
            });
    }

    // Initialize on DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        trackView();
        loadMostViewed();
    });
})();
