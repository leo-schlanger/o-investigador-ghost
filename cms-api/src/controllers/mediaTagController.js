const { MediaTag, MediaTagAssignment, sequelize, Sequelize } = require('../models');
const { Op } = Sequelize;
const apiResponse = require('../utils/apiResponse');

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

        apiResponse.success(res, tags);
    } catch (err) {
        apiResponse.error(res, err.message);
    }
};

// Create a new tag
exports.createTag = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return apiResponse.error(res, 'Nome da tag e obrigatorio', 400);
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
            return apiResponse.error(res, 'Tag ja existe', 409);
        }

        const tag = await MediaTag.create({
            name: name.trim()
        });

        apiResponse.success(res, tag, 201);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return apiResponse.error(res, 'Tag ja existe', 409);
        }
        apiResponse.error(res, err.message);
    }
};

// Delete a tag
exports.deleteTag = async (req, res) => {
    try {
        const { id } = req.params;

        const tag = await MediaTag.findByPk(id);
        if (!tag) {
            return apiResponse.notFound(res, 'Tag');
        }

        // Assignments will be deleted via CASCADE
        await tag.destroy();
        apiResponse.success(res, { message: 'Tag eliminada' });
    } catch (err) {
        apiResponse.error(res, err.message);
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
            return apiResponse.success(res, tags);
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

        apiResponse.success(res, tags);
    } catch (err) {
        apiResponse.error(res, err.message);
    }
};

// Get or create tag by name (useful for inline tag creation)
exports.getOrCreate = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return apiResponse.error(res, 'Nome da tag e obrigatorio', 400);
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

        apiResponse.success(res, { tag, created }, created ? 201 : 200);
    } catch (err) {
        apiResponse.error(res, err.message);
    }
};
