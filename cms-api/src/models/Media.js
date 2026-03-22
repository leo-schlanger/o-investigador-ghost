module.exports = (sequelize, DataTypes) => {
    const Media = sequelize.define('Media', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false
        },
        originalName: {
            type: DataTypes.STRING,
            allowNull: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false
        },
        mimetype: {
            type: DataTypes.STRING,
            allowNull: true
        },
        size: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        folderId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'MediaFolders',
                key: 'id'
            }
        }
    });

    Media.associate = (models) => {
        Media.belongsTo(models.MediaFolder, {
            foreignKey: 'folderId',
            as: 'folder'
        });
        Media.belongsToMany(models.MediaTag, {
            through: models.MediaTagAssignment,
            foreignKey: 'mediaId',
            otherKey: 'tagId',
            as: 'tags'
        });
    };

    return Media;
};
