'use strict';

let ltiAdv = require('./lti-adv');
let srequest = require('sync-request');

exports.namesRoles = (req, res, nrPayload, setup) => {
  return;
  let json = JSON.parse(req.body.body);
  let namesRoles = json["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"];
  let url = namesRoles.context_memberships_url;
  let version = namesRoles.service_version;

  // Get OAuth2 token
  let token = ltiAdv.getOauth2Token(setup);

  // Do a synchroneous call
  let response;
  try {
    response = srequest("GET", url);
  }
  catch(err) {
    return console.log('Names and Roles Error - request call failed: ' + err);
  }

  if (res.statusCode !== 200) {
    return console.log('Names and Roles Error - membership call failed: ' + response.statusCode + '\n' + url);
  }

  nrPayload = response.getBody('UTF-8');
};
