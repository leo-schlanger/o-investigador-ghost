require('dotenv').config();

// Validate environment variables before starting
const { validateEnv } = require('./src/config/env');
try {
    validateEnv();
} catch (err) {
    console.error('❌ Environment validation failed:', err.message);
    process.exit(1);
}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.API_PORT || 3000;

// Security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false // Disabled for API - frontend handles CSP
}));

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : '*';

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

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

// Serve uploaded files statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Sync Database & Start Server
// alter: true creates/updates tables on startup. Set to true only when adding new models or changing schemas.
// After running once with alter:true, revert to alter:false for performance and safety.
sequelize.sync({ alter: false }).then(async () => {
    console.log('📦 Database synced');

    // Run migrations
    try {
        const avatarMigration = require('./src/migrations/001_add_avatar_to_users');
        await avatarMigration.up();
    } catch (migrationError) {
        console.error('Migration warning:', migrationError.message);
    }

    try {
        const mediaFoldersMigration = require('./src/migrations/002_add_media_folders_tags');
        await mediaFoldersMigration.up();
    } catch (migrationError) {
        console.error('Migration warning:', migrationError.message);
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
                console.log('👤 No users found. Creating admin from environment variables...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(adminPassword, salt);

                await User.create({
                    name: 'Admin',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin'
                });
                console.log('✅ Admin user created successfully');
            } else {
                // Generate random credentials for first-time setup
                const randomPassword = crypto.randomBytes(12).toString('hex');
                const defaultEmail = 'admin@setup.local';

                console.log('👤 No users found. Creating temporary admin...');
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(randomPassword, salt);

                await User.create({
                    name: 'Admin',
                    email: defaultEmail,
                    password: hashedPassword,
                    role: 'admin'
                });
                console.log('⚠️  IMPORTANT: Temporary admin created!');
                console.log('⚠️  Email: ' + defaultEmail);
                console.log('⚠️  Password: ' + randomPassword);
                console.log('⚠️  Change these credentials immediately after first login!');
                console.log('⚠️  Or set ADMIN_EMAIL and ADMIN_PASSWORD env vars and restart.');
            }
        }
    } catch (err) {
        console.error('❌ Failed to create default admin:', err);
    }

    app.listen(PORT, () => {
        console.log(`🚀 API Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection error:', err);
});
