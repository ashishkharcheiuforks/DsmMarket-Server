module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        email : {
            type : DataTypes.STRING(40),
            allowNull : false,
            unique : true,
        },
        password : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        nick : {
            type : DataTypes.STRING(100),
            allowNull : false,
            unique : true,
        },
        grade : {
            type : DataTypes.STRING(100),
            allowNull : false,
        },
        gender : {
            type : DataTypes.STRING(10),
            allowNull : false,
        }
    }, {
        timestamps : true,
    });
};