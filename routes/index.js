var express = require('express');
var router = express.Router();

//var logger = require('morgan');
const expressWinston = require('express-winston');
const winston = require('winston');
const level = process.env.LOG_LEVEL || 'debug';
var logger = winston.createLogger({
  level: level,
  transports: [
    //new winston.transports.File(options.file),
    //new winston.transports.Console(options.console)
    new winston.transports.Console()
  ],
  exitOnError: false, // do not exit on handled exceptions
});
var config = require('../config/config.js').get(process.env.NODE_ENV);


var sess;

/* GET home page. */
router.get('/', function(req, res, next) {
  logger.debug('GET / starting...');
  sess=req.session;
  //console.log('after req.session!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
  logger.debug('GET / calling render(index,{renderInfo})...');
  res.render('index', {
    title: 'Health Data App',
    description: 'App to work with Fitbit and DynamoDB',
    username: req.session.username || 'anonymous',
    success: req.session.success,
    errors: req.session.errors,
    startdate: req.session.startdate,
    enddate: req.session.enddate,
    sessionid: req.session.id,
    fitbiturl: `${config.Fitbit.authURL}&client_id=${config.Fitbit.clientId}&redirect_uri=${config.Fitbit.callbackURL}&scope=${config.Fitbit.scope}`,
    tokenstatus: tokenStatus
  });
  req.session.errors = null;
  req.session.success = null;
  logger.debug('GET / complete.');
});

router.post('/get-token', function(req, res, err) {
  logger.debug('POST /get-token starting...');
  var date = req.body.date
  res.redirect('/test/' + date)
})

router.post('/submit', function(req, res, err) {
  logger.debug('POST /submit starting...');
  req.check('startdate', 'invalid start date:').isISO8601();
  req.check('enddate', 'invalid end date:').isISO8601();
  logger.debug('POST /submit validating request...');
  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
    logger.debug('POST /submit after validation, redirecting to / ...');
    res.redirect('/')
  } else {
    req.session.startdate  = req.body.startdate
    req.session.enddate = req.body.enddate
    req.session.success = true;
    //res.redirect('/test/' + startdate)
    logger.debug('POST /get-activities after validation, redirecting to / ...');
    res.redirect('/fitbit/get-activities')
  }

})

router.get('/test/:startdate', function(req, res, next) {
  logger.debug('GET /test/ starting ...');
  res.render('test', {output: req.params.startdate})
})

router.post('/test/submit', function(req, res, err) {
  logger.debug('POST /test/submit starting...');
  var date = req.body.date
  res.redirect('/test/' + date)
})



module.exports = router;
