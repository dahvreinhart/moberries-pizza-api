const request = require('supertest');
const app = require('../app')
const models = require('../models');

describe('Unit testing the `/orders` route', function() {

    describe('GET `/orders/:id', () => {

        it('should return 404 with message when no order found', function() {
            models.Order.findOne = jest.fn();
            models.PizzaItem.findAll = jest.fn();

            return request(app)
              .get(`/orders/${123}`)
              .then(function(response){
                  expect(response.status).toEqual(404);
                  expect(response.text).toBeDefined();
              })
        });

        it('should successfully return an order when one exists', function() {
            const testOrder = { id: 1 };
            models.Order.findOne = jest.fn(() => {
                return testOrder;
            });

            const testPizzaItems = [{ id: 1 }, { id: 2 }, { id: 3 }]
            models.PizzaItem.findAll = jest.fn(() => {
                return testPizzaItems
            });

            return request(app)
              .get(`/orders/${1}`)
              .then(function(response){
                  expect(response.status).toEqual(200);
                  expect(response.body).toEqual({ ...testOrder, pizzaItems: testPizzaItems });
              })
        });

    })

});