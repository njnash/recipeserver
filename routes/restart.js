var express = require('express');
var getter = express.Router();

getter.get('/',
  function(req, res, next) {
    res.send('Exitting Server');
    process.exit(0);
  }
);

module.exports = getter;
