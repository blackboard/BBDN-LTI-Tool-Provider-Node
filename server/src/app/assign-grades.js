'use strict';

exports.assignGrades = (req, res, agPayload, setup) =>{
  let json = JSON.parse(req.body.body);
  agPayload.orig_body = json;
  agPayload.claim = json["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];
};
