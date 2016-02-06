var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  // Search conditions
  var armFiltered = global.rm.getRecipes();
  var aSearchables = global.rm.getSearchables();
  var permission = global.cm.isCookeValid(req.cookies.ID);

  if (req.query['terms'] != null && req.query['terms'].length > 0) {
    var aFreeText = req.query['terms'].split(' ');
    for (var i = 0; i < aFreeText.length; i++) {
      if (aFreeText[i].length > 0) {
        armFiltered = global.rm.textSearch(armFiltered, aFreeText[i], null);
      }
    }
  }
  for (var i = 0; i < aSearchables.length; i++ ) {
    armFiltered = global.rm.textSearch(armFiltered, req.query[aSearchables[i].field], aSearchables[i].field);
  }
  if (req.query['terms'] == 'a') {// Special sort by ID for debugging
    armFiltered.sort( function(a,b) {

                       if (parseInt(a.ID) > parseInt(b.ID)) return 1;
                       if (parseInt(a.ID) < parseInt(b.ID)) return -1;
                       return 0;
                     }
                   );
  }
  res.render('index',
    { title: 'Audrey\'s Great Big Book of Food',
      armOriginal: global.rm.getRecipes(),
      armFiltered: armFiltered,
      aSearchables: aSearchables,
      query: req.query,
      pretty:true,
      permission:permission,
      date:global.rm.getDate()
    }
  );
});

module.exports = router;
