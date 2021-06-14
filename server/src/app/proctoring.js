import jwt from "jsonwebtoken";
import * as ltiAdv from './lti-adv';

export const buildProctoringStartReturnPayload = (req, res, proctoringPayload) => {
  let newJwt = proctoringPayload;
  let now = Math.trunc(new Date().getTime() / 1000);
  let json = {
    locale: 'en_US',
    'https://purl.imsglobal.org/spec/lti/claim/message_type': 'LtiStartAssessment',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    iss: proctoringPayload.body.iss,
    aud: proctoringPayload.body.iss,
    sub: proctoringPayload.body.iss,
    iat: now,
    exp: now + 5 * 60,
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': proctoringPayload.body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'],
    'https://purl.imsglobal.org/spec/lti/claim/resource_link': proctoringPayload.body['https://purl.imsglobal.org/spec/lti/claim/resource_link'],
    'https://purl.imsglobal.org/spec/lti-ap/claim/session_data': proctoringPayload.body['https://purl.imsglobal.org/spec/lti-ap/claim/session_data'],
    'https://purl.imsglobal.org/spec/lti-ap/claim/attempt_number': proctoringPayload.body['https://purl.imsglobal.org/spec/lti-ap/claim/attempt_number'],
    'https://purl.imsglobal.org/spec/lti/claim/custom': proctoringPayload.body['https://purl.imsglobal.org/spec/lti/claim/custom'],
  };

  newJwt.return_url = proctoringPayload.body['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'].return_url;
  if (req.body.custom_message !== '') {
    if (req.body.custom_message_msg) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/msg'] = req.body.custom_message;
      newJwt.return_url = `${proctoringPayload.return_url}&lti_msg=${encodeURI(req.body.custom_message)}`;
    }
    if (req.body.custom_message_log) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/log'] = req.body.custom_message;
      newJwt.return_url = `${proctoringPayload.return_url}&lti_log=${encodeURI(req.body.custom_message)}`;
    }
  }
  if (req.body.custom_error !== '') {
    if (req.body.custom_error_msg) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/errormsg'] = req.body.custom_error;
      newJwt.return_url = `${proctoringPayload.return_url}&lti_errormsg=${encodeURI(req.body.custom_error)}`;
    }
    if (req.body.custom_error_log) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/errorlog'] = req.body.custom_error;
      newJwt.return_url = `${proctoringPayload.return_url}&lti_errorlog=${encodeURI(req.body.custom_error)}`;
    }
  }
  if (req.body.end_assessment_return) {
    json['https://purl.imsglobal.org/spec/lti-ap/claim/end_assessment_return'] = true;
  }

  newJwt.jwt = ltiAdv.signJwt(json);
  newJwt.start_assessment_url = proctoringPayload.body['https://purl.imsglobal.org/spec/lti-ap/claim/start_assessment_url'];
  newJwt.decodedJwt = jwt.decode(proctoringPayload.jwt, { complete: true });
  return newJwt;
};

export const buildProctoringEndReturnPayload = (req, res, proctoringPayload) => {
  let newJwt = proctoringPayload;

  newJwt.return_url = proctoringPayload.body['https://purl.imsglobal.org/spec/lti/claim/launch_presentation'].return_url;
  if (req.body.custom_message !== '') {
    if (req.body.custom_message_msg) {
      newJwt.return_url = `${proctoringPayload.return_url}&lti_msg=${encodeURI(req.body.custom_message)}`;
    }
    if (req.body.custom_message_log) {
      newJwt.return_url = `${proctoringPayload.return_url}&lti_log=${encodeURI(req.body.custom_message)}`;
    }
  }
  if (req.body.custom_error !== '') {
    if (req.body.custom_error_msg) {
      newJwt.return_url = `${proctoringPayload.return_url}&lti_errormsg=${encodeURI(req.body.custom_error)}`;
    }
    if (req.body.custom_error_log) {
      newJwt.return_url = `${proctoringPayload.return_url}&lti_errorlog=${encodeURI(req.body.custom_error)}`;
    }
  }

  return newJwt;
};
