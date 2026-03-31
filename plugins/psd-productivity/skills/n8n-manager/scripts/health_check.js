#!/usr/bin/env bun

// Check n8n server connectivity, version, and workflow count.
// Usage: bun health_check.js

const { n8nFetch, n8nFetchAll, getEditorUrl } = require('./n8n_client.js');

async function healthCheck() {
  // 1. Check connectivity by listing workflows (lightweight endpoint)
  const workflows = await n8nFetchAll('/workflows');
  if (workflows.error) {
    return {
      status: 'error',
      message: `Cannot connect to n8n server: ${workflows.error}`,
    };
  }

  const activeCount = workflows.data.filter(w => w.active).length;
  const inactiveCount = workflows.data.filter(w => !w.active).length;

  // 2. Get tags for context
  const tags = await n8nFetchAll('/tags');
  const tagCount = tags.error ? 0 : tags.count;

  return {
    status: 'healthy',
    editorUrl: getEditorUrl('').replace('/workflow/', ''),
    workflows: {
      total: workflows.count,
      active: activeCount,
      inactive: inactiveCount,
    },
    tags: tagCount,
  };
}

try {
  const result = await healthCheck();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ status: 'error', message: e.message }));
  process.exit(1);
}
