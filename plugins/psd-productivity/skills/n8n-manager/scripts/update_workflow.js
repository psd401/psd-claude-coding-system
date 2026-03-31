#!/usr/bin/env bun

// Update an existing workflow by ID.
// Usage: bun update_workflow.js <workflow-id> '<workflow-json>'
//    or: bun update_workflow.js <workflow-id> @path/to/workflow.json
//
// WARNING: If the workflow is active, updating it auto-republishes the changes.

const { readFileSync } = require('fs');
const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const workflowId = process.argv[2];
const input = process.argv[3];

if (!workflowId || !input) {
  console.error(JSON.stringify({
    error: 'Usage: bun update_workflow.js <id> \'<json>\' or bun update_workflow.js <id> @file.json'
  }));
  process.exit(1);
}

let workflowData;
try {
  if (input.startsWith('@')) {
    workflowData = JSON.parse(readFileSync(input.slice(1), 'utf-8'));
  } else {
    workflowData = JSON.parse(input);
  }
} catch (e) {
  console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` }));
  process.exit(1);
}

async function updateWorkflow() {
  const result = await n8nFetch(`/workflows/${workflowId}`, {
    method: 'PUT',
    body: workflowData,
  });

  if (result.error) return result;

  return {
    success: true,
    id: result.id,
    name: result.name,
    active: result.active,
    nodeCount: (result.nodes || []).length,
    url: getEditorUrl(result.id),
  };
}

try {
  const result = await updateWorkflow();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
