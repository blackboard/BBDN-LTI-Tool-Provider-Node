import request from 'request';
import { getCachedLTIToken } from './lti-token-service';

export const namesRoles = (req, res, nrPayload) => {
  const rlid = nrPayload.form.rlid;
  const role = nrPayload.form.role;
  const limit = nrPayload.form.limit;

  if (nrPayload.url === '') {
    nrPayload.orig_body = JSON.parse(req.body.body);
    let namesRoles =
      nrPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'
      ];
    let url = namesRoles.context_memberships_url + '?groups=true';
    if (rlid) {
      url += `&rlid=${encodeURIComponent(rlid)}`;
    }

    if (role) {
      url += `&role=${encodeURIComponent(role)}`;
    }

    if (limit) {
      url += `&limit=${encodeURIComponent(limit)}`
    }
    nrPayload.url = url;
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
          nrPayload.next_url = '';       //difference_url and next_url need to be set empty, otherwise they will retain the prior values.
          nrPayload.difference_url = ''; 
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
