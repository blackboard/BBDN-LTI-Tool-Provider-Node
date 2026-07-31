import { JsonDB } from 'node-json-db';
import { Config } from 'node-json-db/dist/lib/JsonDBConfig';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { jwk2pem } from 'pem-jwk';
import { v4 as uuidv4 } from 'uuid';
import config from '../config/config';
import { getAllAuth, getAppById } from '../database/db-utility';
import { getProcessorToken } from './lti-token-service';
import { URL } from 'url';

const PNS_DB_PATH = `${config.database_directory}/pns-deliveries-data`;
const PNS_SCOPE = 'https://purl.imsglobal.org/spec/lti/scope/noticehandlers';
const PNS_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/platformnotificationservice';
const CUSTOM_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/custom';
const NOTICE_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/notice';
const DEPLOYMENT_CLAIM = 'https://purl.imsglobal.org/spec/lti/claim/deployment_id';
// The platform currently advertises a single notice type. Kept as a list so additional notice types can
// be preferred in order once they exist; the platform's own supported list still takes precedence.
const NOTICE_TYPE_PREFERENCE = [ 'LtiAssetProcessorSubmissionNotice' ];

let pnsDb;
let failMode = false;

// Newest-first scan for a launch that carried the PNS claim. Both register and the status read need
// this, so it lives in one place. `notice_types_supported` comes straight from the claim - it is the
// platform telling us which notice types it will accept, so the UI can offer exactly those.
const findNewestPnsSession = (targetDeploymentId) => {
  const sessions = getAllAuth().slice().reverse();
  for (const session of sessions) {
    if (!session.auth || !session.auth.jwt) continue;
    const jwtBody = session.auth.jwt.body;
    const pnsClaim = jwtBody[PNS_CLAIM];
    const customClaim = jwtBody[CUSTOM_CLAIM];
    const claim = ( pnsClaim && pnsClaim.platform_notification_service_url ) ? pnsClaim
      : ( customClaim && customClaim.platform_notification_service_url ) ? customClaim
        : null;
    if (!claim) continue;

    const sessionDeploymentId = jwtBody[DEPLOYMENT_CLAIM];
    if (!sessionDeploymentId) continue;
    if (targetDeploymentId && sessionDeploymentId !== targetDeploymentId) continue;

    return {
      clientId: jwtBody.aud instanceof Array ? jwtBody.aud[0] : jwtBody.aud,
      pnsUrl: claim.platform_notification_service_url,
      deploymentId: sessionDeploymentId,
      noticeTypesSupported: claim.notice_types_supported || [],
      scopes: claim.scope || []
    };
  }
  return null;
};

// Failures worth explaining when registering or removing a handler on the platform.
const registerHint = (errorMsg) => {
  if (errorMsg.includes('401')) {
    return 'Ensure the noticehandlers scope is granted for this application';
  }
  if (errorMsg.includes('403')) {
    return 'Verify the deploymentId matches the platform\'s record';
  }
  if (errorMsg.includes('400')) {
    return 'The handler URL must be an HTTPS URL within the tool\'s registered domain';
  }
  return null;
};

// The two failures worth explaining on a verify: the scope was never granted, or the platform is
// running a build without the PNS endpoint at all (its router answers 404).
const verifyHint = (errorMsg) => {
  if (errorMsg.includes('401')) { 
    return 'Ensure the noticehandlers scope is granted in the Dev Portal';
  }
  if (errorMsg.includes('404')) {
    return 'Learn has no PNS endpoint - is it built from a branch with the PNS code?';
  }
  return null;
};

const initPnsDb = () => {
  if (!pnsDb) {
    pnsDb = new JsonDB(new Config(PNS_DB_PATH, true, true, '.'));
  }
};

export const setFailMode = (enabled) => {
  failMode = enabled;
};

export const getFailMode = () => failMode;

