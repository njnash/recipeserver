var express = require('express');
var router = express.Router();

function textSearch(arm, str, prop)
{
  if (str == null || str.length == 0)
    return arm;
  var regex = new RegExp(str, "i");
  var armReturn = [];
  var objArray = [];
  if (prop != null) {
    objArray[prop] = 0;
  }
  for (var i = 0; i < arm.length; i++) {
    if (prop == null) {
      objArray = arm[i];
    }
    for (var prop in objArray) {
      if (arm[i].hasOwnProperty(prop)) {
        if (arm[i][prop].match(regex)) {
          armReturn.push(arm[i]);
          break;
        }
      }
    }
  }
  return armReturn;
}

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
        armFiltered = textSearch(armFiltered, aFreeText[i], null);
      }
    }
  }
  for (var i = 0; i < aSearchables.length; i++ ) {
    armFiltered = textSearch(armFiltered, req.query[aSearchables[i].field], aSearchables[i].field);
  }

  res.render('index',
    { title: 'Audrey\'s Great Big Book of Food',
      armOriginal: global.rm.getRecipes(),
      armFiltered: armFiltered,
      aSearchables: aSearchables,
      query: req.query,
      pretty:true,
      permission:permission
    }
  );
});

module.exports = router;
