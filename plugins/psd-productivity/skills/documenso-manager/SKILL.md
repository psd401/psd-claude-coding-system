---
name: documenso-manager
description: "Manage document signing with Documenso — create envelopes, add recipients/fields, distribute for signature, download signed PDFs, manage templates. Use when: sending documents for signature, creating signing workflows, checking document status, managing templates, building e-signature automations. Triggers on: documenso, sign, signature, envelope, signing, document signing, e-sign."
argument-hint: "[command] [args...] — e.g., 'status', 'list', 'create <pdf>', 'send <id>', 'templates'"
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

# Documenso Manager

## Configuration

- **Server**: Read from `DOCUMENSO_HOST` environment variable (never hardcoded)
- **API Auth**: `Authorization: api_xxxxxxxx` header (NOT Bearer — literal key value)
- **API Version**: v2 only (v1 is deprecated)
- **MCP**: Official Documenso SDK MCP server for document/template discovery
- **Scripts**: `plugins/psd-productivity/skills/documenso-manager/scripts/`

All scripts use `bun` and read credentials from `secrets.js` (env vars → Geoffrey .env).

## Command Reference

### Envelope Management

| Command | Script | Description |
|---------|--------|-------------|
| `/documenso status` | `bun health_check.js` | Server health, envelope count |
| `/documenso list` | `bun list_envelopes.js` | List all envelopes |
| `/documenso list '{"status":"PENDING"}'` | `bun list_envelopes.js '{"status":"PENDING"}'` | Filter by status |
| `/documenso show <id>` | `bun get_envelope.js <id>` | Envelope details (recipients, fields, items) |
| `/documenso create <pdf> [options]` | `bun create_envelope.js <pdf> '<json>'` | Create envelope with PDF |
| `/documenso update '<json>'` | `bun update_envelope.js '<json>'` | Update envelope metadata |
| `/documenso delete <id>` | `bun delete_envelope.js <id>` | Delete envelope (**confirm first**) |
| `/documenso duplicate <id>` | `bun duplicate_envelope.js <id>` | Clone an envelope |

### Distribution & Download

| Command | Script | Description |
|---------|--------|-------------|
| `/documenso send <id>` | `bun distribute_envelope.js <id>` | Send for signing (DRAFT → PENDING) |
| `/documenso resend <id>` | `bun redistribute_envelope.js <id>` | Resend signing emails |
| `/documenso download <item-id>` | `bun download_document.js <item-id> signed` | Download signed PDF |
| `/documenso download <item-id> original` | `bun download_document.js <item-id> original` | Download original PDF |
| `/documenso audit <id>` | `bun get_audit_log.js <id>` | Audit trail |

### Recipients & Fields

| Command | Script | Description |
|---------|--------|-------------|
| `/documenso add-recipients <id> '<json>'` | `bun add_recipients.js <id> '<json>'` | Add recipients (SIGNER/APPROVER/CC/VIEWER/ASSISTANT) |
| `/documenso update-recipients <id> '<json>'` | `bun update_recipients.js <id> '<json>'` | Update recipients |
| `/documenso remove-recipient <id> <rid>` | `bun remove_recipient.js <id> <rid>` | Remove recipient |
| `/documenso add-fields <id> '<json>'` | `bun add_fields.js <id> '<json>'` | Add fields (SIGNATURE/DATE/TEXT/etc.) |
| `/documenso update-fields <id> '<json>'` | `bun update_fields.js <id> '<json>'` | Update field positions |
| `/documenso remove-field <id> <fid>` | `bun remove_field.js <id> <fid>` | Remove field |

### Templates & Folders

| Command | Script | Description |
|---------|--------|-------------|
| `/documenso templates` | `bun list_templates.js` | List templates |
| `/documenso template <id>` | `bun get_template.js <id>` | Template details |
| `/documenso use-template <id> [options]` | `bun use_template.js <id> '<json>'` | Create envelope from template |
| `/documenso folders` | `bun list_folders.js` | List folders |
| `/documenso create-folder <name>` | `bun create_folder.js <name>` | Create folder |

## Envelope Builder Protocol

When building a signing workflow from natural language:

### Step 1: Research
- Read `references/psd-signing-templates.md` for matching PSD patterns
- Read `references/documenso-envelope-lifecycle.md` for field positioning
- Check existing templates via `list_templates.js`

### Step 2: Design
Present the envelope to the user:
- Document: PDF source and title
- Recipients: roles (SIGNER/APPROVER/CC), signing order
- Fields: types and positions on each page
Get user approval before creating.

### Step 3: Create
```bash
bun plugins/psd-productivity/skills/documenso-manager/scripts/create_envelope.js <pdf-path> '<options>'
```

### Step 4: Add Recipients & Fields (if not in create payload)
```bash
bun add_recipients.js <id> '<recipients>'
bun add_fields.js <id> '<fields>'
```

### Step 5: Review
Show envelope summary and link: `http://${DOCUMENSO_HOST}/documents/<id>`

### Step 6: Send (only after user confirms)
```bash
bun distribute_envelope.js <id>
```

### Step 7: Track
Check status and download signed PDF when complete.

## Safety Guardrails

### Always confirm before:
- **Distributing** an envelope — sends real emails, cannot be undone
- **Deleting** an envelope — show title and status first
- **Removing** a recipient from an active (PENDING) envelope

### Field validation:
- All coordinates must be percentages 0-100 (NOT pixels)
- `add_fields.js` rejects coordinates > 100
- Warn if fields overlap or extend off-page

### Status-aware:
- Cannot add fields to COMPLETED envelopes
- Warn before deleting PENDING envelopes (recipients already notified)

## Key Technical Warnings

- **Auth is NOT Bearer** — header is `Authorization: api_xxxxxxxx` (literal key value)
- **Field coordinates are percentages (0-100)**, not pixels
- **API v2 only** — v1 is deprecated
- **Envelope ≠ Document** — an envelope can contain multiple PDFs
- **PDF upload requires multipart/form-data** — not JSON body
- **`DOCUMENSO_HOST` will change** — never hardcode the URL

## Recipient Roles Quick Reference

| Role | Signs? | Blocks Completion? | Receives Copy? |
|------|--------|-------------------|----------------|
| SIGNER | Yes | Yes | Yes |
| APPROVER | Reviews | Yes | Yes |
| CC | No | No | Yes |
| VIEWER | No | No | View only |
| ASSISTANT | Fills fields | No | No |

## Reference Documents

| Document | Contents |
|----------|----------|
| `references/documenso-api-reference.md` | Full v2 API endpoints, field types (11), recipient roles (5), webhook events (13) |
| `references/documenso-envelope-lifecycle.md` | DRAFT→PENDING→COMPLETED flow, field positioning guide, signing order, email settings |
| `references/psd-signing-templates.md` | 8 pre-built PSD template patterns with field positions |
| `references/psd-signing-workflows.md` | End-to-end workflows for HR, board, student, vendor + n8n integration |
