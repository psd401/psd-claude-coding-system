#!/usr/bin/env bun

/**
 * DocuSign eSignature REST API v2.1 Client
 *
 * Extends BaseApiClient with JWT authentication, token caching, rate limiting,
 * and base URI discovery — features unique to DocuSign's auth model.
 *
 * Auth flow: RSA-signed JWT assertion → access token (1-hour expiry)
 * Rate limits: 3,000 calls/hour, 500 per 30 seconds
 */

const { readFileSync } = require('fs');
const { createSign } = require('crypto');
const { BaseApiClient, RateLimiter } = require('../../../scripts/api_client.js');
const { SECRETS } = require('../../../scripts/secrets.js');

// --- Configuration ---

const OAUTH_HOSTS = {
  production: 'account.docusign.com',
  demo: 'account-d.docusign.com',
};

// --- JWT Auth & URI Discovery (DocuSign-specific) ---

let _cachedToken = null;
let _cachedTokenExpiry = 0;
let _cachedBaseUri = null;

function _getOauthHost(config) {
  return OAUTH_HOSTS[config.environment] || OAUTH_HOSTS.production;
}

function buildJwtAssertion() {
  const config = SECRETS.docusign;
  const oauthHost = _getOauthHost(config);
  const now = Math.floor(Date.now() / 1000);

  const header = { typ: 'JWT', alg: 'RS256' };
  const payload = {
    iss: config.integrationKey,
    sub: config.userId,
    aud: oauthHost,
    iat: now,
    exp: now + 3600,
    scope: 'signature impersonation',
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = headerB64 + '.' + payloadB64;

  const privateKey = readFileSync(config.rsaKeyPath, 'utf-8');
  const sign = createSign('RSA-SHA256');
  sign.update(signingInput);
  const signature = sign.sign(privateKey, 'base64url');

  return signingInput + '.' + signature;
}

async function getAccessToken() {
  const now = Date.now();

  // Return cached token if still valid (refresh 5 minutes early)
  if (_cachedToken && _cachedTokenExpiry > now + 300000) {
    return _cachedToken;
  }

  const config = SECRETS.docusign;
  const oauthHost = _getOauthHost(config);
  const assertion = buildJwtAssertion();

  const resp = await fetch(`https://${oauthHost}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${assertion}`,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`DocuSign auth failed (${resp.status}): ${text}`);
  }

  const data = await resp.json();
  _cachedToken = data.access_token;
  _cachedTokenExpiry = now + (data.expires_in * 1000);

  return _cachedToken;
}

async function getBaseUri() {
  if (_cachedBaseUri) return _cachedBaseUri;

  const token = await getAccessToken();
  const config = SECRETS.docusign;
  const oauthHost = _getOauthHost(config);

  const resp = await fetch(`https://${oauthHost}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    throw new Error(`Failed to get user info: ${resp.status}`);
  }

  const userInfo = await resp.json();
  const account = userInfo.accounts.find(a => a.account_id === config.accountId);

  if (!account) {
    throw new Error(`Account ${config.accountId} not found. Available: ${userInfo.accounts.map(a => a.account_id).join(', ')}`);
  }

  _cachedBaseUri = account.base_uri + '/restapi/v2.1';
  return _cachedBaseUri;
}

// --- DocuSign Client (extends BaseApiClient) ---

const rateLimiter = new RateLimiter(480, 16);

class DocuSignClient extends BaseApiClient {
  constructor() {
    super({ rateLimiter });
  }

  get serviceName() { return 'docusign'; }
  get displayName() { return 'DocuSign'; }

  /**
   * DocuSign base URL is dynamic — discovered via OAuth userinfo.
   * This is called by the parent fetch() but we override fetch() entirely
   * because we need the async getBaseUri() + account path prefix.
   */
  buildBaseUrl(_config) {
    // Not used directly — see overridden fetch()
    return '';
  }

  async buildAuthHeaders(_config) {
    const token = await getAccessToken();
    return { Authorization: `Bearer ${token}` };
  }

  /**
   * Override fetch to use DocuSign's dynamic base URI + account path.
   */
  async fetch(path, options = {}) {
    if (this._rateLimiter) {
      await this._rateLimiter.acquire();
    }

    const baseUri = await getBaseUri();
    const config = this.getConfig();
    const token = await getAccessToken();

    const url = `${baseUri}/accounts/${config.accountId}${path}`;

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const fetchOptions = {
      method: options.method || 'GET',
      headers,
    };

    if (options.body) {
      fetchOptions.body = typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body);
    }

    const resp = await globalThis.fetch(url, fetchOptions);

    // Handle binary responses (PDF downloads)
    if (options.responseType === 'arraybuffer') {
      if (!resp.ok) {
        const text = await resp.text();
        return { error: `DocuSign API error ${resp.status}: ${text}` };
      }
      return resp.arrayBuffer();
    }

    // JSON response
    if (!resp.ok) {
      let errorDetail;
      try { errorDetail = await resp.text(); } catch { errorDetail = `HTTP ${resp.status}`; }
      return { error: `DocuSign API error ${resp.status}: ${errorDetail}` };
    }

    try { return await resp.json(); } catch { return { error: 'Failed to parse JSON response' }; }
  }
}

// Singleton instance
const client = new DocuSignClient();

// --- Backward-compatible exports (match original function signatures) --------

async function docusignFetch(path, options = {}) {
  return client.fetch(path, options);
}

async function docusignFetchAll(path, params = {}, itemsKey = 'envelopes', pageSize = 100) {
  const result = await client.fetchAllOffset(path, params, {
    pageSize,
    itemsKey,
    totalKey: ['totalSetSize', 'resultSetSize'],
  });
  // Preserve original return shape: { items, totalCount } instead of { data, count }
  if (result.error) return result;
  return { items: result.data, totalCount: result.count };
}

function sanitizeFilename(name, maxLength = 200) {
  if (!name) return 'untitled';
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

function getConfig() {
  const config = SECRETS.docusign;
  const oauthHost = _getOauthHost(config);
  return { ...config, oauthHost };
}

function getAccountInfo() {
  const config = getConfig();
  return {
    accountId: config.accountId,
    environment: config.environment,
    oauthHost: config.oauthHost,
  };
}

module.exports = {
  docusignFetch,
  docusignFetchAll,
  getAccessToken,
  getBaseUri,
  getConfig,
  getAccountInfo,
  sanitizeFilename,
  client,
};
