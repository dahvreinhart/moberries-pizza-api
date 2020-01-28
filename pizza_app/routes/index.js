var express = require('express');
var router = express.Router();

// Simple homepage route to display welcome screen
router.get('/', function(req, res, next) {
  res.render(
    'index',
    {
      appName: 'MoBerries Application Pizza Ordering API',
      apiRoute: '/api',
    });
});

module.exports = router;
