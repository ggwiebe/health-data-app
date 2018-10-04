var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var logger = require('morgan');
var morgan = require('morgan');
//const logger = require('../logger');
const expressWinston = require('express-winston');
const winston = require('winston');
const level = process.env.LOG_LEVEL || 'debug';
//var logger = expressWinston.logger({
//    transports: [
//      new winston.transports.Console({
//          level: level
//          //,
//          //timestamp: function () {return (new Date()).toISOString();}
//      })
//    ]
//});
var logger = winston.createLogger({
  level: level,
  transports: [
    //new winston.transports.File(options.file),
    //new winston.transports.Console(options.console)
    new winston.transports.Console()
  ],
  exitOnError: false, // do not exit on handled exceptions
});
var hbs = require('express-handlebars');
var cookieParser = require('cookie-parser');
var expressValidator = require('express-validator');
var expressSession = require('express-session');


var indexroutes     = require('./routes/index');
var fitbitroutes    = require('./routes/fitbit');
var datastoreroutes = require('./routes/datastore');

var app = express();
tokenStatus = false;

// view engine setup
logger.info('app engine setup...');
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts/'}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(logger('dev'));
app.use(morgan('dev'));
logger.debug('app.use(logger)...');
//app.use(logger); is this MORGAAN???
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSession({secret: 'glenn', saveUnitialized: false, resave: false}));

logger.debug('app setup routes...');
app.use('/'         , indexroutes);
app.use('/fitbit'   , fitbitroutes);
app.use('/datastore', datastoreroutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
