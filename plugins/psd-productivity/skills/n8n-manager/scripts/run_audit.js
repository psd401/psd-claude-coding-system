#!/usr/bin/env bun

// Generate a security audit report for the n8n instance.
// Usage: bun run_audit.js [categories-json]
//
// Categories (optional): ["credentials", "database", "nodes", "filesystem", "instance"]
// Default: all categories

const { n8nFetch } = require('./n8n_client.js');

let categories;
if (process.argv[2]) {
  try {
    categories = JSON.parse(process.argv[2]);
  } catch {
    console.error(JSON.stringify({ error: 'Invalid JSON categories array' }));
    process.exit(1);
  }
}

async function runAudit() {
  const body = categories ? { categories } : {};
  const result = await n8nFetch('/audit', {
    method: 'POST',
    body,
  });
  return result;
}

try {
  const result = await runAudit();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
