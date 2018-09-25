'use strict';

exports.assignGrades = (req, res, setup) =>{
  let json = JSON.parse(req.body.body);
  let assignGrades = json["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];
};
