'use strict';

import config from "../config/config";

let request = require('request');
let jwt = require('jsonwebtoken');
let jwk = require('jwk-to-pem');

exports.got_launch = function (req, res, jwtPayload) {
  let id_token = req.body.id_token;

  let parts = id_token.split( "." );

  // Parse and store payload data from launch
  jwtPayload.header = JSON.parse( Buffer.from(parts[0], 'base64').toString() );
  jwtPayload.body = JSON.parse( Buffer.from(parts[1], 'base64').toString() );
  jwtPayload.return_url = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  jwtPayload.verified = false;

  // Verify launch is from correct party
  let clientId = jwtPayload.body.aud;
  let url = config.dev_portal + '/api/v1/management/applications/' + clientId + '/jwks.json';
  request(url, {json : true}, (err, res, body) => {
    if (err) {
      return console.log('Verify Error - request call failed: ' + err);
    }

    if (res.statusCode !== 200)
    {
      return console.log('Verify Error - jwks.json call failed: ' + res.statusCode + '\n' + url);
    }

    try {
      jwt.verify(id_token, jwk(body));
      jwtPayload.verified = true;
    } catch(err) {
      console.log('Verify Error - verify failed: ' + err);
      jwtPayload.verified = false;
    }
  });
};