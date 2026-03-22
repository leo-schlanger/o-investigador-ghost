const ghostApi = require('../services/ghostApi');

/**
 * List all tags
 * GET /api/tags
 */
exports.list = async (req, res) => {
    try {
        const tags = await ghostApi.listTags();

        res.json(tags.map(tag => ({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            feature_image: tag.feature_image,
            meta_title: tag.meta_title,
            meta_description: tag.meta_description,
            count: tag.count ? tag.count.posts : 0,
            created_at: tag.created_at,
            updated_at: tag.updated_at
        })));
    } catch (err) {
        console.error('Error listing tags:', err);
        res.status(500).json({ error: err.message });
    }
};

/**
 * Get a single tag
 * GET /api/tags/:id
 */
exports.get = async (req, res) => {
    try {
        const { id } = req.params;
        const tag = await ghostApi.getTag(id);

        res.json({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            feature_image: tag.feature_image,
            meta_title: tag.meta_title,
            meta_description: tag.meta_description,
            count: tag.count ? tag.count.posts : 0
        });
    } catch (err) {
        console.error('Error getting tag:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Create a new tag
 * POST /api/tags
 */
exports.create = async (req, res) => {
    try {
        const data = req.body;

        if (!data.name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const tag = await ghostApi.createTag(data);

        res.status(201).json({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            feature_image: tag.feature_image,
            meta_title: tag.meta_title,
            meta_description: tag.meta_description
        });
    } catch (err) {
        console.error('Error creating tag:', err);
        res.status(400).json({ error: err.message });
    }
};

/**
 * Update an existing tag
 * PUT /api/tags/:id
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const tag = await ghostApi.updateTag(id, data);

        res.json({
            id: tag.id,
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
            feature_image: tag.feature_image,
            meta_title: tag.meta_title,
            meta_description: tag.meta_description
        });
    } catch (err) {
        console.error('Error updating tag:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(400).json({ error: err.message });
    }
};

/**
 * Delete a tag
 * DELETE /api/tags/:id
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        await ghostApi.deleteTag(id);
        res.json({ message: 'Tag deleted successfully' });
    } catch (err) {
        console.error('Error deleting tag:', err);
        if (err.message && err.message.includes('not found')) {
            return res.status(404).json({ error: 'Tag not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

/**
 * Category tags required for navigation
 */
const CATEGORY_TAGS = [
    { name: 'Politica', slug: 'politica', description: 'Noticias sobre politica nacional e internacional' },
    { name: 'Economia', slug: 'economia', description: 'Noticias sobre economia e financas' },
    { name: 'Justica', slug: 'justica', description: 'Noticias sobre justica e direito' },
    { name: 'Internacional', slug: 'internacional', description: 'Noticias internacionais' },
    { name: 'Tecnologia', slug: 'tecnologia', description: 'Noticias sobre tecnologia e inovacao' },
    { name: 'Cultura', slug: 'cultura', description: 'Noticias sobre cultura e entretenimento' },
    { name: 'Investigacoes', slug: 'investigacoes', description: 'Reportagens investigativas' },
    { name: 'Sociedade', slug: 'sociedade', description: 'Noticias sobre sociedade e comunidade' },
    { name: 'Ambiente', slug: 'ambiente', description: 'Noticias sobre ambiente e sustentabilidade' },
    { name: 'Saude', slug: 'saude', description: 'Noticias sobre saude e bem-estar' },
    { name: 'Educacao', slug: 'educacao', description: 'Noticias sobre educacao e ensino' },
    { name: 'Magazine', slug: 'magazine', description: 'Reportagens especiais e conteudo exclusivo' }
];

/**
 * Initialize category tags
 * POST /api/tags/init-categories
 * Creates all required category tags if they don't exist
 */
exports.initCategories = async (req, res) => {
    try {
        const results = {
            created: [],
            existing: [],
            errors: []
        };

        // Get existing tags
        const existingTags = await ghostApi.listTags();
        const existingSlugs = existingTags.map(t => t.slug);

        for (const category of CATEGORY_TAGS) {
            if (existingSlugs.includes(category.slug)) {
                results.existing.push(category.name);
                continue;
            }

            try {
                await ghostApi.createTag(category);
                results.created.push(category.name);
            } catch (err) {
                // Tag might already exist with slightly different data
                if (err.message && err.message.includes('already exists')) {
                    results.existing.push(category.name);
                } else {
                    results.errors.push({ name: category.name, error: err.message });
                }
            }
        }

        res.json({
            message: 'Category tags initialization complete',
            created: results.created,
            existing: results.existing,
            errors: results.errors
        });
    } catch (err) {
        console.error('Error initializing category tags:', err);
        res.status(500).json({ error: err.message });
    }
};
