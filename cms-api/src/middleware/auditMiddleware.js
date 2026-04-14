/**
 * Audit Logging Middleware
 * Records actions on critical resources for security auditing
 */

const logger = require('../utils/logger');

/**
 * Creates an audit log entry after the request completes
 * @param {string} action - The action performed (e.g., 'create', 'update', 'delete', 'login')
 * @param {string} resource - The resource type (e.g., 'user', 'article', 'settings')
 * @param {object} options - Additional options
 * @param {function} options.getResourceId - Function to extract resource ID from req (default: req.params.id)
 * @param {function} options.getDetails - Function to extract relevant details from req
 */
function auditLog(action, resource, options = {}) {
    return async (req, res, next) => {
        // Store original json method to intercept response
        const originalJson = res.json.bind(res);

        res.json = function (body) {
            // Only log successful operations (2xx status)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const logEntry = {
                    userId: req.user?.id || null,
                    userName: req.user?.name || req.user?.email || null,
                    action,
                    resource,
                    resourceId: options.getResourceId
                        ? options.getResourceId(req)
                        : req.params?.id || null,
                    details: options.getDetails ? options.getDetails(req, body) : null,
                    ip: req.ip || req.connection?.remoteAddress || null
                };

                // Fire and forget - don't block the response
                persistAuditLog(logEntry);
            }

            return originalJson(body);
        };

        next();
    };
}

/**
 * Persist audit log to database (non-blocking)
 */
async function persistAuditLog(entry) {
    try {
        // Lazy require to avoid circular dependency
        const db = require('../models');
        if (db.AuditLog) {
            await db.AuditLog.create(entry);
        }
    } catch (err) {
        logger.error('Failed to write audit log:', err.message);
    }
}

module.exports = { auditLog };
