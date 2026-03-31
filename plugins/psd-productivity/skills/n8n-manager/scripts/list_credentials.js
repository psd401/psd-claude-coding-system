#!/usr/bin/env bun

// List all credentials (metadata only — secrets are never exposed via API).
// Usage: bun list_credentials.js

const { n8nFetchAll } = require('./n8n_client.js');

async function listCredentials() {
  const result = await n8nFetchAll('/credentials');
  if (result.error) return result;

  return {
    count: result.count,
    credentials: result.data.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  };
}

try {
  const result = await listCredentials();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
