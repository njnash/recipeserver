var express = require('express');
var getter = express.Router();

getter.get('/',
  function(req, res, next) {

    var title = req.query.title;
    var id = null;
    if (title == null) {
      id = req.query.ID;
    } else {
      results = global.rm.textSearch(null,title,'Title');
      if (results != null && results.length == 1) {
        id = results[0].ID;
      }
    }
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
