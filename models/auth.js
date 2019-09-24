module.exports = (sequelize, DataTypes) => {
    return sequelize.define('auth', {
        email : {
            type : DataTypes.STRING(40),
            allowNull : false,
            unique : true,
        },
        mailCode : {
            type : DataTypes.INTEGER.UNSIGNED,
            allowNull : true,
        },
        authCode : {
            type : DataTypes.INTEGER.UNSIGNED,
            allowNull : true,
        }
    }, {
        charset = 'utf8',
        collation : 'utf8_general_ci',
        timestamp : true,
        tableName : 'auth',
    });
};