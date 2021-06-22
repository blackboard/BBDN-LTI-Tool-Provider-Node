import * as uuid from 'uuid';
import HMAC_SHA from './hmac-sha1';
import _ from 'lodash';
import * as ims_caliper from 'ims-caliper';
import config from '../config/config';
import finish from 'finish';
import https from 'https';
import lti from 'ims-lti';
import moment from 'moment';
import url from 'url';
import utils from './utils';

let rejectUnauthorized = true;

//LTI Variables

let lis_result_sourcedid = '';
let lis_outcome_service_url = '';
let return_url = 'https://community.blackboard.com/community/developers';
let membership_url = '';
let placement_parm = '';
let sha_method = '';

//Caliper Variables
let caliper_profile_url = '';
let custom_caliper_federated_session_id = '';
let caliper_host = '';
let caliper_path = '';
let caliper_id = '';
let eventStoreUrl = '';
let apiKey = '';

//REST
let app_key = `${config.appKey}`;
let app_secret = `${config.appSecret}`;
let access_token = '';
let token_type = '';
let expires_in = '';
let user_id = '';
let course_id = '';

let oauth_consumer_key = '';
let oauth_nonce = '';

let caliper_profile_url_parts = '';

/*
 * POST LTI Launch Received
 */

export const got_launch = (req, res) => {
  req.body = _.omit(req.body, '__proto__');

  let content = '';

  let keys = Object.keys(req.body).sort();
  for (let i = 0, length = keys.length; i < length; i++) {
    content += keys[i] + ' = ' + req.body[keys[i]] + '<br />';
  }

  lis_result_sourcedid = req.body.lis_result_sourcedid;
  lis_outcome_service_url = req.body.lis_outcome_service_url;
  caliper_profile_url = req.body.custom_caliper_profile_url;
  custom_caliper_federated_session_id =
    req.body.custom_caliper_federated_session_id;
  oauth_consumer_key = req.body.oauth_consumer_key;
  oauth_nonce = req.body.oauth_nonce;
  course_id = req.body.context_id;
  user_id = req.body.user_id;
  return_url = req.body.launch_presentation_return_url;
  sha_method = req.body.oauth_signature_method;
  //console.log('Signature Method: ' + sha_method);

  if (req.body.custom_context_memberships_url !== undefined) {
    membership_url = req.body.custom_context_memberships_url;
    placement_parm = membership_url.substring(membership_url.indexOf('=') + 1);
  } else {
    membership_url = '';
    placement_parm = '';
  }

  if (return_url === undefined && caliper_profile_url !== undefined) {
    let parts = url.parse(caliper_profile_url, true);
    return_url = parts.protocol + '//' + parts.host;
  } else if (return_url === undefined) {
    return_url = 'http://google.com';
  }

  res.render('lti', {
    title: 'LTI Launch Received!',
    content: content,
    return_url: return_url,
    return_onclick: 'location.href=' + '\'' + return_url + '\';'
  });
}

export const caliper = (req, res) => {
  let options = {
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    url: caliper_profile_url,
    signer: new HMAC_SHA.HMAC_SHA1(),
    oauth_version: '1.0',
    oauth_signature_method: 'HMAC-SHA1'
  };

  let parts = caliper_profile_url_parts = url.parse(options.url, true);
  let caliper_profile_url_oauth = parts.protocol + '//' + parts.host + parts.pathname;

  let req_options = {
    hostname: caliper_profile_url_parts.hostname,
    path: caliper_profile_url_parts.path,
    method: 'GET',
    rejectUnauthorized: rejectUnauthorized,
    headers: _build_headers(options, parts)
  };

  // console.log(req_options);

  let http_req = https.request(req_options, function (http_res) {
    http_res.setEncoding('utf-8');
    let responseString = '';
    http_res.on('data', function (data) {
      responseString += data;
    });
    http_res.on('end', function () {
      // console.log(responseString);
      let json = JSON.parse(responseString);
      caliper_id = json['id'];
      eventStoreUrl = json['eventStoreUrl'];
      apiKey = json['apiKey'];

      //console.log('ID: ' + caliper_id + ' eventStoreUrl: ' + eventStoreUrl + ' apiKey: ' + apiKey);

      res.render('lti', {
        title: 'Caliper Response Received!',
        content: '<pre>' + JSON.stringify(json, null, '  ') + '</pre>',
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\''
      });
    });
  });

  http_req.body = _.omit(http_req.body, '__proto__');
  http_req.write('');
  http_req.end();
};

