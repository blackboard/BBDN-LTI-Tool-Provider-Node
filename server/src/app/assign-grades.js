import request from 'request';
import { getCachedLTIToken } from './lti-token-service';

const lineItemScope = 'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem';
const lineItemReadonlyScope =
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly';
const resultsScope =
  'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly';
const scoreScope = 'https://purl.imsglobal.org/spec/lti-ags/scope/score';

export default function assignGrades(req, res, agPayload) {
  let json = JSON.parse(req.body.body);
  agPayload.orig_body = json;
  agPayload.claim =
    json['https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'];
  let scopes = agPayload.claim.scope;
  scopes.forEach(function (element) {
    switch (element) {
    case lineItemScope:
      agPayload.scopeLineItem = true;
      break;

    case lineItemReadonlyScope:
      agPayload.scopeLineItemReadonly = true;
      break;

    case 'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly':
      agPayload.scopeResult = true;
      break;

    case 'https://purl.imsglobal.org/spec/lti-ags/scope/score':
      agPayload.scopeScore = true;
      break;
    }
  });
  agPayload.lineItems = agPayload.claim.lineitems;
  agPayload.lineItem = agPayload.claim.lineitem;
};

export const readCols = (req, res, agPayload) => {
  const agPayload_orig = JSON.parse(req.body.body);
  const client_id = agPayload_orig.aud;
  let scope = agPayload.scopeLineItem ? lineItemScope : lineItemReadonlyScope;
  getCachedLTIToken(req.nonce, client_id, scope).then(
    function (token) {
      let options = {
        method: 'GET',
        uri: agPayload.url,
        headers: {
          Authorization: 'Bearer ' + token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          /*console.log(
            'Assignment and Grade Error - request failed: ' + err.message
          );*/
        } else if (response.statusCode !== 200) {
          /*console.log(
            'Assignment and Grade Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );*/
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      //console.log(error);
    }
  );
};

export const addCol = (req, res, agPayload) => {
  const agPayload_orig = JSON.parse(req.body.body);
  const client_id = agPayload_orig.aud;
  getCachedLTIToken(req.nonce, client_id, lineItemScope).then(
    function (token) {
      let label = agPayload.form.label;
      let columnId = agPayload.form.columnId;
      let dueDate = agPayload.form.dueDate;
      //console.log(`Add/update column ID: ${columnId}, label: ${label}, dueDate: ${dueDate}`);

      let newBody = {
        scoreMaximum: agPayload.form.score,
        label: label,
        resourceId: client_id,
        tag: label + ' tag',
        endDateTime: dueDate ? dueDate : null
      };
      let options = {};

      if (columnId) {
        // This is an update
        options = {
          method: 'PUT',
          uri: agPayload.form.url + '/' + columnId,
          headers: {
            'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify(newBody)
        };
      } else {
        // This is a create
        options = {
          method: 'POST',
          uri: agPayload.form.url,
          headers: {
            'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
            Authorization: 'Bearer ' + token
          },
          body: JSON.stringify(newBody)
        };
      }

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          //console.log('AGS Add/Update Column Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200 && response.statusCode !== 201) {
          /*console.log(
            'AGS Add Column Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );*/
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      //console.log(error);
    }
  );
};

export const delCol = (req, res, agPayload) => {
  const agPayload_orig = JSON.parse(agPayload.body.body);
  const client_id = agPayload_orig.aud;
  getCachedLTIToken(req.nonce, client_id, lineItemScope).then(
    function (token) {
      let columnId = agPayload.form.columnId;

      let url = agPayload.form.url;

      if (columnId) {
        url = `${agPayload.form.itemsUrl}/${columnId}`;
      }

      let options = {
        method: 'DELETE',
        uri: url,
        headers: {
          Authorization: 'Bearer ' + token
        }
      };
      request(options, function (err, response, body) {
        if (response.statusCode === 204) {
          //console.log(`Column deleted successfully`);
        } else {
          let json = {};
          if (body) {
            json = JSON.parse(body);
          }

          if (err) {
            /*console.log(
              'AGS Delete Column Error - request failed: ' + err.message
            );*/
          } else if (response.statusCode !== 204) {
            /*console.log(
              'AGS Delete Column Error - Service call failed: ' +
              response.statusCode +
              '\n' +
              options.uri
            );*/
            agPayload.body = json;
          } else {
            agPayload.body = json;
          }
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      //console.log(error);
    }
  );
};

export const results = (req, res, agPayload) => {
  const client_id = req.body.orig_body.aud;
  getCachedLTIToken(req.body.nonce, client_id, resultsScope).then(
    function (token) {
      //console.log(agPayload.form.url)
      let options = {
        method: 'GET',
        uri: agPayload.form.url + '/results',
        headers: {
          Authorization: 'Bearer ' + token
        }
      };
      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          /*console.log(
            'AGS Read Results Error - request failed: ' + err.message
          );*/
        } else if (response.statusCode !== 200) {
          /*console.log(
            'AGS Read Results Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );*/
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      //console.log(error);
    }
  );
};

export const scores = (req, res, agPayload, task) => {
  const agPayload_orig = JSON.parse(agPayload.body.body);
  const client_id = agPayload_orig.aud;
  getCachedLTIToken(req.nonce, client_id, scoreScope).then(
    function (token) {
      let userId = agPayload.form.userid;
      let newScore = agPayload.form.score;
      let columnId = agPayload.form.column;

      let url = agPayload.form.url + '/scores';

      if (columnId) {
        url = agPayload.form.itemsUrl + '/' + columnId + '/scores';
      }

      let score = {};
      switch (task) {
      case 'clear':
        score = {
          userId: userId,
          timestamp: '2017-04-16T18:54:36.736+00:00',
          activityProgress: 'Initialized',
          gradingProgress: 'NotReady'
        };
        break;
      case 'score':
        score = {
          userId: userId,
          scoreGiven: newScore ? newScore : null,
          scoreMaximum: 100.0,
          comment: 'This is exceptional work.',
          timestamp: '2017-04-16T18:54:36.736+00:00',
          activityProgress: 'Completed',
          gradingProgress: 'FullyGraded'
        };
        break;
      case 'submit':
        score = {
          userId: userId,
          timestamp: '2017-04-16T18:54:36.736+00:00',
          activityProgress: 'Submitted',
          gradingProgress: 'Pending'
        };
        break;
      default:
        //console.log('Unknown task sent to scores: ' + task);
        return;
      }

      let options = {
        method: 'POST',
        uri: url,
        headers: {
          'content-type': 'application/vnd.ims.lis.v1.score+json',
          Authorization: 'Bearer ' + token
        },
        body: JSON.stringify(score)
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          //console.log('AGS Send Score Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          /*console.log(
            'AGS Send Score Error - Service call failed: ' +
            response.statusCode +
            '\n' +
            options.uri
          );*/
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      //console.log(error);
    }
  );
};
