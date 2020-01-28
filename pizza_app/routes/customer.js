var express = require('express');
var router = express.Router();
var models  = require('../models');

/**
 * @swagger
 * /customers:
 *   get:
 *     tags: 
 *       - Customer
 *     description: Returns a list of all customers with current orders
 *     responses:
 *       200:
 *         description: OK
 *         text/plain:
 *           schema:
 *             type: array
 */
router.get('/', function(req, res, next) {
  return models.Customer
    .all({
        order: [
            ['id', 'DESC']
        ],
    })
    .then(customers => res.status(200).send(customers))
    .catch(error => res.status(400).send(error));
});

module.exports = router;
