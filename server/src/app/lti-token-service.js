import axios from 'axios';
import * as ltiAdv from './lti-adv';
import qs from 'qs';
import * as db from '../database/db-utility';

export const getLTIToken = async (clientId, tokenUrl, scope, nonce) => {
  console.log(`getLTIToken client ${clientId} tokenUrl: ${tokenUrl} scope: ${scope}`);
  const clientAssertion = ltiAdv.oauth2JWT(clientId, tokenUrl);

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
    cacheToken(token, nonce);

    return token;
  } catch (exception) {
    console.log(`getLTIToken exception ${JSON.stringify(exception)}`);
  }
};

export const getCachedLTIToken = async (nonce, clientId, tokenUrl, scope) => {
  let token = await db.getTokenFromNonce(`${nonce}:lti`);
  if (!token) {
    console.log(`Couldn't get cached token for nonce ${nonce}.`);

    token = await getLTIToken(clientId, tokenUrl, scope, nonce);
  }

  return token;
};

const cacheToken = (token, nonce) => {
  console.log(`cacheToken token ${token} nonce ${nonce}`);
  db.insertNewToken(`${nonce}:lti`, token);
};
