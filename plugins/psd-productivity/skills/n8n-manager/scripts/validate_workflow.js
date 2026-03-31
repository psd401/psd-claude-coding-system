#!/usr/bin/env bun

// Validate workflow JSON structure before deployment.
// Usage: bun validate_workflow.js '<workflow-json>'
//    or: bun validate_workflow.js @path/to/workflow.json
//
// Checks:
//   1. Required top-level fields (name, nodes, connections)
//   2. No duplicate node names (CRITICAL — connections use names, not IDs)
//   3. All connections reference valid node names
//   4. All nodes have required fields (name, type, position)
//   5. Node types follow the n8n-nodes-base.xxx format

const { readFileSync } = require('fs');

const input = process.argv[2];
if (!input) {
  console.error(JSON.stringify({
    error: 'Workflow JSON required. Usage: bun validate_workflow.js \'<json>\' or @file.json'
  }));
  process.exit(1);
}

let workflow;
try {
  if (input.startsWith('@')) {
    workflow = JSON.parse(readFileSync(input.slice(1), 'utf-8'));
  } else {
    workflow = JSON.parse(input);
  }
} catch (e) {
  console.error(JSON.stringify({ valid: false, errors: [`Invalid JSON: ${e.message}`] }));
  process.exit(1);
}

function validate(wf) {
  const errors = [];
  const warnings = [];

  // 1. Required top-level fields
  if (!wf.name) errors.push('Missing required field: name');
  if (!wf.nodes || !Array.isArray(wf.nodes)) errors.push('Missing or invalid field: nodes (must be array)');
  if (!wf.connections || typeof wf.connections !== 'object') errors.push('Missing or invalid field: connections (must be object)');
  if (!wf.settings) {
    warnings.push('Missing "settings" field — n8n API requires it. Will auto-inject {"executionOrder":"v1"} on deploy.');
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  // 2. Check nodes
  const nodeNames = new Set();
  const duplicateNames = [];

  for (const node of wf.nodes) {
    if (!node.name) errors.push(`Node missing name: ${JSON.stringify(node).slice(0, 100)}`);
    if (!node.type) errors.push(`Node "${node.name || '?'}" missing type`);
    if (!node.position || !Array.isArray(node.position)) {
      errors.push(`Node "${node.name || '?'}" missing position [x, y]`);
    }

    if (node.name) {
      if (nodeNames.has(node.name)) {
        duplicateNames.push(node.name);
      }
      nodeNames.add(node.name);
    }

    // Check type format
    if (node.type && !node.type.includes('.')) {
      warnings.push(`Node "${node.name}" type "${node.type}" doesn't follow n8n format (expected: n8n-nodes-base.xxx)`);
    }
  }

  if (duplicateNames.length > 0) {
    errors.push(
      `DUPLICATE NODE NAMES: [${duplicateNames.join(', ')}]. ` +
      'n8n connections use node NAMES as keys — duplicates will break workflow wiring. ' +
      'Use unique, descriptive names for each node.'
    );
  }

  // 3. Check connections reference valid node names
  for (const sourceName of Object.keys(wf.connections)) {
    if (!nodeNames.has(sourceName)) {
      errors.push(`Connection source "${sourceName}" does not match any node name. Available: [${[...nodeNames].join(', ')}]`);
    }

    const outputs = wf.connections[sourceName];
    if (outputs?.main) {
      for (const branch of outputs.main) {
        if (!Array.isArray(branch)) continue;
        for (const conn of branch) {
          if (conn.node && !nodeNames.has(conn.node)) {
            errors.push(`Connection target "${conn.node}" (from "${sourceName}") does not match any node name`);
          }
        }
      }
    }
  }

  // 4. Check for nodes not connected to anything (except triggers)
  const connectedNodes = new Set();
  for (const sourceName of Object.keys(wf.connections)) {
    connectedNodes.add(sourceName);
    const outputs = wf.connections[sourceName];
    if (outputs?.main) {
      for (const branch of outputs.main) {
        if (!Array.isArray(branch)) continue;
        for (const conn of branch) {
          if (conn.node) connectedNodes.add(conn.node);
        }
      }
    }
  }

  for (const node of wf.nodes) {
    if (!connectedNodes.has(node.name)) {
      const isTrigger = node.type?.toLowerCase().includes('trigger');
      if (!isTrigger && wf.nodes.length > 1) {
        warnings.push(`Node "${node.name}" is not connected to any other node`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: {
      name: wf.name,
      nodeCount: wf.nodes.length,
      connectionCount: Object.keys(wf.connections).length,
      uniqueNodeNames: nodeNames.size,
    },
  };
}

const result = validate(workflow);
console.log(JSON.stringify(result, null, 2));
if (!result.valid) process.exit(1);
