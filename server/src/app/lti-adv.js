"use strict";

import config from "../config/config";

let axios = require('axios');
let jwt = require("jsonwebtoken");
let crypto = require("crypto");
let request = require("request");
let uuid = require("uuid");
let jwk2pem = require('pem-jwk').jwk2pem
import {JWTPayload} from "../common/restTypes";

// Pass in JWT and jwtPayload will be populated with results
exports.verifyToken = async function(id_token, setup) {
  let parts = id_token.split(".");

  // Parse and store payload data from launch
  let jwtPayload = new JWTPayload();
  jwtPayload.header = JSON.parse(Buffer.from(parts[0], "base64").toString());
  jwtPayload.body = JSON.parse(Buffer.from(parts[1], "base64").toString());
  jwtPayload.verified = false;

  if (
    jwtPayload.body[
      "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
    ] !== undefined
  ) {
    jwtPayload.return_url =
      jwtPayload.body[
        "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
      ].return_url;
    jwtPayload.error_url = jwtPayload.return_url;
  }

  if (
    jwtPayload.body[
      "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"
    ] !== undefined
  ) {
    jwtPayload.names_roles = true;
  }

  if (
    jwtPayload.body[
      "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"
    ] !== undefined
  ) {
    jwtPayload.grading = true;
  }

  if (
      jwtPayload.body[
          "https://purl.imsglobal.org/spec/lti-gs/claim/groupsservice"
          ] !== undefined
  ) {
    jwtPayload.groups = true;
  }

  if (
      jwtPayload.body[
          "https://purl.imsglobal.org/spec/lti/claim/target_link_uri"
          ] !== undefined
  ) {
    jwtPayload.target_link_uri = jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"];
  }

  // Verify launch is from correct party
  // aud could be an array or a single entry
  let clientId;
  if (jwtPayload.body.aud instanceof Array) {
    clientId = jwtPayload.body.aud[0];
  } else {
    clientId = jwtPayload.body.aud;
  }

  if (clientId === undefined) {
    clientId = setup.applicationId;
  }

  let url =
    setup.devPortalHost +
    "/api/v1/management/applications/" +
    clientId +
    "/jwks.json";

  try {
    const response = await axios.get(url);
    const key = response.data.keys.find(k => k.kid === jwtPayload.header.kid);
    jwt.verify(id_token, jwk2pem(key));
    jwtPayload.verified = true;
    console.log("JWT verified " + jwtPayload.verified);
  } catch (err) {
    console.log("Verify Error - verify failed: " + err);
    jwtPayload.verified = false;
  }

  return jwtPayload;
};

exports.getOauth2Token = function(setup, scope) {
  return new Promise(function(resolve, reject) {
    let options = {
      method: "POST",
      uri: setup.tokenEndPoint,
      headers: {
        content_type: "application/x-www-form-urlencoded"
      },
      form: {
        grant_type: "client_credentials",
        client_assertion_type:
          "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: oauth2JWT(setup),
        scope: scope
      }
    };

    request(options, function(err, response, body) {
      if (err) {
        console.log("Get Token Error - request failed: " + err.message);
        reject(body);
      } else if (response.statusCode !== 200) {
        console.log(
          "Get Token Error - Service call failed:  " +
            response.statusCode +
            "\n" +
            response.statusMessage +
            "\n" +
            options.uri
        );
        reject(body);
      } else {
        resolve(body);
      }
    });
  });
};

exports.tokenGrab = function(req, res, jwtPayload, setup) {
  let scope =
    "https://purl.imsglobal.org/spec/lti-nrps/scope/contextmembership.readonly";
  this.getOauth2Token(setup, scope).then(
    function(token) {
      res.send(token);
    },
    function(error) {
      res.send(error);
    }
  );
};

exports.oidcLogin = function(req, res, jwtPayload, setup) {
  let state = uuid.v4();
  let nonce = uuid.v4();

  // This tool only supports one redirect_uri...the routing is handled by looking at target_link_uri claim or custom params
  const redirectUri = `${config.frontend_url}lti13`;

  let url =
    setup.oidcAuthUrl +
    "?response_type=id_token" +
    "&scope=openid" +
    "&login_hint=" +
    req.query.login_hint +
    "&lti_message_hint=" +
    req.query.lti_message_hint +
    "&state=" +
    state +
    "&redirect_uri=" +
    encodeURIComponent(redirectUri) +
    "&client_id=" +
    setup.applicationId +
    "&nonce=" +
    nonce;

  // Per the OIDC best practices, save the state in a cookie, and check it on the way back in
  res.cookie('state', state,  { sameSite: 'none', secure: true, httpOnly: true });

  console.log("LTI JWT login init; redirecting to: " + url);
  res.redirect(url);
};

let oauth2JWT = function(setup) {
  let now = Math.trunc(new Date().getTime() / 1000);
  let json = {
    iss: "lti-tool",
    sub: setup.applicationId,
    aud: [setup.tokenEndPoint, 'foo'],
    iat: now,
    exp: now + 5 * 60,
    jti: crypto.randomBytes(16).toString("hex")
  };

  return jwt.sign(json, setup.privateKey, { algorithm: "RS256", keyid: "12345" });
};
