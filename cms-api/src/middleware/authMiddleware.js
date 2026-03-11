const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
            req.user = decoded;

            return next();
        } catch (error) {
            console.error('Auth error:', error.message);
            return res.status(401).json({ error: 'Sessao expirada ou token invalido. Faca login novamente.' });
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
