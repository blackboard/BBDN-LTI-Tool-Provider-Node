'use strict';

let ltiAdv = require('./lti-adv');
let request = require('request');

exports.namesRoles = (req, res, nrPayload, setup) => {
  if (nrPayload.url === "") {
    nrPayload.orig_body = JSON.parse(req.body.body);
    let namesRoles = nrPayload.orig_body["https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"];
    nrPayload.url = namesRoles.context_memberships_url;
    nrPayload.version = namesRoles.service_version;
    nrPayload.return_url = nrPayload.orig_body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  }

  // Get OAuth2 token and make call to Learn
  let scope = "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly";
  ltiAdv.getOauth2Token(setup, scope).then(
    function (token) {
      let body = JSON.parse(token);
      nrPayload.token = body.access_token;

      let options = {
        method: 'GET',
        uri: nrPayload.url,
        headers: {
          'content-type': 'application/vnd.ims.lti-nprs.v2.membershipcontainer+json',
          Authorization: 'Bearer ' + nrPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('Names and Roles Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('Names and Roles Error - Service call failed: ' + response.statusCode + '\n' + options.uri);
          nrPayload.body = json;
          nrPayload.difference_url = "";
          nrPayload.next_url = "";
        } else {
          nrPayload.body = json;
          let links = response.headers.link.split(",");
          links.forEach(link => {
            if (link.includes('difference')) {
              nrPayload.difference_url = getLink(link);
            }
            if (link.includes('next')) {
              nrPayload.next_url = getLink(link);
            }
          });
        }
        res.redirect('/names_roles_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

let getLink = function(link) {
  let start = link.indexOf("http");
  let end = link.indexOf(";") - 1;
  return link.substring(start, end);
};
