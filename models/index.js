const Sequelize = require('sequelize');
const config = require('../config/config').development;
const db = {};

const sequelize = new Sequelize(
    config.database, config.username, config.password, config,
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize, Sequelize);
db.DealPost = require('./dealPost')(sequelize, Sequelize);
db.RentPost = require('./rentPost')(sequelize, Sequelize);
db.Interest = require('./interest')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.ChatLog = require('./chatLog')(sequelize, Sequelize);
db.Room = require('./room')(sequelize, Sequelize);

db.User.hasMany(db.DealPost);
db.DealPost.belongsTo(db.User);
db.User.hasMany(db.RentPost);
db.RentPost.belongsTo(db.User);
db.DealPost.hasMany(db.Comment);
db.Comment.belongsTo(db.DealPost);
db.RentPost.hasMany(db.Comment);
db.Comment.belongsTo(db.RentPost);

module.exports = db;