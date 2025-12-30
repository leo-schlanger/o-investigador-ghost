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
sequelize.sync({ alter: false }).then(() => {
    console.log('📦 Database synced');
    app.listen(PORT, () => {
        console.log(`🚀 API Server running on port ${PORT}`);
    });
}).catch(err => {
    console.error('❌ Database connection error:', err);
});
