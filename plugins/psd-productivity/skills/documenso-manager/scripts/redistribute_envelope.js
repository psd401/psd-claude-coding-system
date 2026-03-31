#!/usr/bin/env bun

// Resend signing emails to recipients.
// Usage: bun redistribute_envelope.js <envelope-id>

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required.' }));
  process.exit(1);
}

async function redistributeEnvelope() {
  const result = await documensoFetch('/envelope/redistribute', {
    method: 'POST',
    body: { envelopeId },
  });
  if (result.error) return result;
  return { success: true, resent: true, id: envelopeId };
}

try {
  const result = await redistributeEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
