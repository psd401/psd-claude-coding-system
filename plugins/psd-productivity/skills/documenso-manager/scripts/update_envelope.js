#!/usr/bin/env bun

// Update envelope metadata.
// Usage: bun update_envelope.js '<options-json>'
// Options: {"envelopeId": "xxx", "title": "New Title", "meta": {...}}

const { documensoFetch } = require('./documenso_client.js');

const input = process.argv[2];
if (!input) {
  console.error(JSON.stringify({ error: 'Options JSON required with envelopeId.' }));
  process.exit(1);
}

let options;
try { options = JSON.parse(input); }
catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }

if (!options.envelopeId) {
  console.error(JSON.stringify({ error: 'envelopeId is required in the options JSON.' }));
  process.exit(1);
}

async function updateEnvelope() {
  const result = await documensoFetch('/envelope/update', { method: 'POST', body: options });
  return result;
}

try {
  const result = await updateEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
