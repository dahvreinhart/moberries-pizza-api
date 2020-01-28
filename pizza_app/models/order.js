'use strict';
module.exports = (sequelize, DataTypes) => {
    var Order = sequelize.define('Order', {
        status: {
            type: DataTypes.ENUM,
            values: [
                'NEW',
                'PREPARING',
                'DELIVERING',
                'DELIVERED'
            ],
            allowNull: false,
            defaultValue: 'NEW',
        },
        delivery: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
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
        tableName: 'order'
    });

    Order.associate = (models) => {
        Order.hasMany(models.PizzaItem, {
            foreignKey: 'orderId',
            as: 'pizzaItems',
        });
    };

    Order.associate = (models) => {
        Order.hasOne(models.Customer, {
            foreignKey: 'orderId',
            as: 'customer',
        });
    };

    return Order;
};