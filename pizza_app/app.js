var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var swaggerJSDoc = require('swagger-jsdoc');
var swaggerUIExpress = require('swagger-ui-express');

var indexRouter = require('./routes/index');
var pizzaRouter = require('./routes/pizza');
var customerRouter = require('./routes/customer');
var orderRouter = require('./routes/order');

var app = express();

// swagger UI display options
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: 'MoBerries Application Pizza App',
            version: 'v0.0.1',
            description: 'A simple pizza-ordering API. Made by Dahv Reinhart as part of the employment application to MoBerries.',
        },
        host: '192.168.99.100:3000',
        basePath: '/',
    },
    apis: [__dirname + '/routes/*.js'],
};

// Returns validated swagger spec in JSON format
const swaggerSpec = swaggerJSDoc(swaggerOptions);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/pizzas', pizzaRouter);
app.use('/customers', customerRouter);
app.use('/orders', orderRouter);
app.use('/api', swaggerUIExpress.serve, swaggerUIExpress.setup(swaggerSpec));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // return the error
    res.status(err.status || 500).send('Error: ' + err.message);
});

module.exports = app;
