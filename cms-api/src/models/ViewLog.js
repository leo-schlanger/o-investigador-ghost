module.exports = (sequelize, Sequelize) => {
    const ViewLog = sequelize.define('ViewLog', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId: {
            type: Sequelize.STRING(50),
            allowNull: false,
            field: 'post_id'
        },
        postSlug: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'post_slug'
        },
        country: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        city: {
            type: Sequelize.STRING(100),
            allowNull: true
        },
        viewedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'viewed_at'
        }
    }, {
        tableName: 'view_logs',
        timestamps: false,
        indexes: [
            {
                fields: ['post_id']
            },
            {
                fields: ['viewed_at']
            },
            {
                fields: ['country']
            }
        ]
    });

    return ViewLog;
};
