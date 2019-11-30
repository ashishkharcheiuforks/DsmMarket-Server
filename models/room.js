module.exports = (sequelize, DataTypes) => {
    return sequelize.define('room', {
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        picture: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        roomId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        user1 : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        user2 : {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        timestamps: true,
    });
};