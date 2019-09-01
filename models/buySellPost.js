module.exports = (sequelize, DataTypes) => {
    return sequelize.define({
        img1 : {
            type : DataTypes.STRING(200),
            allowNull : false,
        },
        img2 : {
            type : DataTypes.STRING(200),
            allowNull : true,
        },
        img3 : {
            type : DataTypes.STRING(200),
            allowNull : true,
        },
        img4 : {
            type : DataTypes.STRING(200),
            allowNull : true,
        },
        img5 : {
            type : DataTypes.STRING(200),
            allowNull : true,
        },
        
    })
}