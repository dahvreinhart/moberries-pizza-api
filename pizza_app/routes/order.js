var express = require('express');
var router = express.Router();
var models = require('../models');

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: 
 *       - Order
 *     description: Returns a filterable list of all current orders
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [NEW, PREPARING, DELIVERING, DELIVERED]
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: array
 */
router.get('/', function (req, res, next) {
    // Apply filters only if they are present
    let statusFilter = req.query.status ? { status: req.query.status } : {};
    let customerFilter = req.query.customerId ? { id: req.query.customerId } : {};

    return models.Order
        .all({
            where: statusFilter,
            order: [['id', 'DESC']],
            include: [
                { model: models.Customer, as: 'customer', where: customerFilter }
            ],
        })
        .then(orders => res.status(200).send(orders))
        .catch(error => res.status(400).send(error));
});

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: 
 *       - Order
 *     description: Returns a specific order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: object
 */
router.get('/:id', async function (req, res, next) {
    const order = await models.Order.findOne({
        where: { id: req.params.id },
        include: [{ model: models.Customer, as: 'customer' }],
    });

    // If order could not be found, throw error
    if (!order) return next({ status: 404, message: 'No order found.' });

    // Find all pizzaItems associated with this order
    const pizzaItems = await models.PizzaItem.findAll({
        where: { orderId: order.id },
    });

    const response = {
        ...JSON.parse(JSON.stringify(order)),
        pizzaItems
    };

    res.status(200).send(response)
});

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: 
 *       - Order
 *     description: Create a new order
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: orderData
 *         required: true
 *         description: The data required to create a new order
 *         schema:
 *           type: object
 *           properties:
 *             delivery:
 *               type: boolean
 *             pizzaItems:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - quantity
 *                   - size
 *                   - pizzaTypeId
 *                 properties:
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                   size:
 *                     type: string
 *                     enum: [SMALL, MEDIUM, LARGE]
 *                   pizzaTypeId:
 *                     type: integer
 *             customer:
 *               type: object
 *               required:
 *                 - firstName
 *                 - lastName
 *                 - email
 *                 - phone
 *               properties:
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 streetAddress:
 *                   type: string
 *                 city:
 *                   type: string
 *                 province:
 *                   type: string
 *                 postalCode:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: object
 */
router.post('/', async function (req, res, next) {
    const pizzaItems = req.body.pizzaItems;
    const customerData = req.body.customer;

    // Check if any of the specified pizza choices were invalid
    for (pizzaItem of pizzaItems) {
        const pizza = await models.Pizza.findOne(pizzaItem.pizzaTypeId);
        if (!pizza) return next({ status: 400, message: "One or more pizza selections were invalid." });
    }

    // Ensure that only pizzas with positive quantities are added to the order
    const pizzaItemsToCreate = [];
    pizzaItems.forEach((pizzaItem) => {
        if (pizzaItem.quantity && pizzaItem.quantity > 0) pizzaItemsToCreate.push(pizzaItem);
    });
    if (!pizzaItemsToCreate.length) return next({ status: 400, message: "No pizza selections were made." });

    // Create new Customer, Order and PizzaItems in a transaction
    const orderCreationTransaction = await models.sequelize.transaction();

    try {
        // Create the new order in the db and update with customer and pizza item relations
        const newOrder = await models.Order.create(
            { delivery: req.body.delivery },
            { transaction: orderCreationTransaction }
        );

        // Create the new customer in the db
        await models.Customer.create(
            {
                ...customerData,
                orderId: newOrder.id,
            },
            { transaction: orderCreationTransaction }
        );

        // Create each of the new pizza items in the db
        for (pizzaItem of pizzaItemsToCreate) {
            await models.PizzaItem.create(
                {
                    ...pizzaItem,
                    orderId: newOrder.id,
                },
                { transaction: orderCreationTransaction },
            );
        }

        // No errors were encountered - commit all objects to db
        await orderCreationTransaction.commit();

        // Refresh the order object to add customer relation
        const refreshedOrder = await models.Order.findOne({
            where: { id: newOrder.id },
            include: [{ model: models.Customer, as: 'customer' }],
        });

        res.status(200).send(refreshedOrder);
    } catch (error) {
        // An error was encountered creating/commiting something - rollback entire transaction
        if (orderCreationTransaction) await orderCreationTransaction.rollback();
        return next(error);
    }
});

