"use strict";

let jwt = require("jsonwebtoken");

exports.buildProctoringStartReturnPayload = function(req, res, proctoringPayload, setup) {
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
    "https://purl.imsglobal.org/spec/lti/claim/custom": proctoringPayload.body["https://purl.imsglobal.org/spec/lti/claim/custom"],
  };

  proctoringPayload.return_url = proctoringPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  if (req.body.custom_message !== "") {
    if (req.body.custom_message_msg) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/msg"] = req.body.custom_message;
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_msg=${encodeURI(req.body.custom_message)}`;
    }
    if (req.body.custom_message_log) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/log"] = req.body.custom_message;
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_log=${encodeURI(req.body.custom_message)}`;
    }
  }
  if (req.body.custom_error !== "") {
    if (req.body.custom_error_msg) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/errormsg"] = req.body.custom_error;
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_errormsg=${encodeURI(req.body.custom_error)}`;
    }
    if (req.body.custom_error_log) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/errorlog"] = req.body.custom_error;
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_errorlog=${encodeURI(req.body.custom_error)}`;
    }
  }
  if (req.body.end_assessment_return) {
    json["https://purl.imsglobal.org/spec/lti-ap/claim/end_assessment_return"] = true;
  }

  proctoringPayload.jwt = jwt.sign(json, setup.privateKey, { algorithm: "RS256", keyid: "12345" });
  proctoringPayload.start_assessment_url = proctoringPayload.body["https://purl.imsglobal.org/spec/lti-ap/claim/start_assessment_url"];
  proctoringPayload.decodedJwt = jwt.decode(proctoringPayload.jwt, { complete: true });
};

exports.buildProctoringEndReturnPayload = function(req, res, proctoringPayload, setup) {
  proctoringPayload.return_url = proctoringPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  if (req.body.custom_message !== "") {
    if (req.body.custom_message_msg) {
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_msg=${encodeURI(req.body.custom_message)}`;
    }
    if (req.body.custom_message_log) {
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_log=${encodeURI(req.body.custom_message)}`;
    }
  }
  if (req.body.custom_error !== "") {
    if (req.body.custom_error_msg) {
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_errormsg=${encodeURI(req.body.custom_error)}`;
    }
    if (req.body.custom_error_log) {
      proctoringPayload.return_url = `${proctoringPayload.return_url}&lti_errorlog=${encodeURI(req.body.custom_error)}`;
    }
  }
}