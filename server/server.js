var fs = require('fs');
var https = require('https');
var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config/config.js');
var app = express();

var options = {
  key: fs.readFileSync('star.int.bbpd.io.key'),
  cert: fs.readFileSync('star.int.bbpd.io.crt')
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // don't validate ssl cert for posts to ssl sites

// sections refer to https://www.imsglobal.org/specs/ltiv2p0/implementation-guide

app.use(express.static('./public')); 		// set the static files location
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// routes ======================================================================
require('./app/routes.js')(app);

// listen (start app with node server.js) ======================================

if (config.use_ssl) {
  https.createServer(options, app).listen(config.provider_port, function () {
    console.log("LTI 1 Tool Provider:  " + config.provider_domain + ":" + config.provider_port + "/lti");
    console.log("LTI 2 Registration URL:  " + config.provider_domain + ":" + config.provider_port + "/registration");
  });
} else {
  app.listen(config.provider_port);
  console.log("LTI 1 Tool Provider:  " + config.provider_domain + ":" + config.provider_port + "/lti");
  console.log("LTI 2 Registration URL:  " + config.provider_domain + ":" + config.provider_port + "/registration");
}



