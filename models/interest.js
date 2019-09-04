module.exports = (sequelize, DataTypes) => {
    return sequelize.define('interest', {
        userId : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
        postId : {
            type : DataTypes.INTEGER,
            allowNull : false,
        }
    });
};