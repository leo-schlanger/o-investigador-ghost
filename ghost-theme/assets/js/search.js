/**
 * Search System - O Investigador
 * Uses Ghost Content API to search posts
 * Features: AJAX preview, search history, keyboard navigation, term highlighting
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
    let apiUrl = '';
    let apiKey = '';

    // Search history configuration
    const HISTORY_KEY = 'search_history';
    const MAX_HISTORY = 5;
    let selectedIndex = -1;

    // Sanitize strings to prevent XSS when inserting into HTML
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

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
    let currentQuery = '';

    // Search History Functions
    function getSearchHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        } catch {
            return [];
        }
    }

    function saveToHistory(query) {
        if (!query || query.length < 2) return;
        let history = getSearchHistory();
        history = history.filter(h => h.toLowerCase() !== query.toLowerCase());
        history.unshift(query);
        history = history.slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }

    function clearHistory() {
        localStorage.removeItem(HISTORY_KEY);
        showState('initial');
    }

    // Highlight search terms in text
    function highlightTerms(text, query) {
        if (!text || !query) return text;
        const terms = query.split(/\s+/).filter(t => t.length > 1);
        let result = text;
        terms.forEach(term => {
            const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            result = result.replace(regex, '<mark class="bg-yellow-200 text-neutral-900 rounded px-0.5">$1</mark>');
        });
        return result;
    }

    // Render search history
    function renderHistory() {
        const history = getSearchHistory();
        if (history.length === 0) {
            if (initialState) {
                initialState.innerHTML = '<p class="text-sm">Digite para pesquisar artigos, autores e categorias</p>';
            }
            return;
        }

        if (initialState) {
            initialState.innerHTML = `
                <div class="text-left">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-xs font-medium text-neutral-400 uppercase tracking-wider">Pesquisas recentes</span>
                        <button id="clear-history" class="text-xs text-neutral-400 hover:text-neutral-600 transition">Limpar</button>
                    </div>
                    <div class="space-y-1">
                        ${history.map((h, i) => `
                            <button class="history-item flex items-center gap-2 w-full px-3 py-2 text-left text-neutral-700 hover:bg-neutral-100 rounded-lg transition ${i === selectedIndex ? 'bg-neutral-100' : ''}" data-query="${escapeHtml(h)}">
                                <svg class="w-4 h-4 text-neutral-400 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                <span class="truncate">${escapeHtml(h)}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;

            // Bind history item clicks
            initialState.querySelectorAll('.history-item').forEach(item => {
                item.addEventListener('click', () => {
                    const query = item.dataset.query;
                    if (input) input.value = query;
                    searchPosts(query);
                });
            });

            // Bind clear history
            const clearBtn = initialState.querySelector('#clear-history');
            clearBtn?.addEventListener('click', (e) => {
                e.stopPropagation();
                clearHistory();
            });
        }
    }

    // Open modal
    function openModal() {
        if (!modal) return;

        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Save previously focused element to restore on close
        previouslyFocused = document.activeElement;

        // Show history on open
        showState('initial');
        renderHistory();
        selectedIndex = -1;

        // Focus input after animation
        setTimeout(() => {
            input?.focus();
        }, 100);
    }

    // Focus trap - keep Tab/Shift+Tab within the modal
    var previouslyFocused = null;
    function handleFocusTrap(e) {
        if (!modal || modal.classList.contains('hidden')) return;
        if (e.key !== 'Tab') return;

        var focusableEls = modal.querySelectorAll(
            'input, button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableEls.length) return;

        var firstEl = focusableEls[0];
        var lastEl = focusableEls[focusableEls.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstEl) {
                e.preventDefault();
                lastEl.focus();
            }
        } else {
            if (document.activeElement === lastEl) {
                e.preventDefault();
                firstEl.focus();
            }
        }
    }
    document.addEventListener('keydown', handleFocusTrap);

    // Close modal
    function closeModal() {
        if (!modal) return;

        modal.classList.add('hidden');
        document.body.style.overflow = '';

        // Clear input and reset state
        if (input) input.value = '';
        showState('initial');
        lastQuery = '';
        currentQuery = '';
        selectedIndex = -1;

        // Restore focus to previously focused element
        if (previouslyFocused && previouslyFocused.focus) {
            previouslyFocused.focus();
            previouslyFocused = null;
        }
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

    // Create result item HTML with highlighting
    function createResultItem(post, index) {
        const excerpt = post.custom_excerpt || post.excerpt || '';
        const tag = post.primary_tag ? post.primary_tag.name : '';
        const date = formatDate(post.published_at);
        const isSelected = index === selectedIndex;
        const safeUrl = escapeHtml(post.url);
        const safeImage = escapeHtml(post.feature_image);
        const safeTitle = escapeHtml(post.title);
        const safeTag = escapeHtml(tag);

        return `
            <a href="${safeUrl}" class="search-result block p-4 hover:bg-neutral-50 transition group ${isSelected ? 'bg-primary-50' : ''}" data-index="${index}">
                <div class="flex gap-4">
                    ${post.feature_image ? `
                        <div class="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24">
                            <img
                                src="${safeImage}"
                                alt="${safeTitle}"
                                class="w-full h-full object-cover rounded-lg"
                                loading="lazy"
                            >
                        </div>
                    ` : ''}
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            ${tag ? `<span class="text-xs font-medium text-brand">${safeTag}</span>` : ''}
                            <span class="text-xs text-neutral-400">${date}</span>
                        </div>
                        <h3 class="font-semibold text-neutral-900 group-hover:text-brand transition line-clamp-2 mb-1">
                            ${highlightTerms(safeTitle, currentQuery)}
                        </h3>
                        <p class="text-sm text-neutral-500 line-clamp-2">
                            ${highlightTerms(truncate(escapeHtml(excerpt)), currentQuery)}
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

        selectedIndex = -1;
        listContainer.innerHTML = posts.map((post, i) => createResultItem(post, i)).join('');
        showState('results');

        // Save to history when results are shown
        if (currentQuery) {
            saveToHistory(currentQuery);
        }
    }

    // Update selection highlight
    function updateSelection(results) {
        results.forEach((el, i) => {
            el.classList.toggle('bg-primary-50', i === selectedIndex);
        });

        // Scroll selected into view
        if (selectedIndex >= 0 && results[selectedIndex]) {
            results[selectedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    // Handle keyboard navigation
    function handleResultsKeydown(e) {
        const results = listContainer?.querySelectorAll('.search-result');
        if (!results || results.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
            updateSelection(results);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(results);
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            results[selectedIndex]?.click();
        }
    }

    // Search posts using Ghost Content API
    async function searchPosts(query) {
        if (!query || query.length < 2) {
            showState('initial');
            renderHistory();
            return;
        }

        currentQuery = query;

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
        } else if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
            handleResultsKeydown(e);
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
