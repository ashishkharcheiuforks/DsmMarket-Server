module.exports = (sequelize, DataTypes) => {
    return sequelize.define('comment', {
        postId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        charset: 'utf8',
        collation: 'utf8_general_ci',
        timestamps: true,
    });
};