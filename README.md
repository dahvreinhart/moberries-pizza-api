# MoBerries Pizza Ordering API
A simple pizza ordering API for MoBerries.

First-Time Operation Instructions:
1. Clone/download repository
2. From project root, navigate to `/pizza_app`
3. Run `npm install`
4. Navigate back to project root
5. Run `docker-compose build`
6. Run `docker-compose up`
7. In your browser, navigate to `http://192.168.99.100:3000/api`
8. You should see the Swagger API documentation page
    - If you are unfamiliar with Swagger or how to test APIs with it, please visit the [Swagger UI](https://swagger.io/tools/swagger-ui/) page for more details
9. Additional note: observe that this API allows for the creation of any kind of pizza you like through use of the `POST /pizzas` endpoint - dont forget to create some before testing endpoints, such as the `POST /orders` endpoint, which depend on the existance of some pizza options in the database

Testing:
1. From project root, navigate to `/pizza_app`
2. Run `npm test`
3. Tests should run in console and print results

Operation Dependancies:
- NodeJS & npm
- Docker