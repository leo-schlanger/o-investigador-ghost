const { MediaTag, MediaTagAssignment, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;

// List all tags with usage count
exports.listTags = async (req, res) => {
    try {
        const tags = await MediaTag.findAll({
            attributes: {
                include: [
                    [
                        sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM MediaTagAssignments
                            WHERE MediaTagAssignments.tagId = MediaTag.id
                        )`),
                        'usageCount'
                    ]
                ]
            },
            order: [['name', 'ASC']]
        });

        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Create a new tag
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Nome da tag e obrigatorio' });
        }

        // Check if tag already exists
        const existing = await MediaTag.findOne({
            where: {
                name: {
                    [Op.like]: name.trim()
                }
            }
        });

        if (existing) {
            return res.status(409).json({ error: 'Tag ja existe', tag: existing });
        }

        const tag = await MediaTag.create({
            name: name.trim()
        });

        res.status(201).json(tag);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Tag ja existe' });
        }
        res.status(500).json({ error: err.message });
    }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await MediaTag.findByPk(id);
        if (!tag) {
            return res.status(404).json({ error: 'Tag nao encontrada' });
        }

        // Assignments will be deleted via CASCADE
        await tag.destroy();
        res.json({ message: 'Tag eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Autocomplete suggestions for tags
exports.getSuggestions = async (req, res) => {
    try {
        const { q = '' } = req.query;

        if (!q.trim()) {
            // Return most used tags if no query
            const tags = await MediaTag.findAll({
                attributes: {
                    include: [
                        [
                            sequelize.literal(`(
                                SELECT COUNT(*)
                                FROM MediaTagAssignments
                                WHERE MediaTagAssignments.tagId = MediaTag.id
                            )`),
                            'usageCount'
                        ]
                    ]
                },
                order: [[sequelize.literal('usageCount'), 'DESC']],
                limit: 10
            });
            return res.json(tags);
        }

        const tags = await MediaTag.findAll({
            where: {
                name: {
                    [Op.like]: `%${q.trim()}%`
                }
            },
            order: [['name', 'ASC']],
            limit: 10
        });

        res.json(tags);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Get or create tag by name (useful for inline tag creation)
exports.getOrCreate = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Nome da tag e obrigatorio' });
        }

        const [tag, created] = await MediaTag.findOrCreate({
            where: {
                name: {
                    [Op.like]: name.trim()
                }
            },
            defaults: {
                name: name.trim()
            }
        });

        res.status(created ? 201 : 200).json({ tag, created });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
