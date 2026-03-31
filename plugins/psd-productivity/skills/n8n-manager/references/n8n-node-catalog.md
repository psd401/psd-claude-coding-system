# n8n Node Catalog — Common Nodes

For full node documentation, use the n8n-docs MCP: `search_nodes` and `get_node_details`.
This catalog covers the nodes most frequently used in PSD workflows.

## Trigger Nodes

### Webhook (`n8n-nodes-base.webhook`)
Receives HTTP requests. Use for external service integrations and programmatic triggers.

```json
{
  "name": "Webhook - Receive Request",
  "type": "n8n-nodes-base.webhook",
  "typeVersion": 2,
  "position": [250, 300],
  "parameters": {
    "path": "my-endpoint",
    "httpMethod": "POST",
    "authentication": "headerAuth",
    "responseMode": "responseNode"
  }
}
```

**Key params**: `path` (URL path), `httpMethod` (GET/POST/etc.), `authentication` (none/basicAuth/headerAuth), `responseMode` (lastNode/responseNode)

### Form Trigger (`n8n-nodes-base.formTrigger`)
Creates a web form. n8n hosts the form page automatically.

```json
{
  "name": "Request Form",
  "type": "n8n-nodes-base.formTrigger",
  "typeVersion": 2,
  "position": [250, 300],
  "parameters": {
    "formTitle": "IT Equipment Request",
    "formDescription": "Submit a request for new equipment",
    "formFields": {
      "values": [
        { "fieldLabel": "Your Name", "fieldType": "text", "requiredField": true },
        { "fieldLabel": "Equipment Type", "fieldType": "dropdown", "fieldOptions": { "values": [{ "option": "Laptop" }, { "option": "Monitor" }, { "option": "Keyboard" }] } },
        { "fieldLabel": "Estimated Cost", "fieldType": "number" },
        { "fieldLabel": "Justification", "fieldType": "textarea" }
      ]
    },
    "respondWith": "text",
    "formSubmittedText": "Request submitted successfully!"
  }
}
```

**Field types**: text, textarea, number, email, password, date, dropdown, checkbox, hidden, file

### Schedule Trigger (`n8n-nodes-base.scheduleTrigger`)
Runs on a schedule (cron-style).

```json
{
  "name": "Daily 6:30 AM",
  "type": "n8n-nodes-base.scheduleTrigger",
  "typeVersion": 1.2,
  "position": [250, 300],
  "parameters": {
    "rule": {
      "interval": [{ "field": "cronExpression", "expression": "30 6 * * *" }]
    }
  }
}
```

**Timezone**: Set in workflow settings, not the node. Default: instance timezone.

## Action Nodes

### HTTP Request (`n8n-nodes-base.httpRequest`)
Call any REST API. The workhorse node for custom integrations.

```json
{
  "name": "Fetch Freshservice Tickets",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4.2,
  "position": [500, 300],
  "parameters": {
    "url": "https://psd401.freshservice.com/api/v2/tickets",
    "method": "GET",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "httpHeaderAuth",
    "sendQuery": true,
    "queryParameters": {
      "parameters": [
        { "name": "per_page", "value": "30" },
        { "name": "workspace_id", "value": "2" }
      ]
    }
  },
  "credentials": {
    "httpHeaderAuth": { "id": "cred-id", "name": "Freshservice API" }
  }
}
```

### Code (`n8n-nodes-base.code`)
Run JavaScript or Python. JavaScript is native; Python uses Pyodide (WebAssembly — limited libraries).

```json
{
  "name": "Process Data",
  "type": "n8n-nodes-base.code",
  "typeVersion": 2,
  "position": [500, 300],
  "parameters": {
    "jsCode": "const items = $input.all();\nreturn items.map(item => {\n  return { json: { ...item.json, processed: true } };\n});"
  }
}
```

**CRITICAL**: Code node must return `[{ json: {...} }]` format. Missing this causes silent failures.

### Set (`n8n-nodes-base.set`)
Set or modify data fields.

```json
{
  "name": "Add Metadata",
  "type": "n8n-nodes-base.set",
  "typeVersion": 3.4,
  "position": [500, 300],
  "parameters": {
    "mode": "manual",
    "fields": {
      "values": [
        { "name": "source", "stringValue": "n8n-automation" },
        { "name": "timestamp", "stringValue": "={{ $now.toISO() }}" }
      ]
    }
  }
}
```

## Logic Nodes

### IF (`n8n-nodes-base.if`)
Conditional branching. Output 0 = true, Output 1 = false.

```json
{
  "name": "Check Priority",
  "type": "n8n-nodes-base.if",
  "typeVersion": 2,
  "position": [500, 300],
  "parameters": {
    "conditions": {
      "options": { "caseSensitive": true, "leftValue": "" },
      "conditions": [
        {
          "leftValue": "={{ $json.priority }}",
          "rightValue": 3,
          "operator": { "type": "number", "operation": "lte" }
        }
      ]
    }
  }
}
```

### Switch (`n8n-nodes-base.switch`)
Multi-branch routing based on a value.

