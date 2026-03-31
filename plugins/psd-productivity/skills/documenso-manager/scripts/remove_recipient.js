#!/usr/bin/env bun

// Remove a recipient from an envelope.
// Usage: bun remove_recipient.js <envelope-id> <recipient-id>

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const recipientId = process.argv[3];

if (!envelopeId || !recipientId) {
  console.error(JSON.stringify({ error: 'Usage: bun remove_recipient.js <envelope-id> <recipient-id>' }));
  process.exit(1);
}

async function removeRecipient() {
  const result = await documensoFetch('/envelope/recipient/delete', {
    method: 'POST',
    body: { envelopeId, recipientId },
  });
  return result;
}

try {
  const result = await removeRecipient();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
