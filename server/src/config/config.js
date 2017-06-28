import _ from "lodash";
import configJson from "../../config/config.json";
import process from "process";

/**
 * Load the customized config values from the config.json data.
 *
 * This file mostly just contains host names
 */

let configJsonOverride = null;
let configResult = {};
try {
  configJsonOverride = require('../../config/config_override.json');
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

export default _.defaultsDeep(configResult, configJson);

console.log(JSON.stringify(configResult, null, 2));
