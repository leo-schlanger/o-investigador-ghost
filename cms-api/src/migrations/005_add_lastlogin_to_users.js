/**
 * Migration: Add lastLogin column to Users table
 *
 * Idempotente — seguro correr multiplas vezes.
 * Corre automaticamente no arranque do servidor (server.js).
 */

const { sequelize } = require('../models');

async function up() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        const tableDescription = await queryInterface.describeTable('Users');

        if (tableDescription.lastLogin) {
            console.log('✓ Column "lastLogin" already exists in Users table');
            return;
        }

        await queryInterface.addColumn('Users', 'lastLogin', {
            type: sequelize.Sequelize.DATE,
            allowNull: true,
            comment: 'Data/hora do ultimo login bem-sucedido'
        });

        console.log('✓ Added "lastLogin" column to Users table');
    } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('Duplicate column')) {
            console.log('✓ Column "lastLogin" already exists');
        } else {
            throw error;
        }
    }
}

async function down() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        await queryInterface.removeColumn('Users', 'lastLogin');
        console.log('✓ Removed "lastLogin" column from Users table');
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
