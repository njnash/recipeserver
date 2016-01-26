var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan'); // Logger
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileStreamRotator = require('file-stream-rotator');
var RecipeManager = require('./RecipeManager');
var IDCookieManager = require('./IDCookieManager');
var fs = require('fs');

var index = require('./routes/index');
var recipe = require('./routes/recipe');
var restart = require('./routes/restart');
var addCookie = require('./routes/addCookie');

var dataDir = path.join(__dirname,'data');
fs.mkdir(dataDir, 0755, function(err){});
var logDirectory = path.join(dataDir, 'logs');
fs.mkdir(logDirectory, 0755, function(err){});

// view engine setup
console.log("Starting in " + __dirname);
var app = express();
app.set('views', path.join(__dirname, 'views'));

// create a rotating write stream
var logStream = fileStreamRotator.getStream({
  filename: logDirectory + '/recipes-%DATE%.log',
  frequency: 'daily',
  verbose: false,
  date_format: "YYYY-MM-DD"
});


global.rm = new RecipeManager('1qfK7ULjezDNXlQRMW55niFDRHz9WEjC4OxYGDgYlSNA');
// Re-read the recipe data every so often
setInterval(function(){global.rm.loadRecipeData();}, 15 * 60 * 1000);

global.cm = new IDCookieManager(dataDir);
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev')); // Log to the console
app.use(morgan('combined', {stream: logStream})); // Log to the file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('audrey\'s great big book of food'));

function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

// Add a cookie here if it doesn't exist
app.use(
  function(req, res, next) {
    if (req.cookies.ID == null) {
      console.log("No cookies");
      var newCookie = '' + generateUUID();
      res.cookie('ID', newCookie, { expires: new Date(Date.now() + (10 * 365 * 24 * 60 * 60) * 1000) });
      req.cookies.ID = newCookie;
    }
    next();
  }
);

app.use(express.static(path.join(__dirname, 'public')));  // Static file
app.use('/', index); // Home page, search page

// Check on cookies in this function
// You can do anything up to this point without a valid cookie
app.use(
  function(req, res, next) {
    if (req.cookies.ID == null) {
      res.render('error', {
        message: 'ERROR: Cookie should have been set',
        error: {}
      });
    } else {
      permission = cm.isCookeValid(req.cookies.ID);
      if (permission == 0) {
        // Found, but no permission
        res.render('error', {
          message: 'You do not have permission to access this.',
          error: {}
        });
      } else if (permission == -1) {
        // Not found
        res.render('unknown', {
          emailAddress: 'register@audreysgreatbigbookoffood.com',
          cookie: req.cookies.ID
        });
      } else {
        next();
      }
    }
  }
);

app.use('/recipe', recipe);  // A recipe

// Past here is administrative calls
app.use(
  function(req, res, next) {
    permission = cm.isCookeValid(req.cookies.ID);
    if (permission < 2) {
      // Found, but no permission
      res.render('error', {
        message: 'You do not have permission to access this.',
        error: {}
      });
    } else {
      next();
    }
  }
);

app.use('/restart', restart);  // Exit the app
app.use('/addCookie', addCookie);  // Exit the app

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
