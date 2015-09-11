var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan'); // Logger
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileStreamRotator = require('file-stream-rotator');
var RecipeManager = require('./RecipeManager');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');
var recipe = require('./routes/recipe');
var restart = require('./routes/restart');

var dataDir = path.join(__dirname,'data');
fs.mkdir(dataDir, 0755, function(err){});
var logDirectory = path.join(dataDir, 'logs');
fs.mkdir(logDirectory, 0755, function(err){});

// create a rotating write stream
var accessLogStream = fileStreamRotator.getStream({
  filename: logDirectory + '/access-%DATE%.log',
  frequency: 'daily',
  verbose: false
});

var app = express();
global.rm = new RecipeManager('1qfK7ULjezDNXlQRMW55niFDRHz9WEjC4OxYGDgYlSNA');
// Re-read the recipe data
setInterval(function(){global.rm.loadRecipeData();}, 15 * 60 * 1000);

// view engine setup
console.log("Starting in " + __dirname);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev')); // Log to the console
app.use(morgan('combined', {stream: accessLogStream})); // Log to the file
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('audrey\'s great big book of food'));

// Add a cookie here if it doesn't exist
app.use(
  function(req, res, next) {
    if (req.cookies.ID == null) {
      console.log("No cookies");
      var newCookie = '' + Date.now();
      res.cookie('ID', newCookie, { expires: new Date(Date.now() + (10 * 365 * 24 * 60 * 60) * 1000) });
      req.cookies.ID = newCookie;
    }
    next();
  }
);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);


// Check on cookies in this function
// You can do anything up to this point without a valid cookie
app.use(
  function(req, res, next) {
    if (req.cookies.ID == null) {
      console.log("ERROR: Cookie should have been set.")
    }
  }
  next();
);

app.use('/recipe', recipe);
app.use('/restart', restart);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

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
