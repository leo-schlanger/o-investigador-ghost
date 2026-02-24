require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');
const routes = require('./src/routes');

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Main Routes
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Sync Database & Start Server
sequelize.sync({ alter: false }).then(async () => {
    console.log('📦 Database synced');

    // Create default admin if no users exist
    try {
        const { User } = require('./src/models');
        const bcrypt = require('bcryptjs');

        const userCount = await User.count();
        if (userCount === 0) {
            console.log('👤 No users found. Creating default admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            await User.create({
                name: 'Admin',
                email: 'admin@admin.com',
                password: hashedPassword,
                role: 'admin'
            });
            console.log('✅ Default admin created! Email: admin@admin.com | Password: admin');
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
