var _ = require('lodash');
var promise = require('promise');
var request = require('request');
var config = require('../../config/config.js');
var crypto = require('crypto');
var lti = require('./lti')
var eventstore = require('./eventstore');
var redis = require('redis'),
  redisClient = redis.createClient({"host": config.redis_host, "port": config.redis_port});
var toolProxyType = "application/vnd.ims.lti.v2.toolproxy+json";

function getToolProxyService(tcProfile) {
  var service = _.find(tcProfile.service_offered, function (d) {
    console.log('format ' + d.format.valueOf());
    return d.format.toString().trim() === toolProxyType;
  });
  if (!service) {
    console.log("no service found");
    return null;
  }
  return service;
}

function sendToolProxy(service, proxy, key, secret) {
  logStep("Sending Tool Proxy to TC at ", {uri: service.endpoint});
  console.log("Sending Tool Proxy to TC at " + service.endpoint);

  return new Promise(function (resolve, reject) {
    request.post({
        url: service.endpoint,
        timeouts: 10000,
        oauth: {
          consumer_key: key,
          consumer_secret: secret,
          token: "",
          token_secret: ""
        },
        json: proxy
      },
      function (error, response, body) {
        if (!error && response.statusCode === 200) {
          logStep("Tool Proxy Successfully Sent to TC", proxy);
          logStep("toolproxy POST response :  ", response.body);

          // Save the tool proxy so we can handle launches from this consumer
          toolProxy.tool_proxy_guid = response.body.tool_proxy_guid;
          saveProxy(toolProxy);
          logStep("toolproxy saved to redis with guid : " + toolProxy.tool_proxy_guid);

          console.log("tool proxy sent; response: " + response.statusCode);
          resolve();
        } else {
          logStep("Error sending Tool Proxy to TC", {error: error, status: response.statusCode, proxy: proxy});
          console.log("Error sending tool proxy; error:" + error + " status: " + response.statusCode);
          console.log("Proxy json: " + JSON.stringify(proxy));
          resolve();
        }
      });
  });
}

var toolProxy = {};

var log = [];

function logStep(description, json) {
  log.push({message: description, data: json});
}

function clearLog() {
  log = [];
}

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

function genSharedSecret() {
  // Create a completely random secret
  var sharedSecret = crypto.randomBytes(16); // 128-bits === 16-bytes

  return sharedSecret.toString('base64');
}

// tool profile
// shared secret
// required services and
// operations
// tc capabilities to utilize
function constructToolProxy(tcToolProfileUrl) {
  var toolProxy = {
    "@context": ["http://purl.imsglobal.org/ctx/lti/v2/ToolProxy", {"tcp": "https://ultra-integ.int.bbpd.io/learn/api/v1/lti/profile#"}],
    "@type": "ToolProxy",
    "@id": "http://blackboard.com/ToolProxy/869e5ce5-214c-4e85-86c6-b99e8458a592",
    "lti_version": "LTI-2p0",
    "tool_consumer_profile": tcToolProfileUrl,
    "tool_proxy_guid" :"abc",
    "tool_profile": {
      "lti_version": "LTI-2p0",
      "product_instance": {
        "guid": "fd75124a-140e-470f-944c-114d2d92bb40",
        "product_info": {
          "product_name": {"default_value": "Blackboard LTI2 Test Provider", "key": "tool.name"},
          "description": {
            "default_value": "Internal Blackboard tool for testing LTI2 registration and launch",
            "key": "tool.description"
          },
          "product_version": "1.3.3f (9-Nov-16)",
          "technical_description": {"default_value": "Fully supports LTI", "key": "tool.technical"},
          "product_family": {
            "@id": "http://toolprovider.example.com/vendor/ims/product/assessment-tool",
            "code": "assessment-tool",
            "vendor": {
              "code": "ims",
              "vendor_name": {"default_value": "Blackboard Inc.", "key": "tool.vendor.name"},
              "description": {
                "default_value": "Blackboard is a leading provider of teaching and learning software",
                "key": "tool.vendor.description"
              },
              "website": "http://www.blackboard.com",
              "timestamp": "2016-11-09T16:15:40+00:00",
              "contact": {"email": "lticonformance@imsglobal.org"}
            }
          }
        },
        "support": {"email": "conformance@insglobal,org"},
        "service_provider": {
          "guid": "18e7ea50-3d6d-4f6b-aff2-ed3ab577716c",
          "service_provider_name": {"default_value": "Blackboard", "key": "service_provider.name"},
          "description": {
            "default_value": "Provider of high performance managed hosting environments",
            "key": "service_provider.description"
          },
          "support": {"email": "info@imsglobal.org"},
          "timestamp": "2016-11-09T16:15:40+00:00"
        }
      },
      "base_url_choice": [{"default_base_url": config.provider_domain + ":" + config.provider_port}],
      "resource_handler": [{
        "resource_type": {"code": "asmt"},
        "resource_name": {"default_value": "Blackboard LTI Launch Tester", "key": "assessment.resource.name"},
        "description": {
          "default_value": "An echo server that also supports Caliper and Grade postback",
          "key": "assessment.resource.description"
        },
        "message": [{
          "message_type": "basic-lti-launch-request",
          "path": "/lti",
          "enabled_capability": ["User.id", "Person.sourcedId", "Membership.role", "CourseSection.sourcedId"],
          "parameter": [{"name": "tc_profile_url", "variable": "ToolConsumerProfile.url"}, {
            "name": "cert_given_name",
            "variable": "Person.name.given"
          }, {"name": "cert_family_name", "variable": "Person.name.family"}, {
            "name": "cert_full_name",
            "variable": "Person.name.full"
          }, {"name": "cert_email", "variable": "Person.email.primary"}, {
            "name": "cert_userid",
            "variable": "User.id"
          }, {"name": "cert_username", "variable": "User.username"}, {
            "name": "simple_key",
            "fixed": "custom_simple_value"
          }, {"name": "Complex!@#$^*(){}[]KEY", "fixed": "Complex!@#$^*;(){}[]½Value"}]
        }],
        "icon_info": [{"default_location": {"path": "images/icon.png"}, "key": "iconStyle.default.path"}]
      }]
    },
    "custom": {"id": "id58234b1eaa416"},
    "security_contract": {
      "shared_secret": "secret58234b1eaa36c",
      "tool_service": [{
        "@type": "RestServiceProfile",
        "service": "tcp:ToolConsumerProfile",
        "action": ["GET"]
      }, {
        "@type": "RestServiceProfile",
        "service": "tcp:ToolProxy",
        "action": ["GET", "POST"]
      }, {"@type": "RestServiceProfile", "service": "tcp:CaliperProfile.collection", "action": ["GET"]}]
    }
  };
  return toolProxy;
}

