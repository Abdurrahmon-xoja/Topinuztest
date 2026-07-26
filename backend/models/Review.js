module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Review', {
        authorName: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Гость'
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        ShopId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ProductId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }
    });
};
