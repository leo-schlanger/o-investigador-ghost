/**
 * CSRF Protection Middleware for REST APIs
 *
 * For stateless APIs using JWT in Authorization headers, traditional CSRF
 * protection isn't strictly necessary since browsers don't automatically
 * attach custom headers to cross-origin requests.
 *
 * However, this middleware adds an extra layer of security by:
 * 1. Validating Origin header against allowed origins
 * 2. Requiring a custom header (X-Requested-With) for state-changing operations
 */

const getAllowedOrigins = () => {
    const origins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : [];
    return origins;
};

/**
 * Validates that the request comes from an allowed origin
 */
const validateOrigin = (req) => {
    const origin = req.get('Origin');
    const referer = req.get('Referer');
    const allowedOrigins = getAllowedOrigins();

    // If no CORS_ORIGIN is set, skip validation (development mode)
    if (allowedOrigins.length === 0) {
        return true;
    }

    // Check Origin header first
    if (origin) {
        return allowedOrigins.some((allowed) => {
            try {
                const allowedUrl = new URL(allowed);
                const originUrl = new URL(origin);
                return allowedUrl.origin === originUrl.origin;
            } catch {
                return allowed === origin;
            }
        });
    }

    // Fall back to Referer header
    if (referer) {
        return allowedOrigins.some((allowed) => {
            try {
                const allowedUrl = new URL(allowed);
                const refererUrl = new URL(referer);
                return allowedUrl.origin === refererUrl.origin;
            } catch {
                return false;
            }
        });
    }

    // No Origin or Referer - could be same-origin or non-browser client
    // Allow if it's a same-origin request (no Origin header is sent for same-origin)
    return true;
};

/**
 * CSRF Protection middleware
 *
 * Applies to state-changing methods (POST, PUT, PATCH, DELETE)
 * Validates origin and requires X-Requested-With header
 */
const csrfProtection = (req, res, next) => {
    // Skip for safe methods (GET, HEAD, OPTIONS)
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    // Skip for public endpoints that don't require authentication
    const publicPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/public/',
        '/api/contact',
        '/health'
    ];

    const isPublicPath = publicPaths.some((path) => req.path.startsWith(path));
    if (isPublicPath) {
        return next();
    }

    // Validate origin
    if (!validateOrigin(req)) {
        return res.status(403).json({
            error: 'Requisicao bloqueada: origem nao autorizada',
            code: 'CSRF_ORIGIN_INVALID'
        });
    }

    // Require X-Requested-With header for extra protection
    // This header cannot be set by simple cross-origin requests
    const xRequestedWith = req.get('X-Requested-With');
    if (!xRequestedWith) {
        return res.status(403).json({
            error: 'Requisicao bloqueada: header de seguranca ausente',
            code: 'CSRF_HEADER_MISSING'
        });
    }

    next();
};

/**
 * Lightweight CSRF check - only validates origin
 * Use this for endpoints that need some protection but not full CSRF
 */
const csrfOriginOnly = (req, res, next) => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
        return next();
    }

    if (!validateOrigin(req)) {
        return res.status(403).json({
            error: 'Requisicao bloqueada: origem nao autorizada',
            code: 'CSRF_ORIGIN_INVALID'
        });
    }

    next();
};

/**
 * Restricts cookie-authenticated auth endpoints (refresh/logout) to the admin origin(s).
 * The public site is same-site with the API and in CORS_ORIGIN, so without this a script
 * running on it could use the refresh cookie and read a fresh access token.
 * ADMIN_ORIGIN (comma list) falls back to CORS_ORIGIN. Origin is mandatory when a list is
 * configured (the admin always sends it; only an unconfigured dev setup skips the check).
 */
const adminOriginOnly = (req, res, next) => {
    const configured = process.env.ADMIN_ORIGIN || process.env.CORS_ORIGIN || '';
    const allowed = configured.split(',').map((o) => o.trim()).filter(Boolean);
    const origin = req.get('Origin');
    if (allowed.length === 0 || (origin && allowed.includes(origin))) {
        return next();
    }
    return res.status(403).json({
        error: 'Requisicao bloqueada: origem nao autorizada',
        code: 'CSRF_ORIGIN_INVALID'
    });
};

module.exports = {
    csrfProtection,
    csrfOriginOnly,
    adminOriginOnly,
    validateOrigin
};