function saveProxy(proxy) {
  redisClient.on("error", function (err) {
    console.log("Redis error " + err);
  });

  redisClient.set(proxy.tool_proxy_guid, JSON.stringify(proxy), function (err, res) {
    console.log("saveProxy err " + err);
    console.log("saveProxy res " + res);
  });
}

var activity = {};

module.exports = function (app) {
  app.get('/', function (req, res) {
  });

  // LTI 1 provider and caliper stuff
  app.post('/caliper/send', lti.caliper_send);
  app.post('/caliper/register', lti.caliper);
  app.post('/caliper', eventstore.got_caliper);
  app.get('/caliper', eventstore.show_events);
  app.post('/rest/auth', lti.rest_auth);
  app.post('/rest/user', lti.rest_getuser);
  app.post('/rest/course', lti.rest_getcourse);
  app.post('/lti/outcomes', lti.outcomes);
  app.post('/lti/send_outcomes', lti.send_outcomes);
  app.post('/lti', lti.got_launch);

  // LTI 2 registration stuff
  app.get('/registrationactivity', function (req, res) {
    res.send(activity);
  });

  app.post('/registration', function (req, res) {
    clearLog();

    logStep('Received post data from TC at /registration', req.body);
    var regKey = req.body.reg_key;
    var regSecret = req.body.reg_password;

    logStep('Calling TC Profile Endpoint', {url: req.body.tc_profile_url + '/?lti_version=LTI-2p0'});
    request({uri: req.body.tc_profile_url + "/?lti_version=LTI-2p0"}, function (error, response, body) {
      if (error) {
        console.error(error.message);
        res.send(error.message);
        return;
      }
      activity.get_tc_profile = {
        headers: response.headers,
        body: JSON.parse(body),
        launch_presentation_return_url: req.body.launch_presentation_return_url
      };

      var toolProfile = JSON.parse(body);
      //  activity.request = req;
      activity.status = 'success';
      activity.failReason = '';

      logStep('Received Consumer Profile: ', toolProfile);
      // 6. Register the Tool Proxy
      // 10.1 Tool Proxy Service
      console.log(body);

      activity.log = log;
      // Validate Tool Consumer Profile

      var bodyJSON = JSON.parse(body);

      // search for service that implements application/vnd/ims/lti.v2.toolproxy+json
      var service = getToolProxyService(bodyJSON);
      if (service) {
        logStep("Found TC tool proxy service endpoint", service);
      }

      if (!service) {
        activity.status = 'fail';
        activity.failReason = 'Could not find consumer toolproxy service';
        res.send("I'm sorry Dave, but that's not a valid LTI 2.0 provider.");
      } else {
        // Register Tool Proxy
        toolProxy = constructToolProxy(req.body.tc_profile_url);

        var redirectUrl = config.provider_domain + ":" + config.provider_port + '/#tp_registration'

        sendToolProxy(service, toolProxy, regKey, regSecret).then(function () {
          logStep('Redirecting to : ', {url: redirectUrl});
          console.log('Redirecting to : ' + redirectUrl);
          res.redirect(redirectUrl);
        });
      }
    });
  });

};
