/**
 * Environment configuration and validation
 * This module validates required environment variables on startup
 */

const requiredEnvVars = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET'
];

const optionalEnvVars = [
    'GHOST_API_URL',
    'GHOST_API_KEY',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD',
    'CORS_ORIGIN',
    'API_PORT',
    'NODE_ENV'
];

/**
 * Validate that all required environment variables are set
 * @throws {Error} If any required variable is missing
 */
function validateEnv() {
    const missing = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(', ')}\n` +
            'Please check your .env file or environment configuration.'
        );
    }

    // Validate JWT_SECRET strength
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
        console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters for security.');
    }

    // Warn about missing optional but important vars
    if (!process.env.GHOST_API_URL || !process.env.GHOST_API_KEY) {
        console.warn('⚠️  WARNING: GHOST_API_URL or GHOST_API_KEY not set. Ghost CMS features will be disabled.');
    }
}

/**
 * Get JWT secret - throws error if not configured
 * @returns {string} JWT secret
 */
function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not configured');
    }
    return secret;
}

module.exports = {
    validateEnv,
    getJwtSecret,
    requiredEnvVars,
    optionalEnvVars
};
