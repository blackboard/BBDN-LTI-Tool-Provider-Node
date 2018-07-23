var _ = require('lodash');
import config from "../config/config";
import path from "path";
import {RegistrationData, ContentItem, JWTPayload, SetupParameters} from "../common/restTypes";
var crypto = require('crypto');
var registration = require('./registration.js');
var redis = require('redis');
var redisClient = redis.createClient({"host": config.redis_host, "port": config.redis_port});
var redisUtil = require('./redisutil');
var lti = require('./lti');
var content_item = require('./content-item');
var eventstore = require('./eventstore');
let lti13 = require('./lti13');
let deepLinking = require('./deep-linking');


const regdata_key = "registrationData";
const contentitem_key = "contentItemData";

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
  let provider = config.provider_domain + (config.provider_port !== "NA" ? ":" + config.provider_port : "");
  let launchData = {};

  let contentItemData = new ContentItem();
  let ciLoaded = false;

  //=======================================================
  let setupLoaded = false;
  let setup = new SetupParameters();
  let setup_key = "setupParameters";

  if (!setupLoaded) {
    redisUtil.redisGet(setup_key).then((setupData) => {
      if (setupData !== null) {
        setup = setupData;
        setupLoaded = true;
      }
    });
  }

  //=======================================================
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
  app.get('/lti/membership', (req, res) => {
    lti.get_membership(req, res);
  });
  app.post('/lti', (req, res) => {
    console.log('--------------------\nlti');
    if (req.body.lti_message_type === 'ContentItemSelectionRequest') {
      content_item.got_launch(req, res, contentItemData).then(() => {
        redisUtil.redisSave(contentitem_key, contentItemData);
        ciLoaded = true;

        let redirectUrl = provider + '/content_item';
        console.log('Redirecting to : ' + redirectUrl);
        res.redirect(redirectUrl);
      });
    }

    if (req.body.lti_message_type === 'basic-lti-launch-request') {
      lti.got_launch(req, res);
    }
  });

  //=======================================================
  // LTI 2 registration stuff
  app.get('/toolproxy', (req, res) => {
    redisUtil.getToolProxy().then((toolProxies) => {
      let toolProxiesJSON = [];

      toolProxies.map((toolProxy) => {
        let toolProxyJSON = JSON.parse(toolProxy);
        toolProxiesJSON.push(toolProxyJSON);
      });

      res.send(toolProxiesJSON);
    });
  });

  app.get('/toolproxy/:tool_proxy_guid', (req, res) => {
    let tool_proxy_guid = req.params.tool_proxy_guid;
    redisUtil.redisGet(tool_proxy_guid).then((toolProxy) => {
      res.send(toolProxy);
    });
  });

  app.get('/launchendpointactivity', (req, res) => {
    if (_.isEmpty(registrationData)) {
      redisUtil.redisGet(regdata_key).then(function (regData) {
        registrationData = regData;
        res.send({
          "requestBody": launchData.requestBody,
          "registrationData": registrationData,
          "toolProxy": launchData.toolProxy
        });
      });
    }
    else {
      res.send({
        "requestBody": launchData.requestBody,
        "registrationData": registrationData,
        "toolProxy": launchData.toolProxy
      });
    }
  });

  app.get('/registrationactivity', (req, res) => {
    // if it's empty then see if we have it in the cache
    if (!dataLoaded) {
      redisUtil.redisGet(regdata_key).then((regData) => {
        registrationData = regData;
        res.send(registrationData);
      });
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
    });
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

  //=======================================================
  // Content Item Message processing
  let passthru_req;
  let passthru_res;
  let passthru = false;

  app.post('/CIMRequest', (req, res) => {
    console.log('--------------------\nCIMRequest');
    if (req.body.custom_option === undefined) {
      // no custom_option set so go to CIM request menu and save req and res to pass through
      // after custom_option has been selected
      passthru_req = req;
      passthru_res = res;
      passthru = true;
      res.redirect("/cim_request");
    }
    else {
      if (!passthru) {
        // custom_option was set in call from TC so use current req and res
        passthru_req = req;
        passthru_res = res;
        passthru = false;
      }
      else {
        // custom_option was set from menu so add option and content (if available) to passthru_req
        passthru_req.body.custom_option = req.body.custom_option;
        passthru_req.body.custom_content = req.body.custom_content;
      }
      content_item.got_launch(passthru_req, passthru_res, contentItemData).then(() => {
        redisUtil.redisSave(contentitem_key, contentItemData);
        ciLoaded = true;

        let redirectUrl = provider + '/content_item';
        console.log('Redirecting to : ' + redirectUrl);
        res.redirect(redirectUrl);
      });
    }
  });

  app.get('/contentitemdata', (req, res) => {
    if (!ciLoaded) {
      redisUtil.redisGet(contentitem_key).then((contentData) => {
        contentItemData = contentData;
        res.send(contentItemData);
      });
    } else {
      res.send(contentItemData);
    }
  });

  //=======================================================
  // LTI 1.3 Message processing
  let jwtPayload = new JWTPayload();

  app.post('/lti13', (req, res) => {
    console.log('--------------------\nlti 1.3');
    lti13.toolLaunch(req, res, jwtPayload);
    res.redirect('/jwt_payload');
  });

  app.get('/jwtPayloadData', (req, res) => {
    res.send(jwtPayload);
  });

  //=======================================================
  // Deep Linking
  let dlPayload = new JWTPayload();

  app.post('/deepLink', (req, res) => {
    console.log('--------------------\ndeepLink');
    deepLinking.deepLink(req, res, dlPayload, setup);
    res.redirect('/deep_link');
  });

  app.get('/DLPayloadData', (req, res) => {
    res.send(dlPayload);
  });

  app.post('/deepLinkOptions', (req, res) => {
    console.log('--------------------\ndeepLinkOptions');
    lti13.verifyToken(req.body.id_token, dlPayload);
    res.redirect('/deep_link_options');
  });

  app.post('/deepLinkContent', (req, res) => {
    console.log('--------------------\ndeepLinkContent');
    deepLinking.deepLinkContent(req, res, dlPayload, setup);
    res.redirect('/deep_link');
  });

  //=======================================================
  // Setup processing

  app.get('/setup', (req, res) => {
    console.log('--------------------\nsetup');
    res.redirect('/setup_page');
  });

  app.get('/getSetup', (req, res) => {
    res.send(setup);
  });

  app.post('/saveSetup', (req, res) => {
    setup.privateKey = req.body.privateKey;
    setup.tokenEndPoint = req.body.tokenEndPoint;
    setup.issuer = req.body.issuer;
    setup.applicationId = req.body.applicationId;
    setup.devPortalHost = req.body.devPortalHost;
    redisUtil.redisSave(setup_key, setup);
    config.dev_portal = setup.devPortalHost;
    res.redirect('/setup_page');
  });

  //=======================================================
  // Catch all
  app.get('*', (req, res) => {
    console.log('catchall - (' + req.url + ')');
    res.sendFile(path.resolve('./public', 'index.html'));
  });
};
