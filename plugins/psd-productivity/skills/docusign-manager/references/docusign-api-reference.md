# DocuSign eSignature REST API v2.1 Reference

## Authentication

### JWT Grant Flow
1. Build JWT assertion: `{ iss: integrationKey, sub: userId, aud: oauthHost, scope: "signature impersonation" }`
2. Sign with RSA-SHA256 private key
3. POST to `https://account.docusign.com/oauth/token` with `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=<jwt>`
4. Response: `{ access_token, token_type: "Bearer", expires_in: 3600 }`
5. Use token: `Authorization: Bearer <access_token>`

### Base URI Discovery
```
GET https://account.docusign.com/oauth/userinfo
Authorization: Bearer <token>
```
Response contains `accounts[].base_uri` — use this as the API base URL. Do NOT hardcode `na1.docusign.net`.

## Rate Limits

| Limit | Value |
|-------|-------|
| Hourly | 3,000 API calls per account |
| Burst | 500 calls per 30 seconds |
| Polling | Max 1 request per unique resource per 15 minutes |

Exceeding returns: `HOURLY_APIINVOCATION_LIMIT_EXCEEDED` (429)

## Pagination

DocuSign uses `start_position` + `count` pagination (not page/perPage):

| Parameter | Description |
|-----------|-------------|
| `count` | Items per page (max 100 for most endpoints) |
| `start_position` | 0-based offset |

Response includes `totalSetSize` (total matching items) and `resultSetSize` (items in this page).

## Template Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/templates` | List templates (paginated) |
| GET | `/templates/{templateId}` | Get template details |
| GET | `/templates/{templateId}/recipients` | List template recipients |
| GET | `/templates/{templateId}/documents` | List template documents |
| GET | `/templates/{templateId}/documents/{documentId}` | Get document details |

### List Templates Query Parameters
- `count` — items per page (default 100)
- `start_position` — offset
- `folder` — filter by folder name
- `search_text` — search by name

## Envelope Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/envelopes` | List envelopes (paginated, filtered) |
| GET | `/envelopes/{envelopeId}` | Get envelope details |
| GET | `/envelopes/{envelopeId}/documents` | List envelope documents |
| GET | `/envelopes/{envelopeId}/documents/combined` | Download all docs as single PDF |
| GET | `/envelopes/{envelopeId}/documents/certificate` | Download Certificate of Completion |
| GET | `/envelopes/{envelopeId}/documents/{documentId}` | Download specific document |
| GET | `/envelopes/{envelopeId}/audit_events` | Get audit trail |
| GET | `/envelopes/{envelopeId}/recipients` | List recipients |

### List Envelopes Query Parameters

**CRITICAL**: `from_date` is required. If omitted, DocuSign silently defaults to 30 days ago.

| Parameter | Description |
|-----------|-------------|
| `from_date` | **Required** — ISO date string (e.g., `2024-01-01T00:00:00Z`) |
| `to_date` | End date filter |
| `status` | Filter: `sent`, `completed`, `declined`, `voided`, `created` |
| `search_text` | Full-text search |
| `count` | Items per page |
| `start_position` | Offset |
| `order` | `asc` or `desc` |
| `order_by` | `created`, `last_modified`, `status` |
| `include` | Extra data: `recipients`, `tabs`, `documents`, `custom_fields` |

### Get Template/Envelope Include Parameter
Add `?include=recipients,tabs,documents,custom_fields` to get full details in one call.

## Envelope Status Codes

| Status | Description |
|--------|-------------|
| `created` | Envelope created but not sent |
| `sent` | Sent to recipients, awaiting signatures |
| `delivered` | Viewed by recipient |
| `signed` | Signed by recipient (not yet completed) |
| `completed` | All recipients have signed |
| `declined` | Recipient declined to sign |
| `voided` | Sender voided the envelope |

## Tab Types (DocuSign Fields)

| Tab Type | Description | Documenso Equivalent |
|----------|-------------|---------------------|
| `signHereTabs` | Signature | SIGNATURE |
| `initialHereTabs` | Initials | INITIALS |
| `dateSignedTabs` | Auto-filled sign date | DATE |
| `textTabs` | Free text input | TEXT |
| `numberTabs` | Numeric input | NUMBER |
| `emailTabs` | Email input | EMAIL |
| `fullNameTabs` | Auto-filled name | NAME |
| `checkboxTabs` | Checkbox | CHECKBOX |
| `radioGroupTabs` | Radio buttons | RADIO |
| `listTabs` | Dropdown select | DROPDOWN |
| `dateTabs` | Date picker | DATE |
| `noteTabs` | Read-only text | TEXT (readOnly) |
| `titleTabs` | Job title | TEXT |
| `companyTabs` | Company name | TEXT |
| `formulaTabs` | Calculated field | No equivalent |
| `notarizeTabs` | Notarization | No equivalent |

## Coordinate System

DocuSign uses absolute pixel positions at 72 DPI:
- US Letter: 612 x 792 pixels
- Origin: top-left corner
- `xPosition` / `yPosition`: pixel offset from top-left
- `width` / `height`: pixel dimensions

Convert to Documenso percentages: `positionX = (xPosition / 612) * 100`
