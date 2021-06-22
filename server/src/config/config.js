import _ from "lodash";
import configJson from "../../config/config.json";

/**
 * Load the customized config values from the config.json data.
 *
 */

let configJsonOverride = null;
let configResult = {};
try {
  configJsonOverride = require("../../config/config_override.json");
} catch (ex) {
  // Ignore error if no override configuration file is present
}

if (configJsonOverride) {
  configResult = _.defaultsDeep(configJsonOverride, configJson);
}

if (process.env.LTI_TEST_PROVIDER_DOMAIN) {
  configResult["frontend_url"] = process.env.LTI_TEST_PROVIDER_DOMAIN;
}
if (process.env.LTI_TEST_PROVIDER_PORT) {
  configResult["provider_port"] = process.env.LTI_TEST_PROVIDER_PORT;
}
if (process.env.LTI_TEST_USE_SSL) {
  configResult["use_ssl"] = process.env.LTI_TEST_USE_SSL;
}
export default _.defaultsDeep(configResult, configJson);

// console.log(JSON.stringify(configResult, null, 2));
