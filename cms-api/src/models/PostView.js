module.exports = (sequelize, Sequelize) => {
    const PostView = sequelize.define('PostView', {
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
        postTitle: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'post_title'
        },
        viewCount: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
            field: 'view_count'
        },
        lastViewedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW,
            field: 'last_viewed_at'
        }
    }, {
        tableName: 'post_views',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['post_id']
            },
            {
                fields: ['view_count']
            }
        ]
    });

    return PostView;
};