export const verifyPnsJwt = async (jwtString) => {
  const result = {
    verified: false,
    header: null,
    body: null,
    error: null
  };

  try {
    const parts = jwtString.split('.');
    result.header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
    result.body = JSON.parse(Buffer.from(parts[1], 'base64').toString());
  } catch (err) {
    result.error = 'Malformed JWT: ' + err.message;
    return result;
  }

  let signatureValid = false;

  try {
    if (config.pns_platform_public_key) {
      // Learn signs PNS notice JWTs with its LTI domain-config key (blti_domain_config.auth_key), not the
      // tool-application key registered in DevPortal, and sets no `kid` header on the notice JWT. The
      // DevPortal application-JWKS lookup below therefore cannot verify these tokens - it fetches this
      // tool's own keys, not Learn's signing key. Until Learn publishes a JWKS for its notice-signing key,
      // configure the matching public key (PEM) here to verify platform-signed notices.
      jwt.verify(jwtString, config.pns_platform_public_key, { algorithms: ['RS256'] });
      signatureValid = true;
    } else {
      let clientId;
      if (result.body.aud instanceof Array) {
        clientId = result.body.aud[0];
      } else {
        clientId = result.body.aud;
      }

      const appInfo = getAppById(clientId);
      if (!appInfo || !appInfo.setup) {
        result.error = 'No registered app found for aud: ' + clientId;
        return result;
      }
      const jwksUrl = appInfo.setup.devPortalUrl +
        '/api/v1/management/applications/' + clientId + '/jwks.json';
      const response = await axios.get(jwksUrl);
      const key = response.data.keys.find(k => k.kid === result.header.kid);
      if (!key) {
        result.error = 'No matching key found for kid: ' + result.header.kid +
          '. Notice JWTs from Learn currently carry no kid - set pns_platform_public_key in config.json' +
          ' to verify against Learn\'s auth_key public key instead.';
        return result;
      }
      jwt.verify(jwtString, jwk2pem(key), { algorithms: ['RS256'] });
      signatureValid = true;
    }
  } catch (err) {
    result.error = 'JWT signature verification failed: ' + err.message;
    return result;
  }

  const issues = [];
  const body = result.body;
  if (!body.iss) {
    issues.push('missing iss');
  }
  if (!body.nonce) {
    issues.push('missing nonce');
  }
  if (!body[DEPLOYMENT_CLAIM]) {
    issues.push('missing deployment_id');
  }
  const notice = body[NOTICE_CLAIM];
  if (!notice) {
    issues.push('missing notice claim');
  } else {
    if (!notice.id) {
      issues.push('missing notice.id');
    }
    if (!NOTICE_TYPE_PREFERENCE.includes(notice.type)) {
      issues.push('unexpected notice.type: ' + notice.type);
    }
    if (!notice.timestamp || isNaN(Date.parse(notice.timestamp))) {
      issues.push('missing or invalid notice.timestamp');
    }
  }

  if (issues.length > 0) {
    result.error = 'Claim validation failed: ' + issues.join('; ');
  }
  result.verified = signatureValid && issues.length === 0;
  return result;
};

