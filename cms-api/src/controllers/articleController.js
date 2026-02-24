const { Article } = require('../models');
const ghostSync = require('../services/ghostSync');

exports.list = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status } : {};
        const articles = await Article.findAll({ where, order: [['updatedAt', 'DESC']] });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const article = await Article.create(req.body);

        // Sync to Ghost
        const ghostId = await ghostSync.syncArticleToGhost(article);
        if (ghostId) {
            await article.update({ ghostId });
        }

        res.status(201).json(article);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.get = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });
        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });

        await article.update(req.body);

        // Sync to Ghost (pass existing ghostId)
        const updatedGhostId = await ghostSync.syncArticleToGhost(article, article.ghostId);

        // If it got created on Ghost just now (e.g. didn't have ID before), save it
        if (!article.ghostId && updatedGhostId) {
            await article.update({ ghostId: updatedGhostId });
        }

        res.json(article);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ error: 'Article not found' });

        if (article.ghostId) {
            await ghostSync.deleteArticleFromGhost(article.ghostId);
        }

        await article.destroy();
        res.json({ message: 'Article deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
