---
name: n8n-manager
description: "Build, deploy, and manage n8n workflow automations on PSD's internal server. Use when: creating workflows, checking n8n status, managing executions, building automations, connecting PSD systems (Freshservice, PowerSchool, Google Workspace, Red Rover) via n8n. Triggers on: n8n, workflow automation, webhook, n8n build, n8n status, n8n workflows, n8n form."
argument-hint: "[command] [args...] — e.g., 'build ...', 'list', 'status', 'show 42', 'activate 42'"
model: claude-opus-4-6
effort: high
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
extended-thinking: true
---

# n8n Manager

## Configuration

- **Server**: Read from `N8N_HOST` environment variable (never hardcoded)
- **API Auth**: `X-N8N-API-KEY` header via `N8N_API_KEY` env var
- **Instance MCP**: Native n8n MCP at `N8N_HOST/mcp-server/http` (bearer token from `N8N_MCP_TOKEN`)
- **Docs MCP**: czlonkowski/n8n-mcp for node documentation and templates
- **Version**: n8n Community Edition v2.14.x
- **Scripts**: `plugins/psd-productivity/skills/n8n-manager/scripts/`

All scripts use `bun` and read credentials from `secrets.js` (env vars → Geoffrey .env).

## Community Edition Limitations

PSD runs n8n Community Edition. These features are **not available**:

- **No Settings → Variables** — environment variables are enterprise/pro only. All config values (API keys, URLs, folder IDs) must be hardcoded directly in workflow node parameters.
- **No instance-level error workflow** — must set `errorWorkflow` in each workflow's `settings` object individually.
- **Credentials API returns 403** — credential listing/reading is restricted. Get credential IDs from the user via the n8n UI.
- **No source control / Git integration** — workflows must be managed via API or UI exports.

## Command Reference

### Workflow Management

| Command | Script | Description |
|---------|--------|-------------|
| `/n8n status` | `bun health_check.js` | Server health, version, workflow count |
| `/n8n list` | `bun list_workflows.js` | List all workflows |
| `/n8n list '{"active":true}'` | `bun list_workflows.js '{"active":true}'` | Filter by status |
| `/n8n list '{"tag":"psd-production"}'` | `bun list_workflows.js '{"tag":"psd-production"}'` | Filter by tag |
| `/n8n show <id>` | `bun get_workflow.js <id>` | Get full workflow JSON |
| `/n8n activate <id>` | `bun activate_workflow.js <id>` | Activate workflow |
| `/n8n deactivate <id>` | `bun deactivate_workflow.js <id>` | Deactivate workflow |
| `/n8n delete <id>` | `bun delete_workflow.js <id>` | Delete workflow (**confirm first**) |

### Workflow Builder

| Command | Description |
|---------|-------------|
| `/n8n build "<description>"` | Build workflow from natural language (see protocol below) |
| `/n8n deploy '<json>'` | `bun deploy_workflow.js '<json>'` — validate + create |
| `/n8n trigger <url> [data]` | `bun trigger_workflow.js <url> '<json>'` — trigger via webhook |

### Executions

| Command | Script | Description |
|---------|--------|-------------|
| `/n8n executions` | `bun list_executions.js` | Recent executions |
| `/n8n executions '{"status":"error"}'` | `bun list_executions.js '{"status":"error"}'` | Failed only |
| `/n8n execution <id>` | `bun get_execution.js <id>` | Execution details |
| `/n8n execution <id> --full` | `bun get_execution.js <id> --full` | With node data |
| `/n8n retry <id>` | `bun retry_execution.js <id>` | Retry failed execution |

### Credentials & Configuration

| Command | Script | Description |
|---------|--------|-------------|
| `/n8n creds` | `bun list_credentials.js` | List credentials (metadata only) |
| `/n8n cred-schema <type>` | `bun get_credential_schema.js <type>` | Schema for credential type |
| `/n8n cred-create '<json>'` | `bun create_credential.js '<json>'` | Create credential |
| `/n8n tags` | `bun list_tags.js` | List all tags |
| `/n8n tag-create <name>` | `bun create_tag.js <name>` | Create tag |
| `/n8n vars` | `bun list_variables.js` | List variables |
| `/n8n var-create <key> <val>` | `bun create_variable.js <key> <val>` | Create variable |
| `/n8n audit` | `bun run_audit.js` | Security audit |

## Workflow Builder Protocol

When building a workflow from a natural language description:

### Step 1: Research
- Read `references/n8n-node-catalog.md` for available node types and JSON snippets
- Read `references/psd-integration-map.md` if PSD systems are involved
- Read `references/psd-workflow-templates.md` for similar pre-built patterns
- Use n8n-docs MCP tools if available: `search_nodes` for node discovery, `get_node_details` for parameter schemas

### Step 2: Design
Present the workflow to the user as a numbered list:
```
1. [Trigger] Schedule - Every 5 Minutes (scheduleTrigger)
2. [Action] Fetch Tickets from Freshservice (httpRequest)
3. [Logic] Filter High Priority Only (if)
4. [Action] Send Slack Alert (slack)
```
Get user approval before generating JSON.

