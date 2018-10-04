var express = require('express');
var router = express.Router();

// get runtime configuration
var config = require('../config/config.js').get(process.env.NODE_ENV);

// setup logging
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

// Add package to read json files
//var jsonfile = require('jsonfile');
var fs = require('fs');
// Add package for AWS node sdk
var AWS = require('aws-sdk');
//choose region in config
AWS.config.update(config.DynamoDB.region); //choose region in config

// create a DynamoDB document client to allow using JSON directly
var docClient = new AWS.DynamoDB.DocumentClient();
var attr = require('dynamodb-data-types').AttributeValue;

const actHR         = "activities-heart";
const actHRs        = "activities-heart-intraday";
const hashId        = "ggwiebe";
//const actDate       = "20180902"; // get date from input file
const actDate       = actHR[0].dateTime; // get date from input file
const category_date = "HeartRate#" + actDate;



var request = require('request');

// Handle the oauth redirect route
router.get('/upload', (req, res, next) => {
  logger.debug('upload post route called...')
  // The req.query object has the query params that were sent to this route.

    // redirect the user to the welcome page, along with the access token
    //res.redirect(`/welcome.html?fname=${fbFirstName}&lname=${fbLastName}`)
    res.redirect('/')

})

module.exports = router;
