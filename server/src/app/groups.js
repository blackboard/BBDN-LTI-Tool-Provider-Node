import * as ltiAdv from './lti-adv';
import request from 'request';

export const groups = (req, res, groupsPayload) => {
  if (groupsPayload.url === '') {
    groupsPayload.orig_body = JSON.parse(req.body.body);
    let groups =
      groupsPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti-gs/claim/groupsservice'
        ];
    groupsPayload.url = groups.context_groups_url;
    groupsPayload.version = groups.service_version;
    groupsPayload.return_url =
      groupsPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
        ].return_url;
  }
};

export const getGroups = (req, res, groupsPayload) => {
  // Get OAuth2 token and make call to Learn
  groupsPayload.orig_body = JSON.parse(req.body.body);
  const client_id = groupsPayload.orig_body.aud;
  let scope =
    'https://purl.imsglobal.org/spec/lti-gs/scope/contextgroup.readonly';
  ltiAdv.getOauth2Token(scope, client_id).then(
    function (token) {
      let body = JSON.parse(token);
      groupsPayload.token = body.access_token;
      let userId = groupsPayload.form.userid;
      let url = groupsPayload.form.url;

      if (userId) {
        url += '?user_id=' + userId;
      }

      let options = {
        method: 'GET',
        uri: url,
        headers: {
          Authorization: 'Bearer ' + groupsPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('Groups Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log(
            'Groups Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );
          groupsPayload.body = json;
          groupsPayload.next_url = '';
        } else {
          groupsPayload.body = json;
          console.log('Groups call returned:');
          // console.log(body);
          if (response.headers.link) {
            let links = response.headers.link.split(',');
            links.forEach(link => {
              if (link.includes('next')) {
                groupsPayload.next_url = getLink(link);
              }
            });
          }
        }
        res.redirect('/groups_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

export const groupSets = (req, res, groupSetsPayload) => {
  if (groupSetsPayload.url === '') {
    groupSetsPayload.orig_body = JSON.parse(req.body.body);
    let groups =
      groupSetsPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti-gs/claim/groupsservice'
        ];
    groupSetsPayload.url = groups.context_group_sets_url;
    groupSetsPayload.version = groups.service_version;
    groupSetsPayload.return_url =
      groupSetsPayload.orig_body[
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
        ].return_url;
  }

  // Get OAuth2 token and make call to Learn
  const client_id = groupSetsPayload.orig_body.aud;
  let scope =
    'https://purl.imsglobal.org/spec/lti-gs/scope/contextgroup.readonly';
  ltiAdv.getOauth2Token(scope, client_id).then(
    function (token) {
      let body = JSON.parse(token);
      groupSetsPayload.token = body.access_token;

      let options = {
        method: 'GET',
        uri: groupSetsPayload.url,
        headers: {
          Authorization: 'Bearer ' + groupSetsPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('Groups Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log(
            'Groups Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );
          groupSetsPayload.body = json;
          groupSetsPayload.next_url = '';
        } else {
          groupSetsPayload.body = json;
          console.log('Group Sets call returned:');
          console.log(body);
          if (response.headers.link) {
            let links = response.headers.link.split(',');
            links.forEach(link => {
              if (link.includes('next')) {
                groupSetsPayload.next_url = getLink(link);
              }
            });
          }
        }
        res.redirect('/group_sets_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

let getLink = function (link) {
  let start = link.indexOf('http');
  let end = link.indexOf(';') - 1;
  return link.substring(start, end);
};
