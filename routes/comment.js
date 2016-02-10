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
    var recipe;
    if (id != null) {
      recipe = global.rm.getRecipeByID(id);
      if (recipe == null) {
        res.render('error', {
          message: 'No recipe with the ID\'' + id + '\'',
          error: {}
        });
      }
    }
    res.render('comment',
                {
                  recipe:recipe,
                  id:id,
                  cookie:req.cookies.ID,
                  pretty:true
                }
              );
  }
);

module.exports = getter;
