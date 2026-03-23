/**
 * @deprecated This model is deprecated since 2024.
 * Articles are now stored directly in Ghost CMS.
 * Use the Ghost API service (ghostApi.js) for all article operations.
 *
 * This file is kept for:
 * - Backwards compatibility during migration
 * - Reference for field structure
 * - Potential future migration scripts
 *
 * DO NOT use this model for new code.
 */

module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define('Article', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        ghostId: {
            type: DataTypes.STRING,
            allowNull: true,
            comment: 'ID of the corresponding post in Ghost CMS'
        },
        status: {
            type: DataTypes.ENUM('draft', 'scheduled', 'published'),
            defaultValue: 'draft'
        },
        publishedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        feature_image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    });

    return Article;
};
