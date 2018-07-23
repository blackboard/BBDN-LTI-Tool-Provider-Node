'use strict';

let jwt = require('jsonwebtoken');

exports.deepLink = function (req, res, dlPayload, setup) {
  let deploy = dlPayload.body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"];
  let data = dlPayload.body["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"].data;
  let json = deepLinkingFixed(setup.applicationId, deploy, data);
  dlPayload.jwt = jwt.sign(json, setup.privateKey, {algorithm: 'RS256'});
  dlPayload.return_url = dlPayload.body["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"].return_url;
  dlPayload.error_url = dlPayload.body["https://purl.imsglobal.org/spec/lti/claim/launch_presentation"].return_url;
  dlPayload.return_json = json;
};

exports.deepLinkContent = function (req, res, dlPayload, setup) {
  let deploy = dlPayload.body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"];
  let data = dlPayload.body["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"].data;
  let items = [];

  switch( req.body.custom_option) {
    case '1':
      items[0] = deepLinkingLTILink();
      break;

    case '2':
      items[0] = deepLinkingContentLink();
      break;

    case '3':
      items[0] = deepLInkingFile();

    case '5':
      let total = 0;
      for ( let i = 0; i < req.body.custom_ltilinks; i++, total++ ) {
        items[total] = deepLinkingLTILink();
      }
      for ( let i = 0; i < req.body.custom_contentlinks; i++, total++ ) {
        items[total] = deepLinkingContentLink();
      }
      for ( let i = 0; i < req.body.custom_files; i++, total++ ) {
        items[total] = deepLInkingFile();
      }
      break;

    case '6':
      if (req.body.custom_content !== '') {
        items[0] = JSON.parse(req.body.custom_content);
      }
      break;
  }
  let json = deepLinkingFrame(setup.applicationId, deploy, data, items);
  dlPayload.jwt = jwt.sign(json, setup.privateKey, {algorithm: 'RS256'});
  dlPayload.return_url = dlPayload.body["https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"].return_url;
  dlPayload.return_json = json;
};

let deepLinkingFrame = function(iss, deploy, data, items) {
  return {
    "iss": iss,
    "aud": "http://blackboard.com",
    "locale": "en_US",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": deploy,
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LTIDeepLinkingResponse",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti-dl/claim/data": data,
    "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": items
  };
};

let deepLinkingLTILink = function() {
  return {
    "type": "ltiLink",
    "title": "A title",
    "text": "A description",
    "url": "https://localhost:3000/lti13",
    "available": {
      "startDateTime": "2018-08-01T04:00:00Z",
      "endDateTime": "2018-09-01T04:00:00Z"
    },
    "submission": {
      "endDateTime": "2018-08-30T04:00:00Z"
    },
    "icon": {
      "url": "https://lti.example.com/image.jpg",
      "width": 100,
      "height": 100
    },
    "thumbnail": {
      "url": "https://lti.example.com/thumb.jpg",
      "width": 90,
      "height": 90
    },
    "lineItem": {
      "scoreMaximum": 87,
      "label": "Chapter 12 quiz",
      "resourceId": "xyzpdq1234",
      "tag": "originality"
    },
    "custom": {
      "key1": "some value"
    }
  };
};

let deepLinkingContentLink = function() {
  return {
    "type": "link",
    "title": "My Home Page",
    "url": "http://google.com",
    "icon": {
      "url": "https://lti.example.com/image.jpg",
      "width": 100,
      "height": 100
    },
    "thumbnail": {
      "url": "https://lti.example.com/thumb.jpg",
      "width": 90,
      "height": 90
    }
  };
};

let deepLInkingFile = function() {
  return {
    "type": "file",
    "title": "A file like a PDF that is my assignment submissions",
    "url": "https://my.example.com/assignment1.pdf",
    "mediaType": "application/pdf",
    "expiresAt": "2018-03-06T20:05:02Z",
    "thumbnail": {
      "url": "https://lti.example.com/thumb.jpg",
      "width": 50,
      "height": 50
    }
  };
};

// need to flesh this out a bit still
let deepLinkingFixed = function(iss, deploy, data) {
  return {
    "iss": iss,
    "aud": "http://blackboard.com",
    "locale": "en_US",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": deploy,
    "https://purl.imsglobal.org/spec/lti/claim/message_type": "LTIDeepLinkingResponse",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": [
      {
        "type": "ltiLink",
        "title": "A title",
        "text": "A description",
        "url": "https://localhost:3000/lti13",
        "available": {
          "startDateTime": "2018-08-01T04:00:00Z",
          "endDateTime": "2018-09-01T04:00:00Z"
        },
        "submission": {
          "endDateTime": "2018-08-30T04:00:00Z"
        },
        "icon": {
          "url": "https://lti.example.com/image.jpg",
          "width": 100,
          "height": 100
        },
        "thumbnail": {
          "url": "https://lti.example.com/thumb.jpg",
          "width": 90,
          "height": 90
        },
        "lineItem": {
          "scoreMaximum": 87,
          "label": "Chapter 12 quiz",
          "resourceId": "xyzpdq1234",
          "tag": "originality"
        },
        "custom": {
          "key1": "some value"
        }
      },
      {
        "type": "link",
        "title": "My Home Page",
        "url": "http://google.com",
        "icon": {
          "url": "https://lti.example.com/image.jpg",
          "width": 100,
          "height": 100
        },
        "thumbnail": {
          "url": "https://lti.example.com/thumb.jpg",
          "width": 90,
          "height": 90
        }
      }
    ],
    "https://purl.imsglobal.org/spec/lti-dl/claim/data": data
  };
};

