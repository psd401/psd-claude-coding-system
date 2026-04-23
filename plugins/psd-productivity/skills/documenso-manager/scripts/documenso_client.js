#!/usr/bin/env bun

/**
 * Documenso REST API v2 client.
 *
 * Extends BaseApiClient for authentication, error handling, and pagination.
 * IMPORTANT: Auth header is NOT Bearer — format is: Authorization: api_xxxxxxxx
 * The server URL is read from DOCUMENSO_HOST (env var or .env file) — never hardcoded.
 */

const { BaseApiClient, normalizeHost } = require('../../../scripts/api_client.js');

class DocumensoClient extends BaseApiClient {
  get serviceName() { return 'documenso'; }
  get displayName() { return 'Documenso'; }

  buildBaseUrl(config) {
    return `${normalizeHost(config.host)}/api/v2`;
  }

  buildAuthHeaders(config) {
    // Documenso uses raw API key (NOT Bearer)
    return { Authorization: config.apiKey };
  }

  buildUiUrl(config, resourceId) {
    return `${normalizeHost(config.host)}/documents/${resourceId}`;
  }
}

// Singleton instance
const client = new DocumensoClient();

// --- Backward-compatible exports (match original function signatures) --------

function getConfig() {
  const config = client.getConfig();
  const baseUrl = normalizeHost(config.host);
  return { baseUrl: `${baseUrl}/api/v2`, apiKey: config.apiKey };
}

async function documensoFetch(path, options = {}) {
  return client.fetch(path, options);
}

async function documensoFetchAll(path, params = {}, perPage = 50) {
  return client.fetchAllPages(path, params, {
    perPage,
    dataKeys: ['data', 'envelopes', 'templates', 'folders'],
  });
}

function getEnvelopeUrl(envelopeId) {
  return client.getUiUrl(envelopeId);
}

module.exports = { documensoFetch, documensoFetchAll, getEnvelopeUrl, getConfig, client };
