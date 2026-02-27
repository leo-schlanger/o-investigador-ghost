/**
 * Convert Editor.js data to HTML
 * @param {Object} editorData - Editor.js output data
 * @returns {string} - HTML string
 */
export const convertToHtml = (editorData) => {
    if (!editorData || !editorData.blocks) {
        return '';
    }

    return editorData.blocks.map(block => {
        switch (block.type) {
            case 'header':
                return `<h${block.data.level}>${escapeHtml(block.data.text)}</h${block.data.level}>`;

            case 'paragraph':
                return `<p>${block.data.text}</p>`;

            case 'list':
                const listTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                const items = block.data.items.map(item => `<li>${item}</li>`).join('');
                return `<${listTag}>${items}</${listTag}>`;

            case 'image':
                let imgHtml = `<figure>`;
                imgHtml += `<img src="${escapeHtml(block.data.file.url)}" alt="${escapeHtml(block.data.caption || '')}"`;
                if (block.data.stretched) imgHtml += ' class="stretched"';
                if (block.data.withBorder) imgHtml += ' style="border: 1px solid #ccc"';
                imgHtml += '>';
                if (block.data.caption) {
                    imgHtml += `<figcaption>${escapeHtml(block.data.caption)}</figcaption>`;
                }
                imgHtml += `</figure>`;
                return imgHtml;

            case 'embed':
                return `<figure class="kg-card kg-embed-card">
                    <iframe src="${escapeHtml(block.data.embed)}" width="${block.data.width || 560}" height="${block.data.height || 315}" frameborder="0" allowfullscreen></iframe>
                    ${block.data.caption ? `<figcaption>${escapeHtml(block.data.caption)}</figcaption>` : ''}
                </figure>`;

            case 'quote':
                return `<blockquote>
                    <p>${block.data.text}</p>
                    ${block.data.caption ? `<cite>${escapeHtml(block.data.caption)}</cite>` : ''}
                </blockquote>`;

            case 'code':
                return `<pre><code>${escapeHtml(block.data.code)}</code></pre>`;

            case 'table':
                let tableHtml = '<table>';
                if (block.data.withHeadings && block.data.content.length > 0) {
                    tableHtml += '<thead><tr>';
                    block.data.content[0].forEach(cell => {
                        tableHtml += `<th>${cell}</th>`;
                    });
                    tableHtml += '</tr></thead>';
                    tableHtml += '<tbody>';
                    block.data.content.slice(1).forEach(row => {
                        tableHtml += '<tr>';
                        row.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody>';
                } else {
                    tableHtml += '<tbody>';
                    block.data.content.forEach(row => {
                        tableHtml += '<tr>';
                        row.forEach(cell => {
                            tableHtml += `<td>${cell}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    tableHtml += '</tbody>';
                }
                tableHtml += '</table>';
                return tableHtml;

            case 'delimiter':
                return '<hr>';

            default:
                console.warn(`Unknown block type: ${block.type}`);
                return '';
        }
    }).join('\n');
};

/**
 * Convert HTML to Editor.js blocks
 * Note: This is a basic parser for simple HTML structures
 * @param {string} html - HTML string
 * @returns {Object} - Editor.js data format
 */
export const htmlToEditorJs = (html) => {
    if (!html || typeof html !== 'string') {
        return { time: Date.now(), blocks: [], version: '2.28.0' };
    }

    const blocks = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.body.children;

    for (const element of elements) {
        const block = parseElement(element);
        if (block) {
            blocks.push(block);
        }
    }

    return {
        time: Date.now(),
        blocks,
        version: '2.28.0'
    };
};

/**
 * Parse a single HTML element to Editor.js block
 * @param {Element} element - DOM element
 * @returns {Object|null} - Editor.js block or null
 */
function parseElement(element) {
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
        case 'h1':
        case 'h2':
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
            return {
                type: 'header',
                data: {
                    text: element.innerHTML,
                    level: parseInt(tagName.charAt(1))
                }
            };

        case 'p':
            return {
                type: 'paragraph',
                data: {
                    text: element.innerHTML
                }
            };

        case 'ul':
        case 'ol':
            const items = Array.from(element.querySelectorAll('li')).map(li => li.innerHTML);
            return {
                type: 'list',
                data: {
                    style: tagName === 'ol' ? 'ordered' : 'unordered',
                    items
                }
            };

        case 'figure':
            const img = element.querySelector('img');
            const iframe = element.querySelector('iframe');
            const figcaption = element.querySelector('figcaption');

            if (img) {
                return {
                    type: 'image',
                    data: {
                        file: {
                            url: img.src
                        },
                        caption: figcaption ? figcaption.textContent : '',
                        withBorder: false,
                        stretched: img.classList.contains('stretched'),
                        withBackground: false
                    }
                };
            }

            if (iframe) {
                return {
                    type: 'embed',
                    data: {
                        service: detectEmbedService(iframe.src),
                        embed: iframe.src,
                        width: parseInt(iframe.width) || 560,
                        height: parseInt(iframe.height) || 315,
                        caption: figcaption ? figcaption.textContent : ''
                    }
                };
            }
            break;

        case 'img':
            return {
                type: 'image',
                data: {
                    file: {
                        url: element.src
                    },
                    caption: element.alt || '',
                    withBorder: false,
                    stretched: false,
                    withBackground: false
                }
            };

        case 'blockquote':
            const quoteP = element.querySelector('p');
            const cite = element.querySelector('cite');
            return {
                type: 'quote',
                data: {
                    text: quoteP ? quoteP.innerHTML : element.innerHTML,
                    caption: cite ? cite.textContent : '',
                    alignment: 'left'
                }
            };

        case 'pre':
            const code = element.querySelector('code');
            return {
                type: 'code',
                data: {
                    code: code ? code.textContent : element.textContent
                }
            };

        case 'table':
            const content = [];
            const hasHeadings = !!element.querySelector('thead');
            const headRow = element.querySelector('thead tr');
            const bodyRows = element.querySelectorAll('tbody tr');

            if (headRow) {
                content.push(Array.from(headRow.querySelectorAll('th, td')).map(cell => cell.innerHTML));
            }

            bodyRows.forEach(row => {
                content.push(Array.from(row.querySelectorAll('td, th')).map(cell => cell.innerHTML));
            });

            return {
                type: 'table',
                data: {
                    withHeadings: hasHeadings,
                    content
                }
            };

        case 'hr':
            return {
                type: 'delimiter',
                data: {}
            };

        default:
            // Try to parse as paragraph if text content exists
            if (element.textContent.trim()) {
                return {
                    type: 'paragraph',
                    data: {
                        text: element.innerHTML
                    }
                };
            }
            return null;
    }

    return null;
}

/**
 * Detect embed service from URL
 * @param {string} url - Embed URL
 * @returns {string} - Service name
 */
function detectEmbedService(url) {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('codepen.io')) return 'codepen';
    return 'unknown';
}

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Generate a URL-friendly slug from title
 * @param {string} title - Article title
 * @returns {string} - URL slug
 */
export const generateSlug = (title) => {
    if (!title) return '';

    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-') // Multiple hyphens to single
        .replace(/^-|-$/g, ''); // Trim hyphens
};
