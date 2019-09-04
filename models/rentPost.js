module.exports = (sequelize, DataTypes) => {
    return sequelize.define('rentPost', {
        img : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        title : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        price : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        category : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        possible_time : {
            type : DataTypes.STRING(30),
            allowNull : true,
        }
    }, {
        timestamps : true,
    });
};