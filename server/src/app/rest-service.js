import axios from 'axios';
import config from '../config/config';
import * as db from '../database/db-utility';

export const getLearnRestToken = async (learnUrl, nonce) => {
  const auth_hash = new Buffer.from(`${config.appKey}:${config.appSecret}`).toString('base64');
  const auth_string = `Basic ${auth_hash}`;
  console.log(`Auth string: ${auth_string}`);
  const options = {
    headers: {
      Authorization: auth_string,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };

  console.log(`Getting REST bearer token at ${learnUrl}`);
  try {
    const response = await axios.post(learnUrl, 'grant_type=authorization_code', options);
    const token = response.data.access_token;

    // Cache the REST token
    db.insertNewBearerToken(`${nonce}:rest`, token);
    return token;
  } catch (exception) {
    console.log(`Failed to get token with response ${JSON.stringify(exception)}`);
    return '';
  }
};

export const getCachedToken = async (nonce) => {
  return await db.getBearerTokenFromNonce(`${nonce}:rest`);
};
