/**
 * Migration: Add performance indexes
 *
 * This migration adds indexes to improve query performance.
 * All operations are safe and use IF NOT EXISTS checks.
 */

const logger = require('../utils/logger');

const indexes = [
    // Media table
    { table: 'Media', name: 'idx_media_folder_id', column: 'folderId' },
    { table: 'Media', name: 'idx_media_created_at', column: 'createdAt' },
    { table: 'Media', name: 'idx_media_mimetype', column: 'mimetype' },

    // MediaTagAssignment table (composite index for queries)
    { table: 'MediaTagAssignments', name: 'idx_mta_media_tag', columns: ['mediaId', 'tagId'] },

    // PostView table
    { table: 'PostViews', name: 'idx_postview_post_id', column: 'postId' },
    { table: 'PostViews', name: 'idx_postview_viewed_at', column: 'viewedAt' },

    // ViewLog table
    { table: 'ViewLogs', name: 'idx_viewlog_post_id', column: 'postId' },
    { table: 'ViewLogs', name: 'idx_viewlog_timestamp', column: 'timestamp' },
    { table: 'ViewLogs', name: 'idx_viewlog_post_timestamp', columns: ['postId', 'timestamp'] },

    // ArticleRevision table
    { table: 'ArticleRevisions', name: 'idx_revision_post_id', column: 'postId' },
    { table: 'ArticleRevisions', name: 'idx_revision_created_at', column: 'createdAt' }
];

/**
 * Check if an index exists
 */
async function indexExists(sequelize, tableName, indexName) {
    try {
        const [results] = await sequelize.query(
            `SHOW INDEX FROM \`${tableName}\` WHERE Key_name = ?`,
            { replacements: [indexName] }
        );
        return results.length > 0;
    } catch (err) {
        // Table might not exist
        return false;
    }
}

/**
 * Check if a table exists
 */
async function tableExists(sequelize, tableName) {
    try {
        const [results] = await sequelize.query(
            `SHOW TABLES LIKE ?`,
            { replacements: [tableName] }
        );
        return results.length > 0;
    } catch (err) {
        return false;
    }
}

/**
 * Create an index safely
 */
async function createIndex(sequelize, table, indexName, columns) {
    const columnList = Array.isArray(columns) ? columns.join('`, `') : columns;
    const sql = `CREATE INDEX \`${indexName}\` ON \`${table}\` (\`${columnList}\`)`;

    try {
        await sequelize.query(sql);
        logger.info(`Created index ${indexName} on ${table}`);
        return true;
    } catch (err) {
        if (err.message.includes('Duplicate key name')) {
            logger.info(`Index ${indexName} already exists on ${table}`);
            return false;
        }
        throw err;
    }
}

module.exports = {
    up: async () => {
        const { sequelize } = require('../models');
        let created = 0;
        let skipped = 0;
        let errors = 0;

        logger.info('Starting index migration...');

        for (const idx of indexes) {
            try {
                // Check if table exists
                if (!(await tableExists(sequelize, idx.table))) {
                    logger.warn(`Table ${idx.table} does not exist, skipping index ${idx.name}`);
                    skipped++;
                    continue;
                }

                // Check if index already exists
                if (await indexExists(sequelize, idx.table, idx.name)) {
                    skipped++;
                    continue;
                }

                // Create the index
                const columns = idx.columns || idx.column;
                await createIndex(sequelize, idx.table, idx.name, columns);
                created++;
            } catch (err) {
                logger.error(`Error creating index ${idx.name}`, { error: err.message });
                errors++;
            }
        }

        logger.info(`Index migration complete: ${created} created, ${skipped} skipped, ${errors} errors`);
    },

    down: async () => {
        const { sequelize } = require('../models');

        logger.info('Rolling back indexes...');

        for (const idx of indexes) {
            try {
                if (await tableExists(sequelize, idx.table) && await indexExists(sequelize, idx.table, idx.name)) {
                    await sequelize.query(`DROP INDEX \`${idx.name}\` ON \`${idx.table}\``);
                    logger.info(`Dropped index ${idx.name}`);
                }
            } catch (err) {
                logger.warn(`Could not drop index ${idx.name}`, { error: err.message });
            }
        }
    }
};
