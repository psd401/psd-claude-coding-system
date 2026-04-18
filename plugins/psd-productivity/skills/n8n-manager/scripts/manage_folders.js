#!/usr/bin/env bun

/**
 * Folder management for n8n workflows.
 *
 * Combines MCP (for listing/searching folders) with the public API
 * (for tag management and workflow organization).
 *
 * Usage:
 *   bun manage_folders.js list [projectId]              — List all folders
 *   bun manage_folders.js search <query> [projectId]    — Search folders by name
 *   bun manage_folders.js map [projectId]               — Map folders to workflows
 *   bun manage_folders.js ensure-tags                   — Create standard PSD tags
 *   bun manage_folders.js tag <workflowId> <tagId>      — Add tag to workflow
 *   bun manage_folders.js organize [projectId]          — Show organization report
 *
 * Note: Folder CREATION must be done in the n8n UI (API limitation).
 * This script manages everything else programmatically.
 */

const { mcpCall } = require('./n8n_mcp_client.js');
const { n8nFetch, n8nFetchAll } = require('./n8n_client.js');

const [action, ...args] = process.argv.slice(2);

// Standard PSD tags
const PSD_TAGS = [
  { name: 'psd-production', description: 'Active production workflows' },
  { name: 'psd-ess', description: 'ESS (Employee Support Services) workflows' },
  { name: 'psd-google', description: 'Uses Google credentials' },
  { name: 'psd-infrastructure', description: 'Router, handlers, servers' },
  { name: 'psd-evaluations', description: 'Employee evaluation workflows' },
  { name: 'psd-timesheets', description: 'Timesheet workflows' },
  { name: 'psd-compliance', description: 'Compliance and disclosure workflows' },
  { name: 'psd-documenso', description: 'Uses Documenso for signing' },
];

// Standard folder names (must be created in UI)
const PSD_FOLDERS = [
  'ESS Evaluations',
  'ESS Timesheets',
  'ESS Compliance',
  'PSD Infrastructure',
  'PSD Servers',
];

async function findDefaultProject() {
  // Get projectId from the first workflow's shared field — this is the most
  // reliable method since it always returns the project that owns the workflows.
  const wfResult = await n8nFetchAll('/workflows');
  if (!wfResult.error && wfResult.data && wfResult.data.length > 0) {
    const wf = wfResult.data[0];
    if (wf.shared && wf.shared[0] && wf.shared[0].projectId) {
      return { id: wf.shared[0].projectId, name: 'default' };
    }
  }

  // Fallback: MCP search_projects
  const result = await mcpCall('search_projects', {});
  if (!result.error && result.data && result.data.length > 0) {
    return result.data[0];
  }

  throw new Error('No projects found — provide projectId explicitly');
}

async function listFolders(projectId) {
  if (!projectId) {
    const project = await findDefaultProject();
    projectId = project.id;
  }
  const result = await mcpCall('search_folders', { projectId });
  if (result.error) throw new Error(result.error);
  return { projectId, folders: result.data || [], count: result.count || 0 };
}

async function searchFolders(query, projectId) {
  if (!projectId) {
    const project = await findDefaultProject();
    projectId = project.id;
  }
  const result = await mcpCall('search_folders', { projectId, query });
  if (result.error) throw new Error(result.error);
  return { projectId, query, folders: result.data || [], count: result.count || 0 };
}

async function mapFoldersToWorkflows(projectId) {
  // Get folders
  const folderResult = await listFolders(projectId);

  // Get all workflows
  const wfResult = await n8nFetchAll('/workflows');
  if (wfResult.error) throw new Error(wfResult.error);

  // Build folder lookup
  const folderMap = {};
  for (const f of folderResult.folders) {
    folderMap[f.id] = { ...f, workflows: [] };
  }
  folderMap['_root'] = { id: null, name: '(Root — no folder)', workflows: [] };

  // Map workflows to folders via shared[].projectId
  // Note: public API doesn't expose folderId on workflows,
  // so we use naming conventions to suggest folder placement
  for (const wf of wfResult.data) {
    // All workflows are in the same project, folder info isn't in the API response
    // Use naming prefix to suggest placement
    let suggestedFolder = '_root';

    if (wf.name.startsWith('ESS -') && (wf.name.includes('Evaluation') || wf.name.includes('Performance'))) {
      suggestedFolder = folderResult.folders.find(f => f.name.includes('Evaluation'))?.id || '_root';
    } else if (wf.name.startsWith('ESS -') && wf.name.includes('Timesheet')) {
      suggestedFolder = folderResult.folders.find(f => f.name.includes('Timesheet'))?.id || '_root';
    } else if (wf.name.startsWith('ESS -') && (wf.name.includes('Conflict') || wf.name.includes('Disclosure'))) {
      suggestedFolder = folderResult.folders.find(f => f.name.includes('Compliance'))?.id || '_root';
    } else if (wf.name.startsWith('PSD -') || wf.name.startsWith('Documenso -')) {
      suggestedFolder = folderResult.folders.find(f => f.name.includes('Infrastructure'))?.id || '_root';
    }

    const entry = {
      id: wf.id,
      name: wf.name,
      active: wf.active,
      tags: wf.tags ? wf.tags.map(t => t.name) : [],
    };

    if (folderMap[suggestedFolder]) {
      folderMap[suggestedFolder].workflows.push(entry);
    } else {
      folderMap['_root'].workflows.push(entry);
    }
  }

  return {
    projectId: folderResult.projectId,
    folders: Object.values(folderMap).map(f => ({
      id: f.id,
      name: f.name,
      parentFolderId: f.parentFolderId || null,
      workflowCount: f.workflows.length,
      workflows: f.workflows,
    })),
  };
}

