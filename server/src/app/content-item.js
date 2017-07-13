import lti_content_items from "./lti-content-item.js";

var HMAC_SHA1 = require('./hmac-sha1');
var url = require('url');
var uuid = require('uuid');
var utils = require('./utils');

//LTI Variables
var consumerKey = "12345";
var consumerSecret = "secret";
var returnUrl = "";

exports.got_launch = function (req, res, contentItemData) {

  returnUrl = req.body.content_item_return_url;

  // Setup and create oauth components
  let options = {
    consumer_key: consumerKey,
    consumer_secret: consumerSecret,
    return_url: returnUrl,
    signer: (new HMAC_SHA1())
  };

  let parts = url.parse(options.return_url, true);

  let headers = _build_headers(options, parts);

  // Populate contentItemData
  contentItemData.data = req.body;
  contentItemData.consumer_key = consumerKey;
  contentItemData.consumer_secret = consumerSecret;
  contentItemData.content_items = lti_content_items.constructLTIContentItem();

  // This is ugly but I have not found a better way to strip out the values from a string
  let tempNonce = headers.Authorization.split(",")[2].split("=")[1];
  contentItemData.oauth_nonce = tempNonce.substring(1, tempNonce.length - 1);

  let tempTimeStamp = headers.Authorization.split(",")[3].split("=")[1];
  contentItemData.oauth_timestamp = tempTimeStamp.substring(1, tempTimeStamp.length - 1);

  let tempSig = headers.Authorization.split(",")[6].split("=")[1];
  contentItemData.oauth_signature = tempSig.substring(1, tempSig.length -1);

  console.log(contentItemData);

  return new Promise(function (resolve, reject) {
    resolve();
  });
};

var _build_headers = function (options, parts) {
  var headers, key, val;
  headers = {
    oauth_version: '1.0',
    oauth_nonce: uuid.v4(),
    oauth_timestamp: Math.round(Date.now() / 1000),
    oauth_consumer_key: options.consumer_key,
    oauth_signature_method: 'HMAC-SHA1'
  };
  headers.oauth_signature = options.signer.build_signature_raw(returnUrl, parts, 'POST', headers, options.consumer_secret);
  return {
    Authorization: 'OAuth realm="",' + ((function () {
      var results;
      results = [];
      for (key in headers) {
        val = headers[key];
        results.push(key + "=\"" + (utils.special_encode(val)) + "\"");
      }
      return results;
    })()).join(','),
    'Content-Type': 'application/xml',
    'Content-Length': 0
  };
};
