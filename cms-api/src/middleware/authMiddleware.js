const jwt = require('jsonwebtoken');
const { getJwtSecret } = require('../config/env');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
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
