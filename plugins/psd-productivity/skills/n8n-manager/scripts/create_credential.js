#!/usr/bin/env bun

// Create a credential.
// Usage: bun create_credential.js '<credential-json>'
//
// JSON format:
// {
//   "name": "My API Key",
//   "type": "httpHeaderAuth",
//   "data": { "name": "Authorization", "value": "Bearer xxx" }
// }
//
// Use get_credential_schema.js to discover required fields for a credential type.

const { n8nFetch } = require('./n8n_client.js');

const input = process.argv[2];
if (!input) {
  console.error(JSON.stringify({
    error: 'Credential JSON required. Usage: bun create_credential.js \'{"name":"...","type":"...","data":{...}}\''
  }));
  process.exit(1);
}

let credData;
try {
  credData = JSON.parse(input);
} catch (e) {
  console.error(JSON.stringify({ error: `Invalid JSON: ${e.message}` }));
  process.exit(1);
}

async function createCredential() {
  const result = await n8nFetch('/credentials', {
    method: 'POST',
    body: credData,
  });

  if (result.error) return result;

  return {
    success: true,
    id: result.id,
    name: result.name,
    type: result.type,
  };
}

try {
  const result = await createCredential();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
