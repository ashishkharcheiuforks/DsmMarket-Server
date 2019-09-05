module.exports = (sequelize, DataTypes) => {
    return sequelize.define('comment', {
        nick : {
            type : DataTypes.STRING(40),
            allowNull : false,
        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
    }, {
        timestamps : true,
    });
};