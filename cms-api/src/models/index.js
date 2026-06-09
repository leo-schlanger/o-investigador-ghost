const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    // Garante utf8mb4 nas tabelas criadas pela API (acentos PT e emojis)
    dialectOptions: { charset: 'utf8mb4' },
    define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, Sequelize);
db.Settings = require('./Settings')(sequelize, Sequelize);
db.Media = require('./Media')(sequelize, Sequelize);
db.MediaFolder = require('./MediaFolder')(sequelize, Sequelize);
db.MediaTag = require('./MediaTag')(sequelize, Sequelize);
db.MediaTagAssignment = require('./MediaTagAssignment')(sequelize, Sequelize);
db.PostView = require('./PostView')(sequelize, Sequelize);
db.ViewLog = require('./ViewLog')(sequelize, Sequelize);
db.ArticleRevision = require('./ArticleRevision')(sequelize, Sequelize);
db.AuditLog = require('./AuditLog')(sequelize, Sequelize);

// Set up associations
Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

module.exports = db;
