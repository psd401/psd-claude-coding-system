#!/usr/bin/env bun

// Get JSON schema for a credential type.
// Usage: bun get_credential_schema.js <credential-type-name>
//
// Example: bun get_credential_schema.js httpHeaderAuth
//          bun get_credential_schema.js slackOAuth2Api

const { n8nFetch } = require('./n8n_client.js');

const credType = process.argv[2];
if (!credType) {
  console.error(JSON.stringify({
    error: 'Credential type name required. Usage: bun get_credential_schema.js <type>\nExample: bun get_credential_schema.js httpHeaderAuth'
  }));
  process.exit(1);
}

async function getCredentialSchema() {
  const result = await n8nFetch(`/credentials/schema/${credType}`);
  return result;
}

try {
  const result = await getCredentialSchema();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
