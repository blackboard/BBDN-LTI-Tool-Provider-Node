'use strict';

let srequest = require('sync-request');
let jwt = require('jsonwebtoken');
let jwk = require('jwk-to-pem');
let crypto = require('crypto');

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
  jwtPayload.verified = false;

  if (jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"] !== undefined) {
    jwtPayload.return_url = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
    jwtPayload.error_url = jwtPayload.return_url;
  }
  if (jwtPayload.body["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"] !== undefined) {
    jwtPayload.namesRoles = true;
  }
  if (jwtPayload.body["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"] !== undefined) {
    jwtPayload.grading = true;
  }

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

  if ( clientId === undefined ) {
    clientId = setup.applicationId;
  }

  let url = setup.devPortalHost + '/api/v1/management/applications/' + clientId + '/jwks.json';

  // Do a synchoneous call to dev portal
  let res;
  try {
    res = srequest('GET', url);
  }
  catch(err) {
    return console.log('Verify Error - request call failed: ' + err);
  }

  if (res.statusCode !== 200) {
    return console.log('Verify Error - jwks.json call failed: ' + res.statusCode + '\n' + url);
  }

  try {
    jwt.verify(id_token, jwk(JSON.parse(res.getBody('UTF-8')).keys[0]));
    jwtPayload.verified = true;
    console.log("JWT verified " + jwtPayload.verified);
  } catch(err) {
    console.log('Verify Error - verify failed: ' + err);
    jwtPayload.verified = false;
  }
};

exports.getOauth2Token = function (setup) {
  let url = setup.tokenEndPoint;

  let headers = {
    'content-type':  'application/x-www-form-urlencoded'
  };

  let body =
    "grant_type=client_credentials" +
    "&client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer" +
    "&client_assertion=" + oauth2JWT(setup) +
    "&scope=test";

  // Do a synchroneous call to dev portal
  let response;
  try {
    response = srequest('POST', url, {headers, body});
  } catch(err) {
    return console.log('Get Token Error - request call failed: %s', err);
  }

  if (response.statusCode !== 200) {
    let errorMsg;
    try {
      errorMsg = response.getBody("UTF-8");
    } catch(err) {
      errorMsg = err.body;
    }
    return console.log('Get Token Error - jwttoken call failed: %s\n%s\n%s', response.statusCode, errorMsg, url);
  }

  return response.getBody('UTF-8');
};

exports.tokenGrab = function (req, res, jwtPayload, setup) {
  let token;

  token = this.getOauth2Token(setup);
  try {
    this.verifyToken(token, jwtPayload, setup);
  } catch (err) {
    return console.log('Get Token Error - verify failed\n%s', err);
  }

  let view =
    "<h2>JWT</h2>" +
    "<p>" + token + "<\p>" +
    "<h2>Bearer Token</h2>" +
    "<pre>" + JSON.stringify(jwtPayload.body, null, 2) + "</pre>";


  return view;
};

let oauth2JWT = function(setup) {
  let now = Math.trunc(new Date().getTime() / 1000);
  let json = {
    iss: 'lti-tool',
    sub: setup.applicationId,
    aud: setup.tokenEndPoint,
    iat: now,
    exp: now + (5 * 60),
    jti: crypto.randomBytes(16).toString('hex')
  };

  return jwt.sign(json, setup.privateKey, {algorithm: 'RS256'});
};
