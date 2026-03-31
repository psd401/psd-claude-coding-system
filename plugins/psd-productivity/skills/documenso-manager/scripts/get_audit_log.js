#!/usr/bin/env bun

// Get audit log for an envelope.
// Usage: bun get_audit_log.js <envelope-id>

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required.' }));
  process.exit(1);
}

async function getAuditLog() {
  const result = await documensoFetch(`/envelope/${envelopeId}/audit-log`);
  return result;
}

try {
  const result = await getAuditLog();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
