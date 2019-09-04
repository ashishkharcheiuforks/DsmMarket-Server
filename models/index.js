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
db.Auth = require('./auth')(sequelize, Sequelize);
db.DealPost = require('./dealPost')(sequelize, Sequelize);
db.RentPost = require('./rentPost')(sequelize, Sequelize);
db.Hashtag = require('./hashtag')(sequelize, Sequelize);
db.Interest = require('./interest')(sequelize, Sequelize);

db.User.hasMany(db.DealPost);
db.DealPost.belongsTo(db.User);
db.User.hasMany(db.RentPost);
db.RentPost.belongsTo(db.User);
db.DealPost.belongsToMany(db.Hashtag, {through : 'dealPostHashtag'});
db.Hashtag.belongsToMany(db.DealPost, {through : 'dealPostHashtag'});
db.RentPost.belongsToMany(db.Hashtag, {through : 'rentPostHashtag'});
db.Hashtag.belongsToMany(db.RentPost, {through : 'rentPostHashtag'});
module.exports = db;