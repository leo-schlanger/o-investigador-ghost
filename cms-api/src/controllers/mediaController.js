const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Media } = require('../models');

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
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
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

        const protocol = req.protocol;
        const host = req.get('host');
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        try {
            const media = await Media.create({
                filename: req.file.filename,
                originalName: req.file.originalname,
                url: fileUrl,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            res.json(media);
        } catch (dbErr) {
            res.status(500).json({ error: dbErr.message });
        }
    });
};

exports.listMedia = async (req, res) => {
    try {
        const items = await Media.findAll({ order: [['createdAt', 'DESC']] });
        res.json(items);
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

        await media.destroy();
        res.json({ message: 'Media deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
