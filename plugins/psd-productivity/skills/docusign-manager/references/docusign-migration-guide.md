# DocuSign → Documenso Migration Guide

## Concept Mapping

| DocuSign | Documenso | Notes |
|----------|-----------|-------|
| Envelope | Envelope | 1:1 mapping |
| Template | Template | Structure is different but concepts match |
| Document (PDF) | Envelope Item | Documenso uses `envelopeItems` |
| Tab | Field | Different naming, types map (see below) |
| Recipient | Recipient | Role mapping needed (see below) |
| Routing Order | Signing Order | Same concept: sequential signing |
| Carbon Copy | CC | Same role |
| PowerForm | n8n Form Trigger | Rebuild as n8n workflow with form |
| DocuSign Connect | Documenso Webhook | Different implementation, same concept |

## Recipient Role Mapping

| DocuSign Role | Documenso Role |
|---------------|----------------|
| Signer | SIGNER |
| Carbon Copy | CC |
| Certified Delivery | CC |
| In Person Signer | SIGNER |
| Agent | SIGNER |
| Editor | SIGNER |
| Intermediary | CC |
| Seal | SIGNER |
| Witness | SIGNER |

## Field Type Mapping

| DocuSign Tab | Documenso Field | Conversion Notes |
|-------------|-----------------|-------------------|
| `signHereTabs` | SIGNATURE | Direct mapping |
| `initialHereTabs` | INITIALS | Direct mapping |
| `dateSignedTabs` | DATE | Auto-filled in both |
| `textTabs` | TEXT | Direct mapping. Check `locked` → `readOnly` |
| `numberTabs` | NUMBER | Maps to TEXT with number validation |
| `emailTabs` | EMAIL | Direct mapping |
| `fullNameTabs` | NAME | Auto-filled in both |
| `checkboxTabs` | CHECKBOX | Direct mapping |
| `radioGroupTabs` | RADIO | Map group options |
| `listTabs` | DROPDOWN | Map `listItems` to dropdown options |
| `dateTabs` | DATE | Direct mapping |
| `noteTabs` | TEXT | Set `readOnly: true`, pre-fill with value |
| `titleTabs` | TEXT | No specific Documenso type, use TEXT |
| `companyTabs` | TEXT | No specific Documenso type, use TEXT |

### No Documenso Equivalent

| DocuSign Tab | Workaround |
|-------------|------------|
| `formulaTabs` | Calculate value in n8n Code node before sending |
| `notarizeTabs` | Not supported in Documenso |
| `ssnTabs` | Use TEXT with readOnly |
| `zipTabs` | Use TEXT |
| Conditional tabs | Implement logic in n8n workflow |
| Payment tabs | Not supported |

## Coordinate Conversion

DocuSign uses **absolute pixels at 72 DPI** (origin: top-left).
Documenso uses **percentages (0-100)** (origin: top-left).

### US Letter (612 x 792 pixels)

```
positionX (%) = (xPosition / 612) * 100
positionY (%) = (yPosition / 792) * 100
width (%)     = (tabWidth / 612) * 100
height (%)    = (tabHeight / 792) * 100
```

### Example

DocuSign tab: `{ xPosition: 350, yPosition: 700, width: 200, height: 30 }`

Documenso field:
```json
{
  "positionX": 57.19,
  "positionY": 88.38,
  "width": 32.68,
  "height": 3.79
}
```

## 20-Day Migration Plan

### Timeline Overview

| Days | Phase | Tasks |
|------|-------|-------|
| 1-2 | **Inventory & Archive** | Export account inventory, start bulk download (runs ~18 hours) |
| 3-5 | **Template Triage** | Download all template PDFs, classify into tiers |
| 6-12 | **Template Migration** | Recreate priority templates in Documenso |
| 13-17 | **PowerForm Migration** | Rebuild active PowerForms as n8n → Documenso workflows |
| 18-19 | **Testing & Cutover** | Test all workflows, redirect users |
| 20 | **Decommission** | Disable DocuSign PowerForms, notify users |

### Phase 1: Inventory & Archive (Days 1-2)

```bash
# Day 1: Run account inventory
bun export_account.js

# Day 1: Start bulk envelope download (runs ~18 hours overnight)
bun bulk_download.js

# Day 2: Check progress
bun bulk_download.js --status

# Day 2: Retry any failures
bun bulk_download.js --retry-failed
```

Output: `~/DocuSign-Export/account-inventory.json` + all signed PDFs in `~/DocuSign-Export/envelopes/`

### Phase 2: Template Triage (Days 3-5)

```bash
# Download ALL template PDFs and field mappings
bun export_all_templates.js

# For each template with actual content, download the PDF + fields
bun download_template.js <template-id>
```

**Triage categories:**
- **Tier 1 (Active PowerForms)**: 50 PowerForms — need full n8n workflow rebuild
- **Tier 2 (Frequently used templates)**: Templates used in last 6 months — recreate in Documenso
- **Tier 3 (Rarely used)**: Templates not used recently — archive only, recreate on demand
- **Tier 4 (Empty/test)**: ~106 unnamed stubs — skip

