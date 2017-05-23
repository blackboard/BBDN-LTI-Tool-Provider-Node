import _ from  'lodash';
import configJson from '../../config/config.json';

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

}


if (configJsonOverride) {
  configResult = _.defaultsDeep(configJsonOverride, configJson);
}

export default  _.defaultsDeep(configResult, configJson);



