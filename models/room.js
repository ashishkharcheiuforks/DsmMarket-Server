module.exports = (sequelize, DataTypes) => {
    sequelize.define('room', {
        title : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        picture : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        roomId : {
            type : DataTypes.TEXT,
            allowNull : false,
            autoIncrement : true,
        },
        user1 : {
            type : DataTypes.STRING(40),
            allowNull : false,
        },
        user2 : {
            type : DataTypes.STRING(40),
            allowNull : false,
        },
    }, {
        timestamps : true,
    });
};