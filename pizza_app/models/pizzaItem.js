'use strict';
module.exports = (sequelize, DataTypes) => {
    var PizzaItem = sequelize.define('PizzaItem', {
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        size: {
            type: DataTypes.ENUM,
            allowNull: false,
            values: [
                'SMALL',
                'MEDIUM',
                'LARGE',
            ],
        },
        pizzaTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        },
    }, {
        tableName: 'pizzaItem'
    });

    PizzaItem.associate = (models) => {
        PizzaItem.belongsTo(models.Order, {
            foreignKey: 'orderId',
            onDelete: 'CASCADE',
        });
    };

    return PizzaItem;
};
