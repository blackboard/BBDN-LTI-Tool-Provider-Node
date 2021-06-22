import bodyParser from 'body-parser';
import config from './config/config.js';
import express from 'express';
import fs from 'fs';
import request from 'request';
import routes from './app/routes.js';

const app = express();
const httpProxy = express();

const options = config.use_ssl
  ? {
    key: fs.readFileSync(config.ssl_key),
    cert: fs.readFileSync(config.ssl_crt)
  }
  : { key: null, cert: null };

let listenPort =
  process.env.PORT ||
  ( config.provider_port !== 'NA' ? config.provider_port : 5000 );

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // don't validate ssl cert for posts to ssl sites

// sections refer to https://www.imsglobal.org/specs/ltiv2p0/implementation-guide

app.use(express.static('./public')); // set the static files location
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.set('views', __dirname + '/../views');
app.set('view engine', 'pug');

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

httpProxy.use(function (err, req, res) {
  //console.log(err.stack);
  res.status(500).send('Something broke!');
});

//httpProxy.use(bodyParser.json());       // to support JSON-encoded bodies
httpProxy.use(bodyParser.json({ type: '*/*' }));
httpProxy.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, key, secret, Accept, Authorization'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  next();
});

httpProxy.all('/*', function (req, res) {
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
      //console.log('body:' + req.body);
      request({
        url: learnUrl,
        method: req.method,
        oauth: {
          consumer_key: req.header('key'),
          consumer_secret: req.header('secret'),
          token: '',
          token_secret: ''
        },
        headers: headers,
        json: req.body
      }).pipe(res);
    } else {
      res.send();
    }
  } catch (err) {
    //console.log(err.toString());
  }
});

// routes ======================================================================
routes(app);

// listen (start app with node server.js) ======================================

app.listen(listenPort);
const frontendUrl = config.frontend_url;

console.log('Home page:                    ' + frontendUrl);
console.log('Registered Applications List: ' + frontendUrl + 'applications');
console.log('LTI 1 Tool Provider:          ' + frontendUrl + 'lti');
console.log('LTI 1 Content Item:           ' + frontendUrl + 'CIMRequest');
console.log('LTI 1.3 Login URL:            ' + frontendUrl + 'login');
console.log('LTI 1.3 Redirect URL:         ' + frontendUrl + 'lti13');
console.log('LTI 1.3 Direct Target URL:    ' + frontendUrl + 'lti13');
console.log('LTI 1.3 Deep Linking  URL:    ' + frontendUrl + 'deepLinkOptions');
console.log('LTI 1.3 Bobcat Target URL:    ' + frontendUrl + 'lti13bobcat');
console.log('LTI 1.3 Proctoring URL:       ' + frontendUrl + 'proctoring');
console.log('JWKS URL:                     ' + frontendUrl + '.well-known/jwks.json');
console.log('Setup URL:                    ' + frontendUrl + 'setup');
console.log('Listening on ' + listenPort);
