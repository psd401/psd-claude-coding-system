#!/usr/bin/env bun

// Update recipients on an envelope.
// Usage: bun update_recipients.js <envelope-id> '<recipients-json>'
// Each recipient in the array must include its "id" field.

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const recipientsArg = process.argv[3];

if (!envelopeId || !recipientsArg) {
  console.error(JSON.stringify({ error: 'Usage: bun update_recipients.js <envelope-id> \'<recipients-json>\'' }));
  process.exit(1);
}

let recipients;
try { recipients = JSON.parse(recipientsArg); }
catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }

async function updateRecipients() {
  const result = await documensoFetch('/envelope/recipient/update-many', {
    method: 'POST',
    body: { envelopeId, data: Array.isArray(recipients) ? recipients : [recipients] },
  });
  return result;
}

try {
  const result = await updateRecipients();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
