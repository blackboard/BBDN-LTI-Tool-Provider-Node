import * as ltiAdv from './lti-adv';
import config from '../config/config.js';

export const deepLink = (req, res, dlPayload) => {
  const app = ltiAdv.applicationInfo(dlPayload.body.aud);
  //console.log(app);
  let deploy =
    dlPayload.body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
  let deepLink =
    dlPayload.body[
      'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'
      ];
  let data = deepLink.data;
  let iss = dlPayload.body.iss;
  let json = deepLinkingFrame(
    app.appId,
    iss,
    deploy,
    data,
    deepLinkingFixed()
  );

  dlPayload.jwt = ltiAdv.signJwt(json);
  dlPayload.return_url = deepLink.deep_link_return_url;
  dlPayload.error_url =
    dlPayload.body[
      'https://purl.imsglobal.org/spec/lti/claim/launch_presentation'
      ].return_url;
  dlPayload.return_json = json;
};

export const deepLinkContent = (req, res, dlPayload) => {
  let deploy =
    dlPayload.body['https://purl.imsglobal.org/spec/lti/claim/deployment_id'];
  let deepLink =
    dlPayload.body[
      'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings'
      ];
  let data = deepLink.data;
  let iss = dlPayload.body.iss;

  let items = [];
  //console.log(`Custom option: ${req.body.custom_option}`);
  //console.log(`Custom lti links: ${req.body.custom_ltilinks}`);
  //console.log(`Custom embed lti links: ${req.body.embed_ltilinks}`);
  //console.log(`Custom new window lti links: ${req.body.new_ltilinks}`);

  if (req.body.custom_option === 'false') {
    //console.log('used build-a-payload');
    let total = 0;
    for (let i = 0; i < req.body.custom_ltiLinks; i++, total++) {
      items[total] = deepLinkingLTILink();
    }
    for (let i = 0; i < req.body.embed_ltiLinks; i++, total++) {
      items[total] = deepLinkingEmbedLTILink();
    }
    for (let i = 0; i < req.body.new_ltiLinks; i++, total++) {
      items[total] = deepLinkingNewWindowLTILink();
    }
    for (let i = 0; i < req.body.custom_contentLinks; i++, total++) {
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
  } else {
    //console.log('used custom json');
    if (req.body.custom_content !== '') {
      items[0] = JSON.parse(req.body.custom_content);
    }
  }

  let json = deepLinkingFrame(dlPayload.body.aud, iss, deploy, data, items);

  if (req.body.custom_message !== '') {
    if (req.body.custom_message) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/msg'] =
        req.body.custom_message;
    }
    if (req.body.custom_message_log) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/log'] =
        req.body.custom_message;
    }
  }
  if (req.body.custom_error !== '') {
    if (req.body.custom_error) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/errormsg'] =
        req.body.custom_error;
    }
    if (req.body.custom_error_log) {
      json['https://purl.imsglobal.org/spec/lti-dl/claim/errorlog'] =
        req.body.custom_error;
    }
  }

  let dljwt = dlPayload;
  dljwt.jwt = ltiAdv.signJwt(json);
  dljwt.return_url = deepLink.deep_link_return_url;
  dljwt.return_json = json;
  return JSON.stringify(dljwt);
};

let deepLinkingFrame = function (iss, aud, deploy, data, items) {
  let now = Math.trunc(new Date().getTime() / 1000);

  return {
    iss: iss,
    aud: aud,
    sub: iss,
    iat: now,
    exp: now + 5 * 60,
    locale: 'en_US',
    'https://purl.imsglobal.org/spec/lti/claim/deployment_id': deploy,
    'https://purl.imsglobal.org/spec/lti/claim/message_type':
      'LtiDeepLinkingResponse',
    'https://purl.imsglobal.org/spec/lti/claim/version': '1.3.0',
    'https://purl.imsglobal.org/spec/lti-dl/claim/data': data,
    'https://purl.imsglobal.org/spec/lti-dl/claim/content_items': items
  };
};

let deepLinkingFixed = function () {
  let items = [];
  items[0] = deepLinkingLTILink();
  items[1] = deepLinkingContentLink();
  return items;
};

