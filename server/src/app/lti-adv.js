import * as uuid from 'uuid';
import axios from 'axios';
import * as config from '../../config/config.json';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import request from 'request';
import { JWTPayload } from '../common/restTypes';
import { jwk2pem } from 'pem-jwk';
import { getAppById, insertNewAuthToken, insertNewState } from '../database/db-utility';

export const applicationInfo = (client_id) => {
  const info = getAppById(client_id);
  return {
    appName: info.setup.name,
    appId: info.id,
    devPortalUrl: info.setup.devPortalUrl,
    jwtUrl: info.setup.jwtUrl,
    oidcUrl: info.setup.oidcUrl,
    issuer: info.setup.issuer,
    private_key: jwk2pem(config.privateKey)
  };
};

// Pass in JWT and jwtPayload will be populated with results
export const verifyToken = async (id_token) => {
  console.log('4-Verify the JWT');
  let parts = id_token.split('.');

  // Parse and store payload data from launch
  let jwtPayload = new JWTPayload();
  jwtPayload.header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
  jwtPayload.body = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  jwtPayload.verified = false;

  // Verify launch is from correct party
  // aud could be an array or a single entry
  let clientId;
  if (jwtPayload.body.aud instanceof Array) {
    clientId = jwtPayload.body.aud[0];
  } else {
    clientId = jwtPayload.body.aud;
  }

  /* if (clientId === undefined) {
    clientId = setup.applicationId;
  } */

  let url =
    applicationInfo(clientId).devPortalUrl +
    '/api/v1/management/applications/' +
    clientId +
    '/jwks.json';

  try {
    const response = await axios.get(url);
    const key = response.data.keys.find(k => k.kid === jwtPayload.header.kid);
    jwt.verify(id_token, jwk2pem(key));
    jwtPayload.verified = true;
    console.log('5-JWT verified ' + jwtPayload.verified);
  } catch (err) {
    console.log('5-Verify Error - verify failed: ' + err);
    jwtPayload.verified = false;
  }

  if (
    jwtPayload.body[
      'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
      ] !== undefined
  ) {
    jwtPayload.return_url =
      jwtPayload.body[
        'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
        ].return_url;
    jwtPayload.error_url = jwtPayload.return_url;
  }

  if (
    jwtPayload.body[
      'https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice'
      ] !== undefined
  ) {
    jwtPayload.names_roles = true;
  }

  if (
    jwtPayload.body[
      'https://purl.imsglobal.org/spec/lti-ags/claim/endpoint'
      ] !== undefined
  ) {
    jwtPayload.grading = true;
  }

  if (
    jwtPayload.body[
      'https://purl.imsglobal.org/spec/lti-gs/claim/groupsservice'
      ] !== undefined
  ) {
    jwtPayload.groups = true;
  }

  if (
    jwtPayload.body[
      'https://purl.imsglobal.org/spec/lti/claim/target_link_uri'
      ] !== undefined
  ) {
    jwtPayload.target_link_uri = jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/target_link_uri'];
  }

  return jwtPayload;
};

export const getOauth2Token = (scope, client_id) => {
  console.log('14-Get an oauth2 token')
  const appInfo = applicationInfo(client_id);
  const jwt = oauth2JWT(appInfo.appId, appInfo.jwtUrl);
  return new Promise(function (resolve, reject) {
    let options = {
      method: 'POST',
      uri: appInfo.jwtUrl,
      headers: {
        content_type: 'application/x-www-form-urlencoded'
      },
      form: {
        grant_type: 'client_credentials',
        client_assertion_type:
          'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: jwt,
        scope: scope
      }
    };

    request(options, function (err, response, body) {
      if (err) {
        //console.log('Get Token Error - request failed: ' + err.message);
        reject(body);
      } else if (response.statusCode !== 200) {
        /*console.log(
          'Get Token Error - Service call failed:  ' +
          response.statusCode +
          '\n' +
          response.statusMessage +
          '\n' +
          options.uri
        );*/
        reject(body);
      } else {
        resolve(body);
      }
    });
  });
};

export const oidcLogin = (req, res) => {
  console.log('1-OIDC login')
  const appInfo = applicationInfo(req.query.client_id)
  let state = uuid.v4();
  let nonce = uuid.v4();

  // This tool only supports one redirect_uri...the routing is handled by looking at target_link_uri claim or custom params
  const redirectUri = `${config.frontend_url}lti13`;
  console.log(`2-Inserting new state: ${state}\n2a-Inserting new client_id: ${appInfo.appId}`)
  insertNewState(state, 'state');
  insertNewAuthToken(state, appInfo.appId, 'client_id').catch(e => console.log(e));

  let url =
    appInfo.oidcUrl +
    '?response_type=id_token' +
    '&scope=openid' +
    '&login_hint=' +
    req.query.login_hint +
    '&lti_message_hint=' +
    req.query.lti_message_hint +
    '&state=' +
    state +
    '&redirect_uri=' +
    encodeURIComponent(redirectUri) +
    '&client_id=' +
    appInfo.appId +
    '&nonce=' +
    nonce;

  // Per the OIDC best practices, save the state in a cookie, and check it on the way back in
  res.cookie('state', state, { sameSite: 'none', secure: true, httpOnly: true });

  console.log('3-LTI JWT login init; redirecting to devportal\'s OIDC auth endpoint');
  res.redirect(url);
};

export const oauth2JWT = (clientId, tokenUrl) => {
  let now = Math.trunc(new Date().getTime() / 1000);
  let json = {
    iss: 'lti-tool',
    sub: clientId,
    aud: [tokenUrl, 'foo'],
    iat: now,
    exp: now + 5 * 60,
    jti: crypto.randomBytes(16).toString('hex')
  };

  return signJwt(json);
};

export const signJwt = (json) => {
  try {
    let privateKey = jwk2pem(config.privateKey);
    const signedJwt = jwt.sign(json, privateKey, { algorithm: 'RS256', keyid: '12345' });
    // console.log(`signedJwt ${signedJwt}`);
    return signedJwt;
  } catch (exception) {
    console.log(`Something bad happened in signing ${exception}`);
  }
};

