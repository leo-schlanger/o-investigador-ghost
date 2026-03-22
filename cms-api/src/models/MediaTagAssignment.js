module.exports = (sequelize, DataTypes) => {
    const MediaTagAssignment = sequelize.define('MediaTagAssignment', {
        mediaId: {
            type: DataTypes.UUID,
            primaryKey: true,
            references: {
                model: 'Media',
                key: 'id'
            }
        },
        tagId: {
            type: DataTypes.UUID,
            primaryKey: true,
            references: {
                model: 'MediaTags',
                key: 'id'
            }
        }
    });

    return MediaTagAssignment;
};
