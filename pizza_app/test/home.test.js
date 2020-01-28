const request = require('supertest');
const app = require('../app')

describe('Unit testing the `/` route', () => {

    it('should return OK status', async () => {
      return await request(app)
        .get('/')
        .then(function(response) {
            expect(response.status).toEqual(200);
        })
    });

});