// A subcategory a shop defines for itself, used to group that shop's products
// on its own storefront (/stores/<slug>). Deliberately separate from
// SubCategory: SubCategory is the shared, admin-owned taxonomy that powers the
// platform-wide /shops filters, and it must stay comparable across shops. These
// are private to one shop and never appear on the global shops screen.
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ShopProductGroup', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name_ru: {
            type: DataTypes.STRING,
            allowNull: true
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        }
    });
};
