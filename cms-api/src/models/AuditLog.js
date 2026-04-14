module.exports = (sequelize, Sequelize) => {
    const AuditLog = sequelize.define(
        'AuditLog',
        {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            userId: {
                type: Sequelize.UUID,
                allowNull: true,
                field: 'user_id'
            },
            userName: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'user_name'
            },
            action: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            resource: {
                type: Sequelize.STRING(50),
                allowNull: false
            },
            resourceId: {
                type: Sequelize.STRING(255),
                allowNull: true,
                field: 'resource_id'
            },
            details: {
                type: Sequelize.JSON,
                allowNull: true
            },
            ip: {
                type: Sequelize.STRING(45),
                allowNull: true
            }
        },
        {
            tableName: 'audit_logs',
            timestamps: true,
            updatedAt: false,
            indexes: [
                { fields: ['user_id'] },
                { fields: ['action'] },
                { fields: ['resource'] },
                { fields: ['created_at'] }
            ]
        }
    );

    return AuditLog;
};
