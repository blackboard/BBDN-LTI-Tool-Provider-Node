'use strict';

let ltiAdv = require('./lti-adv');
let srequest = require('sync-request');

exports.namesRoles = (req, res, nrPayload, jwtPayload, setup) => {
  nrPayload.orig_body = JSON.parse(req.body.body);
  let namesRoles = nrPayload.orig_body["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"];
  nrPayload.url = namesRoles.context_memberships_url;
  nrPayload.version = namesRoles.service_version;
  nrPayload.return_url = jwtPayload.return_url;

  // Get OAuth2 token
  nrPayload.token = ltiAdv.getOauth2Token(setup);

  // Do a synchroneous call
  let response;
  try {
    response = srequest("GET", nrPayload.url);
//      {headers: {'content-type': 'application/vnd.ims.lti-nprs.v2.membershipcontainer+json'}});
  }
  catch(err) {
    return console.log('Names and Roles Error - request call failed: ' + err);
  }

  if (res.statusCode !== 200) {
    return console.log('Names and Roles Error - membership call failed: ' + response.statusCode + '\n' + url);
  }

  let nrJWT = new jwtPayload();
  ltiAdv.verifyToken(response.body.id_token, nrJWT, setup);

  nrPayload.jwtPayload = nrJWT;
};
