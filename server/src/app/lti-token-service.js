import axios from 'axios';
import qs from 'qs';
import { oauth2JWT } from './lti-adv';
import { getAppById, getAuthFromState, insertNewAuthToken } from '../database/db-utility';

export const getLTIToken = async (clientId, tokenUrl, scope, nonce) => {
  const clientAssertion = oauth2JWT(clientId, tokenUrl);

  const options = {
    method: 'POST',
    url: tokenUrl,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  const body = {
    grant_type: 'client_credentials',
    client_assertion_type:
      'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
    client_assertion: clientAssertion,
    scope: scope
  };

  try {
    const response = await axios.post(tokenUrl, qs.stringify(body), options);
    const token = response.data.access_token;

    // Cache the LTI token
    await cacheToken(token, nonce);

    return token;
  } catch (exception) {
    console.log(`getLTIToken exception ${JSON.stringify(exception)}`);
  }
};

export const getCachedLTIToken = async (nonce, clientId, scope) => {
  let token = await getAuthFromState(`${nonce}`).lti_token;
  if (!token) {
    console.log(`Couldn't get cached token for nonce ${nonce}.`);
    const tokenUrl = getAppById(clientId).setup.jwtUrl;
    token = await getLTIToken(clientId, tokenUrl, scope, nonce);
    await insertNewAuthToken(nonce, token, 'lti_token');
  }

  return token;
};

const cacheToken = async (token, nonce) => {
  if (nonce) {
    await insertNewAuthToken(nonce, `${token}`, 'lti_token');
  }
};

// Keep a simple in memory cache of processor tokens
const tokenCache = {};
export const getProcessorToken = async(clientId, scope) => {
  let now = Date.now();
  if (!(clientId in tokenCache)) {
    tokenCache[clientId] = {};
  }

  if (scope in tokenCache[clientId]) {
    let cached = tokenCache[clientId][scope];
    if (cached['expiration'] > now) {
      return cached['token'];
    }
  }

  const tokenUrl = getAppById(clientId).setup.jwtUrl;
  let token =  await getLTIToken(clientId, tokenUrl, scope, null);
  tokenCache[clientId][scope] = {
    'expiration': now + 1000 * 60 * 30,
    'token': token
  };

  return token;
};
