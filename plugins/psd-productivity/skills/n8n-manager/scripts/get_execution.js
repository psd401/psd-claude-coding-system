#!/usr/bin/env bun

// Get execution details by ID.
// Usage: bun get_execution.js <execution-id> [--full]
//
// Add --full to include complete execution data (node inputs/outputs).

const { n8nFetch } = require('./n8n_client.js');

const executionId = process.argv[2];
if (!executionId) {
  console.error(JSON.stringify({ error: 'Execution ID required. Usage: bun get_execution.js <id> [--full]' }));
  process.exit(1);
}

const includeFull = process.argv.includes('--full');

async function getExecution() {
  const qs = includeFull ? '?includeData=true' : '';
  const result = await n8nFetch(`/executions/${executionId}${qs}`);
  if (result.error) return result;

  const summary = {
    id: result.id,
    workflowId: result.workflowId,
    workflowName: result.workflowName,
    status: result.status,
    startedAt: result.startedAt,
    stoppedAt: result.stoppedAt,
    mode: result.mode,
  };

  if (includeFull && result.data) {
    summary.data = result.data;
  }

  return summary;
}

try {
  const result = await getExecution();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
