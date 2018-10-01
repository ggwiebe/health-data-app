var express = require('express');
var router = express.Router();

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
var accessToken;
var accessUser;

var config = require('../config/config.js').get(process.env.NODE_ENV);
// Import querystring handler qs from 'qs'
const qs = require('qs')
// Import the axios library, to make HTTP requests
const axios = require('axios')
//require('axios-debug')(axios)
const api = axios.create(
  {timeout: 15000}
)
var request = require('request');

// Handle the oauth redirect route
router.get('/oauth/redirect', (req, res, next) => {
  logger.debug('oauth redirect called...')
  // The req.query object has the query params that were sent to this route. We want the `code` param
  const requestToken = req.query.code
  let requestUrl =  `${config.Fitbit.apiTokenURL}?client_id=${config.Fitbit.clientId}&client_secret=${config.Fitbit.clientSecret}&code=${requestToken}`
  const requestConfig = {
     headers: {
         accept: 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded',
         Authorization: 'Basic ' + Buffer.from(`${config.Fitbit.clientId}:${config.Fitbit.clientSecret}`).toString('base64')
    }
  }
  const requestBody =  {
    code: requestToken,
    grant_type: 'authorization_code',
    redirect_uri: config.Fitbit.callbackURL
  }
  const requestBodyStr = qs.stringify(requestBody)
  logger.debug('api.post() called...')
  api.post(requestUrl, requestBodyStr, requestConfig)
  .then(function (response) {
    logger.debug('oauth redirect accessToken response then(); redirecting to Welcome...')
    //logger.debug('response.data: ', response.data)
    logger.debug('response.status: ', response.status)
    logger.debug('response.statusText: ', response.statusText)
    logger.debug('response.headers: ', response.headers)
    logger.debug('response.config: ', response.config)
    accessToken = response.data.access_token
    accessUser = response.data.user_id

    const authorizedRequestConfig = {
       headers: {
           Authorization: 'Bearer ' + accessToken
      }
    }
    //GET https://api.fitbit.com/1/user/[user-id]/profile.json
    requestUrl = `${config.Fitbit.resourceURLBase}user/${accessUser}/profile.json`
    api.get(requestUrl, authorizedRequestConfig)
    .then(function (profileResponse) {
      logger.debug('get profile.json - response callback; re-rendering to index page...')
      //logger.debug('profile.response.data: ', profileResponse.data)
      logger.debug('profile.response.status: ', profileResponse.status)
      logger.debug('profile.response.statusText: ', profileResponse.statusText)
      logger.debug('profile.response.headers: ', profileResponse.headers)
      logger.debug('profile.response.config: ', profileResponse.config)
      var fbFirstName = profileResponse.data.user.firstName
      var fbLastName = profileResponse.data.user.lastName
      req.session.username = fbFirstName + ' ' + fbLastName
      req.session.tokenstatus = true
      tokenStatus = true;

      // redirect the user to the welcome page, along with the access token
      //res.redirect(`/welcome.html?fname=${fbFirstName}&lname=${fbLastName}`)
      res.redirect('/')
      // Don't redirect, just re-render the index page with the additional information available!
      // set the tokenStatus to true and then re-render
      //res.render('index', {
      //  title: 'Health Data App',
      //  description: 'App to work with Fitbit and DynamoDB',
      //  username: req.session.username,
      //  success: req.session.success,
      //  errors: req.session.errors,
      //  startdate: req.session.startdate,
      //  enddate: req.session.enddate,
      //  sessionid: req.session.id,
      //  tokenstatus: tokenStatus
      //});

    })
    .catch(function (error) {
      logger.debug('get profile.json - catch():', error)
      res.send({
          status: '500',
          message: 'long string here!!!!!!!!!!!'
          //message: customStringify(error)
      })
    })

  })
  .catch(function (error) {
    logger.debug('CATCH(ERROR):', error)
    res.send({
        status: '500',
        message: customStringify(error)
    })
  })
})

