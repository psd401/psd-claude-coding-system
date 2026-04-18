#!/usr/bin/env bun

/**
 * n8n MCP Client — calls n8n's native MCP server for operations
 * not available via the public REST API (e.g., folder management).
 *
 * Auth: Bearer token from N8N_MCP_TOKEN env var.
 * Endpoint: N8N_HOST/mcp-server/http (JSON-RPC over HTTP)
 */

const { SECRETS } = require('../../../scripts/secrets.js');

function getMcpConfig() {
  const { host, mcpToken } = SECRETS.n8n;
  if (!mcpToken) {
    throw new Error(
      'N8N_MCP_TOKEN is required for MCP operations.\n' +
      'Get it from n8n Settings → MCP Server → Generate Token.\n' +
      'Then add N8N_MCP_TOKEN=<token> to your secrets .env file.'
    );
  }
  const baseUrl = host.startsWith('http') ? host : `https://${host}`;
  return { mcpUrl: `${baseUrl}/mcp-server/http`, mcpToken };
}

/**
 * Call an n8n MCP tool via JSON-RPC.
 *
 * @param {string} toolName - MCP tool name (e.g., 'search_folders')
 * @param {object} args - Tool arguments
 * @returns {object} Tool result or error
 */
async function mcpCall(toolName, args = {}) {
  const { mcpUrl, mcpToken } = getMcpConfig();

  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: { name: toolName, arguments: args },
  });

  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${mcpToken}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    return { error: `MCP error ${response.status}: ${text}` };
  }

  const text = await response.text();

  // MCP may return SSE format (event: / data:) or plain JSON
  let parsed;
  if (text.startsWith('event:') || text.includes('\ndata:')) {
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        parsed = JSON.parse(line.slice(5).trim());
        break;
      }
    }
  } else {
    parsed = JSON.parse(text);
  }

  if (!parsed) return { error: 'Empty MCP response' };

  if (parsed.error) {
    return { error: parsed.error.message || JSON.stringify(parsed.error) };
  }

  // Extract structured content if available
  const result = parsed.result;
  if (result && result.structuredContent) {
    return result.structuredContent;
  }

  // Fall back to parsing text content
  if (result && result.content && result.content[0]) {
    try {
      return JSON.parse(result.content[0].text);
    } catch {
      return { data: result.content[0].text };
    }
  }

  return result || parsed;
}

/**
 * List available MCP tools.
 */
async function mcpListTools() {
  const { mcpUrl, mcpToken } = getMcpConfig();

  const body = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {},
  });

  const response = await fetch(mcpUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'Authorization': `Bearer ${mcpToken}`,
    },
    body,
  });

  const text = await response.text();
  let parsed;
  if (text.includes('\ndata:') || text.startsWith('event:')) {
    for (const line of text.split('\n')) {
      if (line.startsWith('data:')) {
        parsed = JSON.parse(line.slice(5).trim());
        break;
      }
    }
  } else {
    parsed = JSON.parse(text);
  }

  if (parsed && parsed.result && parsed.result.tools) {
    return parsed.result.tools;
  }
  return [];
}

module.exports = { mcpCall, mcpListTools, getMcpConfig };
