var express = require('express');
var getter = express.Router();

getter.get('/',
  function(req, res, next) {

    var id = req.query.ID;
    var hidePicts = req.query.hidePicts;
    if (hidePicts == 'true') {
      hidePicts = true;
    } else {
      hidePicts = false;
    }
    if (id == null) {
      res.render('error', {
        message: 'No ID given',
        error: {}
      });
    } else {
      var recipe = global.rm.getRecipeByID(id);
      if (recipe == null) {
        res.render('error', {
          message: 'No recipe with the ID\'' + id + '\'',
          error: {}
        });
      } else {
        res.render('recipe',
                    {
                      recipe:recipe,
                      id:id,
                      pretty:true,
                      hidePicts: hidePicts
                    }
                  );
      }
    }
  }
);

module.exports = getter;
