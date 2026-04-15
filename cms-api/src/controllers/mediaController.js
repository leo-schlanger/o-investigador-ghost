const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    Media,
    MediaFolder,
    MediaTag,
    MediaTagAssignment,
    sequelize,
    Sequelize
} = require('../models');
const { Op } = Sequelize;

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|svg|mp4|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Unsupported file type!'));
    }
}).single('file');

exports.uploadMedia = (req, res) => {
    upload(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        // Use PUBLIC_API_URL env var in production, fallback to request host
        const publicApiUrl = process.env.PUBLIC_API_URL;
        let fileUrl;

        if (publicApiUrl) {
            // Production: use configured public URL
            fileUrl = `${publicApiUrl}/uploads/${req.file.filename}`;
        } else {
            // Development: use request host
            const protocol = req.headers['x-forwarded-proto'] || req.protocol;
            const host = req.get('host');
            fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
        }

        try {
            // Get optional folderId from body
            const folderId = req.body.folderId || null;

            const media = await Media.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size,
                folderId
            });

            // Fetch with associations
            const mediaWithAssociations = await Media.findByPk(media.id, {
                include: [
                    { model: MediaFolder, as: 'folder' },
                    { model: MediaTag, as: 'tags' }
                ]
            });

            res.json(mediaWithAssociations);
        } catch (dbErr) {
            res.status(500).json({ error: dbErr.message });
        }
    });
};

exports.listMedia = async (req, res) => {
    try {
        const { folderId, tags, search, page = 1, limit = 50 } = req.query;

        const where = {};
        const include = [
            { model: MediaFolder, as: 'folder' },
            { model: MediaTag, as: 'tags' }
        ];

        // Filter by folder
        if (folderId !== undefined) {
            if (folderId === 'null' || folderId === '') {
                // Root level (no folder)
                where.folderId = null;
            } else {
                where.folderId = folderId;
            }
        }

        // Filter by search term (filename or originalName)
        if (search && search.trim()) {
            where[Op.or] = [
                { filename: { [Op.like]: `%${search.trim()}%` } },
                { originalName: { [Op.like]: `%${search.trim()}%` } }
            ];
        }

        // Build query
        let queryOptions = {
            where,
            include,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            distinct: true
        };

        // Filter by tags (comma-separated tag IDs)
        if (tags && tags.trim()) {
            const tagIds = tags
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
            if (tagIds.length > 0) {
                // Find media that has ALL specified tags
                const tagCount = parseInt(tagIds.length, 10);
                const mediaIdsWithTags = await MediaTagAssignment.findAll({
                    attributes: ['mediaId'],
                    where: { tagId: { [Op.in]: tagIds } },
                    group: ['mediaId'],
                    having: sequelize.where(
                        sequelize.fn('COUNT', sequelize.fn('DISTINCT', sequelize.col('tagId'))),
                        tagCount
                    )
                });

                const mediaIds = mediaIdsWithTags.map((m) => m.mediaId);
                where.id = { [Op.in]: mediaIds };
            }
        }

        const { count, rows } = await Media.findAndCountAll(queryOptions);

        res.json({
            items: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getMedia = async (req, res) => {
    try {
        const { id } = req.params;

        const media = await Media.findByPk(id, {
            include: [
                { model: MediaFolder, as: 'folder' },
                { model: MediaTag, as: 'tags' }
            ]
        });

        if (!media) {
            return res.status(404).json({ error: 'Media nao encontrada' });
        }

        res.json(media);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.updateMedia = async (req, res) => {
    try {
        const { id } = req.params;
        const { folderId, tagIds, originalName } = req.body;

        const media = await Media.findByPk(id);
        if (!media) {
            return res.status(404).json({ error: 'Media nao encontrada' });
        }

        // Update folder
        if (folderId !== undefined) {
            if (folderId) {
                const folder = await MediaFolder.findByPk(folderId);
                if (!folder) {
                    return res.status(404).json({ error: 'Pasta nao encontrada' });
                }
            }
            media.folderId = folderId || null;
        }

        // Update original name
        if (originalName !== undefined) {
            media.originalName = originalName;
        }

        await media.save();

        // Update tags if provided
        if (tagIds !== undefined) {
            // Remove all existing tag assignments
            await MediaTagAssignment.destroy({ where: { mediaId: id } });

            // Create new assignments
            if (Array.isArray(tagIds) && tagIds.length > 0) {
                const assignments = tagIds.map((tagId) => ({
                    mediaId: id,
                    tagId
                }));
                await MediaTagAssignment.bulkCreate(assignments, { ignoreDuplicates: true });
            }
        }

        // Fetch updated media with associations
        const updatedMedia = await Media.findByPk(id, {
            include: [
                { model: MediaFolder, as: 'folder' },
                { model: MediaTag, as: 'tags' }
            ]
        });

        res.json(updatedMedia);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkMove = async (req, res) => {
    try {
        const { mediaIds, folderId } = req.body;

        if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({ error: 'Lista de media IDs e obrigatoria' });
        }

        // Verify folder exists if provided
        if (folderId) {
            const folder = await MediaFolder.findByPk(folderId);
            if (!folder) {
                return res.status(404).json({ error: 'Pasta nao encontrada' });
            }
        }

        const [updatedCount] = await Media.update(
            { folderId: folderId || null },
            { where: { id: { [Op.in]: mediaIds } } }
        );

        res.json({
            message: `${updatedCount} items movidos`,
            updatedCount
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.bulkAddTags = async (req, res) => {
    try {
        const { mediaIds, tagIds } = req.body;

        if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
            return res.status(400).json({ error: 'Lista de media IDs e obrigatoria' });
        }

        if (!Array.isArray(tagIds) || tagIds.length === 0) {
            return res.status(400).json({ error: 'Lista de tag IDs e obrigatoria' });
        }

        // Create assignments for each media-tag pair
        const assignments = [];
        for (const mediaId of mediaIds) {
            for (const tagId of tagIds) {
                assignments.push({ mediaId, tagId });
            }
        }

        await MediaTagAssignment.bulkCreate(assignments, { ignoreDuplicates: true });

        res.json({
            message: `Tags adicionadas a ${mediaIds.length} items`
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMedia = async (req, res) => {
    try {
        const media = await Media.findByPk(req.params.id);
        if (!media) return res.status(404).json({ error: 'Media not found' });

        // Delete from disk
        const filePath = path.join(uploadDir, media.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Tag assignments will be deleted via CASCADE
        await media.destroy();
        res.json({ message: 'Media deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
