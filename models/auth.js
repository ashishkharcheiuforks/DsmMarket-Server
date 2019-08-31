module.exports = (sequelize, DataTypes) => {
    return sequelize.define('auth', {
        email : {
            type : DataTypes.STRING(40),
            allowNull : false,
            unique : true,
        },
        code : {
            type : DataTypes.INTEGER.UNSIGNED,
            allowNull : false,
        },
    }, {
        timestamp : true,
        tableName : 'auth',
    });
};