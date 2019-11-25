module.exports = (sequelize, DataTypes) => {
    return sequelize.define('rentPost', {
        author: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        img: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        price: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        possible_time: {
            type: DataTypes.STRING(30),
            allowNull: true,
        }
    }, {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        timestamps: true,
    });
};