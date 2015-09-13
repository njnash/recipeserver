var express = require('express');
var getter = express.Router();

getter.get('/',
  function(req, res, next) {
    if (req.query['cookie'] == null) {
      res.send('No cookie given');
    } else {
      c = global.cm.isCookeValid(req.query['cookie']);
      if (c != -1) {
        res.send('Cookie ' + req.query['cookie'] + ' already exists')
      } else {
        global.cm.addCookie(req.query['cookie'],1);
        res.send('Cookie ' + req.query['cookie'] + ' added')
      }
    }
  }
);

module.exports = getter;
