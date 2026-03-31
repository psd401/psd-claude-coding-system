#!/usr/bin/env bun

// List workflow executions with optional filters.
// Usage: bun list_executions.js [options-json]
// Options: {"workflowId": "123", "status": "error", "limit": 20}
//
// Status values: error, success, waiting, running
//
// Examples:
//   bun list_executions.js                                 # recent executions
//   bun list_executions.js '{"status": "error"}'           # failed only
//   bun list_executions.js '{"workflowId": "5"}'           # for specific workflow

const { n8nFetchAll } = require('./n8n_client.js');

let options = {};
if (process.argv[2]) {
  try {
    options = JSON.parse(process.argv[2]);
  } catch {
    console.error(JSON.stringify({ error: 'Invalid JSON options' }));
    process.exit(1);
  }
}

async function listExecutions() {
  const params = {};
  if (options.workflowId) params.workflowId = options.workflowId;
  if (options.status) params.status = options.status;

  const limit = options.limit || 20;
  const result = await n8nFetchAll('/executions', params, limit);
  if (result.error) return result;

  return {
    count: result.count,
    executions: result.data.map(e => ({
      id: e.id,
      workflowId: e.workflowId,
      workflowName: e.workflowName,
      status: e.status,
      startedAt: e.startedAt,
      stoppedAt: e.stoppedAt,
      mode: e.mode,
    })),
  };
}

try {
  const result = await listExecutions();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
