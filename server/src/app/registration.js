import log from "./action_log.js";

import config from "../config/config";
import request from "request";
import redisUtil from "./redisutil";
import _ from "lodash";
import tpGenerator from "./tool_proxy_generator.js";

import {TCProfileResponse} from "../common/restTypes";
let redisClient = redisUtil.redisInit(config.redis_host, config.redis_port);
let toolProxy = {};

module.exports = function () {
  const toolProxyMediaType = "application/vnd.ims.lti.v2.toolproxy+json";
  const toolSettingsSimpleMediaType = "application/vnd.ims.lti.v2.toolsettings.simple+json";
  const resultMediaType = "application/vnd.ims.lis.v2.result+json";

  return {
    handleRegistrationPost: function (req, res, registrationData: RegistrationData) {

      return new Promise(function (resolve, reject) {
        log.clearLog();

        log.logStep('Received post data from TC at /registration', req.body);
        let regKey = req.body.reg_key;
        let regSecret = req.body.reg_password;


        // get the tool consumer profile
        log.logStep('Calling TC Profile Endpoint', {url: req.body.tc_profile_url + '/?lti_version=LTI-2p0'});

        getToolConsumerProfile(req.body.tc_profile_url + '/?lti_version=LTI-2p0').then(function (toolConsumerProfile) {

          registrationData.TCProfileResponse = new TCProfileResponse(toolConsumerProfile,
            req.body.launch_presentation_return_url);

          //  activity.request = req;
          registrationData.status = 'success';
          registrationData.failReason = '';

          log.logStep('Received Consumer Profile: ', toolConsumerProfile);
          // 6. Register the Tool Proxy
          // 10.1 Tool Proxy Service
          console.log(toolConsumerProfile);

          registrationData.log = log.getLog();
          // Validate Tool Consumer Profile

          getServicesFromConsumerProfile(toolConsumerProfile, registrationData);

          // search for service that implements application/vnd/ims/lti.v2.toolproxy+json
          let service = getServiceFromConsumerProfile(toolConsumerProfile, toolProxyMediaType);
          if (service) {
            log.logStep("Found TC tool proxy service endpoint", service);
            // Register Tool Proxy
            registrationData.toolProxy = tpGenerator.constructToolProxy(req.body.tc_profile_url);

            sendToolProxy(service, registrationData.toolProxy, regKey, regSecret, registrationData).then(function () {
              resolve();
            });

          } else {
            registrationData.status = 'fail';
            registrationData.failReason = 'Could not find consumer toolproxy service';
            res.send("I'm sorry Dave, but that's not a valid LTI 2.0 provider.");
            resolve();
          }
        });
      });
    }
  };


  function getServicesFromConsumerProfile(toolConsumerProfile, registrationData) {
    // search for tool settings service if available
    let toolSettings = getServiceFromConsumerProfile(toolConsumerProfile, toolSettingsSimpleMediaType);
    if (toolSettings) {
      registrationData.toolSettingsService = toolSettings;
    }

    let result = getServiceFromConsumerProfile(toolConsumerProfile, resultMediaType);
    if (result) {
      registrationData.resultService = result;
    }
  }


  function getServiceFromConsumerProfile(tcProfile, type) {
    let service = _.find(tcProfile.service_offered, function (d) {
      console.log('format ' + d.format.valueOf());
      return _.contains(d.format, type);
    });
    if (!service) {
      console.log("no service found");
      return null;
    }
    return service;
  }


  function getToolConsumerProfile(url) {
    log.logStep('Calling TC Profile Endpoint', {url: url});

    log.logStep("Requesting TC profile at ", {uri: url});
    console.log("Requesting TC profile at " + url);

    return new Promise(function (resolve, reject) {

      request({
          url: url,
          timeouts: 10000,
        },
        function (error, response, body) {
          if (!error && response.statusCode === 200) {
            resolve(JSON.parse(body));
          } else {
            console.error(error.message);
            reject();
          }

        });
    });
  }


  function sendToolProxy(service, proxy, key, secret, registrationData) {
    log.logStep("Sending Tool Proxy to TC at ", {uri: service.endpoint});
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
          headers: {
            'Accept': 'application/vnd.ims.lti.v2.toolproxy.id+json',
            'Content-Type': 'application/vnd.ims.lti.v2.toolproxy+json'

          },
          json: proxy
        },
        function (error, response, body) {
          if (!error && response.statusCode === 201) {
            log.logStep("Tool Proxy Successfully Sent to TC", proxy);
            log.logStep('toolproxy POST response header', response.headers);
            log.logStep("toolproxy POST response :  ", response.body);

            // Save the tool proxy so we can handle launches from this consumer
            proxy.tool_proxy_guid = response.body.tool_proxy_guid;
            redisUtil.redisSave(proxy.tool_proxy_guid, proxy);
            registrationData.tool_guid = proxy.tool_proxy_guid;

            log.logStep("toolproxy saved to redis with guid : " + proxy.tool_proxy_guid);
            console.log("tool proxy sent; response: " + response.statusCode);
            resolve();
          } else {
            log.logStep("Error sending Tool Proxy to TC", {error: error, status: response.statusCode, proxy: proxy});
            console.log("Error sending tool proxy; error:" + error + " status: " + response.statusCode);
            console.log("Proxy json: " + JSON.stringify(proxy));
            resolve();
          }
        });
    });
  }
}()