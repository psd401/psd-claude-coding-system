#!/usr/bin/env bun

// List all workflows with optional filters.
// Usage: bun list_workflows.js [options-json]
// Options: {"tag": "psd-production", "active": true}
//
// Examples:
//   bun list_workflows.js                         # all workflows
//   bun list_workflows.js '{"active": true}'      # only active
//   bun list_workflows.js '{"tag": "psd-staging"}'# by tag name

const { n8nFetchAll, getEditorUrl } = require('./n8n_client.js');

let options = {};
if (process.argv[2]) {
  try {
    options = JSON.parse(process.argv[2]);
  } catch {
    console.error(JSON.stringify({ error: 'Invalid JSON options. Usage: bun list_workflows.js \'{"tag":"name","active":true}\'' }));
    process.exit(1);
  }
}

async function listWorkflows() {
  const params = {};
  if (options.tag) params.tags = options.tag;
  if (options.active === true) params.active = 'true';
  if (options.active === false) params.active = 'false';

  const result = await n8nFetchAll('/workflows', params);
  if (result.error) return result;

  return {
    count: result.count,
    workflows: result.data.map(w => ({
      id: w.id,
      name: w.name,
      active: w.active,
      tags: (w.tags || []).map(t => t.name),
      nodeCount: (w.nodes || []).length,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      url: getEditorUrl(w.id),
    })),
  };
}

try {
  const result = await listWorkflows();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