```json
{
  "name": "Route by Category",
  "type": "n8n-nodes-base.switch",
  "typeVersion": 3.2,
  "position": [500, 300],
  "parameters": {
    "mode": "rules",
    "rules": {
      "values": [
        { "conditions": { "conditions": [{ "leftValue": "={{ $json.category }}", "rightValue": "hardware", "operator": { "type": "string", "operation": "equals" } }] }, "outputKey": "Hardware" },
        { "conditions": { "conditions": [{ "leftValue": "={{ $json.category }}", "rightValue": "software", "operator": { "type": "string", "operation": "equals" } }] }, "outputKey": "Software" }
      ]
    },
    "fallbackOutput": "extra"
  }
}
```

### Merge (`n8n-nodes-base.merge`)
Combine data from multiple branches.

```json
{
  "name": "Combine Results",
  "type": "n8n-nodes-base.merge",
  "typeVersion": 3,
  "position": [750, 300],
  "parameters": {
    "mode": "append"
  }
}
```

**Modes**: append, combine (by field), chooseBranch, multiplex

## Communication Nodes

### Slack (`n8n-nodes-base.slack`)
Send messages to Slack channels.

```json
{
  "name": "Alert Slack Channel",
  "type": "n8n-nodes-base.slack",
  "typeVersion": 2.2,
  "position": [750, 300],
  "parameters": {
    "resource": "message",
    "operation": "post",
    "channel": { "__rl": true, "value": "#it-alerts", "mode": "name" },
    "text": "={{ '🚨 High priority ticket: ' + $json.subject }}"
  },
  "credentials": {
    "slackOAuth2Api": { "id": "cred-id", "name": "PSD Slack" }
  }
}
```

### Send Email (`n8n-nodes-base.emailSend`)
Send email via SMTP.

```json
{
  "name": "Send Notification Email",
  "type": "n8n-nodes-base.emailSend",
  "typeVersion": 2.1,
  "position": [750, 300],
  "parameters": {
    "fromEmail": "n8n@psd401.net",
    "toEmail": "={{ $json.email }}",
    "subject": "Your request has been submitted",
    "emailType": "text",
    "message": "Hello {{ $json.name }}, your request #{{ $json.ticketId }} has been received."
  },
  "credentials": {
    "smtp": { "id": "cred-id", "name": "PSD SMTP" }
  }
}
```

## Google Workspace Nodes

### Google Sheets (`n8n-nodes-base.googleSheets`)

```json
{
  "name": "Log to Sheet",
  "type": "n8n-nodes-base.googleSheets",
  "typeVersion": 4.5,
  "position": [750, 300],
  "parameters": {
    "operation": "append",
    "documentId": { "__rl": true, "value": "spreadsheet-id", "mode": "id" },
    "sheetName": { "__rl": true, "value": "Sheet1", "mode": "name" },
    "columns": {
      "mappingMode": "defineBelow",
      "value": {
        "Date": "={{ $now.toISO() }}",
        "Name": "={{ $json.name }}",
        "Status": "={{ $json.status }}"
      }
    }
  },
  "credentials": {
    "googleSheetsOAuth2Api": { "id": "cred-id", "name": "PSD Google" }
  }
}
```

### Gmail (`n8n-nodes-base.gmail`)

```json
{
  "name": "Send Gmail",
  "type": "n8n-nodes-base.gmail",
  "typeVersion": 2.1,
  "position": [750, 300],
  "parameters": {
    "sendTo": "={{ $json.email }}",
    "subject": "Notification from PSD",
    "message": "Your request has been processed."
  },
  "credentials": {
    "gmailOAuth2": { "id": "cred-id", "name": "PSD Gmail" }
  }
}
```

## Response Nodes

### Respond to Webhook (`n8n-nodes-base.respondToWebhook`)
Send a response back to the webhook caller.

```json
{
  "name": "Return Success",
  "type": "n8n-nodes-base.respondToWebhook",
  "typeVersion": 1.1,
  "position": [750, 300],
  "parameters": {
    "respondWith": "json",
    "responseBody": "={{ { success: true, id: $json.id } }}"
  }
}
```

## Error Handling

### Error Trigger (`n8n-nodes-base.errorTrigger`)
Fires when another workflow fails. Set as the instance error workflow in Settings.

### Stop and Error (`n8n-nodes-base.stopAndError`)
Explicitly fail the workflow with a custom message.

```json
{
  "name": "Fail - Missing Data",
  "type": "n8n-nodes-base.stopAndError",
  "typeVersion": 1,
  "position": [750, 400],
  "parameters": {
    "errorMessage": "Required field 'email' is missing from input data"
  }
}
```

## n8n Expression Syntax

- Access incoming data: `{{ $json.fieldName }}`
- Access specific node output: `{{ $('Node Name').item.json.field }}`
- Current timestamp: `{{ $now.toISO() }}`
- Environment variables: `{{ $env.VARIABLE_NAME }}`
- Previous node data: `{{ $input.first().json.field }}`
- All items: `{{ $input.all() }}`
