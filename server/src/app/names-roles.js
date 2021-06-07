import request from 'request';
import { getCachedLTIToken } from './lti-token-service';

export const namesRoles = (req, res, nrPayload) => {
  if (nrPayload.url === '') {
    nrPayload.orig_body = JSON.parse(req.body.body);
    let namesRoles =
      nrPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'
        ];
    nrPayload.url = namesRoles.context_memberships_url + '?groups=true';
    nrPayload.version = namesRoles.service_version;
    nrPayload.return_url =
      nrPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
        ].return_url;
  }

  // Get OAuth2 token and make call to Learn
  getCachedLTIToken(req.body.nonce).then(
    function (token) {
      let options = {
        method: 'GET',
        uri: nrPayload.url,
        headers: {
          Authorization: 'Bearer ' + token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('Names and Roles Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log(
            'Names and Roles Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );
          nrPayload.body = json;
          nrPayload.difference_url = '';
          nrPayload.next_url = '';
        } else {
          nrPayload.body = json;
          let links = response.headers.link.split(',');
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

const getLink = (link) => {
  let start = link.indexOf('http');
  let end = link.indexOf(';') - 1;
  return link.substring(start, end);
};
