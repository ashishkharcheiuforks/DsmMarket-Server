module.exports = (sequelize, DataTypes) => {
    return sequelize.define('room', {
        postId : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        title : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        picture : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        roomId : {
            type : DataTypes.INTEGER,
            allowNull : false,
            primaryKey : true,
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