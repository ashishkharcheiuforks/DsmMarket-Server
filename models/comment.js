module.exports = (sequelize, DataTypes) => {
    return sequelize.define('comment', {
        email : {
            type : DataTypes.STRING(40),
            allowNull : false,
        },
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