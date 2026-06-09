/**
 * Migration: Add performance indexes
 *
 * This migration adds indexes to improve query performance.
 * All operations are safe and use IF NOT EXISTS checks.
 */

const logger = require('../utils/logger');

// NOTA: os indices de post_views, view_logs e article_revisions ja sao criados
// pelo Sequelize via a opcao `indexes` nos respetivos modelos. Esta migration cobre
// apenas as lacunas reais (Media e MediaTagAssignments nao definem indexes no modelo,
// e o composto post_id+viewed_at de view_logs nao existe). Nomes de tabela/coluna
// correspondem ao schema real (Media usa camelCase; tabelas de views usam snake_case).
const indexes = [
    // Media table (camelCase, sem underscored)
    { table: 'Media', name: 'idx_media_folder_id', column: 'folderId' },
    { table: 'Media', name: 'idx_media_created_at', column: 'createdAt' },
    { table: 'Media', name: 'idx_media_mimetype', column: 'mimetype' },

    // MediaTagAssignment (indice composto para joins de tags)
    { table: 'MediaTagAssignments', name: 'idx_mta_media_tag', columns: ['mediaId', 'tagId'] },

    // view_logs: composto para consultas por artigo ao longo do tempo
    { table: 'view_logs', name: 'idx_viewlog_post_viewed', columns: ['post_id', 'viewed_at'] }
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
