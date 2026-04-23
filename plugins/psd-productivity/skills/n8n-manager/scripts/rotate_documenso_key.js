#!/usr/bin/env bun

// Rotate the Documenso API key across every n8n workflow that uses it.
//
// Usage:
//   bun rotate_documenso_key.js <old_key> <new_key>
//   bun rotate_documenso_key.js --dry-run <old_key> <new_key>
//
// What it does:
//   1. Lists all workflows on the n8n instance
//   2. For each, fetches live JSON and counts occurrences of <old_key>
//   3. For workflows with matches: string-replaces old → new in the full JSON,
//      strips to API-allowed settings, and PUTs back
//   4. Prints a per-workflow result line
//
// Safe to re-run; workflows with zero matches are skipped.

const { n8nFetch, getEditorUrl } = require('./n8n_client.js');

const args = process.argv.slice(2);
const dryRun = args[0] === '--dry-run';
if (dryRun) args.shift();
const [oldKey, newKey] = args;

if (!oldKey || !newKey) {
  console.error(JSON.stringify({
    error: 'Usage: bun rotate_documenso_key.js [--dry-run] <old_key> <new_key>'
  }));
  process.exit(1);
}

if (!oldKey.startsWith('api_') || !newKey.startsWith('api_')) {
  console.error(JSON.stringify({
    error: 'Both keys must start with "api_" — refusing to do replacements that look unsafe.'
  }));
  process.exit(1);
}

const ALLOWED_SETTINGS = ['executionOrder', 'callerPolicy', 'errorWorkflow'];

function stripSettings(settings) {
  const out = {};
  for (const k of ALLOWED_SETTINGS) {
    if (settings && settings[k] !== undefined) out[k] = settings[k];
  }
  return out;
}

async function main() {
  const list = await n8nFetch('/workflows');
  const workflows = list.data || list.workflows || list || [];
  const results = [];

  for (const w of workflows) {
    const id = w.id;
    const name = w.name || '(unnamed)';
    let live;
    try { live = await n8nFetch(`/workflows/${id}`); } catch (e) { results.push({ id, name, status: 'fetch_failed', error: e.message }); continue; }

    const json = JSON.stringify(live);
    const count = (json.match(new RegExp(oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count === 0) continue;

    if (dryRun) {
      results.push({ id, name, status: 'would_update', references: count });
      continue;
    }

    const updatedJson = json.split(oldKey).join(newKey);
    const updated = JSON.parse(updatedJson);
    const body = {
      name: updated.name,
      nodes: updated.nodes,
      connections: updated.connections,
      settings: stripSettings(updated.settings),
    };

    try {
      await n8nFetch(`/workflows/${id}`, { method: 'PUT', body });
      results.push({ id, name, status: 'updated', references: count, url: getEditorUrl(id) });
    } catch (e) {
      results.push({ id, name, status: 'update_failed', references: count, error: e.message });
    }
  }

  console.log(JSON.stringify({
    dryRun,
    totalWorkflows: workflows.length,
    affectedWorkflows: results.length,
    results,
  }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
});
