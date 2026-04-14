/**
 * Migration: Create audit_logs table
 */

const logger = require('../utils/logger');

module.exports = {
    async up(queryInterface, Sequelize) {
        try {
            const tableExists = await queryInterface.sequelize.query(
                "SHOW TABLES LIKE 'audit_logs'",
                { type: Sequelize.QueryTypes.SELECT }
            );

            if (tableExists.length > 0) {
                logger.info('Migration 004: audit_logs table already exists, skipping');
                return;
            }

            await queryInterface.createTable('audit_logs', {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                user_id: {
                    type: Sequelize.UUID,
                    allowNull: true
                },
                user_name: {
                    type: Sequelize.STRING(255),
                    allowNull: true
                },
                action: {
                    type: Sequelize.STRING(50),
                    allowNull: false
                },
                resource: {
                    type: Sequelize.STRING(50),
                    allowNull: false
                },
                resource_id: {
                    type: Sequelize.STRING(255),
                    allowNull: true
                },
                details: {
                    type: Sequelize.JSON,
                    allowNull: true
                },
                ip: {
                    type: Sequelize.STRING(45),
                    allowNull: true
                },
                created_at: {
                    type: Sequelize.DATE,
                    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
                }
            });

            await queryInterface.addIndex('audit_logs', ['user_id']);
            await queryInterface.addIndex('audit_logs', ['action']);
            await queryInterface.addIndex('audit_logs', ['resource']);
            await queryInterface.addIndex('audit_logs', ['created_at']);

            logger.info('Migration 004: audit_logs table created successfully');
        } catch (error) {
            logger.error('Migration 004 failed:', error.message);
            throw error;
        }
    },

    async down(queryInterface) {
        await queryInterface.dropTable('audit_logs');
    }
};
