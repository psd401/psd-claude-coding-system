#!/usr/bin/env bun

// Get a workflow by ID (full JSON including nodes and connections).
// Usage: bun get_workflow.js <workflow-id>

const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const workflowId = process.argv[2];
if (!workflowId) {
  console.error(JSON.stringify({ error: 'Workflow ID required. Usage: bun get_workflow.js <id>' }));
  process.exit(1);
}

async function getWorkflow() {
  const result = await n8nFetch(`/workflows/${workflowId}`);
  if (result.error) return result;

  return {
    ...result,
    url: getEditorUrl(workflowId),
  };
}

try {
  const result = await getWorkflow();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