export const caliper_send = (req, res) =>  {

  const sensor = ims_caliper.Sensor;
  const client = ims_caliper.Client;

  finish(function (async) {
    const BASE_IRI = 'https://example.edu';
    const BASE_SECTION_IRI = 'https://example.edu/terms/201601/courses/7/sections/1';

    // Initialize the caliper client and sensor


    // Id with canned value
    uuid = user_id;


    // Any asynchronous calls within this function will be captured
    // Just wrap each asynchronous call with function 'async'.
    // Each asynchronous call should invoke 'done' as its callback.
    // 'done' tasks two arguments: error and result.
    async('sensor', function (done) {
      // Initialize sensor with options

      sensor.initialize(caliper_id);

      client.initialize(caliper_id, {
        hostname: caliper_profile_url_parts.hostname,
        path: caliper_profile_url_parts.path,
        uri: eventStoreUrl,
        method: 'POST',
        json: true,
        port: caliper_profile_url_parts.port,
        rejectUnauthorized: rejectUnauthorized,
        headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' }
      });

      sensor.registerClient(client);

      done(null, sensor);
    });

    async('actor', function (done) {
      // The Actor for the caliper Event
      var actor = entityFactory().create(ims_caliper.Person, { id: BASE_IRI.concat('/users/554433') });

      done(null, actor);
    });

    async('action', function (done) {
      // The Action for the caliper Event
      var action = caliper.Actions.navigatedTo.term;

      done(null, action);
    });

    async('target', function (done) {
      var target = entityFactory().create(ims_caliper.WebPage, {
        id: BASE_SECTION_IRI.concat('/pages/2'),
        name: 'Learning Analytics Specifications',
        description: 'Overview of Learning Analytics Specifications with particular emphasis on IMS Caliper.',
        dateCreated: moment.utc('2016-08-01T09:00:00.000Z')
      });

      done(null, target);
    });

    async('navigatedFrom', function (done) {
      // Specific to the Navigation Event - the location where the user navigated from
      var navigatedFrom = entityFactory().create(ims_caliper.WebPage, { id: BASE_SECTION_IRI.concat('/pages/1') });

      done(null, navigatedFrom);
    });

    async('edApp', function (done) {
      var edApp = entityFactory().create(ims_caliper.SoftwareApplication, {
        id: BASE_SECTION_IRI,
        type: 'SoftwareApplication',
        version: '1.0'
      });

      done(null, edApp);
    });

    async('group', function (done) {
      var group = entityFactory().create(ims_caliper.CourseSection, {
        id: BASE_SECTION_IRI,
        courseNumber: 'CPS 435-01',
        academicSession: 'Fall 2016'
      });

      done(null, group);
    });

    async('membership', function (done) {
      var membership = entityFactory().create(ims_caliper.Membership, {
        id: BASE_SECTION_IRI.concat('/rosters/1'),
        member: BASE_IRI.concat('/users/554433'),
        organization: BASE_SECTION_IRI,
        roles: [caliper.Role.learner.term],
        status: caliper.Status.active.term,
        dateCreated: moment.utc('2016-08-01T06:00:00.000Z')
      });

      done(null, membership);
    });

  }, function (err, results) {

    var event = eventFactory().create(ims_caliper.NavigationEvent, {
      id: user_id,
      actor: results['actor'],
      action: results['action'],
      object: results['target'],
      eventTime: new Date().toISOString(),
      referrer: results['navigatedFrom'],
      edApp: results['edApp'],
      group: results['group'],
      membership: results['membership'],
      session: custom_caliper_federated_session_id
    });

    //console.log('created navigation event %O', event);

    //console.log('results %O', results);

    var envelope = sensor.createEnvelope({ data: event });

    sensor.sendToClients(envelope);
    // This callback is invoked after all asynchronous calls finish
    // or as soon as an error occurs
    // results is an array that contains result of each asynchronous call
    //console.log('Sensor: %O Actor: %O Action: %O Object: %O Target: %O NavigatedFrom: %O EdApp: %O Group: %O Membership: %O', results['sensor'], results['actor'], results['action'], results['eventObj'], results['target'], results['navigatedFrom'], results['edApp'], results['group'], results['membership']);
    //console.log('eventObj from target: %O', results['target'].isPartOf);

    var content = JSON.stringify(event, null, '\t');

    //console.log('JSON: ' + content);

    res.render('lti', { title: 'Caliper event successfully sent!', content: content, return_url: return_url });
  });
};

