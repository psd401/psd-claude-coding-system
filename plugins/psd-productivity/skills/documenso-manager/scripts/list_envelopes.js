#!/usr/bin/env bun

// List/search envelopes with optional filters.
// Usage: bun list_envelopes.js [options-json]
// Options: {"status": "COMPLETED", "query": "contract", "page": 1, "perPage": 20}
//
// Status values: DRAFT, PENDING, COMPLETED, REJECTED

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

let options = {};
if (process.argv[2]) {
  try { options = JSON.parse(process.argv[2]); }
  catch { console.error(JSON.stringify({ error: 'Invalid JSON options' })); process.exit(1); }
}

async function listEnvelopes() {
  const params = new URLSearchParams();
  params.set('page', String(options.page || 1));
  params.set('perPage', String(options.perPage || 20));
  if (options.status) params.set('status', options.status);
  if (options.query) params.set('query', options.query);
  if (options.orderByColumn) params.set('orderByColumn', options.orderByColumn);
  if (options.orderByDirection) params.set('orderByDirection', options.orderByDirection);

  const result = await documensoFetch(`/envelope?${params}`);
  if (result.error) return result;

  const envelopes = result.data || [];
  return {
    count: envelopes.length,
    totalPages: result.totalPages,
    envelopes: envelopes.map(e => ({
      id: e.id,
      title: e.title,
      status: e.status,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
      completedAt: e.completedAt,
      recipients: (e.recipients || []).map(r => ({ name: r.name, email: r.email, role: r.role, signingStatus: r.signingStatus })),
      url: getEnvelopeUrl(e.id),
    })),
  };
}

try {
  const result = await listEnvelopes();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
