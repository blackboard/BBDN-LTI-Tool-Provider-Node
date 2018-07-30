'use strict';

let request = require('request');
let jwt = require('jsonwebtoken');
let jwk = require('jwk-to-pem');

exports.toolLaunch = function (req, res, jwtPayload) {
  let id_token = req.body.id_token;

  this.verifyToken(id_token, jwtPayload);
};

// Pass in JWT and jwtPayload will be populated with results
exports.verifyToken = function (id_token, jwtPayload, setup) {
  let parts = id_token.split( "." );

  // Parse and store payload data from launch
  jwtPayload.header = JSON.parse( Buffer.from(parts[0], 'base64').toString() );
  jwtPayload.body = JSON.parse( Buffer.from(parts[1], 'base64').toString() );
  jwtPayload.return_url = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  jwtPayload.error_url = jwtPayload.return_url;
  jwtPayload.verified = false;

  // Verify launch is from correct party
  // aud could be an array or a single entry
  let clientId;
  if ( jwtPayload.body.aud instanceof Array )
  {
    clientId = jwtPayload.body.aud[0];
  }
  else
  {
    clientId = jwtPayload.body.aud;
  }
  let url = setup.devPortalHost + '/api/v1/management/applications/' + clientId + '/jwks.json';

  request(url, {json : true}, (err, res, body) => {
    if (err) {
      return console.log('Verify Error - request call failed: ' + err);
    }

    if (res.statusCode !== 200)
    {
      return console.log('Verify Error - jwks.json call failed: ' + res.statusCode + '\n' + url);
    }

    try {
      jwt.verify(id_token, jwk(body.keys[0]));
      jwtPayload.verified = true;
      console.log("JWT verified " + jwtPayload.verified);
    } catch(err) {
      console.log('Verify Error - verify failed: ' + err);
      jwtPayload.verified = false;
    }
  });
};
