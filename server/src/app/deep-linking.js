"use strict";

import config from "../config/config.js";

let jwt = require("jsonwebtoken");

exports.deepLink = function(req, res, dlPayload, setup) {
  let deploy =
    dlPayload.body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"];
  let deepLink =
    dlPayload.body[
      "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"
    ];
  let data = deepLink.data;
  let iss = dlPayload.body.iss;
  let json = deepLinkingFrame(
    setup.applicationId,
    iss,
    deploy,
    data,
    deepLinkingFixed()
  );

  console.log("Private key: " + setup.privateKey);

  dlPayload.jwt = jwt.sign(json, setup.privateKey, { algorithm: "RS256", keyid: "12345" });
  dlPayload.return_url = deepLink.deep_link_return_url;
  dlPayload.error_url =
    dlPayload.body[
      "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
    ].return_url;
  dlPayload.return_json = json;
};

exports.deepLinkContent = function(req, res, dlPayload, setup) {
  let deploy =
    dlPayload.body["https://purl.imsglobal.org/spec/lti/claim/deployment_id"];
  let deepLink =
    dlPayload.body[
      "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings"
    ];
  let data = deepLink.data;
  let iss = dlPayload.body.iss;

  let items = [];
  switch (req.body.custom_option) {
    case "1":
      let total = 0;
      for (let i = 0; i < req.body.custom_ltilinks; i++, total++) {
        items[total] = deepLinkingLTILink();
      }
      for (let i = 0; i < req.body.custom_contentlinks; i++, total++) {
        items[total] = deepLinkingContentLink();
      }
      for (let i = 0; i < req.body.custom_files; i++, total++) {
        items[total] = deepLinkingFile();
      }
      for (let i = 0; i < req.body.custom_htmls; i++, total++) {
        items[total] = deepLinkingHTML();
      }
      for (let i = 0; i < req.body.custom_images; i++, total++) {
        items[total] = deepLinkingImage();
      }
      break;

    case "2":
      if (req.body.custom_content !== "") {
        items[0] = JSON.parse(req.body.custom_content);
      }
      break;
  }

  let json = deepLinkingFrame(setup.applicationId, iss, deploy, data, items);

  if (req.body.custom_message !== "") {
    if (req.body.custom_message_msg) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/msg"] =
        req.body.custom_message;
    }
    if (req.body.custom_message_log) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/log"] =
        req.body.custom_message;
    }
  }
  if (req.body.custom_error !== "") {
    if (req.body.custom_error_msg) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/errormsg"] =
        req.body.custom_error;
    }
    if (req.body.custom_error_log) {
      json["https://purl.imsglobal.org/spec/lti-dl/claim/errorlog"] =
        req.body.custom_error;
    }
  }

  console.log("Private key2: " + setup.privateKey);

  dlPayload.jwt = jwt.sign(json, setup.privateKey, { algorithm: "RS256", keyid: "12345" });
  dlPayload.return_url = deepLink.deep_link_return_url;
  dlPayload.return_json = json;
};

let deepLinkingFrame = function(iss, aud, deploy, data, items) {
  let now = Math.trunc(new Date().getTime() / 1000);

  return {
    iss: iss,
    aud: aud,
    sub: iss,
    iat: now,
    exp: now + 5 * 60,
    locale: "en_US",
    "https://purl.imsglobal.org/spec/lti/claim/deployment_id": deploy,
    "https://purl.imsglobal.org/spec/lti/claim/message_type":
      "LtiDeepLinkingResponse",
    "https://purl.imsglobal.org/spec/lti/claim/version": "1.3.0",
    "https://purl.imsglobal.org/spec/lti-dl/claim/data": data,
    "https://purl.imsglobal.org/spec/lti-dl/claim/content_items": items
  };
};

let deepLinkingFixed = function() {
  let items = [];
  items[0] = deepLinkingLTILink();
  items[1] = deepLinkingContentLink();
  return items;
};

let deepLinkingLTILink = function() {
  let start = new Date();
  start.setHours(8, 0, 0, 0);
  let end = new Date();
  end.setHours(8, 0, 0, 0);
  end.setDate(start.getDate() + 30);

  return {
    type: "ltiResourceLink",
    title: "A title for LTI Link",
    text: "A description",
    url:
      config.provider_domain +
      (config.provider_port !== "NA" ? ":" + config.provider_port : "") +
      "/lti13",
    available: {
      startDateTime: start,
      endDateTime: end
    },
    submission: {
      endDateTime: end
    },
    icon: {
      url: "https://lti.example.com/image.jpg",
      width: 100,
      height: 100
    },
    thumbnail: {
      url: "https://lti.example.com/thumb.jpg",
      width: 90,
      height: 90
    },
    lineItem: {
      scoreMaximum: 100,
      label: "Chapter 12 quiz",
      resourceId: "xyzpdq1234",
      tag: "originality"
    },
    custom: {
      key1: "some value",
      contextHistory: "$Context.id.history",
      resourceHistory: "$ResourceLink.id.history",
      firstAvailable: "$ResourceLink.available.startDateTime",
      lastAvailable: "$ResourceLink.available.endDateTime",
      dueDate: "$ResourceLink.submission.endDateTime",
      userName: "$User.username",
      userEmail: "$Person.email.primary",
      userSysRoles: "@X@user.role@X@"
    }
  };
};

let deepLinkingContentLink = function() {
  return {
    type: "link",
    title: "My Home Page",
    url: "http://google.com",
    icon: {
      url: "https://lti.example.com/image.jpg",
      width: 100,
      height: 100
    },
    thumbnail: {
      url: "https://lti.example.com/thumb.jpg",
      width: 90,
      height: 90
    }
  };
};

let deepLinkingFile = function() {
  return {
    type: "file",
    title: "A file like a PDF that is my assignment submissions",
    url: "https://my.example.com/assignment1.pdf",
    mediaType: "application/pdf",
    expiresAt: "2018-03-06T20:05:02Z",
    thumbnail: {
      url: "https://lti.example.com/thumb.jpg",
      width: 50,
      height: 50
    }
  };
};

let deepLinkingHTML = function() {
  return {
    type: "html",
    html: "<h2>this is a title</h2>"
  };
};

let deepLinkingImage = function() {
  return {
    type: "image",
    url: "https://www.example.com/pic.jpg",
    width: 300,
    height: 240
  };
};
