/**
 * Migration: Add avatar column to Users table
 *
 * Run this migration by executing:
 * node src/migrations/001_add_avatar_to_users.js
 *
 * Or it will run automatically on server startup if RUN_MIGRATIONS=true
 */

const { sequelize } = require('../models');

async function up() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        // Check if column already exists
        const tableDescription = await queryInterface.describeTable('Users');

        if (tableDescription.avatar) {
            console.log('✓ Column "avatar" already exists in Users table');
            return;
        }

        // Add avatar column
        await queryInterface.addColumn('Users', 'avatar', {
            type: sequelize.Sequelize.STRING,
            allowNull: true,
            comment: 'URL da foto de perfil do usuario'
        });

        console.log('✓ Added "avatar" column to Users table');
    } catch (error) {
        if (error.message.includes('already exists')) {
            console.log('✓ Column "avatar" already exists');
        } else {
            throw error;
        }
    }
}

async function down() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await queryInterface.removeColumn('Users', 'avatar');
        console.log('✓ Removed "avatar" column from Users table');
    } catch (error) {
        console.error('Error removing column:', error.message);
    }
}

// Run migration if executed directly
if (require.main === module) {
    up()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { up, down };
