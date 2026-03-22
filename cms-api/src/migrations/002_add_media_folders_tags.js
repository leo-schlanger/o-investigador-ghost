/**
 * Migration: Add MediaFolders, MediaTags, and MediaTagAssignments tables
 * Also adds folderId column to Media table
 *
 * This migration is idempotent - safe to run multiple times
 */

const { sequelize, Sequelize } = require('../models');

async function up() {
    const queryInterface = sequelize.getQueryInterface();

    // Create MediaFolders table
    try {
        await queryInterface.describeTable('MediaFolders');
        console.log('✓ Table "MediaFolders" already exists');
    } catch (error) {
        await queryInterface.createTable('MediaFolders', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            parentId: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'MediaFolders',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
        console.log('✓ Created "MediaFolders" table');
    }

    // Create MediaTags table
    try {
        await queryInterface.describeTable('MediaTags');
        console.log('✓ Table "MediaTags" already exists');
    } catch (error) {
        await queryInterface.createTable('MediaTags', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            slug: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
        console.log('✓ Created "MediaTags" table');
    }

    // Create MediaTagAssignments junction table
    try {
        await queryInterface.describeTable('MediaTagAssignments');
        console.log('✓ Table "MediaTagAssignments" already exists');
    } catch (error) {
        await queryInterface.createTable('MediaTagAssignments', {
            mediaId: {
                type: Sequelize.UUID,
                primaryKey: true,
                references: {
                    model: 'Media',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            tagId: {
                type: Sequelize.UUID,
                primaryKey: true,
                references: {
                    model: 'MediaTags',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false
            }
        });
        console.log('✓ Created "MediaTagAssignments" table');
    }

    // Add folderId column to Media table
    try {
        const tableDescription = await queryInterface.describeTable('Media');
        if (tableDescription.folderId) {
            console.log('✓ Column "folderId" already exists in Media table');
        } else {
            await queryInterface.addColumn('Media', 'folderId', {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'MediaFolders',
                    key: 'id'
                },
                onDelete: 'SET NULL'
            });
            console.log('✓ Added "folderId" column to Media table');
        }
    } catch (error) {
        console.error('Error adding folderId column:', error.message);
    }
}

async function down() {
    const queryInterface = sequelize.getQueryInterface();

    try {
        // Remove folderId column from Media
        await queryInterface.removeColumn('Media', 'folderId');
        console.log('✓ Removed "folderId" column from Media table');
    } catch (error) {
        console.error('Error removing folderId column:', error.message);
    }

    try {
        await queryInterface.dropTable('MediaTagAssignments');
        console.log('✓ Dropped "MediaTagAssignments" table');
    } catch (error) {
        console.error('Error dropping MediaTagAssignments:', error.message);
    }

    try {
        await queryInterface.dropTable('MediaTags');
        console.log('✓ Dropped "MediaTags" table');
    } catch (error) {
        console.error('Error dropping MediaTags:', error.message);
    }

    try {
        await queryInterface.dropTable('MediaFolders');
        console.log('✓ Dropped "MediaFolders" table');
    } catch (error) {
        console.error('Error dropping MediaFolders:', error.message);
    }
}

// Run migration if executed directly
if (require.main === module) {
    up()
        .then(() => {
            console.log('Migration completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Migration failed:', error);
            process.exit(1);
        });
}

module.exports = { up, down };
