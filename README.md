# MoBerries Pizza Ordering API
A simple pizza ordering API for MoBerries.

Operation Instructions:
1. Clone/download repository
2. Navigate to project root
3. Run `docker-compose build`
4. Run `docker-compose up`
5. In your browser, navigate to `http://192.168.99.100:3000/api`
6. You should see the Swagger API documentation page
    - If you are unfamiliar with Swagger or how to test APIs with it, please visit the [Swagger UI](https://swagger.io/tools/swagger-ui/) page for more details
7. Additional note: observe that this API allows for the creation of any kind of pizza you like through use of the `POST /pizzas` endpoint - dont forget to create some before testing endpoints, such as the `POST /orders` endpoint, which depend on the existance of some pizza options in the database

Testing:
1. Navigate to `/pizza_app`
2. Run `npm test`
3. Tests should run in console and print results

Operation Dependancies:
- NodeJS & npm
- Docker