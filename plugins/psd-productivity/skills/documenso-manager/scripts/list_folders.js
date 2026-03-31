#!/usr/bin/env bun

// List all folders.
// Usage: bun list_folders.js

const { documensoFetch } = require('./documenso_client.js');

async function listFolders() {
  const result = await documensoFetch('/folder');
  return result;
}

try {
  const result = await listFolders();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
