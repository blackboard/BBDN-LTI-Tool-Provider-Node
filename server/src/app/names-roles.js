'use strict';
import {JWTPayload} from "../common/restTypes";

let ltiAdv = require('./lti-adv');
let https = require('https');
let url = require('url');

exports.namesRoles = (req, res, nrPayload, jwtPayload, setup) => {
  nrPayload.orig_body = JSON.parse(req.body.body);
  let namesRoles = nrPayload.orig_body["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"];
  nrPayload.url = namesRoles.context_memberships_url;
  nrPayload.version = namesRoles.service_version;
  nrPayload.return_url = jwtPayload.return_url;

  // Get OAuth2 token
  let tokenjwt = ltiAdv.getOauth2Token(setup);
  let jwtparts = tokenjwt.split( "." );
  let body = JSON.parse( Buffer.from(jwtparts[1], 'base64').toString() );

  nrPayload.token = body.access_token;

  let headers = {
    'content-type': 'application/vnd.ims.lti-nprs.v2.membershipcontainer+json',
    Authorization: 'Bearer ' + nrPayload.token
  };

  let parts = url.parse(nrPayload.url, true);

  let options = {
    hostname: parts.hostname,
    path: parts.path,
    method: 'GET',
    headers: headers
  };

  console.log(options);

  let request = https.request(options, function(response) {
    response.setEncoding(('UTF-8'));
    let responseString = '';

    response.on('data', function(data) {
      responseString += data;
    });

    response.on('end', function() {
      let json = JSON.parse(responseString);
      nrPayload.jwtPayload = new JWTPayload();
      if (json !== 200) {
        nrPayload.jwtPayload.body = json;
      } else {
        ltiAdv.verifyToken(json.body, nrPayload.jwtPayload, setup);
      }
      res.redirect('/names_roles_view');
    });
  });

  request.write("");
  request.end();
};
