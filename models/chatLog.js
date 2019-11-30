module.exports = (sequelize, DataTypes) => {
    return sequelize.define('chatLog', {
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        timestamps: true,
    })
}