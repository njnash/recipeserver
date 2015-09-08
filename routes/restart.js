var express = require('express');
var getter = express.Router();

getter.get('/',
  function(req, res, next) {
    process.exit(0);
  }
);

module.exports = getter;