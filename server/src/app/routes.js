var _ = require('lodash');
import config from "../config/config";
import path from "path";
import {AGPayload, ContentItem, JWTPayload, NRPayload, RegistrationData, SetupParameters} from "../common/restTypes";

var crypto = require('crypto');
var registration = require('./registration.js');
var redis = require('redis');
var redisClient = redis.createClient({"host": config.redis_host, "port": config.redis_port});
var redisUtil = require('./redisutil');
var lti = require('./lti');
var content_item = require('./content-item');
var eventstore = require('./eventstore');
let ltiAdv = require('./lti-adv');
let deepLinking = require('./deep-linking');
let namesRoles = require('./names-roles');
let assignGrades = require('./assign-grades');

const regdata_key = "registrationData";
const contentitem_key = "contentItemData";

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
    } else {
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
    } else {
      if (!passthru) {
        // custom_option was set in call from TC so use current req and res
        passthru_req = req;
        passthru_res = res;
        passthru = false;
      } else {
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
  // LTI Advantage Message processing
  let jwtPayload;

  app.post('/lti13', (req, res) => {
    console.log('--------------------\nltiAdvantage');
    jwtPayload = new JWTPayload();
    ltiAdv.verifyToken(req.body.id_token, jwtPayload, setup);
    res.redirect('/lti_adv_view');
  });

  app.post('/ltiAdv', (req, res) => {
    console.log('--------------------\nltiAdvantage');
    jwtPayload = new JWTPayload();
    ltiAdv.verifyToken(req.body.id_token, jwtPayload, setup);
    res.redirect('/lti_adv_view');
  });

  app.get('/jwtPayloadData', (req, res) => {
    res.send(jwtPayload);
  });

  app.get('/login', (req, res) => {
    console.log('--------------------\nlogin');
    ltiAdv.security1(req, res, jwtPayload, setup);
  });

  //=======================================================
  // Deep Linking
  let dlPayload;

  app.post('/deepLink', (req, res) => {
    console.log('--------------------\ndeepLink');
    dlPayload = new JWTPayload();
    ltiAdv.verifyToken(req.body.id_token, dlPayload, setup);
    deepLinking.deepLink(req, res, dlPayload, setup);
    res.redirect('/deep_link');
  });

  app.get('/dlPayloadData', (req, res) => {
    res.send(dlPayload);
  });

  app.post('/deepLinkOptions', (req, res) => {
    console.log('--------------------\ndeepLinkOptions');
    dlPayload = new JWTPayload();
    ltiAdv.verifyToken(req.body.id_token, dlPayload, setup);
    res.redirect('/deep_link_options');
  });

  app.post('/deepLinkContent', (req, res) => {
    console.log('--------------------\ndeepLinkContent');
    deepLinking.deepLinkContent(req, res, dlPayload, setup);
    res.redirect('/deep_link');
  });

  //=======================================================
  // Names and Roles
  let nrPayload;

  app.post('/namesAndRoles', (req, res) => {
    console.log('--------------------\nnamesAndRoles');
    nrPayload = new NRPayload();
    namesRoles.namesRoles(req, res, nrPayload, setup);
  });

  app.post('/namesAndRoles2', (req, res) => {
    nrPayload.url = req.body.url;
    namesRoles.namesRoles(req, res, nrPayload, setup);
  });

  app.get('/nrPayloadData', (req, res) => {
    res.send(nrPayload);
  });

  //=======================================================
  // Assignments and Grades
  let agPayload;

  app.post('/assignAndGrades', (req, res) => {
    console.log('--------------------\nassignAndGrades');
    agPayload = new AGPayload();
    assignGrades.assignGrades(req, res, agPayload, setup);
    res.redirect('/assign_grades_view');
  });

  app.post('/agsReadCols', (req, res) => {
    console.log('--------------------\nagsReadCols');
    agPayload.url = req.body.url;
    assignGrades.readCols(req, res, agPayload, setup);
  });

  app.post('/agsAddcol', (req, res) => {
    console.log('--------------------\nagsAddCol');
    agPayload.form = req.body;
    assignGrades.addCol(req, res, agPayload, setup);
  });

  app.post('/agsDeleteCol', (req, res) => {
    console.log('--------------------\nagsDeleteCol');
    agPayload.form = req.body;
    assignGrades.delCol(req, res, agPayload, setup);
  });

  app.post('/agsResults', (req, res) => {
    console.log('--------------------\nagsResults');
    agPayload.form = req.body;
    assignGrades.results(req, res, agPayload, setup);
  });

  app.post('/agsScores', (req, res) => {
    console.log('--------------------\nagsResults');
    agPayload.form = req.body;
    assignGrades.scores(req, res, agPayload, setup);
  });

  app.get('/agPayloadData', (req, res) => {
    res.send(agPayload);
  });

  //=======================================================
  // Grab a token and display it

  app.get('/tokenGrab', (req, res) => {
    console.log('--------------------\ntokenGrab');
    ltiAdv.tokenGrab(req, res, jwtPayload, setup);
  });

  //=======================================================
  // Setup processing

  app.get('/setup', (req, res) => {
    console.log('--------------------\nsetup');
    res.redirect('/setup_page');
  });

  app.get('/setupData', (req, res) => {
    res.send(setup);
  });

  app.post('/saveSetup', (req, res) => {
    setup.privateKey = req.body.privateKey;
    setup.tokenEndPoint = req.body.tokenEndPoint;
    setup.issuer = req.body.issuer;
    setup.applicationId = req.body.applicationId;
    setup.devPortalHost = req.body.devPortalHost;
    redisUtil.redisSave(setup_key, setup);
    res.redirect('/setup_page');
  });

  //=======================================================
  // Catch all
  app.get('*', (req, res) => {
    console.log('catchall - (' + req.url + ')');
    res.sendFile(path.resolve('./public', 'index.html'));
  });
};