// Handle the fitbit getActivity
router.get('/get-activities', (req, res, next) => {
  logger.debug('/get-activities form action called...')
  // The req.query object has the query params that were sent to this route. We want the `code` param
  const requestToken = req.query.code
  // Sample fully fleshed out request: https://api.fitbit.com/1/user/4MCDD3/activities/heart/date/2018-09-01/1d/1min.json
  //                                   https://api.fitbit.com/1/user/4MCDD3/activities/heart/date/2018-09-01/1d/1min.json
  //                                                         /1/user/4MCDD3/activities/heart/date/2018-09-01/1d/1min.json
  //                                   https://api.fitbit.com/1/user/4MCDD3/activities/heart/date/2018-09-01/1d/1min.json
  // When we added validation, the startdate & enddate moved into session variables. 
  //let requestUrl =  `${config.Fitbit.resourceURLBase}user/${accessUser}/activities/heart/date/${req.query.startdate}/1d/1min.json` // when using GET
  let requestUrl =  `${config.Fitbit.resourceURLBase}user/${accessUser}/activities/heart/date/${req.session.startdate}/1d/1min.json` // when using GET
  //let requestUrl =  `${config.Fitbit.resourceURLBase}user/${accessUser}/activities/heart/date/${req.body.startdate}/1d/1min.json` // when using POST

  const requestConfig = {
     headers: {
         accept: 'application/json',
         'Content-Type': 'application/x-www-form-urlencoded',
         Authorization: 'Bearer ' + accessToken
    }
  }
  const requestBody =  {
    code: requestToken,
    grant_type: 'authorization_code',
    redirect_uri: config.Fitbit.callbackURL
  }
  const requestBodyStr = qs.stringify(requestBody)
  logger.debug(`api.get(${requestUrl}) called...'`)
  api.get(requestUrl, requestConfig)
  .then(function (response) {
    logger.debug('Fitbit/get-activities post after api.post...')
    logger.debug('response.data: ', response.data)
    logger.debug('response.status: ', response.status)
    logger.debug('response.statusText: ', response.statusText)
    logger.debug('response.headers: ', response.headers)
    logger.debug('response.config: ', response.config)
    res.render('index', {
      title: 'Health Data App',
      description: 'App to work with Fitbit and DynamoDB',
      username: req.session.username,
      success: req.session.success,
      errors: req.session.errors,
      startdate: req.session.startdate,
      enddate: req.session.enddate,
      sessionid: req.session.id,
      //activitydata: response.data.categories,
      hractivitydate: response.data['activities-heart'][0].dateTime,
      hractivity: response.data['activities-heart'][0].value.heartRateZones,
      hractivityintradaydatasettype: response.data['activities-heart-intraday'].datasetType,
      hractivityintradayinterval: response.data['activities-heart-intraday'].datasetInterval,
      hractivityintraday: response.data['activities-heart-intraday'].dataset,
      tokenstatus: tokenStatus
    });

  })
  .catch(function (error) {
    logger.debug('CATCH(ERROR):', error)
    res.send({
        status: '500',
        //message: customStringify(error)
        message: 'big error!'
    })
  })

})

function apiRequest(resourcePath) {
  logger.debug('apiRequest: starting...');
  return new Promise(function(fulfill, reject) {
    let requestUrl = config.FITBIT_RESOURCE_BASE_URL + 'user/-/' + resourcePath;
    logger.debug('apiRequest: Fetching: ' + requestUrl + '...');
    var options = {
      url: requestUrl,
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    }
    request(options, function(err, res, body) {
      if (!err) {
        if (res.statusCode == 200) {
          if(config.STORE_JSON == true) {
            fs.writeFile('./result_history/' + resourcePath.replace(/\//g, '_').replace(moment().format('YYYY-MM-DD'), 'temporary'), body, function(err) { // write every request to file system as reference for debugging and backup of original fitbit data
              if (err) throw err;
            });
          }
          fulfill(JSON.parse(body));
        }
        else reject({'Statuscode': res.statusCode, 'Options:': options});
      }
      else reject({'Error': err, 'Options:': options});
        });
  });
}


const customStringify = function (v) {
  const cache = new Set();
  return JSON.stringify(v, function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        // Circular reference found, discard key
        return;
      }
      // Store value in our set
      cache.add(value);
    }
    return value;
  });
};

module.exports = router;
