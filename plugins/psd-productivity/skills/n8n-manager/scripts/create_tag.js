#!/usr/bin/env bun

// Create a tag.
// Usage: bun create_tag.js <tag-name>

const { n8nFetch } = require('./n8n_client.js');

const tagName = process.argv[2];
if (!tagName) {
  console.error(JSON.stringify({ error: 'Tag name required. Usage: bun create_tag.js <name>' }));
  process.exit(1);
}

async function createTag() {
  const result = await n8nFetch('/tags', {
    method: 'POST',
    body: { name: tagName },
  });
  return result;
}

try {
  const result = await createTag();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
