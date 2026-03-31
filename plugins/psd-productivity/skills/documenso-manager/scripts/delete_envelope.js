#!/usr/bin/env bun

// Delete an envelope by ID.
// Usage: bun delete_envelope.js <envelope-id>
// Shows envelope details before deletion for confirmation.

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required.' }));
  process.exit(1);
}

async function deleteEnvelope() {
  // Get details first
  const envelope = await documensoFetch(`/envelope/${envelopeId}`);
  if (envelope.error) return envelope;

  const info = {
    id: envelope.id || envelopeId,
    title: envelope.title,
    status: envelope.status,
  };

  const result = await documensoFetch('/envelope/delete', {
    method: 'POST',
    body: { envelopeId },
  });

  if (result.error) return { ...info, error: result.error };
  return { success: true, deleted: info };
}

try {
  const result = await deleteEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