async function ensureTags() {
  // Get existing tags
  const existing = await n8nFetchAll('/tags');
  if (existing.error) throw new Error(existing.error);

  const existingNames = new Set(existing.data.map(t => t.name));
  const created = [];
  const skipped = [];

  for (const tag of PSD_TAGS) {
    if (existingNames.has(tag.name)) {
      const existingTag = existing.data.find(t => t.name === tag.name);
      skipped.push({ name: tag.name, id: existingTag.id });
    } else {
      const result = await n8nFetch('/tags', {
        method: 'POST',
        body: { name: tag.name },
      });
      if (result.error) {
        created.push({ name: tag.name, error: result.error });
      } else {
        created.push({ name: tag.name, id: result.id });
      }
    }
  }

  return { created, skipped, total: PSD_TAGS.length };
}

async function tagWorkflow(workflowId, tagId) {
  // Get current workflow
  const wf = await n8nFetch(`/workflows/${workflowId}`);
  if (wf.error) throw new Error(wf.error);

  // Get current tag IDs
  const currentTagIds = (wf.tags || []).map(t => t.id);
  if (currentTagIds.includes(tagId)) {
    return { message: 'Tag already applied', workflowId, tagId };
  }

  // Update workflow with new tag list
  const newTags = [...currentTagIds.map(id => ({ id })), { id: tagId }];
  const result = await n8nFetch(`/workflows/${workflowId}/tags`, {
    method: 'PUT',
    body: newTags,
  });

  return result;
}

async function organizationReport(projectId) {
  const folders = await listFolders(projectId);
  const workflows = await n8nFetchAll('/workflows');
  if (workflows.error) throw new Error(workflows.error);
  const tags = await n8nFetchAll('/tags');
  if (tags.error) throw new Error(tags.error);

  // Check which standard folders exist
  const existingFolderNames = new Set(folders.folders.map(f => f.name));
  const missingFolders = PSD_FOLDERS.filter(f => !existingFolderNames.has(f));

  // Check which standard tags exist
  const existingTagNames = new Set(tags.data.map(t => t.name));
  const missingTags = PSD_TAGS.filter(t => !existingTagNames.has(t.name));

  // Check workflow naming compliance
  const nameIssues = [];
  for (const wf of workflows.data) {
    if (!wf.name.match(/^(ESS|PSD|TSD|Documenso) - /)) {
      nameIssues.push({ id: wf.id, name: wf.name, issue: 'Missing standard prefix (ESS/PSD/TSD/Documenso)' });
    }
    if (!wf.tags || wf.tags.length === 0) {
      nameIssues.push({ id: wf.id, name: wf.name, issue: 'No tags assigned' });
    }
  }

  return {
    summary: {
      totalWorkflows: workflows.count,
      totalFolders: folders.count,
      totalTags: tags.count,
      missingFolders: missingFolders.length,
      missingTags: missingTags.length,
      namingIssues: nameIssues.length,
    },
    existingFolders: folders.folders,
    missingFolders,
    existingTags: tags.data.map(t => ({ id: t.id, name: t.name })),
    missingTags: missingTags.map(t => t.name),
    namingIssues: nameIssues,
    workflows: workflows.data.map(wf => ({
      id: wf.id,
      name: wf.name,
      active: wf.active,
      tags: (wf.tags || []).map(t => t.name),
    })),
  };
}

// --- CLI ---

async function main() {
  switch (action) {
    case 'list':
      return await listFolders(args[0]);

    case 'search':
      if (!args[0]) throw new Error('Query required. Usage: bun manage_folders.js search <query>');
      return await searchFolders(args[0], args[1]);

    case 'map':
      return await mapFoldersToWorkflows(args[0]);

    case 'ensure-tags':
      return await ensureTags();

    case 'tag':
      if (!args[0] || !args[1]) throw new Error('Usage: bun manage_folders.js tag <workflowId> <tagId>');
      return await tagWorkflow(args[0], args[1]);

    case 'organize':
      return await organizationReport(args[0]);

    default:
      return {
        error: 'Unknown action. Available: list, search, map, ensure-tags, tag, organize',
        usage: {
          list: 'bun manage_folders.js list [projectId]',
          search: 'bun manage_folders.js search <query> [projectId]',
          map: 'bun manage_folders.js map [projectId]',
          'ensure-tags': 'bun manage_folders.js ensure-tags',
          tag: 'bun manage_folders.js tag <workflowId> <tagId>',
          organize: 'bun manage_folders.js organize [projectId]',
        },
      };
  }
}

try {
  const result = await main();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
