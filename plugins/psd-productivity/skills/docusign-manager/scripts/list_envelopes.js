#!/usr/bin/env bun

// List envelopes with filtering by date and status.
// Usage: bun list_envelopes.js [options-json]
//
// Options:
//   { "status": "completed", "from_date": "2024-01-01", "to_date": "2025-12-31",
//     "search": "search text", "limit": 25 }
//
// IMPORTANT: DocuSign requires from_date. If omitted, defaults to 2015-01-01.

const { docusignFetch } = require('./docusign_client.js');

const optionsArg = process.argv[2];
let options = {};
if (optionsArg) {
  try { options = JSON.parse(optionsArg); }
  catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }
}

async function listEnvelopes() {
  const params = new URLSearchParams();

  // from_date is REQUIRED — DocuSign silently defaults to 30 days ago if omitted
  params.set('from_date', options.from_date || '2015-01-01T00:00:00Z');

  if (options.to_date) params.set('to_date', options.to_date);
  if (options.status) params.set('status', options.status);
  if (options.search) params.set('search_text', options.search);

  params.set('count', String(options.limit || 25));
  params.set('start_position', '0');
  params.set('order', 'desc');
  params.set('order_by', 'last_modified');

  const result = await docusignFetch(`/envelopes?${params.toString()}`);

  if (result.error) return result;

  return {
    totalSetSize: result.totalSetSize,
    resultSetSize: result.resultSetSize,
    envelopes: (result.envelopes || []).map(e => ({
      envelopeId: e.envelopeId,
      emailSubject: e.emailSubject,
      status: e.status,
      sentDateTime: e.sentDateTime,
      completedDateTime: e.completedDateTime,
      createdDateTime: e.createdDateTime,
      senderName: e.sender?.userName || '',
      senderEmail: e.sender?.email || '',
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
