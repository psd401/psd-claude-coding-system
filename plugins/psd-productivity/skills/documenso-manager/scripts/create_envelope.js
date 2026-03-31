#!/usr/bin/env bun

// Create an envelope with PDF upload.
// Usage: bun create_envelope.js <pdf-path> '<options-json>'
//
// Options JSON:
// {
//   "title": "Employment Contract",
//   "recipients": [{"email": "signer@psd401.net", "name": "Jane Doe", "role": "SIGNER"}],
//   "meta": {"subject": "Please sign", "message": "Body text", "signingOrder": "PARALLEL"}
// }
//
// PDF path can be absolute or relative.

const { readFileSync } = require('fs');
const { basename } = require('path');
const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

const pdfPath = process.argv[2];
const optionsArg = process.argv[3];

if (!pdfPath) {
  console.error(JSON.stringify({
    error: 'PDF path required. Usage: bun create_envelope.js <pdf-path> \'<options-json>\''
  }));
  process.exit(1);
}

let options = {};
if (optionsArg) {
  try { options = JSON.parse(optionsArg); }
  catch (e) { console.error(JSON.stringify({ error: `Invalid options JSON: ${e.message}` })); process.exit(1); }
}

async function createEnvelope() {
  // Read PDF file
  let pdfBuffer;
  try {
    pdfBuffer = readFileSync(pdfPath);
  } catch (e) {
    return { error: `Cannot read PDF: ${e.message}` };
  }

  // Build the payload object
  const payload = {
    type: options.type || 'DOCUMENT',
    title: options.title || basename(pdfPath, '.pdf'),
  };

  if (options.recipients) payload.recipients = options.recipients;
  if (options.meta) payload.meta = options.meta;
  if (options.externalId) payload.externalId = options.externalId;
  if (options.folderId) payload.folderId = options.folderId;

  // Build multipart form data
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  formData.append('files', new Blob([pdfBuffer], { type: 'application/pdf' }), basename(pdfPath));

  const result = await documensoFetch('/envelope/create', {
    method: 'POST',
    body: formData,
  });

  if (result.error) return result;

  const envelope = result.data || result;
  return {
    success: true,
    id: envelope.id,
    title: envelope.title,
    status: envelope.status,
    url: getEnvelopeUrl(envelope.id),
    hint: 'Envelope created as DRAFT. Use distribute_envelope.js to send for signing.',
  };
}

try {
  const result = await createEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
