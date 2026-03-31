#!/usr/bin/env bun

// Duplicate an existing envelope.
// Usage: bun duplicate_envelope.js <envelope-id>

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required.' }));
  process.exit(1);
}

async function duplicateEnvelope() {
  const result = await documensoFetch('/envelope/duplicate', {
    method: 'POST',
    body: { envelopeId },
  });

  if (result.error) return result;

  const envelope = result.data || result;
  return {
    success: true,
    id: envelope.id,
    title: envelope.title,
    status: envelope.status,
    url: getEnvelopeUrl(envelope.id),
  };
}

try {
  const result = await duplicateEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