### Step 3: Generate
- Read `references/n8n-workflow-json-spec.md` for the exact JSON format
- Use unique, descriptive node names (NEVER default names like "HTTP Request")
- Space nodes ~250px apart horizontally
- Wire connections using exact node names

### Step 4: Validate
```bash
bun plugins/psd-productivity/skills/n8n-manager/scripts/validate_workflow.js '<json>'
```
Fix any errors before deploying.

### Step 5: Deploy
```bash
bun plugins/psd-productivity/skills/n8n-manager/scripts/deploy_workflow.js '<json>'
```
Returns the workflow ID and editor URL.

### Step 6: Test & Activate
- If webhook trigger: offer to send test data via `trigger_workflow.js`
- Check execution result via `list_executions.js`
- After successful test, activate with `activate_workflow.js`
- Suggest tagging with `psd-production`

## Safety Guardrails

### Always confirm before:
- **Deleting** a workflow (show name and active status first)
- **Deactivating** an active workflow (warn: webhook listeners will stop)
- **Overwriting** a workflow (show what changed)
- **Deleting** credentials (warn: workflows using them will break)

### Naming conventions:
- Node names must be **unique and descriptive** — e.g., "Fetch Freshservice Tickets" not "HTTP Request"
- Connections use node **NAMES as keys, NOT IDs** — duplicate names break wiring silently

### Production safety:
- Never edit an active production workflow directly
- Clone first → modify clone → test → swap
- Tag convention: `psd-production`, `psd-staging`, `psd-template`, `psd-[system]`
- Webhook triggers should always include authentication (headerAuth minimum)

## Key Technical Warnings

- **No "run workflow" API endpoint** — workflows must have a Webhook/Schedule/Form trigger to execute. Use `trigger_workflow.js` to POST to webhook URLs.
- **Python in Code nodes uses Pyodide** (WebAssembly CPython) — not native Python. Standard library only, slower performance.
- **5-minute timeout** on native instance MCP executions.
- **Credential IDs are instance-specific** — workflows from other instances need credential re-mapping.
- **Code node sandbox restrictions** — no `fetch()`, `URLSearchParams`, `$http`, optional chaining `?.`, or `require()`. Use HTTP Request node for HTTP calls. Use `encodeURIComponent()` for URL encoding. See `references/n8n-node-catalog.md` for the complete list.
- **Form Trigger URLs use `webhookId` UUID** — not the custom `path` parameter. The URL is `/form/{webhookId}`, not `/form/{path}`. Get the `webhookId` from the workflow API response.
- **Form hidden fields don't populate from query params** — data is available in `$json.formQueryParameters`, not the hidden field value. Use fallback: `form['Field'] || form.formQueryParameters.fieldName || ''`.
- **Form custom CSS requires deactivate/reactivate** — n8n caches the form template. Changes to `customCss` in options won't appear until the workflow is toggled off then on.
- **Form width** — controlled by CSS variable `--container-width` (default 448px). Override in custom CSS: `:root { --container-width: 900px !important; }`.
- **Form branding** — `<img>` tags are sanitized (src stripped). Use `<iframe frameborder="0">` with a webhook-served image instead. CSS `url()` is also stripped.
- **Webhook paths don't support route parameters** — `path: "template/:name"` returns 404. Use query parameters instead: `path: "psd-template"` with `?name=value`.
- **Google Drive v3 download bug** — the download operation calls the export API, causing "Export only supports Docs Editors files" for uploaded PDFs. Use the template server pattern or HTTP Request with `?alt=media&supportsAllDrives=true`.
- **Google Sheets auto-map pitfall** — `autoMapInputData` creates duplicate columns if JSON keys don't match headers exactly (including whitespace). Use a Code node to format keys before the Sheets node.

## PSD Systems Quick Reference

| System | Auth | How to Connect |
|--------|------|---------------|
| Freshservice | API Key (Basic auth with `:X`) | httpHeaderAuth credential + HTTP Request node |
| PowerSchool | Plugin OAuth → Bearer token | httpHeaderAuth credential + HTTP Request node |
| Google Workspace | OAuth2 | Native Google nodes (Sheets, Gmail, Calendar, Drive) |
| Red Rover | Basic Auth (username:password) | httpBasicAuth credential + HTTP Request node |
| Slack | OAuth2 Bot Token | Native Slack node |

See `references/psd-integration-map.md` for full details including workspace IDs and endpoints.

## Reference Documents

| Document | Contents |
|----------|----------|
| `references/n8n-workflow-json-spec.md` | Workflow JSON structure, connection model, expression syntax |
| `references/n8n-node-catalog.md` | Common nodes with JSON snippets (Webhook, Form, HTTP, Code, IF, Slack, Google) |
| `references/psd-integration-map.md` | PSD systems → n8n nodes, credentials, auth methods, endpoints |
| `references/psd-workflow-templates.md` | 10 pre-built PSD workflow patterns with node configs |
