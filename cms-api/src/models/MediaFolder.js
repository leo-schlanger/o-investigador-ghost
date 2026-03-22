module.exports = (sequelize, DataTypes) => {
    const MediaFolder = sequelize.define('MediaFolder', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        parentId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: 'MediaFolders',
                key: 'id'
            }
        }
    });

    MediaFolder.associate = (models) => {
        // Self-referential relationship for hierarchical folders
        MediaFolder.belongsTo(models.MediaFolder, {
            as: 'parent',
            foreignKey: 'parentId'
        });
        MediaFolder.hasMany(models.MediaFolder, {
            as: 'children',
            foreignKey: 'parentId'
        });
        // Folder has many media items
        MediaFolder.hasMany(models.Media, {
            foreignKey: 'folderId',
            as: 'media'
        });
    };

    return MediaFolder;
};
