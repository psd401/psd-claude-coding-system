# n8n Integration Guide

## Overview

`generate_pdf.py` can be called from n8n workflows via Execute Command nodes. This enables automated document generation → signing pipelines.

## Workflow Pattern

```
Webhook/Form Trigger
  → Code Node (build PDF spec)
  → Execute Command (generate PDF)
  → HTTP Request (create Documenso envelope)
  → Code Node (map fields from manifest)
  → HTTP Request (add fields to envelope)
  → HTTP Request (distribute for signing)
```

## Node Configurations

### 1. Webhook Trigger

Receives form submission data (e.g., from an n8n Form or external webhook):

```json
{
  "name": "New Document Request",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "generate-document",
    "httpMethod": "POST"
  }
}
```

### 2. Code Node — Build PDF Spec

Transforms webhook data into a `generate_pdf.py` spec:

```javascript
const data = $input.first().json;

const spec = {
  template: data.template || "generic-form",
  data: {
    student_name: data.student_name || "",
    event: data.event || "",
    date: data.date || "",
    school: data.school || "",
  },
};

const outputPath = `/tmp/psd-doc-${Date.now()}.pdf`;

return [{
  json: {
    spec: JSON.stringify(spec),
    outputPath: outputPath,
    manifestPath: outputPath + ".fields.json",
  }
}];
```

### 3. Execute Command — Generate PDF

```json
{
  "name": "Generate Branded PDF",
  "type": "n8n-nodes-base.executeCommand",
  "parameters": {
    "command": "cd /path/to/plugins/psd-productivity/skills/pdf-builder/scripts && uv run generate_pdf.py --json '{{ $json.spec }}' --output {{ $json.outputPath }}"
  }
}
```

### 4. HTTP Request — Create Documenso Envelope

Upload the generated PDF to Documenso:

```json
{
  "name": "Create Signing Envelope",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "http://${DOCUMENSO_HOST}/api/v2/envelope/create",
    "method": "POST",
    "sendBody": true,
    "bodyType": "multipart-form-data",
    "bodyParametersUi": {
      "parameter": [
        {
          "name": "file",
          "parameterType": "formBinaryData",
          "inputDataFieldName": "data"
        },
        {
          "name": "payload",
          "parameterType": "formData",
          "value": "{\"title\": \"Permission Slip\", \"visibility\": \"EVERYONE\"}"
        }
      ]
    }
  },
  "credentials": {
    "httpHeaderAuth": { "id": "documenso-api-key", "name": "Documenso API" }
  }
}
```

### 5. Code Node — Map Fields from Manifest

Read the `.fields.json` manifest and build the Documenso field creation payload:

```javascript
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync($('Generate Branded PDF').first().json.manifestPath));
const envelopeId = $('Create Signing Envelope').first().json.id;
const recipientId = $('Add Recipients').first().json.recipients[0].id;

const fieldPayload = {
  envelopeId: envelopeId,
  data: manifest.fields.map(f => ({
    recipientId: recipientId,
    type: f.type,
    identifier: 0,
    page: f.page,
    positionX: f.positionX,
    positionY: f.positionY,
    width: f.width,
    height: f.height,
    fieldMeta: f.fieldMeta,
  })),
};

return [{ json: fieldPayload }];
```

### 6. HTTP Request — Add Fields

```json
{
  "name": "Add Signing Fields",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "http://${DOCUMENSO_HOST}/api/v2/envelope/field/create-many",
    "method": "POST",
    "sendBody": true,
    "bodyType": "json",
    "body": "={{ JSON.stringify($json) }}"
  }
}
```

### 7. HTTP Request — Distribute

```json
{
  "name": "Send for Signing",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "url": "http://${DOCUMENSO_HOST}/api/v2/envelope/{{ $('Create Signing Envelope').first().json.id }}/distribute",
    "method": "POST"
  }
}
```

## Recommended: Template Server Pattern

Instead of requiring `uv` on the n8n server, generate the PDF locally once and serve it via a webhook workflow:

1. Generate locally: `uv run generate_pdf.py --spec spec.json -o template.pdf`
2. Base64-encode the PDF and embed it in an n8n Code node
3. The n8n workflow serves it via `GET /webhook/psd-template?name={template-name}`
4. Other workflows download the template via HTTP Request node before creating Documenso envelopes

**Why not Google Drive?** The n8n Google Drive v3 download node calls the export API instead of `files.get`, causing `"Export only supports Docs Editors files"` errors for uploaded PDFs. The template server avoids this entirely.

## Critical n8n Gotchas

### Shell Escaping (CRITICAL)

**Never use `bun -e "..."` to update n8n Code nodes.** The shell strips `$` characters, breaking `$input`, `$json`, `$('Node Name')`, and expressions like `={{ $json.field }}`. Always write update scripts to a `.js` file first, then run with `bun script.js`. After running, verify the deployed code still contains `$input` and no `$$`.

### Code Node Sandbox Restrictions

The n8n Code node runs in an isolated VM. These are **not available**:
- `fetch()` — use HTTP Request node instead
- `URLSearchParams` — use `encodeURIComponent()` + string concatenation
- `$http` — does not exist
- `require()` — blocked by default
- Optional chaining `?.` — causes `Unexpected token '.'`. Use `|| {}` fallback.

### HTTP Request Body Serialization

The n8n HTTP Request node's `keypair` body mode can produce malformed JSON. Use raw mode instead:
```json
{
  "contentType": "raw",
  "rawContentType": "application/json",
  "body": "={\"envelopeId\": \"{{ $json.id }}\"}"
}
```

### Form Trigger URL Format

Form URLs are `/form/{webhookId}` — NOT `/form/{path}`. The custom `path` parameter does not control the form URL. Get the `webhookId` from the workflow API response.

### Form Hidden Fields

Hidden fields do NOT auto-populate from URL query parameters. Data is in `$json.formQueryParameters`:
```javascript
var email = form['Supervisor Email'] || form.formQueryParameters.supervisorEmail || '';
```

### Resource Locator Format

All resource-referencing parameters need the `__rl` format:
```json
{ "__rl": true, "value": "resource-id", "mode": "id" }
```

## Environment Requirements (Execute Command approach)

If using Execute Command instead of the Template Server pattern:

- `uv` must be installed on the n8n server
- Font files must exist in `scripts/fonts/` (run `install_fonts.py` once)
- `DOCUMENSO_HOST` environment variable must be set (Community Edition has no env vars — hardcode in nodes)
- Documenso API key configured as an n8n credential

## Example: Complete Permission Slip Workflow

**Trigger**: Parent fills out an n8n Form with student name, event, date
**Generate**: PDF Builder creates branded permission slip with data pre-filled
**Sign**: Documenso sends to parent's email for e-signature
**Complete**: Webhook on `DOCUMENT_COMPLETED` stores signed PDF to Google Drive
