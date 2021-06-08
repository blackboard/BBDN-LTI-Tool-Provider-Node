import path from "path";
import fs from "fs";
import axios from "axios";
import cookieParser from "cookie-parser";
import {AGPayload, ContentItem, NRPayload, GroupsPayload, SetupParameters} from "../common/restTypes";
import config from "../config/config";
import assignGrades from "./assign-grades";
import * as content_item from "./content-item";
import eventstore from './eventstore';
import {deepLink, deepLinkContent} from "./deep-linking";
import {buildProctoringStartReturnPayload, buildProctoringEndReturnPayload} from "./proctoring";
import * as lti from "./lti";
import namesRoles from "./names-roles";
import groups from "./groups";
import ltiAdv from "./lti-adv";
import ltiTokenService from './lti-token-service';
import restService from './rest-service';
import redisUtil from "./redisutil";

const contentitem_key = "contentItemData";

const ltiScopes = 'https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/lineitem.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/result.readonly ' +
  'https://purl.imsglobal.org/spec/lti-ags/scope/score';

module.exports = function(app) {
  app.use(cookieParser());

  let contentItemData = new ContentItem();
  let ciLoaded = false;

  //=======================================================
  let setupLoaded = false;
  let setup = new SetupParameters();
  let setup_key = "setupParameters";

  if (!setupLoaded) {
    redisUtil.redisGet(setup_key).then(setupData => {
      if (setupData !== null) {
        setup = setupData;
        setupLoaded = true;
      }
    });
  }

  //=======================================================
  // LTI 1.1 provider and caliper stuff
  app.post('/caliper/send', (req, res) => {
    lti.caliper_send(req, res);
  });
  app.post('/caliper/register', (req, res) => {
    lti.caliper(req, res);
  });
  app.post('/caliper', (req, res) => {
    eventstore.got_caliper(req, res);
  });
  app.get('/caliper', (req, res) => {
    eventstore.show_events(req, res);
  });
  app.post("/rest/auth", (req, res) => {
    lti.rest_auth(req, res);
  });
  app.post("/rest/user", (req, res) => {
    lti.rest_getuser(req, res);
  });
  app.post("/rest/course", (req, res) => {
    lti.rest_getcourse(req, res);
  });
  app.post("/lti/outcomes", (req, res) => {
    lti.outcomes(req, res);
  });
  app.post("/lti/send_outcomes", (req, res) => {
    lti.send_outcomes(req, res);
  });
  app.post("/lti/get_outcomes", (req, res) => {
    lti.get_outcomes(req, res);
  });
  app.get("/lti/membership", (req, res) => {
    lti.get_membership(req, res);
  });
  app.post("/lti", (req, res) => {
    console.log("--------------------\nlti");
    if (req.body.lti_message_type === "ContentItemSelectionRequest") {
      content_item.got_launch(req, res, contentItemData).then(() => {
        redisUtil.redisSave(contentitem_key, contentItemData);
        ciLoaded = true;

        const redirectUrl = `${config.frontend_url}content_item`;
        console.log("Redirecting to : " + redirectUrl);
        res.redirect(redirectUrl);
      });
    }

    if (req.body.lti_message_type === "basic-lti-launch-request") {
      lti.got_launch(req, res);
    }
  });

  //=======================================================
  // Content Item Message processing
  let passthru_req;
  let passthru_res;
  let passthru = false;

  app.post("/CIMRequest", (req, res) => {
    console.log("--------------------\nCIMRequest frontend URL in routes: " + config.frontend_url);

    if (req.body.custom_option === undefined) {
      // no custom_option set so go to CIM request menu and save req and res to pass through
      // after custom_option has been selected
      passthru_req = req;
      passthru_res = res;
      passthru = true;
      res.redirect("/cim_request");
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
      content_item
        .got_launch(passthru_req, passthru_res, contentItemData)
        .then(() => {
          redisUtil.redisSave(contentitem_key, contentItemData);
          ciLoaded = true;

          const redirectUrl = `${config.frontend_url}content_item`;
          console.log("Redirecting to : " + redirectUrl);
          res.redirect(redirectUrl);
        });
    }
  });

  app.get("/contentitemdata", (req, res) => {
    if (!ciLoaded) {
      redisUtil.redisGet(contentitem_key).then(contentData => {
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
    name : "Fyodor",
    age : "77"
  };

  // The OIDC login entry point
  app.get("/login", (req, res) => {
    console.log("--------------------\nlogin");
    // Set some cookies for giggles
    res.cookie("userData-legacy", users);
    res.cookie("userData", users,  { sameSite: 'none', secure: true });
    ltiAdv.oidcLogin(req, res, setup);
  });

  // This is our single redirect_uri entry point; we can use customer parameters or target_link_uri to determine how
  // to route from here
  app.post("/lti13", async (req, res) => {
    console.log("--------------------\nlti13");

    // Per the OIDC best practices, ensure the state parameter passed in here matches the one in our cookie
    const state = req.cookies['state'];
    if (state !== req.body.state) {
      console.log(`The state field is missing or doesn't match. Maybe cookies are blocked?`);
    }

    // Parse, verify and save the id_token JWT
    const jwtPayload = await ltiAdv.verifyToken(req.body.id_token, setup);
    redisUtil.redisSave(state + ':jwt', jwtPayload);

    // Now we have the JWT but next we need to get an OAuth2 bearer token for REST calls.
    // Before we can do that we need to get an authorization code for the current user.
    // Save off the JWT to our database so we can get it back after we get the auth code.
    const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const redirectUri = `${config.frontend_url}tlocode&scope=*&response_type=code&client_id=${config.appKey}&state=${req.body.state}`;
    const authcodeUrl = `${lmsServer}/learn/api/public/v1/oauth2/authorizationcode?redirect_uri=${redirectUri}`;

    console.log(`Redirect to get 3LO code ${authcodeUrl}`);
    res.redirect(authcodeUrl);
  });

  // The 3LO redirect route
  app.get('/tlocode', async (req, res) => {
    console.log(`tlocode called with code: ${req.query.code} and state: ${req.query.state}`);

    const state = req.cookies['state'];
    if (state !== req.query.state) {
      console.log(`The state field is missing or doesn't match.`);
    }

    const jwtPayload = await redisUtil.redisGet(state + ':jwt');
    console.log(`tlocode jwt ${JSON.stringify(jwtPayload)}`);

    // If we have a 3LO auth code, let's get us a bearer token here.
    const redirectUri = `${config.frontend_url}tlocode`;
    const lmsServer = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const learnUrl = lmsServer + `/learn/api/public/v1/oauth2/token?code=${req.query.code}&redirect_uri=${redirectUri}`;

    // Cache the nonce which is our state value
    redisUtil.redisSave(state, 'nonce');

    console.log(`Getting REST token at ${learnUrl}`);
    const restToken = await restService.getLearnRestToken(learnUrl, state);
    console.log(`Learn REST token ${restToken}`);

    // Now get the LTI OAuth 2 bearer token (shame they aren't the same)
    console.log(`Getting LTI token at ${setup.tokenEndPoint}`);
    const ltiToken = await ltiTokenService.getLTIToken(setup.applicationId, setup.tokenEndPoint, ltiScopes, state);
    console.log(`LMS LTI token ${ltiToken}`);

    // Now finally redirect to the UI
    if (jwtPayload.target_link_uri.endsWith('deepLinkOptions')) {
      res.redirect(`/deep_link_options?nonce=${state}`);
    } else if ( jwtPayload.target_link_uri.endsWith('CIMRequest')) {
      res.redirect(`/deep_link_options?nonce=${state}`);
    } else if ( jwtPayload.target_link_uri.endsWith('lti13bobcat')) {
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
    } else if ( jwtPayload.target_link_uri.endsWith('lti')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if ( jwtPayload.target_link_uri.endsWith('lti13')) {
      res.redirect(`/lti_adv_view?nonce=${state}`);
    } else if ( jwtPayload.target_link_uri.endsWith('msteams')) {
      res.redirect(`/ms_teams_view?nonce=${state}`);
    } else {
      res.send(`Sorry Dave, I can't use that target_link_uri ${jwtPayload.target_link_uri}` );
    }
  });

  app.get("/jwtPayloadData", async (req, res) => {
    const nonce = req.query.nonce;
    const jwtPayload = await redisUtil.redisGet(nonce + ':jwt');
    res.send(jwtPayload);
  });

  app.get("/courseData", async (req, res) => {
    const nonce = req.query.nonce;
    const restToken = await restService.getCachedToken(nonce);
    console.log(`courseData nonce: ${nonce}, restToken: ${restToken}`)
    const jwt = await redisUtil.redisGet(nonce + ':jwt');
    const lmsServer = jwt.body['https://purl.imsglobal.org/spec/lti/claim/tool_platform'].url;
    const courseUUID = jwt.body["https://purl.imsglobal.org/spec/lti/claim/context"]["id"];
    const xhrConfig = {
      headers: {Authorization: `Bearer ${restToken}`}
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
  app.get("/dlPayloadData", async (req, res) => {
    const nonce = req.query.nonce;
    console.log(`--------------------\ndlPayloadData Nonce: ${nonce}`)
    const dljwt = await redisUtil.redisGet(nonce + ':dljwt');
    console.log(`dljwt ${JSON.stringify(dljwt)}`);
    res.send(dljwt);
  });

  app.post("/deepLinkContent", async (req, res) => {
    console.log("--------------------\ndeepLinkContent");
    const nonce = req.body.nonce;
    console.log(`Nonce: ${nonce}`)
    const jwtPayload = await redisUtil.redisGet(nonce + ':jwt');
    let dljwt = deepLinkContent(req, res, jwtPayload, setup);
    redisUtil.redisSave(nonce + ':dljwt', dljwt);
    console.log(`dljwt ${JSON.stringify(dljwt)}`);
    res.redirect(`/deep_link?nonce=${nonce}`);
  });

  //=======================================================
  // Proctoring Service

  app.get("/getProctoringPayloadData", async (req, res) => {
    const nonce = req.query.nonce;
    console.log(`--------------------\ngetProctoringPayloadData nonce: ${nonce}`);
    const jwtPayload = await redisUtil.redisGet(nonce + ':jwt');
    console.log(`getProctoringPayloadData jwt: ${JSON.stringify(jwtPayload)}`);
    res.send(jwtPayload);
  });

  app.post("/buildProctoringStartReturnPayload", async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await redisUtil.redisGet(nonce + ':jwt');
    buildProctoringStartReturnPayload(req, res, jwtPayload, setup);
    res.redirect(`/proctoring_start_actions_view?nonce=${nonce}`);
  });

  app.post("/buildProctoringEndReturnPayload", async (req, res) => {
    const nonce = req.body.nonce;
    const jwtPayload = await redisUtil.redisGet(nonce + ':jwt');
    buildProctoringEndReturnPayload(req, res, jwtPayload, setup);
    res.redirect(`/proctoring_end_actions_view?nonce=${nonce}`);
  });

  //=======================================================
  // Names and Roles
  let nrPayload;

  app.post("/namesAndRoles", (req, res) => {
    console.log("--------------------\nnamesAndRoles");
    nrPayload = new NRPayload();
    namesRoles.namesRoles(req, res, nrPayload, setup);
  });

  app.post("/namesAndRoles2", (req, res) => {
    nrPayload.url = req.body.url;
    namesRoles.namesRoles(req, res, nrPayload, setup);
  });

  app.get("/nrPayloadData", (req, res) => {
    res.send(nrPayload);
  });

  //=======================================================
  // Groups
  let groupsPayload;

  app.post("/groups", (req, res) => {
    console.log("--------------------\ngroups");
    groupsPayload = new GroupsPayload();
    groups.groups(req, res, groupsPayload, setup);
    res.redirect("/groups_view");
  });

  app.get("/groupsPayloadData", (req, res) => {
    res.send(groupsPayload);
  });

  app.post("/getgroups", (req, res) => {
    console.log("--------------------\ngroups");
    groupsPayload.form = req.body;
    groups.getGroups(req, res, groupsPayload, setup);
  });

  let groupSetsPayload;

  app.post("/groupsets", (req, res) => {
    console.log("--------------------\ngroupsets");
    groupSetsPayload = new GroupsPayload();
    groups.groupSets(req, res, groupSetsPayload, setup);
  });

  app.get("/groupSetsPayloadData", (req, res) => {
    res.send(groupSetsPayload);
  });

  //=======================================================
  // Assignments and Grades
  let agPayload;

  app.post("/assignAndGrades", (req, res) => {
    console.log("--------------------\nassignAndGrades");
    agPayload = new AGPayload();
    assignGrades.assignGrades(req, res, agPayload);
    res.redirect("/assign_grades_view");
  });

  app.post("/agsReadCols", (req, res) => {
    console.log("--------------------\nagsReadCols");
    agPayload.url = req.body.url;
    assignGrades.readCols(req, res, agPayload, setup);
  });

  app.post("/agsAddcol", (req, res) => {
    console.log("--------------------\nagsAddCol");
    agPayload.form = req.body;
    assignGrades.addCol(req, res, agPayload, setup);
  });

  app.post("/agsDeleteCol", (req, res) => {
    console.log("--------------------\nagsDeleteCol");
    agPayload.form = req.body;
    assignGrades.delCol(req, res, agPayload, setup);
  });

  app.post("/agsResults", (req, res) => {
    console.log("--------------------\nagsResults");
    agPayload.form = req.body;
    assignGrades.results(req, res, agPayload, setup);
  });

  app.post("/agsScores", (req, res) => {
    console.log("--------------------\nagsScores");
    agPayload.form = req.body;
    assignGrades.scores(req, res, agPayload, setup, "score");
  });

  app.post("/agsClearScores", (req, res) => {
    console.log("--------------------\nagsClearScores");
    agPayload.form = req.body;
    assignGrades.scores(req, res, agPayload, setup, "clear");
  });

  app.post("/agsSubmitAttempt", (req, res) => {
    console.log("--------------------\nagsSubmitAttempt");
    agPayload.form = req.body;
    assignGrades.scores(req, res, agPayload, setup, "submit");
  });

  app.get("/agPayloadData", (req, res) => {
    res.send(agPayload);
  });

  app.get("/config", (req, res) => {
    res.send(config);
  });

  app.get("/.well-known/jwks.json", (req, res) => {
    res.send(config.publicKeys);
  });

  //=======================================================
  // Setup processing

  app.get("/setup_page", (req, res) => {
    console.log("--------------------\nsetup");
    res.redirect("/setup");
  });

  app.get("/setupData", (req, res) => {
    setup.cookies = req.cookies;
    setup.host = req.header('Host');
    res.send(setup);
  });

  app.post("/saveSetup", (req, res) => {
    setup.tokenEndPoint = req.body.tokenEndPoint;
    setup.oidcAuthUrl = req.body.oidcAuthUrl;
    setup.issuer = req.body.issuer;
    setup.applicationId = req.body.applicationId;
    setup.devPortalHost = req.body.devPortalHost;
    redisUtil.redisSave(setup_key, setup);
    res.redirect("/setup");
  });

  //=======================================================
  // Test REDIS

  app.get("/testRedis", (req, res) => {
    console.log("--------------------\ntestRedis");

    redisUtil.redisSave("key", "value");
    redisUtil.redisGet("key").then( (value) => { console.log("Redis value for key: " + value); });

    res.send('<html lang=""><body>Redis be okay</body></html>');
  });

  app.get("/version", (req, res) => {
    console.log("-------------------\nversion");
    const data = fs.readFileSync('version.json', 'utf8')
    res.send(data);
  })

  //=======================================================
  // Catch all
  app.get("*", (req, res) => {
    console.log("catchall - (" + req.url + ")");
    res.sendFile(path.resolve("./public", "index.html"));
  });
};
