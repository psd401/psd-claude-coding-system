#!/usr/bin/env bun

// List all n8n variables.
// Usage: bun list_variables.js

const { n8nFetchAll } = require('./n8n_client.js');

async function listVariables() {
  const result = await n8nFetchAll('/variables');
  if (result.error) return result;

  return {
    count: result.count,
    variables: result.data.map(v => ({
      id: v.id,
      key: v.key,
      value: v.value,
      type: v.type,
    })),
  };
}

try {
  const result = await listVariables();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
