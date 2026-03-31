#!/usr/bin/env bun

// Check Documenso server connectivity and envelope count.
// Usage: bun health_check.js

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

async function healthCheck() {
  // List envelopes to verify connectivity
  const result = await documensoFetch('/envelope?page=1&perPage=1');
  if (result.error) {
    return { status: 'error', message: `Cannot connect to Documenso: ${result.error}` };
  }

  const totalEnvelopes = result.totalPages ? result.totalPages * (result.perPage || 1) : (result.data || []).length;

  return {
    status: 'healthy',
    uiUrl: getEnvelopeUrl('').replace('/documents/', ''),
    envelopes: {
      total: totalEnvelopes,
    },
  };
}

try {
  const result = await healthCheck();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ status: 'error', message: e.message }));
  process.exit(1);
}
