#!/usr/bin/env bun

// Check Documenso server connectivity and envelope count.
// Usage: bun health_check.js

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');
const { runHealthCheck } = require('../../../scripts/health_check_base.js');

runHealthCheck(async () => {
  const result = await documensoFetch('/envelope?page=1&perPage=1');
  if (result.error) {
    return { status: 'error', message: `Cannot connect to Documenso: ${result.error}` };
  }

  const totalEnvelopes = result.totalPages ? result.totalPages * (result.perPage || 1) : (result.data || []).length;

  return {
    status: 'healthy',
    uiUrl: getEnvelopeUrl('').replace('/documents/', ''),
    envelopes: { total: totalEnvelopes },
  };
});
