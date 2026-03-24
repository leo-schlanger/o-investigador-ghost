require('dotenv').config();

const logger = require('./src/utils/logger');

// Validate environment variables before starting
const { validateEnv } = require('./src/config/env');
try {
    validateEnv();
} catch (err) {
    logger.error('Environment validation failed', { error: err.message });
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { csrfProtection } = require('./src/middleware/csrfMiddleware');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
const cacheService = require('./src/services/cacheService');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Security headers
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false // Disabled for API - frontend handles CSP
    })
);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : '*';

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    })
);

// Trust proxy (nginx) - required for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: { error: 'Muitas requisicoes. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 login attempts per window
    message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);

app.use(express.json({ limit: '10mb' }));

// CSRF Protection for state-changing operations
app.use(csrfProtection);

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'O Investigador API Docs'
}));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// Main Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Sync Database & Start Server
// alter: true creates/updates tables on startup. Set to true only when adding new models or changing schemas.
// After running once with alter:true, revert to alter:false for performance and safety.
sequelize
    .sync({ alter: false })
    .then(async () => {
        logger.info('Database synced');

        // Initialize Redis cache
        cacheService.initRedis();

        // Run migrations
        try {
            const avatarMigration = require('./src/migrations/001_add_avatar_to_users');
            await avatarMigration.up();
        } catch (migrationError) {
            logger.warn('Migration warning', { migration: 'avatar', error: migrationError.message });
        }

        try {
            const mediaFoldersMigration = require('./src/migrations/002_add_media_folders_tags');
            await mediaFoldersMigration.up();
        } catch (migrationError) {
            logger.warn('Migration warning', {
                migration: 'media_folders_tags',
                error: migrationError.message
            });
        }

        try {
            const indexMigration = require('./src/migrations/003_add_performance_indexes');
            await indexMigration.up();
        } catch (migrationError) {
            logger.warn('Migration warning', {
                migration: 'performance_indexes',
                error: migrationError.message
            });
        }

        // Create default admin if no users exist (only if ADMIN_EMAIL and ADMIN_PASSWORD are set)
        try {
            const { User } = require('./src/models');
            const bcrypt = require('bcryptjs');
            const crypto = require('crypto');

            const userCount = await User.count();
            if (userCount === 0) {
                const adminEmail = process.env.ADMIN_EMAIL;
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (adminEmail && adminPassword) {
                    logger.info('No users found. Creating admin from environment variables...');
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(adminPassword, salt);

                    await User.create({
                        name: 'Admin',
                        email: adminEmail,
                        password: hashedPassword,
                        role: 'admin'
                    });
                    logger.info('Admin user created successfully');
                } else {
                    // Generate random credentials for first-time setup
                    const randomPassword = crypto.randomBytes(12).toString('hex');
                    const defaultEmail = 'admin@setup.local';

                    logger.info('No users found. Creating temporary admin...');
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(randomPassword, salt);

                    await User.create({
                        name: 'Admin',
                        email: defaultEmail,
                        password: hashedPassword,
                        role: 'admin'
                    });
                    logger.warn('IMPORTANT: Temporary admin created!', {
                        email: defaultEmail,
                        password: randomPassword,
                        action: 'Change credentials immediately or set ADMIN_EMAIL and ADMIN_PASSWORD env vars'
                    });
                }
            }
        } catch (err) {
            logger.error('Failed to create default admin', { error: err.message, stack: err.stack });
        }

        app.listen(PORT, () => {
            logger.info(`API Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        logger.error('Database connection error', { error: err.message, stack: err.stack });
    });
