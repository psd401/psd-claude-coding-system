#!/usr/bin/env bun

// Distribute an envelope to recipients for signing (DRAFT → PENDING).
// Usage: bun distribute_envelope.js <envelope-id>
// WARNING: This sends signing emails to all recipients. Cannot be undone.

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required.' }));
  process.exit(1);
}

async function distributeEnvelope() {
  const result = await documensoFetch('/envelope/distribute', {
    method: 'POST',
    body: { envelopeId },
  });

  if (result.error) return result;

  return {
    success: true,
    distributed: true,
    id: envelopeId,
    url: getEnvelopeUrl(envelopeId),
    hint: 'Envelope sent to recipients. Status is now PENDING.',
  };
}

try {
  const result = await distributeEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
