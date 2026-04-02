# Documenso Envelope Lifecycle

## States

```
DRAFT → PENDING → COMPLETED
                ↘ REJECTED
```

| State | Description | Allowed Operations |
|-------|-------------|-------------------|
| **DRAFT** | Created, not sent. Can add/remove recipients, fields, items. | Update, distribute, delete, duplicate |
| **PENDING** | Sent to recipients, awaiting signatures. | Redistribute, audit-log, download original |
| **COMPLETED** | All required signatories signed. | Download signed, audit-log |
| **REJECTED** | A recipient declined to sign. | Audit-log, delete |

## Creating an Envelope — Full Flow

### Step 1: Create (multipart/form-data)

```
POST /api/v2/envelope/create
Content-Type: multipart/form-data

payload: JSON string with envelope configuration
files: one or more PDF files
```

**Payload JSON**:
```json
{
  "type": "DOCUMENT",
  "title": "Employment Contract - Jane Doe",
  "recipients": [
    {
      "email": "jane@psd401.net",
      "name": "Jane Doe",
      "role": "SIGNER",
      "signingOrder": 1,
      "fields": [
        {
          "type": "SIGNATURE",
          "identifier": 0,
          "page": 1,
          "positionX": 55,
          "positionY": 85,
          "width": 40,
          "height": 5,
          "fieldMeta": { "label": "Employee Signature", "required": true }
        },
        {
          "type": "DATE",
          "identifier": 0,
          "page": 1,
          "positionX": 10,
          "positionY": 85,
          "width": 25,
          "height": 3,
          "fieldMeta": { "label": "Date", "required": true }
        }
      ]
    }
  ],
  "meta": {
    "subject": "Please sign your employment contract",
    "message": "Please review and sign the attached employment contract.",
    "timezone": "America/Los_Angeles",
    "dateFormat": "yyyy-MM-dd",
    "distributionMethod": "EMAIL",
    "signingOrder": "SEQUENTIAL",
    "language": "en",
    "typedSignatureEnabled": true,
    "drawSignatureEnabled": true
  }
}
```

### Step 2: Add More Recipients/Fields (optional)

If not included in the create payload, add separately:

```bash
bun add_recipients.js <envelope-id> '[{"email":"hr@psd401.net","name":"HR Director","role":"APPROVER","signingOrder":2}]'
bun add_fields.js <envelope-id> '[{"recipientId":"xxx","type":"SIGNATURE","identifier":0,"page":2,"positionX":55,"positionY":85,"width":40,"height":5}]'
```

### Step 3: Distribute

```bash
bun distribute_envelope.js <envelope-id>
```

This sends signing emails and moves status to PENDING.

### Step 4: Track & Download

```bash
bun get_envelope.js <envelope-id>        # Check status
bun get_audit_log.js <envelope-id>       # See audit trail
bun download_document.js <item-id> signed # Download signed PDF
```

## Signing Order

| Mode | Behavior |
|------|----------|
| `SEQUENTIAL` | Recipients sign in `signingOrder` order (1, 2, 3...) |
| `PARALLEL` | All recipients receive signing links simultaneously |

## Email Settings (in meta)

```json
{
  "emailSettings": {
    "recipientSigningRequest": true,
    "recipientRemoved": true,
    "recipientSigned": true,
    "documentCompleted": true,
    "ownerDocumentCompleted": true
  },
  "emailReplyTo": "hagelk@psd401.net"
}
```

## Signing Authentication Options

Both `globalAccessAuth` and `globalActionAuth` support:

| Value | Description |
|-------|-------------|
| `ACCOUNT` | Must have Documenso account |
| `TWO_FACTOR_AUTH` | 2FA required |
| `PASSKEY` | Passkey authentication |
| `PASSWORD` | Password required |
| `EXPLICIT_NONE` | No auth required (public) |

## Field Positioning Best Practices

### Standard Signature Block (bottom of page)

```
Employee Signature: positionX=55, positionY=85, width=40, height=5
Date:               positionX=10, positionY=85, width=25, height=3
```

### Multi-Signer Layout (two signatures side by side)

```
Signer 1:  positionX=5,  positionY=85, width=40, height=5
Signer 2:  positionX=55, positionY=85, width=40, height=5
Date 1:    positionX=5,  positionY=91, width=25, height=3
Date 2:    positionX=55, positionY=91, width=25, height=3
```

### Initials on Each Page

```
Page 1: positionX=85, positionY=95, width=10, height=3
Page 2: positionX=85, positionY=95, width=10, height=3
(repeat for each page)
```

### Checkbox Group (e.g., permission form)

```
Checkbox 1: positionX=5, positionY=60, width=3, height=2
Checkbox 2: positionX=5, positionY=65, width=3, height=2
Checkbox 3: positionX=5, positionY=70, width=3, height=2
```

## Pre-filled ReadOnly Fields

Use `fieldMeta.text` with `readOnly: true` to create display-only fields that show data to signers without requiring them to type anything. Common for form data collected via n8n forms before signing.

### How It Works

1. Create a TEXT field via the API with `fieldMeta.text` set to the pre-filled value
2. Set `fieldMeta.readOnly: true` to prevent signer editing
3. Assign the field to any recipient (typically the first signer) — it's visible to all
4. Optionally set `fieldMeta.fontSize` to control text size (default is large)

### Known Signing Preview Bug (#2669)

Pre-filled readOnly TEXT fields may show text overflowing past the field border in the browser signing preview. This is a CSS rendering bug — the signing page uses `25cqw` (container query width) for font sizing, but `container-type: inline-size` is missing on the field container, causing the font size to be calculated from the viewport width instead of the field width.

**The final signed PDF renders correctly** — it uses the Konva canvas renderer which properly respects field width minus 12px padding.

**Workaround**: Accept the signing preview overflow. Keep the PDF template box border visible so the document looks clean even with the preview issue. Filed as [documenso/documenso#2669](https://github.com/documenso/documenso/issues/2669).

### Pre-fill + readOnly Caveats

- Bug #2512: clicking a pre-filled (non-readOnly) field clears its value and shows the label. `readOnly: true` prevents this.
- Same email for multiple recipients may cause Documenso to skip signing emails (deduplication). Use different emails for each signer.

## Common Mistakes

1. **Using pixels instead of percentages** — positionX=500 is invalid (max 100)
2. **Forgetting `identifier`** — 0-based index of the PDF file in the envelope
3. **Not setting `signingOrder`** when using SEQUENTIAL mode
4. **Distributing before adding fields** — recipients get emails but have nothing to sign
5. **Using v1 endpoints** — v1 is deprecated, only use `/api/v2`
