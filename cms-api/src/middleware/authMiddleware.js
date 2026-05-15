const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, getJwtSecret());
            req.user = decoded;

            return next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: 'Sessao expirada. Faca login novamente.' });
            }
            return res.status(401).json({ error: 'Token invalido. Faca login novamente.' });
        }
    }

    if (!token) {
        return res.status(401).json({ error: 'Acesso nao autorizado. Faca login para continuar.' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `User role ${req.user ? req.user.role : 'none'} is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * Middleware to enforce article ownership for authors.
 * Admins and editors can modify any article.
 * Authors can only modify articles they authored.
 *
 * Must be used after `protect` middleware (requires req.user).
 * Expects req.params.id to be the Ghost post ID.
 */
exports.checkArticleOwnership = (ghostApiService) => {
    return async (req, res, next) => {
        // Admins and editors bypass ownership check
        if (req.user.role === 'admin' || req.user.role === 'editor') {
            return next();
        }

        const articleId = req.params.id;
        if (!articleId) {
            return res.status(400).json({ error: 'Article ID is required' });
        }

        try {
            const post = await ghostApiService.getPost(articleId);
            const authors = post.authors || [];
            const userEmail = req.user.email;

            const isAuthor = authors.some(
                (a) => a.email && a.email.toLowerCase() === userEmail.toLowerCase()
            );

            if (!isAuthor) {
                return res.status(403).json({
                    error: 'Nao tem permissao para modificar este artigo. Apenas o autor pode editar ou eliminar os seus proprios artigos.'
                });
            }

            next();
        } catch (err) {
            if (err.message && err.message.includes('not found')) {
                return res.status(404).json({ error: 'Article not found' });
            }
            return res.status(500).json({ error: 'Error verifying article ownership' });
        }
    };
};