export const receivePnsNotification = async (req, res) => {
  try {
    initPnsDb();
    let notices = [];

    if (Array.isArray(req.body.notices)) {
      if (typeof req.body.notices[0] === 'string') {
        notices = req.body.notices;
      } else if (typeof req.body.notices[0] === 'object' && req.body.notices[0].jwt) {
        notices = req.body.notices.map(n => n.jwt);
      }
    }

    if (notices.length === 0) {
      return res.status(400).json({ error: 'Missing or invalid notices array' });
    }

    const results = [];

    for (const jwtString of notices) {
      const verification = await verifyPnsJwt(jwtString);
      const body = verification.body;
      const noticeClaim = body && body[NOTICE_CLAIM];
      const noticeId = noticeClaim && noticeClaim.id;

      const existingRecords = pnsDb.exists('.deliveries')
        ? pnsDb.getData('.deliveries')
        : [];
      const isDuplicate = Boolean(noticeId) &&
        existingRecords.some(r => r.noticeId === noticeId);

      const record = {
        id: uuidv4(),
        receivedAt: new Date().toISOString(),
        verified: verification.verified,
        error: verification.error,
        jwtHeader: verification.header,
        jwtBody: body,
        noticeType: noticeClaim && noticeClaim.type,
        noticeId: noticeId,
        deploymentId: body && body[DEPLOYMENT_CLAIM],
        isDuplicate: isDuplicate,
        rawJwt: jwtString
      };

      pnsDb.push('.deliveries[]', record);

      results.push({
        status: 'received',
        verified: verification.verified,
        error: verification.error,
        noticeType: record.noticeType,
        noticeId: record.noticeId,
        isDuplicate: isDuplicate
      });
    }

    if (failMode) {
      console.warn('Fail mode active - returning 500 to trigger retry');
      return res.status(500).json({ error: 'Injected failure', results });
    }

    res.json({ status: 'received', notices: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const showPnsStatus = async (req, res) => {
  try {
    initPnsDb();
    let deliveries = [];
    let registrations = [];
    if (pnsDb.exists('.deliveries')) deliveries = pnsDb.getData('.deliveries');
    if (pnsDb.exists('.registrations')) registrations = pnsDb.getData('.registrations');
    const lastDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;

    // Additive: the newest launch's PNS claim, so the UI can offer only the notice types the
    // platform actually advertises instead of asking the tester to type one correctly. Null before
    // the first Asset Processor launch.
    let launchClaim = null;
    try {
      launchClaim = findNewestPnsSession(null);
    } catch (err) {
      launchClaim = null;
    }

    res.json({
      handlerUrl: config.frontend_url + 'pns',
      deliveryCount: deliveries.length,
      registrations: registrations,
      lastDelivery: lastDelivery,
      failMode: failMode,
      launchClaim: launchClaim
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read-only counterpart to register/unregister: asks Learn what handlers it currently holds and
// compares them against what we think we registered. Uses the stored registration's clientId, so
// unlike register it needs no launch session, and it never writes anything on either side. This is
// the safe way to confirm the OAuth token exchange and Learn's GET endpoint are both working.
export const verifyPnsRegistration = async (req, res) => {
  initPnsDb();

  let registrations = [];
  if (pnsDb.exists('.registrations')) {
    registrations = pnsDb.getData('.registrations');
  }
  if (registrations.length === 0) {
    return res.status(400).json({
      error: 'No local registrations to verify',
      hint: 'Register first via POST /pns/register'
    });
  }

  const targetDeploymentId = req.body && req.body.deploymentId;
  const targets = targetDeploymentId
    ? registrations.filter(r => r.deploymentId === targetDeploymentId)
    : registrations;
  if (targets.length === 0) {
    return res.status(400).json({
      error: 'No registration found for deploymentId: ' + targetDeploymentId,
      hint: 'Use GET /pns to list active registrations'
    });
  }

  const checks = [];
  for (const registration of targets) {
    const pnsEndpoint = new URL(registration.pnsUrl);
    pnsEndpoint.searchParams.append('deploymentId', registration.deploymentId);

    try {
      const token = await getProcessorToken(registration.clientId, PNS_SCOPE);
      const response = await axios.get(pnsEndpoint.toString(), {
        headers: { Authorization: 'Bearer ' + token }
      });
      const handlers = ( response.data && response.data.notice_handlers ) || [];
      const match = handlers.find(h => h.notice_type === registration.noticeType);
      checks.push({
        deploymentId: registration.deploymentId,
        noticeType: registration.noticeType,
        expectedHandler: registration.handlerUrl,
        platformHandler: match ? match.handler : null,
        inSync: Boolean(match) && match.handler === registration.handlerUrl,
        platformNoticeHandlers: handlers
      });
    } catch (err) {
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      checks.push({
        deploymentId: registration.deploymentId,
        noticeType: registration.noticeType,
        expectedHandler: registration.handlerUrl,
        inSync: false,
        error: errorMsg,
        hint: verifyHint(errorMsg)
      });
    }
  }

  const failed = checks.filter(c => !c.inSync);
  return res.status(failed.length > 0 ? 400 : 200).json({
    status: failed.length === 0 ? 'in-sync' : 'out-of-sync',
    checked: checks.length,
    outOfSync: failed.length,
    checks: checks
  });
};

export const showPnsDeliveries = async (req, res) => {
  try {
    initPnsDb();
    let deliveries = [];
    if (pnsDb.exists('.deliveries')) deliveries = pnsDb.getData('.deliveries');
    const sorted = deliveries.slice().sort((a, b) =>
      new Date(b.receivedAt) - new Date(a.receivedAt));
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const registerPnsHandler = async (req, res) => {
  initPnsDb();
  let clientId = null;
  let pnsUrl = null;
  let deploymentId = null;
  let foundSession = null;

  const targetDeploymentId = req.body && req.body.deploymentId;
  const targetNoticeType = req.body && req.body.notice_type;
  const targetHandler = req.body && req.body.handler;

  if (targetDeploymentId && typeof targetDeploymentId !== 'string') {
    return res.status(400).json({ error: 'deploymentId must be a string' });
  }
  if (targetNoticeType && typeof targetNoticeType !== 'string') {
    return res.status(400).json({ error: 'notice_type must be a string' });
  }
  if (targetHandler && typeof targetHandler !== 'string') {
    return res.status(400).json({ error: 'handler must be a string' });
  }
  if (targetHandler && !targetHandler.startsWith('https://')) {
    return res.status(400).json({
      error: 'handler must be an HTTPS URL',
      hint: 'Learn requires HTTPS URLs for webhook handlers'
    });
  }

  try {
    foundSession = findNewestPnsSession(targetDeploymentId);
    if (foundSession) {
      clientId = foundSession.clientId;
      pnsUrl = foundSession.pnsUrl;
      deploymentId = foundSession.deploymentId;
    }
  } catch (err) {
    return res.status(500).json({
      error: 'Failed to read launch sessions',
      detail: err.message,
      hint: 'Check that database/auth-data.json exists and is valid JSON, then launch the AP placement again.'
    });
  }

  if (!foundSession) {
    if (targetDeploymentId) {
      return res.status(400).json({
        error: 'No launch session with PNS claim found for deploymentId: ' + targetDeploymentId,
        hint: 'Launch the Asset Processor placement for deployment ' + targetDeploymentId + ' via Learn first.'
      });
    }
    return res.status(400).json({
      error: 'No PNS claim found in any launch session',
      hint: 'Launch the Asset Processor placement via Learn first. Only AP placements include the platformnotificationservice claim.'
    });
  }

  const pnsEndpoint = new URL(pnsUrl);
  pnsEndpoint.searchParams.append('deploymentId', deploymentId);
  const discoveryUrl = pnsEndpoint.toString();

  try {
    const token = await getProcessorToken(clientId, PNS_SCOPE);
    const discoveryResponse = await axios.get(discoveryUrl, {
      headers: { Authorization: 'Bearer ' + token }
    });
    const discovery = discoveryResponse.data;

    let discoveredTypes = [];
    if (discovery.notice_handlers && discovery.notice_handlers.length > 0) {
      discoveredTypes = discovery.notice_handlers.map(h => h.notice_type);
    }

    if (targetNoticeType) {
      if (discoveredTypes.length > 0 && !discoveredTypes.includes(targetNoticeType)) {
        return res.status(400).json({
          error: 'Notice type "' + targetNoticeType + '" is not supported by this deployment. Supported types: ' + discoveredTypes.join(', '),
          hint: 'Use one of the supported types or omit notice_type to auto-select'
        });
      }
    }

    let noticeType = targetNoticeType;
    if (!noticeType) {
      if (discoveredTypes.length === 0) {
        return res.status(400).json({
          error: 'Platform returned no supported notice types for deploymentId: ' + deploymentId,
          hint: 'Check that feature.asset.processor.pns is enabled for the tenant on the Learn side'
        });
      }
      const noticeHandler =
        NOTICE_TYPE_PREFERENCE
          .map(type => discovery.notice_handlers.find(h => h.notice_type === type))
          .find(Boolean) ||
        discovery.notice_handlers[0];
      noticeType = noticeHandler.notice_type;
    }

    const handlerUrl = targetHandler || (config.frontend_url + 'pns');

    await axios.put(discoveryUrl, {
      notice_type: noticeType,
      handler: handlerUrl
    }, {
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    });

    if (pnsDb.exists('.registrations')) {
      const existing = pnsDb.getData('.registrations');
      const indicesToRemove = [];
      existing.forEach((reg, idx) => {
        if (reg.deploymentId === deploymentId && reg.noticeType === noticeType && reg.clientId === clientId) {
          indicesToRemove.push(idx);
        }
      });
      indicesToRemove.reverse().forEach(idx => {
        pnsDb.delete('.registrations[' + idx + ']');
      });
    }

    const registration = {
      clientId: clientId,
      pnsUrl: pnsUrl,
      deploymentId: deploymentId,
      noticeType: noticeType,
      handlerUrl: handlerUrl,
      registeredAt: new Date().toISOString(),
      discovery: discovery
    };
    pnsDb.push('.registrations[]', registration);

    res.json({
      status: 'registered',
      deploymentId: deploymentId,
      clientId: clientId,
      noticeType: noticeType,
      handlerUrl: handlerUrl,
      discoveredTypes: discoveredTypes,
      discovery: discovery
    });
  } catch (err) {
    const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
    res.status(400).json({
      status: 'failed',
      error: 'Registration failed: ' + errorMsg,
      hint: registerHint(errorMsg)
    });
  }
};

export const unregisterPnsHandler = async (req, res) => {
  initPnsDb();

  const targetDeploymentId = req.body && req.body.deploymentId;
  if (!targetDeploymentId) {
    return res.status(400).json({
      error: 'deploymentId is required',
      hint: 'Provide the deploymentId from the launch JWT\'s https://purl.imsglobal.org/spec/lti/claim/deployment_id claim'
    });
  }

  let registrations = [];
  if (pnsDb.exists('.registrations')) {
    registrations = pnsDb.getData('.registrations');
  }

  if (registrations.length === 0) {
    return res.status(400).json({
      error: 'No active registrations found',
      hint: 'Register first via POST /pns/register'
    });
  }

  const targetRegistrations = registrations.filter(r => r.deploymentId === targetDeploymentId);
  if (targetRegistrations.length === 0) {
    return res.status(400).json({
      error: 'No registration found for deploymentId: ' + targetDeploymentId,
      hint: 'Use GET /pns to list active registrations'
    });
  }

  const errors = [];
  const indicesToRemove = [];
  const unregisteredNoticeTypes = [];

  for (const registration of targetRegistrations) {
    const pnsEndpoint = new URL(registration.pnsUrl);
    pnsEndpoint.searchParams.append('deploymentId', registration.deploymentId);

    try {
      const token = await getProcessorToken(registration.clientId, PNS_SCOPE);
      await axios.put(pnsEndpoint.toString(), {
        notice_type: registration.noticeType,
        handler: ''
      }, {
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      const errorMsg = err.response ? JSON.stringify(err.response.data) : err.message;
      errors.push({
        noticeType: registration.noticeType,
        deploymentId: registration.deploymentId,
        error: errorMsg,
        hint: registerHint(errorMsg)
      });
      continue;
    }

    indicesToRemove.push(registrations.indexOf(registration));
    unregisteredNoticeTypes.push(registration.noticeType);
  }

  indicesToRemove.sort((a, b) => b - a).forEach(idx => {
    pnsDb.delete('.registrations[' + idx + ']');
  });

  const successCount = targetRegistrations.length - errors.length;

  if (errors.length > 0 && successCount > 0) {
    return res.status(400).json({
      status: 'partial',
      deploymentId: targetDeploymentId,
      unregistered: successCount,
      failed: errors.length,
      errors: errors
    });
  }

  if (errors.length > 0) {
    return res.status(500).json({
      status: 'failed',
      deploymentId: targetDeploymentId,
      unregistered: 0,
      failed: errors.length,
      errors: errors
    });
  }

  const uniqueTypes = [...new Set(unregisteredNoticeTypes)];
  res.json({
    status: 'unregistered',
    deploymentId: targetDeploymentId,
    noticeTypes: uniqueTypes,
    count: successCount
  });
};
