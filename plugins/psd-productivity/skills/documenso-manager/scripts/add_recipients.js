#!/usr/bin/env bun

// Add recipients to an envelope.
// Usage: bun add_recipients.js <envelope-id> '<recipients-json>'
//
// Recipients JSON example:
// [
//   {"email": "signer@psd401.net", "name": "Jane Doe", "role": "SIGNER", "signingOrder": 1},
//   {"email": "hr@psd401.net", "name": "HR Director", "role": "APPROVER", "signingOrder": 2},
//   {"email": "cc@psd401.net", "name": "CC Person", "role": "CC"}
// ]
//
// Roles: SIGNER, APPROVER, CC, VIEWER, ASSISTANT

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const recipientsArg = process.argv[3];

if (!envelopeId || !recipientsArg) {
  console.error(JSON.stringify({ error: 'Usage: bun add_recipients.js <envelope-id> \'<recipients-json>\'' }));
  process.exit(1);
}

let recipients;
try { recipients = JSON.parse(recipientsArg); }
catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }

async function addRecipients() {
  const result = await documensoFetch('/envelope/recipient/create-many', {
    method: 'POST',
    body: { envelopeId, data: Array.isArray(recipients) ? recipients : [recipients] },
  });
  return result;
}

try {
  const result = await addRecipients();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
