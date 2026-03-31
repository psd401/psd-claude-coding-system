#!/usr/bin/env bun

/**
 * Shared Documenso REST API v2 client.
 *
 * Handles authentication and pagination.
 * IMPORTANT: Auth header is NOT Bearer — format is: Authorization: api_xxxxxxxx
 * The server URL is read from DOCUMENSO_HOST (env var or .env file) — never hardcoded.
 */

const { SECRETS } = require('../../../scripts/secrets.js');

function getConfig() {
  const { host, apiKey } = SECRETS.documenso;
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  return { baseUrl: `${baseUrl}/api/v2`, apiKey };
}

/**
 * Make an authenticated request to the Documenso v2 API.
 * Auth header: Authorization: api_xxxxxxxx (NOT Bearer)
 */
async function documensoFetch(path, options = {}) {
  const { baseUrl, apiKey } = getConfig();
  const url = `${baseUrl}${path}`;

  const headers = {
    Authorization: apiKey,
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body
        ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body))
        : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorDetail;
    try { errorDetail = JSON.parse(errorText); } catch { errorDetail = errorText; }
    return {
      error: `Documenso API error ${response.status}: ${typeof errorDetail === 'object' ? JSON.stringify(errorDetail) : errorDetail}`,
      status: response.status,
    };
  }

  const text = await response.text();
  if (!text) return { success: true };
  try { return JSON.parse(text); } catch { return { data: text }; }
}

/**
 * Fetch paginated list from Documenso.
 * Uses page/perPage pagination.
 */
async function documensoFetchAll(path, params = {}, perPage = 50) {
  let page = 1;
  const allData = [];

  do {
    const qs = new URLSearchParams({ page: String(page), perPage: String(perPage), ...params });
    const result = await documensoFetch(`${path}?${qs}`);
    if (result.error) return result;

    const items = result.data || result.envelopes || result.templates || result.folders || [];
    if (items.length === 0) break;
    allData.push(...items);
    if (items.length < perPage) break;
    page++;
  } while (true);

  return { data: allData, count: allData.length };
}

/**
 * Get the Documenso UI URL for an envelope.
 */
function getEnvelopeUrl(envelopeId) {
  const { host } = SECRETS.documenso;
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  return `${baseUrl}/documents/${envelopeId}`;
}

module.exports = { documensoFetch, documensoFetchAll, getEnvelopeUrl, getConfig };
