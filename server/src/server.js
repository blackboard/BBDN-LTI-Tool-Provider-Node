import express from "express";
import bodyParser from "body-parser";
import fs from "fs";
import https from "https";
import config from "./config/config.js";
import routes from "./app/routes.js";
import request from "request";
import {SetupParameters} from "./common/restTypes";
var app = express();
var httpProxy = express();
let redisUtil = require('./app/redisutil');


var options = (config.use_ssl) ? {
  key: fs.readFileSync('star.int.bbpd.io.key'),
  cert: fs.readFileSync('star.int.bbpd.io.crt')
} : {key: null, cert: null};

let provider = config.provider_domain + (config.provider_port !== "NA" ? ":" + config.provider_port : "");
let listenPort = (config.provider_port !== "NA" ? config.provider_port : 3000);

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // don't validate ssl cert for posts to ssl sites

// sections refer to https://www.imsglobal.org/specs/ltiv2p0/implementation-guide

app.use(express.static('./public')); 		// set the static files location
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.set('views', __dirname + '/../views');
app.set('view engine', 'pug');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

httpProxy.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//httpProxy.use(bodyParser.json());       // to support JSON-encoded bodies
httpProxy.use(bodyParser.json({type: '*/*'}));
httpProxy.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, key, secret, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  next();
});

httpProxy.all('/*', function (req, res, next) {
  //modify the url in any way you want
  let learnUrl = 'https://isthisthingon.hopto.org' + req.url;

  let headers = {};
  if (req.header('content-type')) {
    headers['Content-Type'] = req.header('content-type');

  }
  if (req.header('accept')) {
    headers.accept = req.header('accept');
  }

  try {
    if (req.method !== 'OPTIONS') {
      console.log('body:' + req.body);
      request({
        url: learnUrl,
        method: req.method,
        oauth: {
          consumer_key: req.header('key'),
          consumer_secret: req.header('secret'),
          token: "",
          token_secret: ""
        },
        headers: headers,
        json: req.body
      }).pipe(res);
    } else {
      res.send();
    }
  } catch (err) {
    console.error(err.toString());
  }
});

// setup parameters ============================================================
let setup_key = 'setupParameters';
redisUtil.redisGet(setup_key).then((setupData) => {
  console.log('--------------------');
  if (setupData === null) {
    let setup = new SetupParameters();
    setup.issuer = 'https://blackboard.com';
    setup.tokenEndPoint = 'Need Oauth2 token endpoint';
    setup.privateKey = 'Need private key';
    setup.applicationId = 'Need application id';
    setup.devPortalHost = "Need dev portal url";
    redisUtil.redisSave(setup_key, setup);
    console.log('Initialize setup parameters');
  } else {
    console.log('Setup parameters');
    console.log(setupData.issuer);
    console.log(setupData.tokenEndPoint);
    console.log(setupData.applicationId);
    console.log(setupData.devPortalHost);
  }
  console.log('--------------------');
});


// routes ======================================================================
routes(app);

// listen (start app with node server.js) ======================================

httpProxy.listen(8543);

if (config.use_ssl) {
  https.createServer(options, app).listen(listenPort, function () {
    console.log("Configuring for SSL use");
    console.log("LTI 1 Tool Provider:  " + provider + "/lti");
    console.log("LTI 1 Content Item: " + provider + "/CIMRequest");
    console.log("LTI 1.3 Launch: " + provider + "/lti13");
    console.log("LTI Deep Linking: " + provider + "/deepLinkOptions");
    console.log("LTI 2 Registration URL:  " + provider + "/registration");
  });
} else {
  app.listen(listenPort);
  console.log("LTI 1 Tool Provider:  " + provider + "/lti");
  console.log("LTI 1 Content Item: " + provider + "/CIMRequest");
  console.log("LTI 1.3 Launch: " + provider + "/lti13");
  console.log("LTI Deep Linking: " + provider + "/deepLinkOptions");
  console.log("LTI 2 Registration URL:  " + provider + "/registration");
}