let deepLinkingLTILink = function () {
  let start = new Date();
  start.setHours(8, 0, 0, 0);
  let end = new Date();
  end.setHours(8, 0, 0, 0);
  end.setDate(start.getDate() + 30);

  return {
    type: 'ltiResourceLink',
    title: 'A title for LTI & 1.3 " Link',
    text: 'A & description with quotes "',
    url: `${config.frontend_url}lti13`,
    available: {
      startDateTime: start,
      endDateTime: end
    },
    submission: {
      endDateTime: end
    },
    icon: {
      url: 'https://photos.smugmug.com/photos/i-t4nLkQd/0/Th/i-t4nLkQd-Th.jpg',
      width: 100,
      height: 100
    },
    thumbnail: {
      url: 'https://photos.smugmug.com/photos/i-t4nLkQd/0/Th/i-t4nLkQd-Th.jpg',
      width: 90,
      height: 90
    },
    lineItem: {
      scoreMaximum: 100,
      label: 'Chapter 12 quiz',
      resourceId: 'xyzpdq1234',
      tag: 'originality'
    },
    custom: {
      key1: 'some & value',
      contextHistory: '$Context.id.history',
      resourceHistory: '$ResourceLink.id.history',
      firstAvailable: '$ResourceLink.available.startDateTime',
      lastAvailable: '$ResourceLink.available.endDateTime',
      dueDate: '$ResourceLink.submission.endDateTime',
      userName: '$User.username',
      userEmail: '$Person.email.primary',
      userSysRoles: '@X@user.role@X@',
      source: 'link'
    }
  };
};

let deepLinkingNewWindowLTILink = function () {
  return {
    type: 'ltiResourceLink',
    title: 'A New Window & LTI Link',
    text: 'A new window & " description',
    url: `${config.frontend_url}lti13`,
    icon: {
      url: 'https://photos.smugmug.com/photos/i-PhqNP5C/0/7be04c91/Th/i-PhqNP5C-Th.jpg',
      width: 100,
      height: 100
    },
    lineItem: {
      scoreMaximum: 100,
      label: 'New Window quiz',
      resourceId: 'xyzpdasdfq1234',
      tag: 'originality'
    },
    custom: {
      key1: 'new window & link value',
      userName: '$User.username',
      userEmail: '$Person.email.primary',
      userSysRoles: '@X@user.role@X@',
      source: 'new window link'
    },
    window: {
      targetName: '_blank'
    }
  };
};

let deepLinkingEmbedLTILink = function () {
  let start = new Date();
  start.setHours(8, 0, 0, 0);
  let end = new Date();
  end.setHours(8, 0, 0, 0);
  end.setDate(start.getDate() + 30);

  return {
    type: 'ltiResourceLink',
    title: 'An Embedded LTI & " Link',
    text: 'Bobcat & art',
    url: `${config.frontend_url}lti13`,
    iframe: {
      width: 600,
      height: 600
    },
    custom: {
      deeplinkkey1: 'from deep linking & item',
      userName: '$User.username',
      userEmail: '$Person.email.primary',
      userSysRoles: '@X@user.role@X@',
      assignment_pk: '@X@content.pk_string@X@',
      course_pk: '@X@course.pk_string@X@'
    }
  };
};

let deepLinkingContentLink = function () {
  return {
    type: 'link',
    title: 'My &Home" Page',
    url: 'https://www.google.com?foo=bar&a=b&url=https%3A%2F%2Fwww.google.com%3Ffoo%3Dbar%26a%3Db',
    icon: {
      url: 'https://photos.smugmug.com/photos/i-t4nLkQd/0/Th/i-t4nLkQd-Th.jpg',
      width: 100,
      height: 100
    },
    thumbnail: {
      url: 'https://photos.smugmug.com/photos/i-t4nLkQd/0/Th/i-t4nLkQd-Th.jpg',
      width: 90,
      height: 90
    }
  };
};

let deepLinkingFile = function () {
  return {
    type: 'file',
    title: 'A file like a PDF that is my assignment submissions',
    url: 'https://my.example.com/assignment1.pdf',
    mediaType: 'application/pdf',
    expiresAt: '2018-03-06T20:05:02Z',
    thumbnail: {
      url: 'https://photos.smugmug.com/photos/i-t4nLkQd/0/Th/i-t4nLkQd-Th.jpg',
      width: 50,
      height: 50
    }
  };
};

let deepLinkingHTML = function () {
  return {
    type: 'html',
    html: '<h2>this is a title</h2>'
  };
};

let deepLinkingImage = function () {
  return {
    type: 'image',
    url: 'https://flic.kr/p/2imo4TA',
    width: 300,
    height: 240
  };
};
