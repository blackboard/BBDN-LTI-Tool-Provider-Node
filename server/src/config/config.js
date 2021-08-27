import _ from 'lodash';
import configJson from '../../config/config.json';
import * as fs from 'fs';

/**
 * Load the customized config values from the config.json data.
 *
 */

let overrides = '';

let configResult = {};
if (fs.existsSync('server/config/config_override.json')) {
  overrides = require('../../config/config_override.json');
  configResult = _.defaultsDeep(overrides, configJson);
}

if (process.env.LTI_TEST_PROVIDER_DOMAIN) {
  configResult['frontend_url'] = process.env.LTI_TEST_PROVIDER_DOMAIN;
}
if (process.env.LTI_TEST_PROVIDER_PORT) {
  configResult['provider_port'] = process.env.LTI_TEST_PROVIDER_PORT;
}
if (process.env.DATABASE_DIRECTORY) {
  configResult['database_directory'] = process.env.DATABASE_DIRECTORY;
}

export default _.defaultsDeep(configResult, configJson);
