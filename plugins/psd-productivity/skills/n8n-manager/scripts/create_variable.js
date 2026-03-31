#!/usr/bin/env bun

// Create an n8n variable.
// Usage: bun create_variable.js <key> <value>

const { n8nFetch } = require('./n8n_client.js');

const key = process.argv[2];
const value = process.argv[3];

if (!key || value === undefined) {
  console.error(JSON.stringify({ error: 'Usage: bun create_variable.js <key> <value>' }));
  process.exit(1);
}

async function createVariable() {
  const result = await n8nFetch('/variables', {
    method: 'POST',
    body: { key, value },
  });
  return result;
}

try {
  const result = await createVariable();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
