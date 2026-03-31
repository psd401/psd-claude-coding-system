# n8n Workflow JSON Specification

## Top-Level Structure

```json
{
  "name": "Workflow Name",
  "active": false,
  "settings": { "executionOrder": "v1" },
  "nodes": [],
  "connections": {},
  "tags": []
}
```

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `name` | Yes | string | Descriptive workflow name |
| `active` | No | boolean | Default false. Set via activate endpoint. |
| `settings` | **Yes** | object | `{"executionOrder": "v1"}` — API rejects without it |
| `nodes` | Yes | array | Array of node objects |
| `connections` | Yes | object | Wiring between nodes |
| `tags` | No | array | Tag objects `[{ "name": "tag-name" }]` |

## Node Object

```json
{
  "id": "unique-uuid",
  "name": "Descriptive Node Name",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [250, 300],
  "parameters": {},
  "credentials": {},
  "disabled": false
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | Recommended | UUID string. n8n generates if omitted. |
| `name` | **CRITICAL** | Must be unique. Connections use this as key. |
| `type` | Yes | Format: `n8n-nodes-base.<nodeName>` for core nodes |
| `typeVersion` | Yes | Integer. Different versions have different parameter schemas. |
| `position` | Yes | `[x, y]` pixel coordinates in the editor canvas |
| `parameters` | Yes | Node-specific configuration |
| `credentials` | If needed | `{ "credType": { "id": "cred-id", "name": "cred-name" } }` |
| `disabled` | No | Set true to skip node during execution |

### Node Type Format

- Core nodes: `n8n-nodes-base.<camelCaseName>` (e.g., `n8n-nodes-base.httpRequest`)
- Community nodes: `n8n-nodes-<package>.<nodeName>`
- For MCP search tools: use `nodes-base.<name>` (without the `n8n-` prefix)

### Position Layout Guidelines

Space nodes ~250px apart horizontally for readability:
- Trigger: `[250, 300]`
- Step 2: `[500, 300]`
- Step 3: `[750, 300]`
- Branch (IF true): `[750, 200]`, (IF false): `[750, 400]`

## Connection Model

**CRITICAL**: Connections use node **display names** as keys, NOT IDs. Renaming a node in the UI breaks its connections.

```json
{
  "connections": {
    "Source Node Name": {
      "main": [
        [
          {
            "node": "Target Node Name",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

### Structure Breakdown

```
connections[sourceName].main[outputIndex][connectionIndex]
```

- **sourceName**: Exact `name` field of the source node
- **main**: Output type (always "main" for standard nodes)
- **First array**: Output branches (index 0 = default, index 1 = false branch for IF nodes)
- **Second array**: Multiple connections from same output to different targets

### IF Node Branching

```json
{
  "IF Check Priority": {
    "main": [
      [{ "node": "High Priority Handler", "type": "main", "index": 0 }],
      [{ "node": "Normal Priority Handler", "type": "main", "index": 0 }]
    ]
  }
}
```

- `main[0]` = true branch
- `main[1]` = false branch

### Merge Node (Multiple Inputs)

A Merge node receives from multiple sources. Each source connects to the Merge node's input index:

```json
{
  "Source A": {
    "main": [[{ "node": "Merge Data", "type": "main", "index": 0 }]]
  },
  "Source B": {
    "main": [[{ "node": "Merge Data", "type": "main", "index": 1 }]]
  }
}
```

### AI Agent Connections

AI nodes use typed connections instead of "main":

```json
{
  "OpenAI Chat Model": {
    "ai_languageModel": [[{ "node": "AI Agent", "type": "ai_languageModel", "index": 0 }]]
  },
  "Calculator Tool": {
    "ai_tool": [[{ "node": "AI Agent", "type": "ai_tool", "index": 0 }]]
  }
}
```

Common AI connection types:
- `ai_languageModel` — LLM model → Agent
- `ai_tool` — Tool → Agent
- `ai_memory` — Memory → Agent
- `ai_outputParser` — Parser → Agent

## Common Gotchas

1. **Duplicate node names** break connections silently — always use unique, descriptive names
2. **Renaming a node** after wiring requires updating all connections that reference it
3. **`typeVersion` matters** — HTTP Request v4 has different params than v3
4. **Credential IDs are instance-specific** — a workflow exported from one instance won't have valid credential IDs on another
5. **Empty `parameters: {}`** is valid — many nodes have sensible defaults
6. **Tags in workflow creation** use `[{ "name": "tag-name" }]` — the server resolves names to IDs

## Minimal Valid Workflow Example

```json
{
  "name": "Hello World Webhook",
  "nodes": [
    {
      "id": "trigger-1",
      "name": "Webhook Trigger",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2,
      "position": [250, 300],
      "parameters": {
        "path": "hello-world",
        "httpMethod": "POST"
      }
    },
    {
      "id": "respond-1",
      "name": "Send Response",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [500, 300],
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"message\": \"Hello from n8n!\", \"received\": $json } }}"
      }
    }
  ],
  "connections": {
    "Webhook Trigger": {
      "main": [[{ "node": "Send Response", "type": "main", "index": 0 }]]
    }
  }
}
```
