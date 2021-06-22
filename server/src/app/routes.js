import * as config from '../../config/config.json';
import assignGrades, { addCol, delCol, readCols, results, scores } from './assign-grades';
import axios from 'axios';
import cookieParser from 'cookie-parser';
import eventstore from './eventstore';
import fs from 'fs';
import path from 'path';
import {
  caliper,
  caliper_send,
  get_membership,
  get_outcomes,
  outcomes,
  rest_auth,
  rest_getcourse,
  rest_getuser,
  send_outcomes
} from './lti';
import {
  deleteAppById,
  getAllApplications,
  getAppById, getAuthFromState,
  getCIMFromKey, getSecretFromKey,
  insertNewApp, insertNewAuthToken,
  insertNewCIM
} from '../database/db-utility';
import { getCachedToken, getLearnRestToken } from './rest-service';
import { getGroups, groups, groupSets } from './groups';
import { getLTIToken } from './lti-token-service';
import { got_launch } from './content-item';
import { got_launch as lti_got_launch } from './lti';
import { namesRoles } from './names-roles';
import { oidcLogin, verifyToken } from './lti-adv';
import { AGPayload, ContentItem, GroupsPayload, NRPayload } from '../common/restTypes';
import { buildProctoringEndReturnPayload, buildProctoringStartReturnPayload } from './proctoring';
import { deepLinkContent } from './deep-linking';

const contentitem_key = 'contentItemData';

const ltiScopes = 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/score';

