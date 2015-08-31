var console = require('console');
var https = require('https');
var babyparse = require('babyparse');

// Constructor
function RecipeManager(googleSpreadsheetID)
{
  // always initialize all instance properties
  this.googleSpreadsheetID = googleSpreadsheetID;
  this.recipes = [];
  this.recipeIDToIndex = {};
  this.searchables = [
    {field:'Course',enums:[]},
    {field:'Key Ingredient',enums:[]},
    {field:'Type of Food',enums:[]},
    {field:'Ethnicity',enums:[]},
    {field:'Themes/Holidays',enums:[]},
    {field:'Prep Method',enums:[]},
    {field:'Difficulty',enums:[]},
    {field:'Serving Temp',enums:[]},
  ];

  this.loadRecipeData();
}

RecipeManager.prototype.getRecipes = function()
{
  return this.recipes;
};

RecipeManager.prototype.getSearchables = function()
{
  return this.searchables;
};

RecipeManager.prototype.getRecipeByID = function(id)
{
  var index = this.recipeIDToIndex[id];
  if (index != null) {
    return this.recipes[index];
  } else {
    return null
  }
};

// Searches through the whole recipe list to build the search enumerations for field
RecipeManager.prototype.findEnums = function(field)
{
  var aEnums = [];
  for (var i = 0; i < this.recipes.length; i++) {
    var fieldValue = this.recipes[i][field];
    if (fieldValue != null && fieldValue.length > 0) {
      avalues = fieldValue.split('\n');
      for (var j = 0; j < avalues.length; j++) {
        if (avalues[j] == null || avalues[j].length == 0) continue;
        var k = 0;
        for (; k < aEnums.length; k++) {
          if (aEnums[k] == avalues[j]) break;
        }
        if (k == aEnums.length) aEnums.push(avalues[j]);
      }
    }
  }
  aEnums.sort();
  return aEnums;
}

// Build the enumeration values for every searchable field;
RecipeManager.prototype.buildSearchIndices = function()
{
  for (var i = 0; i < this.searchables.length; i++ ) {
    this.searchables[i].enums = this.findEnums(this.searchables[i].field);
  }
}

RecipeManager.prototype.loadRecipeData = function()
{
  var url = 'https://docs.google.com/spreadsheets/d/' + this.googleSpreadsheetID + '/pub?output=csv';
  var rm = this;
  console.log("Loading data from: " + url);
  https.get(url,
    function(res) {
      var str = '';
      res.on('data',
        function(d) {
            str += d.toString();
        }
      );
      res.on('end',
        function(d) {
          var parsed = babyparse.parse(str);
          var rows = parsed.data;
          var header = rows[0];
          var keywords = [];
          for (var i = 0; i < header.length; i++) {
            keywords.push(header[i]);
          }
          var newRecipes = [];
          for (var i = 1; i < rows.length; i++) {
            var obj ={};
            for (var j=0;j<keywords.length;j++) {
              obj[keywords[j]] = rows[i][j];
            }
            newRecipes[i-1] = obj;
          }
          rm.recipes = newRecipes;
          rm.recipes.sort( function(a,b) {
                             if (a.Title > b.Title) {
                               return 1;
                             }
                             if (a.Title < b.Title) {
                               return -1;
                             }
                             return 0;
                           }
                         );
          var newRecipeIDToIndex = {};
          for (var i = 0; i < rm.recipes.length; i++) {
            newRecipeIDToIndex[rm.recipes[i].ID] = i;
          }
          rm.recipeIDToIndex = newRecipeIDToIndex;
          rm.buildSearchIndices();
          console.log("Got recipes: " + rm.recipes.length);
        }
      );
    }
  ).on('error',
    function(e) {
      console.error(e);
    }
  );
}

// export the class
module.exports = RecipeManager;