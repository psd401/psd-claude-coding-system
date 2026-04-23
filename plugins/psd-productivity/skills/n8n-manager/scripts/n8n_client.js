#!/usr/bin/env bun

/**
 * n8n REST API client.
 *
 * Extends BaseApiClient for authentication, error handling, and cursor-based pagination.
 * The server URL is read from N8N_HOST (env var or .env file) — never hardcoded.
 */

const { BaseApiClient, normalizeHost } = require('../../../scripts/api_client.js');
const { SECRETS } = require('../../../scripts/secrets.js');

class N8nClient extends BaseApiClient {
  get serviceName() { return 'n8n'; }
  get displayName() { return 'n8n'; }

  buildBaseUrl(config) {
    return `${normalizeHost(config.host)}/api/v1`;
  }

  buildAuthHeaders(config) {
    return {
      'X-N8N-API-KEY': config.apiKey,
      Accept: 'application/json',
    };
  }

  buildUiUrl(config, resourceId) {
    return `${normalizeHost(config.host)}/workflow/${resourceId}`;
  }
}

// Singleton instance
const client = new N8nClient();

// --- Backward-compatible exports (match original function signatures) --------

function getConfig() {
  const config = client.getConfig();
  const baseUrl = normalizeHost(config.host);
  return { baseUrl: `${baseUrl}/api/v1`, apiKey: config.apiKey };
}

async function n8nFetch(path, options = {}) {
  return client.fetch(path, options);
}

async function n8nFetchAll(path, params = {}, limit = 100) {
  return client.fetchAllCursor(path, params, { limit });
}

function getEditorUrl(workflowId) {
  return client.getUiUrl(workflowId);
}

module.exports = { n8nFetch, n8nFetchAll, getEditorUrl, getConfig, client };
