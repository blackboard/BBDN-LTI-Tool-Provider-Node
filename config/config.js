var _ = require('lodash');

/**
 * Load the customized config values from the config.json data.
 *
 * This file mostly just contains host names
 */
var config = module.exports = {};

var configJson = require('./config.json');
try {
  var configJsonOverride = require('./config_override.json');
  configJson = _.defaultsDeep(configJsonOverride, configJson);
} catch (e) {
  // There's no override
}
_.defaultsDeep(config, configJson);