module.exports = function (app) {
  app.use(cookieParser());

  const frontendUrl = config.frontend_url;

  let contentItemData = new ContentItem();
  let ciLoaded = false;

  //=======================================================

  //=======================================================
  // LTI 1.1 provider and caliper stuff
  app.post('/caliper/send', (req, res) => {
    caliper_send(req, res);
  });
  app.post('/caliper/register', (req, res) => {
    caliper(req, res);
  });
  app.post('/caliper', (req, res) => {
    eventstore.got_caliper(req, res);
  });
  app.get('/caliper', (req, res) => {
    eventstore.show_events(req, res);
  });
  app.post('/rest/auth', (req, res) => {
    rest_auth(req, res);
  });
  app.post('/rest/user', (req, res) => {
    rest_getuser(req, res);
  });
  app.post('/rest/course', (req, res) => {
    rest_getcourse(req, res);
  });
  app.post('/lti/outcomes', (req, res) => {
    outcomes(req, res);
  });
  app.post('/lti/send_outcomes', (req, res) => {
    send_outcomes(req, res);
  });
  app.post('/lti/get_outcomes', (req, res) => {
    get_outcomes(req, res);
  });
  app.get('/lti/membership', (req, res) => {
    get_membership(req, res);
  });
  app.post('/lti', (req, res) => {
    console.log('--------------------\nlti');
    if (req.body.lti_message_type === 'ContentItemSelectionRequest') {
      console.log(req.body);
      got_launch(req, res, contentItemData).then(() => {
        insertNewCIM(contentitem_key, contentItemData);
        ciLoaded = true;

        const redirectUrl = `${frontendUrl}content_item`;
        //console.log('Redirecting to : ' + redirectUrl);
        res.redirect(redirectUrl);
      });
    }

    if (req.body.lti_message_type === 'basic-lti-launch-request') {
      lti_got_launch(req, res);
    }
  });

  //=======================================================
  // Content Item Message processing
  let passthru_req;
  let passthru_res;
  let passthru = false;

  app.post('/CIMRequest', (req, res) => {
    console.log('--------------------\nCIMRequest');
    if (req.body.oauth_consumer_key === getSecretFromKey(req.body.oauth_consumer_key)) {
      if (req.body.custom_option === undefined) {
        // no custom_option set so go to CIM request menu and save req and res to pass through
        // after custom_option has been selected
        passthru_req = req;
        passthru_res = res;
        passthru = true;
        res.redirect('/cim_request');
      } else {
        if (!passthru) {
          // custom_option was set in call from TC so use current req and res
          passthru_req = req;
          passthru_res = res;
          passthru = false;
        } else {
          // custom_option was set from menu so add option and content (if available) to passthru_req
          passthru_req.body.custom_option = req.body.custom_option;
          passthru_req.body.custom_content = req.body.custom_content;
        }
        got_launch(passthru_req, passthru_res, contentItemData)
          .then(() => {
            insertNewCIM(contentitem_key, contentItemData);
            ciLoaded = true;

            const redirectUrl = `${frontendUrl}content_item`;
            //console.log('Redirecting to : ' + redirectUrl);
            res.redirect(redirectUrl);
          });
      }
    } else {
      console.log('application not registered with this tool')
    }

  });

  app.get('/contentitemdata', (req, res) => {
    if (!ciLoaded) {
      getCIMFromKey(contentitem_key).then(contentData => {
        contentItemData = contentData;
        res.send(contentItemData);
      });
    } else {
      res.send(contentItemData);
    }
  });

  //=======================================================
  // LTI Advantage Message processing
  let users = {
    name: 'Fyodor',
    age: '77'
  };

  // The OIDC login entry point
  app.get('/login', (req, res) => {
    console.log('--------------------\nlogin');
    // Set some cookies for giggles
    res.cookie('userData-legacy', users);
    res.cookie('userData', users, { sameSite: 'none', secure: true });
    oidcLogin(req, res);
  });

  // This is our single redirect_uri entry point; we can use customer parameters or target_link_uri to determine how
  // to route from here
  app.post('/lti13', async (req, res) => {
    console.log('--------------------\nlti13');
    // Per the OIDC best practices, ensure the state parameter passed in here matches the one in our cookie
    const state = req.cookies['state'];
    if (state !== req.body.state) {
      console.log(`The state field is missing or doesn't match. Maybe cookies are blocked?`);
    }

    // Parse, verify and save the id_token JWT
    const jwtPayload = await verifyToken(req.body.id_token);
    await insertNewAuthToken(state, jwtPayload, 'jwt');
    //await insertNewAuthToken(state, appInfo.appId, 'client_id');
    const app = getAppById(jwtPayload.body.aud);
    // Now we have the JWT but next we need to get an OAuth2 bearer token for REST calls.
    // Before we can do that we need to get an authorization code for the current user.
    // Save off the JWT to our database so we can get it back after we get the auth code.
    const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const redirectUri = `${config.frontend_url}tlocode&scope=*&response_type=code&client_id=${app.setup.appKey}&state=${req.body.state}`;
    const authcodeUrl = `${lmsServer}learn/api/public/v1/oauth2/authorizationcode?redirect_uri=${redirectUri}`;

    console.log(`6-Redirect to Learn to get 3LO code`);
    res.redirect(authcodeUrl);
  });

  // The 3LO redirect route
  app.get('/tlocode', async (req, res) => {
    console.log(`7-Learn sent back: code: ${JSON.stringify(req.query)}`);
    await insertNewAuthToken(req.query.state, req.query.code, 'auth_code');

    const state = req.cookies['state'];
    if (state !== req.query.state) {
      console.log(`The state field is missing or doesn't match.`);
    }
    console.log('8-using state ' + state);
    const auth = await getAuthFromState(state);

    const jwtPayload = auth.jwt;
    //console.log("jwt payload is " + JSON.stringify(jwtPayload));
    const app = getAppById(jwtPayload.body.aud);
    // If we have a 3LO auth code, let's get us a bearer token here.
    const redirectUri = `${config.frontend_url}tlocode`;
    const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const learnUrl = lmsServer + `learn/api/public/v1/oauth2/token?code=${req.query.code}&redirect_uri=${redirectUri}`;

    const restToken = await getLearnRestToken(learnUrl, state, app);
    console.log(`12-Learn REST token ${JSON.stringify(restToken)}`);

    // Now get the LTI OAuth 2 bearer token (shame they aren't the same)
    await getLTIToken(app.id, app.setup.jwtUrl, ltiScopes, state);

    // Now finally redirect to the UI
    if (jwtPayload.target_link_uri.endsWith('deepLinkOptions')) {
      res.redirect(`/deep_link_options?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('CIMRequest')) {
      res.redirect(`/deep_link_options?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('lti13bobcat')) {
      res.redirect(`/lti_bobcat_view?nonce=${state}`);
    } else if ( jwtPayload.target_link_uri.endsWith('proctoring')) {
      const messageType = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/message_type"];
      if (messageType === "LtiStartProctoring") {
        res.redirect(`/proctoring_start_options_view?nonce=${state}`);
      } else if (messageType === "LtiEndAssessment") {
        res.redirect(`/proctoring_end_options_view?nonce=${state}`);
      } else {
        res.send(`Unrecognized proctoring message type: ${messageType}`);
      }
    } else if (jwtPayload.target_link_uri.endsWith('lti')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('lti13')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if (jwtPayload.target_link_uri.endsWith('msteams')) {
      res.redirect(`/ms_teams_view?nonce=${state}`);
    } else {
      res.send(`Sorry Dave, I can't use that target_link_uri ${jwtPayload.target_link_uri}`);
    }
  });

  app.get('/jwtPayloadData', async (req, res) => {
      try {
        const jwtPayload = await getAuthFromState(req.query.nonce).jwt;
        console.log('Nonce matches the state we have so send the jwt')
        res.send(jwtPayload);
      } catch (e) {
        return e
      }
  });

  app.get('/courseData', async (req, res) => {
    const nonce = req.query.nonce;
    const restToken = await getCachedToken(nonce);
    console.log(`courseData nonce: ${nonce}, restToken: ${restToken}`);
    const jwt = await getAuthFromState(nonce).auth.jwt;
    const lmsServer = jwt.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const courseUUID = jwt.body['https://purl.imsglobal.org/spec/lti/claim/context']['id'];
    const xhrConfig = {
      headers: { Authorization: `Bearer ${restToken}` }
    };

    try {
      const courseResponse = await axios.get(`${lmsServer}/learn/api/public/v2/courses/uuid:${courseUUID}`, xhrConfig);
      console.log(`Got course; Ultra status is ${courseResponse.data.ultraStatus}, and PK1 is: ${courseResponse.data.id}`);
      res.send(courseResponse.data);
    } catch (exception) {
      console.log(`Error getting courseData for ${courseUUID}: ${JSON.stringify(exception)}, from: ${lmsServer}`);
    }
  });

  //=======================================================
  // Deep Linking
  app.get('/dlPayloadData', async (req, res) => {
    const nonce = req.query.nonce;
    const dljwt = await getAuthFromState(nonce);
    res.send(dljwt);
  });

  app.post('/deepLinkContent', async (req, res) => {
    console.log('--------------------\ndeepLinkContent');
    const nonce = req.query.nonce;
    const jwtPayload = await getAuthFromState(nonce).jwt;
    let dljwt = deepLinkContent(req, res, jwtPayload);
    await insertNewAuthToken(nonce, `${dljwt}`, 'dljwt');
    res.redirect(`/deep_link?nonce=${nonce}`);
  });

  //=======================================================
  // Proctoring Service

  app.get('/getProctoringPayloadData', async (req, res) => {
    const nonce = req.query.nonce;
    console.log(`--------------------\ngetProctoringPayloadData nonce: ${nonce}`);
    const jwtPayload = await getAuthFromState(nonce).auth['jwt'];
    res.send(jwtPayload);
  });

  app.post('/buildProctoringStartReturnPayload', async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await getAuthFromState(nonce).auth['jwt'];
    buildProctoringStartReturnPayload(req, res, jwtPayload);
    res.redirect('/proctoring_start_actions_view?nonce=${nonce}');
  });

  app.post('/buildProctoringEndReturnPayload', async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await getAuthFromState(nonce).auth['jwt'];
    buildProctoringEndReturnPayload(req, res, jwtPayload);
    res.redirect('/proctoring_end_actions_view?nonce=${nonce}');
  });

  //=======================================================
  // Names and Roles
  let nrPayload;

  app.post('/namesAndRoles', (req, res) => {
    console.log('--------------------\nnamesAndRoles');
    nrPayload = new NRPayload();
    namesRoles(req, res, nrPayload);
  });

  app.post('/namesAndRoles2', (req, res) => {
    nrPayload.url = req.body.url;
    namesRoles(req, res, nrPayload);
  });

  app.get('/nrPayloadData', (req, res) => {
    res.send(nrPayload);
  });

  //=======================================================
  // Groups
  let groupsPayload;

  app.post('/groups', (req, res) => {
    console.log('--------------------\ngroups');
    groupsPayload = new GroupsPayload();
    groups(req, res, groupsPayload);
    res.redirect('/groups_view');
  });

  app.get('/groupsPayloadData', (req, res) => {
    res.send(groupsPayload);
  });

  app.post('/getgroups', (req, res) => {
    console.log('--------------------\ngroups');
    groupsPayload.form = req.body;
    getGroups(req, res, groupsPayload);
  });

  let groupSetsPayload;

  app.post('/groupsets', (req, res) => {
    console.log('--------------------\ngroupsets');
    groupSetsPayload = new GroupsPayload();
    groupSets(req, res, groupSetsPayload);
  });

  app.get('/groupSetsPayloadData', (req, res) => {
    res.send(groupSetsPayload);
  });

  //=======================================================
  // Assignments and Grades
  let agPayload;

  app.post('/assignAndGrades', (req, res) => {
    console.log('--------------------\nassignAndGrades');
    agPayload = new AGPayload();
    assignGrades(req, res, agPayload);
    res.redirect('/assign_grades_view');
  });

  app.post('/agsReadCols', (req, res) => {
    console.log('--------------------\nagsReadCols');
    agPayload.url = req.body.url;
    readCols(req, res, agPayload);
  });

  app.post('/agsAddcol', (req, res) => {
    console.log('--------------------\nagsAddCol');
    agPayload.form = req.body;
    addCol(req, res, agPayload);
  });

  app.post('/agsDeleteCol', (req, res) => {
    console.log('--------------------\nagsDeleteCol');
    agPayload.form = req.body;
    delCol(req, res, agPayload);
  });

  app.post('/agsResults', (req, res) => {
    console.log('--------------------\nagsResults');
    agPayload.form = req.body;
    results(req, res, agPayload);
  });

  app.post('/agsScores', (req, res) => {
    console.log('--------------------\nagsScores');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'score');
  });

  app.post('/agsClearScores', (req, res) => {
    console.log('--------------------\nagsClearScores');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'clear');
  });

  app.post('/agsSubmitAttempt', (req, res) => {
    console.log('--------------------\nagsSubmitAttempt');
    agPayload.form = req.body;
    scores(req, res, agPayload, 'submit');
  });

  app.get('/agPayloadData', (req, res) => {
    res.send(agPayload);
  });

  app.get('/config', (req, res) => {
    res.send(config);
  });

  app.get('/.well-known/jwks.json', (req, res) => {
    res.send(config.publicKeys);
  });

  //=======================================================
  // Setup processing

  app.get('/setup_page', (req, res) => {
    console.log('--------------------\nsetup');
    res.redirect('/setup');
  });

  //=======================================================
  // Application Registration processing

  app.get('/applications/all', (req, res) => {
    res.send(getAllApplications());
  });

  app.post('/saveSetup', (req, res) => {
    const app = {
      'name': req.body.appName,
      'appId': req.body.appId,
      'appSecret': req.body.appSecret,
      'devPortalUrl': req.body.devPortalUrl,
      'appKey': req.body.appKey
    };
    const result = insertNewApp(app);
    res.send(result);
  });

  app.get('/applications/:appId', (req, res) => {
    res.send(getAppById(req.params.appId));
  });

  app.delete('/applications/:appId', (req, res) => {
    res.send(deleteAppById(req.params.appId));
  });

  app.get('/version', (req, res) => {
    console.log('-------------------\nversion');
    const data = fs.readFileSync('version.json', 'utf8');
    res.send(data);
  });

  app.get('/adminConfig', async (req, res) => {
    const dljwt = await getAuthFromState(nonce);
    console.log(`dljwt ${JSON.stringify(dljwt)}`);
    res.send(dljwt);
  });

  //=======================================================
  // Catch all
  app.get('*', (req, res) => {
    console.log('catchall - (' + req.url + ')');
    res.sendFile(path.resolve('./public', 'index.html'));
  });
};
