const Sequelize = require('sequelize');
const config = require('../config/config').development;
const db = {};

const sequelize = new Sequelize(
    config.database, config.username, config.password, {
        host : config.host,
        dialect : config.dialect,
        logging : config.logging,
    }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);

module.exports = db;