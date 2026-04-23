#!/usr/bin/env bun

// Rotate the Documenso API key across every n8n workflow that uses it.
//
// Usage:
//   bun rotate_documenso_key.js <old_key> <new_key>
//   bun rotate_documenso_key.js --dry-run <old_key> <new_key>
//
// What it does:
//   1. Lists all workflows on the n8n instance (paginated via n8nFetchAll)
//   2. For each, fetches live JSON and counts occurrences of <old_key>
//   3. For workflows with matches: string-replaces old → new in the full JSON,
//      strips only read-only fields (id, createdAt, etc.), and PUTs back
//   4. Prints a per-workflow result line (exits non-zero if any update fails)
//
// Safe to re-run; workflows with zero matches are skipped.

const { n8nFetch, n8nFetchAll, getEditorUrl } = require('./n8n_client.js');

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

// Read-only fields returned by GET that the PUT endpoint rejects.
const READ_ONLY_FIELDS = ['id', 'createdAt', 'updatedAt', 'versionId'];

async function main() {
  // Use n8nFetchAll to paginate through all workflows (n8nFetch only returns one page)
  const list = await n8nFetchAll('/workflows');
  if (list.error) {
    console.error(JSON.stringify({ error: `Failed to list workflows: ${list.error}` }));
    process.exit(1);
  }
  const workflows = list.data || [];
  const results = [];
  let hasFailures = false;

  for (const w of workflows) {
    const id = w.id;
    const name = w.name || '(unnamed)';

    // Fetch the full live workflow — n8nFetch returns {error} on failure, does not throw
    const live = await n8nFetch(`/workflows/${id}`);
    if (live.error) {
      results.push({ id, name, status: 'fetch_failed', error: live.error });
      hasFailures = true;
      continue;
    }

    const json = JSON.stringify(live);
    const count = (json.match(new RegExp(oldKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    if (count === 0) continue;

    if (dryRun) {
      results.push({ id, name, status: 'would_update', references: count });
      continue;
    }

    // Replace key in the full workflow JSON, then strip only read-only fields
    // that the API rejects on PUT. This preserves all workflow metadata (tags,
    // active, staticData, pinData, settings, etc.) instead of destructively
    // rebuilding a partial body.
    const updatedJson = json.split(oldKey).join(newKey);
    const updated = JSON.parse(updatedJson);
    for (const field of READ_ONLY_FIELDS) {
      delete updated[field];
    }

    const putResult = await n8nFetch(`/workflows/${id}`, { method: 'PUT', body: updated });
    if (putResult.error) {
      results.push({ id, name, status: 'update_failed', references: count, error: putResult.error });
      hasFailures = true;
    } else {
      results.push({ id, name, status: 'updated', references: count, url: getEditorUrl(id) });
    }
  }

  console.log(JSON.stringify({
    dryRun,
    totalWorkflows: workflows.length,
    affectedWorkflows: results.length,
    results,
  }, null, 2));

  if (hasFailures) process.exit(1);
}

main().catch((e) => {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
});
