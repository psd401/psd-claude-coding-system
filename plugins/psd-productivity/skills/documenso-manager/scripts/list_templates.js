#!/usr/bin/env bun

// List all templates.
// Usage: bun list_templates.js [options-json]
// Options: {"page": 1, "perPage": 20}

const { documensoFetch } = require('./documenso_client.js');

let options = {};
if (process.argv[2]) {
  try { options = JSON.parse(process.argv[2]); }
  catch { console.error(JSON.stringify({ error: 'Invalid JSON options' })); process.exit(1); }
}

async function listTemplates() {
  const params = new URLSearchParams();
  params.set('page', String(options.page || 1));
  params.set('perPage', String(options.perPage || 50));

  const result = await documensoFetch(`/template?${params}`);
  if (result.error) return result;

  const templates = result.data || [];
  return {
    count: templates.length,
    templates: templates.map(t => ({
      id: t.id,
      title: t.title,
      type: t.type,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
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
