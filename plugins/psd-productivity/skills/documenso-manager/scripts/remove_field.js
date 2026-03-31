#!/usr/bin/env bun

// Remove a field from an envelope.
// Usage: bun remove_field.js <envelope-id> <field-id>

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const fieldId = process.argv[3];

if (!envelopeId || !fieldId) {
  console.error(JSON.stringify({ error: 'Usage: bun remove_field.js <envelope-id> <field-id>' }));
  process.exit(1);
}

async function removeField() {
  const result = await documensoFetch('/envelope/field/delete', {
    method: 'POST',
    body: { envelopeId, fieldId },
  });
  return result;
}

try {
  const result = await removeField();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
