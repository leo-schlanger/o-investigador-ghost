#!/usr/bin/env node
/**
 * Sync user avatars from local database to Ghost CMS
 * Run: node scripts/sync-avatars.js
 */

require('dotenv').config();

const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize(
    process.env.DB_NAME || 'o_investigador',
    process.env.DB_USER || 'ghost',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    }
);

async function syncAvatars() {
    console.log('🔄 Starting avatar sync to Ghost...\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established\n');

        // Get all local users with avatars
        const [localUsers] = await sequelize.query(`
            SELECT id, name, email, avatar
            FROM Users
            WHERE avatar IS NOT NULL AND avatar != ''
        `);

        console.log(`📋 Found ${localUsers.length} users with avatars\n`);

        if (localUsers.length === 0) {
            console.log('ℹ️  No users with avatars to sync');
            return;
        }

        let synced = 0;
        let errors = 0;

        for (const user of localUsers) {
            try {
                // Find Ghost user by email
                const [ghostUsers] = await sequelize.query(
                    `SELECT id, name, email, profile_image FROM users WHERE email = ?`,
                    { replacements: [user.email] }
                );

                if (ghostUsers.length === 0) {
                    console.log(`⚠️  ${user.email}: Not found in Ghost`);
                    continue;
                }

                const ghostUser = ghostUsers[0];

                // Update Ghost user profile_image
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
                await sequelize.query(
                    `UPDATE users SET profile_image = ?, updated_at = ? WHERE id = ?`,
                    { replacements: [user.avatar, now, ghostUser.id] }
                );

                console.log(`✅ ${user.email}: Avatar synced`);
                synced++;
            } catch (err) {
                console.log(`❌ ${user.email}: ${err.message}`);
                errors++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`✅ Synced: ${synced}`);
        console.log(`❌ Errors: ${errors}`);
        console.log('='.repeat(50));

    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

syncAvatars();
