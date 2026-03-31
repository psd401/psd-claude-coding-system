#!/usr/bin/env bun

// Update fields on an envelope.
// Usage: bun update_fields.js <envelope-id> '<fields-json>'
// Each field must include its "id".

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const fieldsArg = process.argv[3];

if (!envelopeId || !fieldsArg) {
  console.error(JSON.stringify({ error: 'Usage: bun update_fields.js <envelope-id> \'<fields-json>\'' }));
  process.exit(1);
}

let fields;
try { fields = JSON.parse(fieldsArg); }
catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }

async function updateFields() {
  const result = await documensoFetch('/envelope/field/update-many', {
    method: 'POST',
    body: { envelopeId, data: Array.isArray(fields) ? fields : [fields] },
  });
  return result;
}

try {
  const result = await updateFields();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
