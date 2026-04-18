#!/usr/bin/env bun

// List folders in an n8n project via MCP.
// Usage: bun list_folders.js [projectId] [query]
//
// If projectId is omitted, searches for the default project first.
// Optional query filters folders by name (case-insensitive partial match).

const { mcpCall } = require('./n8n_mcp_client.js');
const { n8nFetchAll } = require('./n8n_client.js');

const projectId = process.argv[2];
const query = process.argv[3];

async function findDefaultProject() {
  // Get projectId from first workflow's shared field — most reliable
  const wfResult = await n8nFetchAll('/workflows');
  if (!wfResult.error && wfResult.data && wfResult.data.length > 0) {
    const wf = wfResult.data[0];
    if (wf.shared && wf.shared[0]) return wf.shared[0].projectId;
  }
  return { error: 'No projects found — provide projectId explicitly' };
}

async function listFolders() {
  let pid = projectId;
  if (!pid) {
    pid = await findDefaultProject();
    if (typeof pid === 'object' && pid.error) return pid;
  }

  const args = { projectId: pid };
  if (query) args.query = query;

  const result = await mcpCall('search_folders', args);
  if (result.error) return result;

  return {
    projectId: pid,
    count: result.count || (result.data ? result.data.length : 0),
    folders: result.data || [],
  };
}

try {
  const result = await listFolders();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
