#!/usr/bin/env bun

// Create a new workflow from JSON.
// Usage: bun create_workflow.js '<workflow-json>'
//    or: bun create_workflow.js @path/to/workflow.json
//
// The JSON must include at minimum: name, nodes, connections
// Returns the created workflow with its ID and editor URL.

const { readFileSync } = require('fs');
const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const input = process.argv[2];
if (!input) {
  console.error(JSON.stringify({
    error: 'Workflow JSON required. Usage: bun create_workflow.js \'<json>\' or bun create_workflow.js @file.json'
  }));
  process.exit(1);
}

let workflowData;
try {
  if (input.startsWith('@')) {
    const filePath = input.slice(1);
    workflowData = JSON.parse(readFileSync(filePath, 'utf-8'));
  } else {
    workflowData = JSON.parse(input);
  }
} catch (e) {
  console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` }));
  process.exit(1);
}

async function createWorkflow() {
  const result = await n8nFetch('/workflows', {
    method: 'POST',
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
  const result = await createWorkflow();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
