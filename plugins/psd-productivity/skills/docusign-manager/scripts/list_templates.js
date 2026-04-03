#!/usr/bin/env bun

// List all templates in the DocuSign account.
// Usage: bun list_templates.js [options-json]
//
// Options: { "folder": "folder-name", "search": "search-text" }

const { docusignFetchAll } = require('./docusign_client.js');

const optionsArg = process.argv[2];
let options = {};
if (optionsArg) {
  try { options = JSON.parse(optionsArg); }
  catch (e) { console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` })); process.exit(1); }
}

async function listTemplates() {
  const params = {};
  if (options.folder) params.folder = options.folder;
  if (options.search) params.search_text = options.search;

  const result = await docusignFetchAll('/templates', params, 'envelopeTemplates', 100);

  if (result.error) return result;

  return {
    count: result.totalCount,
    templates: result.items.map(t => ({
      templateId: t.templateId,
      name: t.name,
      description: t.description || '',
      created: t.created,
      lastModified: t.lastModified,
      shared: t.shared === 'true',
      folderName: t.folderName || '',
      emailSubject: t.emailSubject || '',
    })),
  };
}

try {
  const result = await listTemplates();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
