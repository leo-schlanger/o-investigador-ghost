/**
 * CORS options (shared by server.js and the auth cookie tests).
 * credentials: true is required for the httpOnly refresh cookie; origins are an
 * explicit allowlist (never '*', which browsers reject with credentials anyway).
 */
const corsOptions = () => {
    const allowedOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
        : [];

    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (same-origin, curl, mobile apps)
            if (!origin) return callback(null, true);

            // In development, allow all origins if CORS_ORIGIN is not set
            if (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production') {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
    };
};

module.exports = { corsOptions };
