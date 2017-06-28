var _ = require('lodash');
import config from '../config/config';
var crypto = require('crypto');
var registration = require('./registration.js');
var redis = require('redis');
var redisClient = redis.createClient({"host": config.redis_host, "port": config.redis_port});
var redisUtil = require('./redisutil');
var lti = require('./lti')
var eventstore = require('./eventstore');
import path from 'path';
import {RegistrationData} from '../common/restTypes';


const regdata_key = "registrationData";


function getToolConsumerProfile(url) {

  return new Promise(function (resolve, reject) {

    request({
        url: url,
        timeouts: 10000,
      },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          console.error(error.message);
          reject();
        }

      });
  });
}


module.exports = function (app) {

  let registrationData = new RegistrationData();
  let dataLoaded = false;
  let provider = config.provider_domain + (config.provider_port != "NA" ? ":" + config.provider_port : "");
  var launchData = {};

  // LTI 1 provider and caliper stuff
  app.post('/caliper/send', (req, res) => {
      lti.caliper_send(req, res);
  });
  app.post('/caliper/register', (req, res) => {
      lti.caliper(req, res);
  });
  app.post('/caliper', (req, res) => {
      eventstore.got_caliper(req, res);
  });
  app.get('/caliper', (req, res) => {
      eventstore.show_events(req, res);
  });
  app.post('/rest/auth', (req, res) => {
      lti.rest_auth(req, res);
  });
  app.post('/rest/user', (req, res) => {
      lti.rest_getuser(req, res);
  });
  app.post('/rest/course', (req, res) => {
      lti.rest_getcourse(req, res);
  });
  app.post('/lti/outcomes', (req, res) => {
      lti.outcomes(req, res);
  });
  app.post('/lti/send_outcomes', (req, res) => {
      lti.send_outcomes(req, res);
  });
  app.post('/lti', (req, res) => {
    lti.got_launch(req, res);
  });

  // LTI 2 registration stuff
  app.get('/toolproxy', (req, res) => {
    redisUtil.getToolProxy().then((toolProxies) => {
      let toolProxiesJSON = [];

      toolProxies.map((toolProxy) => {
        let toolProxyJSON = JSON.parse(toolProxy);
        toolProxiesJSON.push(toolProxyJSON);
      });

      res.send(toolProxiesJSON);
    })
  });

  app.get('/toolproxy/:tool_proxy_guid', (req, res) => {
    let tool_proxy_guid = req.params.tool_proxy_guid;
    redisUtil.redisGet(tool_proxy_guid).then((toolProxy) => {
      res.send(toolProxy);
    })
  });

  app.get('/launchendpointactivity', (req, res) => {
    if (_.isEmpty(registrationData)) {
      redisGet(regdata_key).then(function (regData) {
        registrationData = regData;
        res.send({
          "requestBody": launchData.requestBody,
          "registrationData": registrationData,
          "toolProxy":launchData.toolProxy
        });
      })
    }
    else {
      res.send({
        "requestBody": launchData.requestBody,
        "registrationData": registrationData,
        "toolProxy":launchData.toolProxy
      });
    }
  });

  app.get('/registrationactivity', (req, res) => {
    // if it's empty then see if we have it in the cache
    if (!dataLoaded) {
      redisUtil.redisGet(regdata_key).then((regData) => {
        registrationData = regData;
        res.send(registrationData);
      })
    } else {
      res.send(registrationData);
    }
  });

  app.post('/ltilaunchendpoint', (req, res) => {
    launchData.requestBody = req.body;
    let redirectUrl = provider + '/ltilaunchendpoint';
    redisUtil.redisGet(req.body.oauth_consumer_key).then((toolProxy) => {
      launchData.toolProxy = toolProxy;
      res.redirect(redirectUrl);
    })
  });

  app.post('/registration', (req, res) => {
    registration.handleRegistrationPost(req, res, registrationData).then(() => {
      redisUtil.redisSave(regdata_key, registrationData);
      dataLoaded = true;
      let redirectUrl = provider + '/tp_registration';

      console.log('Redirecting to : ' + redirectUrl);
      res.redirect(redirectUrl);
    });
  });

  app.get('*', (req, res) => {
    res.sendFile(path.resolve('./public', 'index.html'));
  });
};
