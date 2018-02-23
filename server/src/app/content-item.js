import lti_content_items from "./lti-content-item.js"

var HMAC_SHA = require('./hmac-sha1');
var url = require('url');
var uuid = require('uuid');
var utils = require('./utils');

//LTI Variables
var consumerKey = "12345";
var consumerSecret = "secret";
var returnUrl = "";
var sha_method = "";

exports.got_launch = function (req, res, contentItemData) {

  returnUrl = req.body.content_item_return_url;
  sha_method = req.body.oauth_signature_method;
  console.log("Signature Method: " + sha_method);

  // Populate contentItemData
  contentItemData.data = req.body;
  contentItemData.consumer_key = consumerKey;
  contentItemData.consumer_secret = consumerSecret;
  switch (req.body.custom_option) {
    case '1':
      contentItemData.content_items = lti_content_items.constructLTIContentItem1();
      break;

    case '2':
      contentItemData.content_items = lti_content_items.constructLTIContentItem2();
      break;

    case '3':
      contentItemData.content_items = lti_content_items.constructLTIContentItem3();
      break;

    case '4':
      contentItemData.content_items = lti_content_items.constructLTIContentItem4();
      break;

    case '5':
      contentItemData.content_items = lti_content_items.constructLTIContentItem5();
      break;

    case '6':
      contentItemData.content_items = JSON.parse(req.body.custom_content);
      break;

    default:
      contentItemData.content_items = lti_content_items.constructLTIContentItem1();
      break;
  }
  contentItemData.oauth_signature_method = sha_method;

  // Setup and create oauth components
  let options = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    return_url: returnUrl,
    params: req.body,
    content_items: contentItemData.content_items,
    oauth_version: '1.0',
    oauth_signature_method: sha_method
  };

  if (sha_method === 'HMAC-SHA256') {
    options.signer = new HMAC_SHA.HMAC_SHA2();
  } else {
    options.signer = new HMAC_SHA.HMAC_SHA1();
  }

  // Use internal HMAC_SHA1 processing
  let parts = url.parse(options.return_url, true);
  let headers = _build_headers(options, parts);

  console.log(headers);

  contentItemData.oauth_nonce = get_value('oauth_nonce', headers.Authorization);
  contentItemData.oauth_timestamp = get_value('oauth_timestamp', headers.Authorization);
  contentItemData.oauth_signature = get_value('oauth_signature', headers.Authorization);

  console.log('--- Content Item ---');
  console.log(contentItemData);

  return new Promise(function (resolve, reject) {
    resolve();
  });
};

let _build_headers = function (options, parts) {
  let headers = {}, key = "", val = "";

  headers = {
    content_items: JSON.stringify(options.content_items),
    data: options.params.data,
    lti_message_type: 'ContentItemSelection',
    lti_version: options.params.lti_version,
    oauth_callback: 'about:blank',
    oauth_version: options.oauth_version,
    oauth_nonce: uuid.v4(),
    oauth_timestamp: Math.round(Date.now() / 1000),
    oauth_consumer_key: options.consumer_key,
    oauth_signature_method: options.oauth_signature_method
  };

  headers.oauth_signature = options.signer.build_signature_raw(returnUrl, parts, 'POST', headers, options.consumer_secret);
//  console.log(options.oauth_signature_method + " signature: " + headers.oauth_signature);

  return {
    Authorization: 'OAuth realm="",' + ((function () {
      let results;
      results = [];
      for (key in headers) {
        val = headers[key];
        results.push(key + "=\"" + val + "\"");
      }
      return results;
    })()).join(','),
    'Content-Type': 'application/xml',
    'Content-Length': 0
  };
};

let get_value = function (key, source) {
  let offset1, offset2;

  key = key + '=';
  offset1 = source.indexOf(key) + key.length + 1;
  offset2 = source.indexOf('"', offset1);
  return source.substring(offset1, offset2);
};