/**
 * @swagger
 * /orders/{id}:
 *   patch:
 *     tags: 
 *       - Order
 *     description: Updates a specific order
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *       - in: body
 *         name: updateData
 *         description: The data for the specified order to be updated with
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               enum: [NEW, PREPARING, DELIVERING, DELIVERED]
 *             pizzaItems:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - quantity
 *                   - size
 *                   - pizzaTypeId
 *                 properties:
 *                   quantity:
 *                     type: integer
 *                     minimum: 1
 *                   size:
 *                     type: string
 *                     enum: [SMALL, MEDIUM, LARGE]
 *                   pizzaTypeId:
 *                     type: integer
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: object
 */
router.patch('/:id', async function (req, res, next) {
    const newStatus = req.body.status;
    const newPizzaItems = req.body.pizzaItems;

    if (!newStatus && !newPizzaItems) {
        return next({ status: 400, message: 'No update data found.' });
    }

    // Find the order we will update
    const order = await models.Order.findOne({
        where: { id: req.params.id },
    });

    // If order could not be found, throw error
    if (!order) return next({ status: 404, message: 'No order found.' });

    // If an order has already been delivered then it is forbidden to update it
    if (order.status === 'DELIVERED') {
        return next({ status: 400, message: 'Order has already been delivered and cannot be updated.' });
    }
    
    const pizzaItemsToCreate = [];
    if (newPizzaItems) {
        // Check if any of the specified pizza choices are invalid
        for (pizzaItem of newPizzaItems) {
            const pizza = await models.Pizza.findOne(pizzaItem.pizzaTypeId);
            if (!pizza) return next({ status: 400, message: "One or more pizza selections were invalid." });
        }

        // Ensure that only pizzas with positive quantities are added to the order
        newPizzaItems.forEach((pizzaItem) => {
            if (pizzaItem.quantity && pizzaItem.quantity > 0) pizzaItemsToCreate.push(pizzaItem);
        });
        if (!pizzaItemsToCreate.length) return next({ status: 400, message: "No pizza selections were made." });
    }

    // Create new Customer, Order and PizzaItems in a transaction
    const orderUpdateTransaction = await models.sequelize.transaction();

    try {
        // If we are updating the pizza items, delete the old ones first
        if (pizzaItemsToCreate.length) {
            await models.PizzaItem.destroy(
                { where: { orderId: order.id } },
                { transaction: orderUpdateTransaction },
            );
        }

        // Then create new pizzaItems in the db for each of the updates
        for (pizzaItem of pizzaItemsToCreate) {
            await models.PizzaItem.create(
                {
                    ...pizzaItem,
                    orderId: order.id,
                },
                { transaction: orderUpdateTransaction },
            );
        }

        // Now update the order if the status was updated
        if (newStatus && newStatus !== order.status) {
            await models.Order.update(
                { status: req.body.status },
                { where: { id: order.id } },
                { transaction: orderUpdateTransaction }
            );
        }

        // No errors were encountered - commit all objects to db
        await orderUpdateTransaction.commit();

        // Refresh the order object to add customer relation
        const refreshedOrder = await models.Order.findOne({
            where: { id: order.id },
            include: [{ model: models.Customer, as: 'customer' }],
        });

        res.status(200).send(refreshedOrder);
    } catch(error) {
        // An error was encountered creating/commiting something - rollback entire transaction
        if (orderUpdateTransaction) await orderUpdateTransaction.rollback();
        return next(error);
    }

    res.status(200).send()
});

module.exports = router;
