#!/usr/bin/env bun

// Retry a failed execution.
// Usage: bun retry_execution.js <execution-id>

const { n8nFetch } = require('./n8n_client.js');

const executionId = process.argv[2];
if (!executionId) {
  console.error(JSON.stringify({ error: 'Execution ID required. Usage: bun retry_execution.js <id>' }));
  process.exit(1);
}

async function retryExecution() {
  const result = await n8nFetch(`/executions/${executionId}/retry`, { method: 'POST' });
  if (result.error) return result;

  return {
    success: true,
    retried: executionId,
    data: result,
  };
}

try {
  const result = await retryExecution();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
