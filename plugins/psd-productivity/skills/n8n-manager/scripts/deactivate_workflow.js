#!/usr/bin/env bun

// Deactivate a workflow by ID.
// Usage: bun deactivate_workflow.js <workflow-id>

const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const workflowId = process.argv[2];
if (!workflowId) {
  console.error(JSON.stringify({ error: 'Workflow ID required. Usage: bun deactivate_workflow.js <id>' }));
  process.exit(1);
}

async function deactivateWorkflow() {
  const result = await n8nFetch(`/workflows/${workflowId}/deactivate`, { method: 'POST' });
  if (result.error) return result;

  return {
    success: true,
    id: result.id,
    name: result.name,
    active: result.active,
    url: getEditorUrl(result.id),
  };
}

try {
  const result = await deactivateWorkflow();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
