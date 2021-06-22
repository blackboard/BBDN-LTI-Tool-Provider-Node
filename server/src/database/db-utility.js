import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

const apps = new JsonDB(new Config('server/src/database/applications-data', true, true, '.'));
const cim = new JsonDB(new Config('server/src/database/cim-data',true,true,'.'));
const auth = new JsonDB(new Config('server/src/database/auth-data', true, true, '.'));
const configData = new JsonDB(new Config('server/src/database/config-data', true, true, '.'));

const jwtApi = '/api/v1/gateway/oauth2/jwttoken';
const oidcApi = '/api/v1/gateway/oidcauth';

export const getAllApplications = () => {
  return apps.getData('.applications-data');
}

export const getAppById = (appId) => {
  //console.log("Asking the database for this application: " + appId)
  try {
    const appIndex = apps.getIndex('.applications-data', appId);
    return apps.getData(`.applications-data[${appIndex}]`);
  } catch (error) {
    return error;
  }
}

export const insertNewApp = (app) => {
  if ( !apps.exists(`.applications-data.${app.id}`) ) {
    try {
      apps.push('.applications-data[]', {
        "id": app.appId,
        "setup": {
          "name": app.name,
          "key": app.appKey,
          "secret": app.appSecret,
          "devPortalUrl": app.devPortalUrl,
          "jwtUrl":`${app.devPortalUrl}${jwtApi}`,
          "oidcUrl": `${app.devPortalUrl}${oidcApi}`,
          "issuer": "www.blackboard.com"
        }
      });
      return "success";
    } catch (error) {
      return error;
    }
  } else {
    return 'application already exists'
  }
}

export const deleteAppById = (appId) => {
  try {
    const app = apps.getIndex('.applications-data', appId)
    apps.delete(`.applications-data[${app}]`);
    return `${appId} has been deleted`
  } catch (e) {
    return e;
  }
}

export const insertConfig = (config) => {
  try {
    apps.push('.config-data[]', {
      "privateKey": config.privateKey,
      "publicKey": config.publicKey
    });
    return "success";
  } catch (error) {
    return error;
  }
}

export const getConfig = () => {
  try {
    return configData.getData('.config-data[0]');
  } catch (error) {
    return error;
  }
}

export const getAuthFromState = (state) => {
  try {
    const index = auth.getIndex('.auth-data', state);
    return auth.getData(`.auth-data[${index}].auth`);
  } catch (error) {
    return error;
  }
}

export const insertNewState = (state) => {
  if (!auth.exists(`.auth-data.${state}`)) {
    try {
      auth.push('.auth-data[]', {
        state: state
      })
      return 'success';
    } catch (e) {
      return e;
    }
  } else {
    //console.log(`${state} already has a record`)
  }
}

export const insertNewAuthToken = async (state, token, type) => {
  const index = auth.getIndex('.auth-data', state, 'state');
  try {
    auth.push(`.auth-data[${index}]`, {
      "auth": {
        [type]: token
      }
    }, false);
    return "success";
  } catch (e) {
    return e;
  }
}

export const insertNewCIM = (cimKey, cim) => {
    try {
      cim.push('.cim-data[]', {
        key: cimKey,
        message: cim
      });
      return "success";
    } catch (error) {
      return error;
    }
}

export const getCIMFromKey = (cimKey) => {
  try {
    const index = cim.getIndex('.cim-data', cimKey);
    return cim.getData(`.cim-data[${index}]`);
  } catch (error) {
    //console.log(error);
  }
}

export const getSecretFromKey = (appKey) => {
  try {
    const index = apps.getIndex('.applications-data', appKey);
    console.log(`[${index}]${appKey}`);
    return apps.getData(`.applications-data[${index}]`);
  } catch (error) {
    console.log(error);
  }
}
