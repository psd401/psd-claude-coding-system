#!/usr/bin/env bun

// List all tags.
// Usage: bun list_tags.js

const { n8nFetchAll } = require('./n8n_client.js');

async function listTags() {
  const result = await n8nFetchAll('/tags');
  if (result.error) return result;

  return {
    count: result.count,
    tags: result.data.map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    })),
  };
}

try {
  const result = await listTags();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
