'use strict';

let ltiAdv = require('./lti-adv');
let request = require('request');

const lineItemScope = "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem";
const lineItemReadonlyScope = "https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly";
const resultsScope = "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly";
const scoreScope = "https://purl.imsglobal.org/spec/lti-ags/scope/score";

exports.assignGrades = (req, res, agPayload, setup) => {
  let json = JSON.parse(req.body.body);
  agPayload.orig_body = json;
  agPayload.claim = json["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];
  let scopes = agPayload.claim.scope;
  scopes.forEach(function (element) {
    switch (element) {
      case lineItemScope:
        agPayload.scopeLineItem = true;
        break;

      case lineItemReadonlyScope:
        agPayload.scopeLineItemReadonly = true;
        break;

      case "https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly":
        agPayload.scopeResult = true;
        break;

      case "https://purl.imsglobal.org/spec/lti-ags/scope/score":
        agPayload.scopeScore = true;
        break;
    }
  });
  agPayload.lineItems = agPayload.claim.lineitems;
  agPayload.lineItem = agPayload.claim.lineitem;
};

exports.readCols = (req, res, agPayload, setup) => {
  let scope = (agPayload.scopeLineItem) ? lineItemScope : lineItemReadonlyScope;
  ltiAdv.getOauth2Token(setup, scope).then(
    function (token) {
      let body = JSON.parse(token);
      agPayload.token = body.access_token;

      let options = {
        method: 'GET',
        uri: agPayload.url,
        headers: {
          Authorization: 'Bearer ' + agPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('Assignment and Grade Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('Assignment and Grade Error - Service call falied: ' + response.statusCode + '\n' + options.uri);
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

exports.addCol = (req, res, agPayload, setup) => {
  ltiAdv.getOauth2Token(setup, lineItemScope).then(
    function (token) {
      let body = JSON.parse(token);
      agPayload.token = body.access_token;

      let add = {
        scoreMaximum: agPayload.form.score,
        label: agPayload.form.tagval + ' grade',
        resourceId: setup.applicationId,
        tag: 'grade'
      };

      let options = {
        method: 'POST',
        uri: agPayload.form.url,
        headers: {
          'content-type': 'application/vnd.ims.lis.v2.lineitem+json',
          Authorization: 'Bearer ' + agPayload.token
        },
        body: JSON.stringify(add)
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('AGS Add Column Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('AGS Add Column Error - Service call failed: ' + response.statusCode + '\n' + options.uri);
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

exports.delCol = (req, res, agPayload, setup) => {
  ltiAdv.getOauth2Token(setup, lineItemScope).then(
    function (token) {
      let body = JSON.parse(token);
      agPayload.token = body.access_token;

      let options = {
        method: 'DELETE',
        uri: agPayload.form.url,
        headers: {
          Authorization: 'Bearer ' + agPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('AGS Delete Column Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('AGS Delete Column Error - Service call failed: ' + response.statusCode + '\n' + options.uri);
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

exports.results = (req, res, agPayload, setup) => {
  ltiAdv.getOauth2Token(setup, resultsScope).then(
    function (token) {
      let body = JSON.parse(token);
      agPayload.token = body.access_token;

      let options = {
        method: 'GET',
        uri: agPayload.form.url + '/results',
        headers: {
          Authorization: 'Bearer ' + agPayload.token
        }
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('AGS Read Results Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('AGS Read Results Error - Service call failed: ' + response.statusCode + '\n' + options.uri);
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};

exports.scores = (req, res, agPayload, setup) => {
  ltiAdv.getOauth2Token(setup, scoreScope).then(
    function (token) {
      let body = JSON.parse(token);
      agPayload.token = body.access_token;
      let userId = agPayload.form.userid;

      let score = {
        userId: userId,
        scoreGiven: 95.0,
        scoreMaximum: 100.0,
        comment: 'This is exceptional work.',
        timestamp: '2017-04-16T18:54:36.736+00:00',
        activityProgress: 'Completed',
        gradingProgress: 'FullyGraded'
      };

      let options = {
        method: 'POST',
        uri: agPayload.form.url + '/scores',
        headers: {
          'content-type': 'application/vnd.ims.lis.v1.score+json',
          Authorization: 'Bearer ' + agPayload.token
        },
        body: JSON.stringify(score)
      };

      request(options, function (err, response, body) {
        let json = JSON.parse(body);

        if (err) {
          console.log('AGS Send Score Error - request failed: ' + err.message);
        } else if (response.statusCode !== 200) {
          console.log('AGS Send Score Error - Service call failed: ' + response.statusCode + '\n' + options.uri);
          agPayload.body = json;
        } else {
          agPayload.body = json;
        }
        res.redirect('/assign_grades_view');
      });
    },
    function (error) {
      console.log(error);
    }
  );
};
