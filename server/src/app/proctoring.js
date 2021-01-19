"use strict";

let jwt = require("jsonwebtoken");

exports.proctoringContent = function(req, res, proctoringPayload, setup) {
  let now = Math.trunc(new Date().getTime() / 1000);
  let json = {
    locale: "en_US",
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LtiStartAssessment",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    iss: proctoringPayload.body.iss,
    aud: proctoringPayload.body.iss,
    sub: proctoringPayload.body.iss,
    iat: now,
    exp: now + 5 * 60,
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": proctoringPayload.body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
    "https://purl.imsglobal.org/spec/lti/claim/resource_link": proctoringPayload.body["https://purl.imsglobal.org/spec/lti/claim/resource_link"],
    "https://purl.imsglobal.org/spec/lti-ap/claim/session_data": proctoringPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/session_data"],
    "https://purl.imsglobal.org/spec/lti-ap/claim/attempt_number": proctoringPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/attempt_number"],
  };
  proctoringPayload.jwt = jwt.sign(json, setup.privateKey, { algorithm: "RS256", keyid: "12345" });
  proctoringPayload.return_url = proctoringPayload.return_url;
  proctoringPayload.start_assessment_url = proctoringPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/start_assessment_url"];
  proctoringPayload.return_json = json;
};