### Phase 3: Template Migration (Days 6-12)

For each Tier 1-2 template:

1. **Download template**: `bun download_template.js <id>`
   - Gets the original PDF document(s)
   - Generates `_documenso-fields.json` with Documenso percentage coordinates
   - Generates `_export.json` with recipient/field mapping

2. **Option A — Use original PDF directly in Documenso**:
   - Upload the downloaded PDF to Documenso as a template
   - Use the `_documenso-fields.json` to position fields via the Documenso API
   - Map recipients from the export JSON

3. **Option B — Recreate with pdf-builder (branded)**:
   - Use `/pdf-builder` to create a new branded PSD version of the form
   - Use the pdf-builder manifest for Documenso field positions
   - Better for forms that need a refresh anyway

4. **Test** — create a test envelope, verify fields align, send for test signing

### Phase 4: PowerForm Migration (Days 13-17)

Each DocuSign PowerForm becomes an n8n workflow:

```
[n8n Form Trigger] → [Build Documenso Payload] → [Create Envelope] → [Distribute]
```

For each PowerForm:

1. **Get PowerForm details**: `bun get_powerform.js <id>`
   - Note the `templateId` — this is the template to recreate
   - Note the recipients and their roles
   - Note the `powerFormUrl` that users currently use

2. **Recreate the template** (if not already done in Phase 3)

3. **Build n8n workflow** following the ESS Evaluation pattern:
   - Form Trigger collects signer info (name, email, any form data)
   - Code node builds Documenso payload with pre-filled fields
   - HTTP Request creates and distributes the envelope
   - PSD logo branding on the form
   - Error notifications to Google Chat

4. **Wire to completion handler** — the Document Completion Router already catches all `DOCUMENT_COMPLETED` webhooks. Add the new title prefix to the Switch node.

5. **Redirect users** — update any links/bookmarks pointing to the old DocuSign PowerForm URL to the new n8n form URL

### Phase 5: Testing & Cutover (Days 18-19)

- Test each migrated workflow end-to-end
- Verify signed PDFs look correct
- Verify completion handler files to Drive and logs to Sheet
- Update the tracking spreadsheet to handle new document types
- Communicate the change to users

### Phase 6: Decommission (Day 20)

- Disable all DocuSign PowerForms
- Send notification to all DocuSign users about the transition
- Keep DocuSign account in read-only mode for 30 days (audit trail access)
- After 30 days, confirm all historical documents are archived, then cancel

## Step-by-Step: Recreating a Template in Documenso

```bash
# 1. Download the template PDF and field mapping
bun download_template.js <docusign-template-id>

# Output:
#   ~/DocuSign-Export/templates/{name}/document.pdf
#   ~/DocuSign-Export/templates/{name}/_documenso-fields.json

# 2. Upload PDF to Documenso (via API or UI)
bun plugins/psd-productivity/skills/documenso-manager/scripts/create_envelope.js \
  ~/DocuSign-Export/templates/{name}/document.pdf \
  '{"title":"Template Name","type":"TEMPLATE"}'

# 3. Add fields from the mapping JSON
#    Read _documenso-fields.json and use add_fields.js to position them

# 4. Test with a sample envelope
```

## Step-by-Step: Rebuilding a PowerForm as n8n Workflow

```bash
# 1. Get PowerForm details
bun get_powerform.js <powerform-id>
# Note: templateId, recipients, signingMode

# 2. Download and export the linked template
bun download_template.js <template-id-from-step-1>

# 3. Recreate template in Documenso (see above)

# 4. Build n8n workflow following the ESS Evaluation pattern:
#    - Form Trigger (branded, wide, logo)
#    - Read Template PDF from Template Server
#    - Build Documenso Payload (pre-fill fields from form data)
#    - Create Envelope (multipart upload)
#    - Distribute (raw JSON body)
#    - Tag: psd-production, psd-{department}

# 5. Add to Document Completion Router
#    - Add title prefix to Switch node
#    - Route to existing or new completion handler

# 6. Deploy, activate, test
```

## For Historical Envelopes

```bash
# Bulk download ALL completed envelopes (~18 hours for 55K)
bun bulk_download.js

# Check progress
bun bulk_download.js --status

# Retry failures
bun bulk_download.js --retry-failed

# Download audit certificates for specific envelopes
bun download_audit.js <envelope-id> certificate
```

The signed PDFs are self-contained — they include all signatures, timestamps, and certificate data. No ongoing DocuSign access needed after download.

## What Doesn't Migrate

| Feature | Impact | Workaround |
|---------|--------|------------|
| PowerForms | Self-service signing links stop working | Rebuild as n8n form → Documenso workflow |
| Conditional routing | Complex recipient logic | Implement in n8n workflow logic |
| Formula fields | Calculated values | Calculate in n8n Code node |
| Payment tabs | Payment collection | Use separate payment system |
| SMS delivery | Text message signing | Documenso uses email only |
| In-person signing | Tablet signing ceremony | Not supported in Documenso |
| DocuSign Connect | Real-time webhook events | Documenso has its own webhooks |
| Branding/themes | DocuSign branding | Use pdf-builder for PSD branding |
