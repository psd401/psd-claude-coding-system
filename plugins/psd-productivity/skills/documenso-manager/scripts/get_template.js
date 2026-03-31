#!/usr/bin/env bun

// Get template details by ID.
// Usage: bun get_template.js <template-id>

const { documensoFetch } = require('./documenso_client.js');

const templateId = process.argv[2];
if (!templateId) {
  console.error(JSON.stringify({ error: 'Template ID required.' }));
  process.exit(1);
}

async function getTemplate() {
  const result = await documensoFetch(`/template/${templateId}`);
  return result;
}

try {
  const result = await getTemplate();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
