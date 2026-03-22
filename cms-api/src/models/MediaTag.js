module.exports = (sequelize, DataTypes) => {
    const MediaTag = sequelize.define('MediaTag', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        }
    });

    MediaTag.associate = (models) => {
        MediaTag.belongsToMany(models.Media, {
            through: models.MediaTagAssignment,
            foreignKey: 'tagId',
            otherKey: 'mediaId',
            as: 'media'
        });
    };

    // Generate slug from name before validation
    MediaTag.beforeValidate((tag) => {
        if (tag.name && !tag.slug) {
            tag.slug = tag.name
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }
    });

    return MediaTag;
};
