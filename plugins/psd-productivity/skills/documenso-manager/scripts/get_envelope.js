#!/usr/bin/env bun

// Get envelope details by ID (includes recipients, fields, items).
// Usage: bun get_envelope.js <envelope-id>

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required. Usage: bun get_envelope.js <id>' }));
  process.exit(1);
}

async function getEnvelope() {
  const result = await documensoFetch(`/envelope/${envelopeId}`);
  if (result.error) return result;
  return { ...result, url: getEnvelopeUrl(envelopeId) };
}

try {
  const result = await getEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
