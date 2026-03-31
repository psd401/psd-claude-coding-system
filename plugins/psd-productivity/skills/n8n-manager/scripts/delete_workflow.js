#!/usr/bin/env bun

// Delete a workflow by ID.
// Usage: bun delete_workflow.js <workflow-id>
//
// Outputs workflow details (name, active status) before deletion
// so the caller can confirm the right workflow is being deleted.
// NOTE: The n8n REST API does not have a DELETE /workflows/{id} endpoint.
// This script uses the undocumented endpoint if available, otherwise reports the gap.

const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const workflowId = process.argv[2];
if (!workflowId) {
  console.error(JSON.stringify({ error: 'Workflow ID required. Usage: bun delete_workflow.js <id>' }));
  process.exit(1);
}

async function deleteWorkflow() {
  // First, get the workflow details so the user can see what's being deleted
  const workflow = await n8nFetch(`/workflows/${workflowId}`);
  if (workflow.error) return workflow;

  const info = {
    id: workflow.id,
    name: workflow.name,
    active: workflow.active,
    nodeCount: (workflow.nodes || []).length,
  };

  // Attempt deletion
  const result = await n8nFetch(`/workflows/${workflowId}`, { method: 'DELETE' });

  if (result.error) {
    return {
      ...info,
      error: result.error,
      hint: 'If DELETE is not supported, deactivate and remove manually from the n8n UI.',
    };
  }

  return {
    success: true,
    deleted: info,
  };
}

try {
  const result = await deleteWorkflow();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
