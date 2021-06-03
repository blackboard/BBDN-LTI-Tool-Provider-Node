import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';

const apps = new JsonDB(new Config('server/src/database/applications-data', true, true, '.'));
const cim = new JsonDB(new Config('server/src/database/cim-data',true,true,'.'));
const jwt = new JsonDB(new Config('server/src/database/jwt-data', true, true, '.'));
const rest = new JsonDB(new Config('server/src/database/rest-data', true, true, '.'));
const session = new JsonDB(new Config('server/src/database/session-data', true, true, '.'));
const configData = new JsonDB(new Config('server/src/database/config-data', true, true, '.'));

const jwtApi = '/api/v1/gateway/oauth2/jwttoken';
const oidcApi = '/api/v1/gateway/oidcauth';

export const getAllApplications = () => {
  return apps.getData('.applications-data');
}

export const getAppById = (appId) => {
  console.log("Asking the database for this application: " + appId)
  try {
    const appIndex = apps.getIndex('.applications-data', appId);
    return apps.getData(`.applications-data[${appIndex}]`);
  } catch (error) {
    console.log(error);
  }
}

export const insertNewApp = (app) => {
  if ( !apps.exists(`.applications-data.${app.id}`) ) {
    try {
      apps.push('.applications-data[]', {
        "id": app.appId,
        "setup": {
          "name": app.name,
          "devPortalUrl": app.devPortalUrl,
          "jwtUrl":`${app.devPortalUrl}${jwtApi}`,
          "oidcUrl": `${app.devPortalUrl}${oidcApi}`,
          "issuer": "Blackboard"
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

export const getConfig = () => {
  try {
    return configData.getData('.config-data[0]');
  } catch (error) {
    console.log(error);
  }
}

export const getTokenFromNonce = (nonce) => {
  try {
    const index = session.getIndex('.session-data', nonce);
    return session.getData(`.session-data[${index}]`);
  } catch (error) {
    console.log(error);
  }
}

export const insertNewToken = (lnonce, ltoken) => {
  if (!session.exists(`.session.${nonce.lnonce}`)) {
    try {
      session.push('.session[]', {
        nonce: lnonce,
        token: ltoken
      });
      return "success";
    } catch (error) {
      return error;
    }
  } else {
    console.log(`Session already exists for ${lnonce}`)
  }
}

export const insertNewBearerToken = (bnonce, btoken) => {
  if (!rest.exists(`.rest-data.${nonce.bnonce}`)) {
    try {
      rest.push('.rest-data[]', {
        nonce: bnonce,
        token: btoken
      })
    } catch (error) {
      return error;
    }
  } else {
    console.log(`Token already saved for ${bnonce}`)
  }
}

export const getBearerTokenFromNonce = (bnonce) => {
  try {
    const index = rest.getIndex('.rest-data', bnonce);
    return rest.getData(`.rest-data[${index}]`);
  } catch (error) {
    console.log(error);
  }
}

export const insertNewCIM = (cimKey, cim) => {
  if (!cim.exists(`.cim-data.${key.cimKey}`)) {
    try {
      cim.push('.cim-data[]', {
        key: cimKey,
        message: cim
      });
      return "success";
    } catch (error) {
      return error;
    }
  } else {
    console.log(`Message already exists for ${cimKey}`)
  }
}

export const getCIMFromKey = (cimKey) => {
  try {
    const index = cim.getIndex('.cim-data', cimKey);
    return cim.getData(`.cim-data[${index}]`);
  } catch (error) {
    console.log(error);
  }
}

export const insertNewJWT = (sstate, sjwt) => {
  if (!jwt.exists(`.jwt-data.${jwt.sjwt}`)) {
    try {
      jwt.push('.jwt-data[]', {
        state: sstate,
        jwt: sjwt
      })
      return 'success';
    } catch (error) {
      console.log(`JWT already exists for ${sstate}`);
    }
  }
}

export const getJWTFromState = (sstate) => {
  try {
    const index = jwt.getIndex('.jwt-data', sstate);
    return jwt.getData(`.jwt-data[${index}]`);
  } catch (error) {
    console.log(error)
  }
}
