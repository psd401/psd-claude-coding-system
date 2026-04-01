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

## Environment Requirements

- `uv` must be installed on the n8n server
- Font files must exist in `scripts/fonts/` (run `install_fonts.py` once)
- `DOCUMENSO_HOST` environment variable must be set
- Documenso API key configured as an n8n credential

## Example: Complete Permission Slip Workflow

**Trigger**: Parent fills out an n8n Form with student name, event, date
**Generate**: PDF Builder creates branded permission slip with data pre-filled
**Sign**: Documenso sends to parent's email for e-signature
**Complete**: Webhook on `DOCUMENT_COMPLETED` stores signed PDF to Google Drive