export const outcomes = (req, res) =>  {
  res.render('outcomes', {
    title: 'Enter Grade',
    sourcedid: lis_result_sourcedid,
    endpoint: lis_outcome_service_url,
    key: consumer_key,
    secret: consumer_secret
  });
};

export const send_outcomes = (req, res) =>  {
  let options = {};

  options.consumer_key = req.body.key;
  options.consumer_secret = req.body.secret;
  options.service_url = req.body.url;
  options.source_did = req.body.sourcedid;

  let grade = parseFloat(req.body.grade);

  let outcomes_service = new lti.OutcomeService(options);

  outcomes_service.send_replace_result(grade, function (err, result) {
    //console.log(`Replace result ${result}`); //True or false

    if (result) {
      res.render('lti', {
        title: 'Outcome successfully sent!',
        content: result,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    } else {
      res.render('lti', {
        title: 'Outcome Failed!',
        content: err,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    }
  });
};

export const get_outcomes = (req, res) =>  {
  let options = {};

  options.consumer_key = req.body.key;
  options.consumer_secret = req.body.secret;
  options.service_url = req.body.url;
  options.source_did = req.body.sourcedid;

  let outcomes_service = new lti.OutcomeService(options);

  outcomes_service.send_read_result(function (err, result) {
    //console.log(`Outcomes read result ${result}`);

    if (result || result === 0) {
      res.render('lti', {
        title: 'Outcome successfully read!',
        content: `Score: ${result}`,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    } else {
      res.render('lti', {
        title: 'Outcome read failed!',
        content: err,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    }
  });
};

export const rest_auth = (req, res) =>  {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);
  let oauth_host = parts.protocol + '//' + parts.host;

  let auth_hash = new Buffer(app_key + ':' + app_secret).toString('base64');

  let auth_string = 'Basic ' + auth_hash;

  /*console.log(
    'oauth_host: ' +
    oauth_host +
    ' auth_hash: ' +
    auth_hash +
    ' auth_string: ' +
    auth_string
  );*/

  let options = {
    hostname: parts.hostname,
    path: '/learn/api/public/v1/oauth2/token',
    method: 'POST',
    headers: {
      Authorization: auth_string,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  // console.log(options);

  let http_req = https.request(options, function (http_res) {
    http_res.setEncoding('utf-8');
    let responseString = '';
    http_res.on('data', function (data) {
      responseString += data;
    });
    http_res.on('end', function () {
      //console.log(responseString);
      let json = JSON.parse(responseString);
      access_token = json.access_token;
      token_type = json.token_type;
      expires_in = json.expires_in;

      /*console.log(
        'Access Token: ' +
        access_token +
        ' Token Type: ' +
        token_type +
        ' Expires In: ' +
        expires_in
      );*/

      res.render('lti', {
        title: 'REST Token Response Received!',
        content: `<pre>${JSON.stringify(json, null, '  ')}</pre>`,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    });
  });

  let grant = 'grant_type=client_credentials';

  http_req.write(grant);
  //console.log(http_req);
  http_req.end();
};

export const rest_getuser = (req, res) =>  {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);

  let auth_string = 'Bearer ' + access_token;

  let user_path = '/learn/api/public/v1/users/uuid:' + user_id;

  let options = {
    hostname: parts.hostname,
    path: user_path,
    method: 'GET',
    headers: { Authorization: auth_string }
  };

  //console.log(options);

  let http_req = https.request(options, function (http_res) {
    http_res.setEncoding('utf-8');
    let responseString = '';
    http_res.on('data', function (data) {
      responseString += data;
    });
    http_res.on('end', function () {
      //console.log(responseString);
      let json = JSON.parse(responseString);

      //console.log('User Info: ' + JSON.stringify(json, null, '  '));

      res.render('lti', {
        title: 'REST User Info Received!',
        content: `<pre>${JSON.stringify(json, null, '  ')}</pre>`,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    });
  });

  http_req.write('');
  //console.log(http_req);
  http_req.end();
};

export const rest_getcourse = (req, res) =>  {
  //build url from caliper profile url
  let parts = url.parse(caliper_profile_url, true);

  let auth_string = 'Bearer ' + access_token;

  let course_path = '/learn/api/public/v1/courses/uuid:' + course_id;

  let options = {
    hostname: parts.hostname,
    path: course_path,
    method: 'GET',
    headers: { Authorization: auth_string }
  };

  console.log(options);

  let http_req = https.request(options, function (http_res) {
    http_res.setEncoding('utf-8');
    let responseString = '';
    http_res.on('data', function (data) {
      responseString += data;
    });
    http_res.on('end', function () {
      console.log(responseString);
      let json = JSON.parse(responseString);

      console.log('Course Info: ' + JSON.stringify(json, null, '  '));

      res.render('lti', {
        title: 'REST Course Info Received!',
        content: `<pre>${JSON.stringify(json, null, '  ')}</pre>`,
        return_url: return_url,
        return_onclick: 'location.href=' + '\'' + return_url + '\';'
      });
    });
  });

  http_req.write('');
  console.log(http_req);
  http_req.end();
};

export const get_membership = (req, res) =>  {
  if (membership_url !== '') {
    let parts = url.parse(membership_url, true);

    let options = {
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      url: parts.protocol + '//' + parts.host + parts.pathname, // Rebuild url without parameters
      oauth_version: '1.0',
      oauth_signature_method: sha_method
    };

    if (sha_method === 'HMAC-SHA256') {
      options.signer = new HMAC_SHA.HMAC_SHA2();
    } else {
      options.signer = new HMAC_SHA.HMAC_SHA1();
    }

    let req_options = {
      hostname: parts.hostname,
      path: parts.path,
      method: 'GET',
      headers: _build_headers(options, parts)
    };

    console.log(req_options);

    let http_req = https.request(req_options, function (http_res) {
      http_res.setEncoding('utf-8');
      let responseString = '';

      http_res.on('data', function (data) {
        responseString += data;
      });

      http_res.on('end', function () {
        let json = JSON.parse(responseString);

        res.render('lti', {
          title: 'Membership Info Received',
          content: `<pre>${JSON.stringify(json, null, '  ')}</pre>`,
          return_url: return_url,
          return_onclick: 'location.href=' + '\'' + return_url + '\';'
        });
      });
    });

    http_req.write('');
    http_req.end();
  } else {
    res.render('lti', {
      title: 'Membership service not supported',
      content: '<h2>Membership service not supported</h2>',
      return_url: return_url,
      return_onclick: 'location.href=' + '\'' + return_url + '\';'
    });
  }
};

let _build_headers = function (options, parts) {
  let headers, key, val;

  headers = {
    oauth_version: options.oauth_version,
    oauth_nonce: uuid.v4(),
    oauth_timestamp: Math.round(Date.now() / 1000),
    oauth_consumer_key: options.consumer_key,
    oauth_signature_method: options.oauth_signature_method
  };

  headers.oauth_signature = options.signer.build_signature_raw(
    options.url,
    parts,
    'GET',
    headers,
    options.consumer_secret
  );
  //  console.log(options.oauth_signature_method + " signature: " + headers.oauth_signature);

  return {
    Authorization:
      'OAuth realm="",' +
      ( function () {
        let results;
        results = [];
        for (key in headers) {
          if (headers.hasOwnProperty(key)) {
            val = headers[key];
            results.push(key + '="' + utils.special_encode(val) + '"');
          }
        }
        return results;
      } )().join(','),
    'Content-Type': 'application/xml',
    'Content-Length': 0
  };
};
