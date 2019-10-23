module.exports = (sequelize, DataTypes) => {
    return sequelize.define('chatLog', {
        content : {
            type : DataTypes.TEXT,
            allowNull : false,
        },
        roomId : {
            type : DataTypes.INTEGER,
            allowNull : false,
        },
    }, {
        timestamps : true,
    })
}