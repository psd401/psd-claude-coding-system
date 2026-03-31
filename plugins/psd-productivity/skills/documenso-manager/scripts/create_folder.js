#!/usr/bin/env bun

// Create a folder.
// Usage: bun create_folder.js <folder-name>

const { documensoFetch } = require('./documenso_client.js');

const name = process.argv[2];
if (!name) {
  console.error(JSON.stringify({ error: 'Folder name required.' }));
  process.exit(1);
}

async function createFolder() {
  const result = await documensoFetch('/folder/create', {
    method: 'POST',
    body: { name },
  });
  return result;
}

try {
  const result = await createFolder();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
