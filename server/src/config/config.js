import _ from "lodash";
import process from "process";
import configJson from "../../config/config.json";

/**
 * Load the customized config values from the config.json data.
 *
 * This file mostly just contains host names
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

// Load redis connection information from environment variables if present
// These are used in Marathon for application configuration
if (process.env.REDIS_PORT_6379_TCP_ADDR) {
  configResult["redis_host"] = process.env.REDIS_PORT_6379_TCP_ADDR;
}
if (process.env.REDIS_PORT_6379_TCP_PORT) {
  configResult["redis_port"] = process.env.REDIS_PORT_6379_TCP_PORT;
}
if (process.env.REDIS_URL) {
  configResult["redis_url"] = process.env.REDIS_URL;
}
if (process.env.LTI_POLL_PROVIDER_DOMAIN) {
  configResult["provider_domain"] = process.env.LTI_POLL_PROVIDER_DOMAIN;
}
if (process.env.LTI_POLL_PROVIDER_PORT) {
  configResult["provider_port"] = process.env.LTI_POLL_PROVIDER_PORT;
}
if (process.env.LTI_POLL_USE_SSL) {
  configResult["use_ssl"] = process.env.LTI_POOL_USE_SSL;
}
export default _.defaultsDeep(configResult, configJson);

console.log(JSON.stringify(configResult, null, 2));
