module.exports = (sequelize, DataTypes) => {
    return sequelize.define('hashtag', {
        title : {
            type : DataTypes.STRING(30),
            allowNull : false,
        },
    }, {
        timestamps : true,
    });
};