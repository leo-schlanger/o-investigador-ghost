/**
 * Search System - O Investigador
 * Uses Ghost Content API to search posts
 */
(function() {
    'use strict';

    // DOM Elements
    const searchButtons = document.querySelectorAll('[data-ghost-search]');
    const modal = document.getElementById('search-modal');
    const backdrop = document.getElementById('search-backdrop');
    const input = document.getElementById('search-input');
    const closeBtn = document.getElementById('search-close');
    const resultsContainer = document.getElementById('search-results');
    const initialState = document.getElementById('search-initial');
    const loadingState = document.getElementById('search-loading');
    const emptyState = document.getElementById('search-empty');
    const listContainer = document.getElementById('search-list');

    // Configuration - Ghost Content API
    // The key is injected via Ghost's code injection or detected from ghost-sdk
    let apiUrl = '';
    let apiKey = '';

    // Try to get API config from Ghost's built-in search or meta tags
    function initializeApi() {
        // Method 1: Check for ghost-search config in page
        const ghostSearchMeta = document.querySelector('meta[name="ghost-search-key"]');
        if (ghostSearchMeta) {
            apiKey = ghostSearchMeta.content;
        }

        // Method 2: Check for data attribute on search button
        const searchBtn = document.querySelector('[data-ghost-search]');
        if (searchBtn && searchBtn.dataset.key) {
            apiKey = searchBtn.dataset.key;
        }

        // Method 3: Try to extract from existing Ghost config
        if (window.ghost && window.ghost.contentApiKey) {
            apiKey = window.ghost.contentApiKey;
        }

        // Get API URL from current site
        apiUrl = window.location.origin;

        // Fallback: Use a placeholder that admins should configure
        if (!apiKey) {
            // Check localStorage for configured key
            const storedKey = localStorage.getItem('ghost_content_api_key');
            if (storedKey) {
                apiKey = storedKey;
            }
        }
    }

    // State
    let searchTimeout = null;
    let lastQuery = '';

    // Open modal
    function openModal() {
        if (!modal) return;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Focus input after animation
        setTimeout(() => {
            input?.focus();
        }, 100);
    }

    // Close modal
    function closeModal() {
        if (!modal) return;

        modal.classList.add('hidden');
        document.body.style.overflow = '';

        // Clear input and reset state
        if (input) input.value = '';
        showState('initial');
        lastQuery = '';
    }

    // Show specific state
    function showState(state) {
        initialState?.classList.toggle('hidden', state !== 'initial');
        loadingState?.classList.toggle('hidden', state !== 'loading');
        emptyState?.classList.toggle('hidden', state !== 'empty');
        listContainer?.classList.toggle('hidden', state !== 'results');
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const options = { day: '2-digit', month: 'short', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Truncate text
    function truncate(text, maxLength = 120) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    // Create result item HTML
    function createResultItem(post) {
        const excerpt = post.custom_excerpt || post.excerpt || '';
        const tag = post.primary_tag ? post.primary_tag.name : '';
        const date = formatDate(post.published_at);

        return `
            <a href="${post.url}" class="block p-4 hover:bg-neutral-50 transition group">
                <div class="flex gap-4">
                    ${post.feature_image ? `
                        <div class="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                            <img
                                src="${post.feature_image}"
                                alt="${post.title}"
                                class="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                            >
                        </div>
                    ` : ''}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            ${tag ? `<span class="text-xs font-medium text-brand">${tag}</span>` : ''}
                            <span class="text-xs text-neutral-400">${date}</span>
                        </div>
                        <h3 class="font-semibold text-neutral-900 group-hover:text-brand transition line-clamp-2 mb-1">
                            ${post.title}
                        </h3>
                        <p class="text-sm text-neutral-500 line-clamp-2">
                            ${truncate(excerpt)}
                        </p>
                    </div>
                </div>
            </a>
        `;
    }

    // Render results
    function renderResults(posts) {
        if (!listContainer) return;

        if (posts.length === 0) {
            showState('empty');
            return;
        }

        listContainer.innerHTML = posts.map(createResultItem).join('');
        showState('results');
    }

    // Search posts using Ghost Content API
    async function searchPosts(query) {
        if (!query || query.length < 2) {
            showState('initial');
            return;
        }

        // Check if API key is configured
        if (!apiKey) {
            console.warn('Ghost Content API key not configured for search');
            listContainer.innerHTML = `
                <div class="p-6 text-center">
                    <p class="text-neutral-600 font-medium">Busca indisponivel</p>
                    <p class="text-neutral-400 text-sm mt-1">Configure a Content API Key nas configuracoes do Ghost</p>
                </div>
            `;
            showState('results');
            return;
        }

        showState('loading');

        try {
            // Build search URL with Ghost Content API
            const searchUrl = new URL(`${apiUrl}/ghost/api/content/posts/`);
            searchUrl.searchParams.set('key', apiKey);
            searchUrl.searchParams.set('limit', '10');
            searchUrl.searchParams.set('fields', 'id,title,slug,url,excerpt,custom_excerpt,feature_image,published_at');
            searchUrl.searchParams.set('include', 'tags');
            searchUrl.searchParams.set('filter', `title:~'${query}'+status:published`);

            const response = await fetch(searchUrl.toString());

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const posts = data.posts || [];

            // If title search returns few results, also search in content
            if (posts.length < 3) {
                const contentUrl = new URL(`${apiUrl}/ghost/api/content/posts/`);
                contentUrl.searchParams.set('key', apiKey);
                contentUrl.searchParams.set('limit', '10');
                contentUrl.searchParams.set('fields', 'id,title,slug,url,excerpt,custom_excerpt,feature_image,published_at');
                contentUrl.searchParams.set('include', 'tags');
                contentUrl.searchParams.set('filter', `plaintext:~'${query}'+status:published`);

                const contentResponse = await fetch(contentUrl.toString());
                if (contentResponse.ok) {
                    const contentData = await contentResponse.json();
                    const contentPosts = contentData.posts || [];

                    // Merge results, avoiding duplicates
                    const existingIds = new Set(posts.map(p => p.id));
                    contentPosts.forEach(post => {
                        if (!existingIds.has(post.id)) {
                            posts.push(post);
                        }
                    });
                }
            }

            renderResults(posts.slice(0, 10));
        } catch (error) {
            console.error('Search error:', error);
            listContainer.innerHTML = `
                <div class="p-6 text-center">
                    <p class="text-neutral-600 font-medium">Erro na busca</p>
                    <p class="text-neutral-400 text-sm mt-1">Tente novamente mais tarde</p>
                </div>
            `;
            showState('results');
        }
    }

    // Handle input with debounce
    function handleInput(e) {
        const query = e.target.value.trim();

        // Clear previous timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Don't search if query hasn't changed
        if (query === lastQuery) return;
        lastQuery = query;

        // Show initial state if query is empty
        if (!query) {
            showState('initial');
            return;
        }

        // Debounce search
        searchTimeout = setTimeout(() => {
            searchPosts(query);
        }, 300);
    }

    // Handle keyboard events
    function handleKeydown(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    }

    // Handle global keyboard shortcut (Ctrl/Cmd + K)
    function handleGlobalKeydown(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (modal?.classList.contains('hidden')) {
                openModal();
            } else {
                closeModal();
            }
        }
    }

    // Initialize
    function init() {
        initializeApi();

        // Bind search button clicks
        searchButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        // Bind close actions
        closeBtn?.addEventListener('click', closeModal);
        backdrop?.addEventListener('click', closeModal);

        // Bind input events
        input?.addEventListener('input', handleInput);

        // Bind keyboard events
        document.addEventListener('keydown', handleGlobalKeydown);
        modal?.addEventListener('keydown', handleKeydown);
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
