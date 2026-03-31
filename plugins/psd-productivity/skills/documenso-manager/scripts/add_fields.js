#!/usr/bin/env bun

// Add fields to a document within an envelope.
// Usage: bun add_fields.js <envelope-id> '<fields-json>'
//
// Fields JSON example:
// [
//   {
//     "recipientId": "recipient-id",
//     "type": "SIGNATURE",
//     "identifier": 0,
//     "page": 1,
//     "positionX": 55,
//     "positionY": 85,
//     "width": 40,
//     "height": 5,
//     "fieldMeta": {"label": "Sign here", "required": true}
//   }
// ]
//
// CRITICAL: positionX/Y, width, height are PERCENTAGES (0-100), NOT pixels.
//
// Field types: SIGNATURE, FREE_SIGNATURE, INITIALS, NAME, EMAIL, DATE,
//              TEXT, NUMBER, RADIO, CHECKBOX, DROPDOWN

const { documensoFetch } = require('./documenso_client.js');

const envelopeId = process.argv[2];
const fieldsArg = process.argv[3];

if (!envelopeId || !fieldsArg) {
  console.error(JSON.stringify({ error: 'Usage: bun add_fields.js <envelope-id> \'<fields-json>\'' }));
  process.exit(1);
}

let fields;
try { fields = JSON.parse(fieldsArg); }
catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }

// Validate percentage coordinates
const fieldArray = Array.isArray(fields) ? fields : [fields];
for (const f of fieldArray) {
  if (f.positionX > 100 || f.positionY > 100 || f.width > 100 || f.height > 100) {
    console.error(JSON.stringify({
      error: 'Field coordinates must be percentages (0-100), NOT pixels. Check positionX, positionY, width, height.',
    }));
    process.exit(1);
  }
}

async function addFields() {
  const result = await documensoFetch('/envelope/field/create-many', {
    method: 'POST',
    body: { envelopeId, data: fieldArray },
  });
  return result;
}

try {
  const result = await addFields();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
