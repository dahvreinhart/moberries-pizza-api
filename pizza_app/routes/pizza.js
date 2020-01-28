var express = require('express');
var router = express.Router();
var models = require('../models');

/**
 * @swagger
 * /pizzas:
 *   get:
 *     tags:
 *       - Pizza
 *     description: Returns a list of all the types of pizza made by the shop
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: array
 */
router.get('/', function (req, res, next) {
    return models.Pizza
        .all({
            order: [
                ['id', 'DESC']
            ],
        })
        .then(pizzas => res.status(200).send(pizzas.map((pizza) => pizza.name)))
        .catch(error => res.status(400).send(error));
});

/**
 * @swagger
 * /pizzas:
 *   post:
 *     tags:
 *       - Pizza
 *     description: Create a new pizza option
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: pizzaData
 *         required: true
 *         description: The data required to create a new pizza
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: array
 */
router.post('/', async function (req, res, next) {
    // If pizza already exists, send an error
    const existingPizza = await models.Pizza.findOne({ where: { name: req.body.name } });
    if (existingPizza) {
        return next({ status: 400, message: 'Identical pizza already exists.' });
    }

    return models.Pizza
        .create({ name: req.body.name })
        .then(newPizza => res.status(200).send(newPizza))
        .catch(error => res.status(400).send(error));
});

module.exports = router;
