#!/usr/bin/env bun

/**
 * Shared n8n REST API client.
 *
 * Handles authentication, error responses, and cursor-based pagination.
 * All scripts import this module for consistent API access.
 *
 * The server URL is read from N8N_HOST (env var or .env file) — never hardcoded.
 */

const { SECRETS } = require('../../../scripts/secrets.js');

function getConfig() {
  const { host, apiKey } = SECRETS.n8n;
  // Support both "host:port" and "http://host:port" formats
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  return { baseUrl: `${baseUrl}/api/v1`, apiKey };
}

/**
 * Make an authenticated request to the n8n REST API.
 *
 * @param {string} path - API path (e.g., '/workflows')
 * @param {object} options - fetch options (method, body, headers)
 * @returns {object} Parsed JSON response or error object
 */
async function n8nFetch(path, options = {}) {
  const { baseUrl, apiKey } = getConfig();
  const url = `${baseUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'X-N8N-API-KEY': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail;
    try {
      errorDetail = JSON.parse(errorText);
    } catch {
      errorDetail = errorText;
    }
    return {
      error: `n8n API error ${response.status}: ${typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail}`,
      status: response.status,
    };
  }

  // Some endpoints return empty responses (204 No Content)
  const text = await response.text();
  if (!text) return { success: true };

  try {
    return JSON.parse(text);
  } catch {
    return { data: text };
  }
}

/**
 * Fetch all pages from a paginated n8n list endpoint.
 *
 * n8n uses cursor-based pagination with `limit` and `cursor` query params.
 *
 * @param {string} path - API path (e.g., '/workflows')
 * @param {object} params - Additional query parameters
 * @param {number} limit - Items per page (default 100)
 * @returns {object} { data: [...], count: N } or error object
 */
async function n8nFetchAll(path, params = {}, limit = 100) {
  let cursor = undefined;
  const allData = [];

  do {
    const qs = new URLSearchParams({ limit: String(limit), ...params });
    if (cursor) qs.set('cursor', cursor);

    const result = await n8nFetch(`${path}?${qs}`);
    if (result.error) return result;

    const items = result.data || [];
    allData.push(...items);
    cursor = result.nextCursor;
  } while (cursor);

  return { data: allData, count: allData.length };
}

/**
 * Get the n8n editor URL for a workflow.
 * Reads N8N_HOST dynamically — never hardcodes a URL.
 */
function getEditorUrl(workflowId) {
  const { host } = SECRETS.n8n;
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  return `${baseUrl}/workflow/${workflowId}`;
}

module.exports = { n8nFetch, n8nFetchAll, getEditorUrl, getConfig };
