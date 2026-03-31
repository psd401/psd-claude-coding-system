#!/usr/bin/env bun

// Create an envelope from a template (with optional prefill values).
// Usage: bun use_template.js <template-id> [options-json]
//
// Options JSON:
// {
//   "recipients": [{"email": "signer@psd401.net", "name": "Jane Doe"}],
//   "formValues": {"field-label": "prefilled value"},
//   "title": "Custom Title",
//   "externalId": "your-ref-123"
// }

const { documensoFetch, getEnvelopeUrl } = require('./documenso_client.js');

const templateId = process.argv[2];
const optionsArg = process.argv[3];

if (!templateId) {
  console.error(JSON.stringify({ error: 'Template ID required. Usage: bun use_template.js <template-id> [options-json]' }));
  process.exit(1);
}

let options = {};
if (optionsArg) {
  try { options = JSON.parse(optionsArg); }
  catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }
}

async function useTemplate() {
  const body = { templateId, ...options };
  const result = await documensoFetch('/envelope/use', {
    method: 'POST',
    body,
  });

  if (result.error) return result;

  const envelope = result.data || result;
  return {
    success: true,
    id: envelope.id,
    title: envelope.title,
    status: envelope.status,
    url: getEnvelopeUrl(envelope.id),
    hint: 'Envelope created from template as DRAFT. Use distribute_envelope.js to send.',
  };
}

try {
  const result = await useTemplate();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
