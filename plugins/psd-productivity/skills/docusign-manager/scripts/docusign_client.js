#!/usr/bin/env bun

/**
 * DocuSign eSignature REST API v2.1 Client
 *
 * Handles JWT authentication, token caching, rate limiting, and pagination.
 * Used by all DocuSign manager scripts.
 *
 * Auth flow: RSA-signed JWT assertion → access token (1-hour expiry)
 * Rate limits: 3,000 calls/hour, 500 per 30 seconds
 */

const { readFileSync } = require('fs');
const { createSign } = require('crypto');
const { SECRETS } = require('../../../scripts/secrets.js');

// --- Configuration ---

const OAUTH_HOSTS = {
  production: 'account.docusign.com',
  demo: 'account-d.docusign.com',
};

const API_HOSTS = {
  production: 'docusign.net',
  demo: 'docusign.net',
};

let _cachedToken = null;
let _cachedTokenExpiry = 0;
let _cachedBaseUri = null;

function getConfig() {
  const config = SECRETS.docusign;
  const oauthHost = OAUTH_HOSTS[config.environment] || OAUTH_HOSTS.production;
  return { ...config, oauthHost };
}

// --- JWT Authentication ---

function buildJwtAssertion() {
  const config = getConfig();
  const now = Math.floor(Date.now() / 1000);

  const header = {
    typ: 'JWT',
    alg: 'RS256',
  };

  const payload = {
    iss: config.integrationKey,
    sub: config.userId,
    aud: config.oauthHost,
    iat: now,
    exp: now + 3600, // 1 hour
    scope: 'signature impersonation',
  };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url');
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signingInput = headerB64 + '.' + payloadB64;

  // Read RSA private key
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

  const config = getConfig();
  const assertion = buildJwtAssertion();

  const resp = await fetch(`https://${config.oauthHost}/oauth/token`, {
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

// --- Base URI Discovery ---

async function getBaseUri() {
  if (_cachedBaseUri) return _cachedBaseUri;

  const token = await getAccessToken();
  const config = getConfig();

  const resp = await fetch(`https://${config.oauthHost}/oauth/userinfo`, {
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

// --- Rate Limiter (Token Bucket) ---

class RateLimiter {
  constructor(maxTokens = 480, refillRate = 16) {
    this.maxTokens = maxTokens;       // Max burst (below 500/30s hard limit)
    this.refillRate = refillRate;       // Tokens per second
    this.tokens = maxTokens;
    this.lastRefill = Date.now();
  }

  async acquire() {
    this._refill();

    if (this.tokens < 1) {
      // Wait for a token
      const waitMs = Math.ceil((1 - this.tokens) / this.refillRate * 1000);
      await new Promise(resolve => setTimeout(resolve, waitMs));
      this._refill();
    }

    this.tokens -= 1;
  }

  _refill() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
}

const rateLimiter = new RateLimiter();

// --- API Fetch ---

async function docusignFetch(path, options = {}) {
  await rateLimiter.acquire();

  const baseUri = await getBaseUri();
  const token = await getAccessToken();
  const config = getConfig();

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

  const resp = await fetch(url, fetchOptions);

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
    try {
      errorDetail = await resp.text();
    } catch {
      errorDetail = `HTTP ${resp.status}`;
    }
    return { error: `DocuSign API error ${resp.status}: ${errorDetail}` };
  }

  try {
    return await resp.json();
  } catch {
    return { error: 'Failed to parse JSON response' };
  }
}

/**
 * Paginated fetch — handles DocuSign's start_position/count pagination.
 * Returns all items across pages.
 *
 * @param {string} path - API path
 * @param {object} params - Query parameters (including any filters)
 * @param {string} itemsKey - Key in response containing the array (e.g., 'envelopeTemplates', 'envelopes')
 * @param {number} pageSize - Items per page (max 100 for most endpoints)
 */
async function docusignFetchAll(path, params = {}, itemsKey = 'envelopes', pageSize = 100) {
  const allItems = [];
  let startPosition = 0;
  let totalCount = null;

  while (true) {
    const queryParams = new URLSearchParams({
      ...params,
      count: String(pageSize),
      start_position: String(startPosition),
    });

    const result = await docusignFetch(`${path}?${queryParams.toString()}`);

    if (result.error) return result;

    const items = result[itemsKey] || [];
    allItems.push(...items);

    // Get total from response (varies by endpoint)
    if (totalCount === null) {
      totalCount = parseInt(result.totalSetSize || result.resultSetSize || '0', 10);
    }

    // Check if we have all items
    if (items.length < pageSize || allItems.length >= totalCount) {
      break;
    }

    startPosition += pageSize;
  }

  return { items: allItems, totalCount: totalCount || allItems.length };
}

// --- Helpers ---

function sanitizeFilename(name, maxLength = 200) {
  if (!name) return 'untitled';
  return name
    .replace(/[/\\:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, maxLength);
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
};
