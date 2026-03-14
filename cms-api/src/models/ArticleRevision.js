module.exports = (sequelize, Sequelize) => {
    const ArticleRevision = sequelize.define('ArticleRevision', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        articleId: {
            type: Sequelize.STRING(50),
            allowNull: false,
            field: 'article_id',
            comment: 'Ghost post ID'
        },
        userId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            field: 'user_id'
        },
        userName: {
            type: Sequelize.STRING(255),
            allowNull: true,
            field: 'user_name'
        },
        title: {
            type: Sequelize.STRING(500),
            allowNull: true
        },
        content: {
            type: Sequelize.TEXT('long'),
            allowNull: true
        },
        excerpt: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        featureImage: {
            type: Sequelize.STRING(500),
            allowNull: true,
            field: 'feature_image'
        },
        status: {
            type: Sequelize.STRING(50),
            allowNull: true
        },
        revisionNumber: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
            field: 'revision_number'
        }
    }, {
        tableName: 'article_revisions',
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
                fields: ['article_id']
            },
            {
                fields: ['created_at']
            }
        ]
    });

    // Class method to clean old revisions (keep only last 50)
    ArticleRevision.cleanOldRevisions = async function(articleId, keepCount = 50) {
        const revisions = await this.findAll({
            where: { articleId },
            order: [['createdAt', 'DESC']],
            attributes: ['id']
        });

        if (revisions.length > keepCount) {
            const toDelete = revisions.slice(keepCount).map(r => r.id);
            await this.destroy({
                where: { id: toDelete }
            });
        }
    };

    return ArticleRevision;
};
