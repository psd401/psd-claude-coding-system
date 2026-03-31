# PSD End-to-End Signing Workflows

## Workflow 1: New Hire Employment Contract

**Trigger**: HR initiates via `/documenso build` or n8n workflow
**Flow**:
1. HR uploads employment contract PDF
2. Add recipients: Employee (SIGNER) → HR Director (APPROVER) → Superintendent (SIGNER)
3. Place signature, date, and initials fields
4. Distribute — Employee receives signing email first (SEQUENTIAL)
5. After Employee signs → HR Director reviews and approves
6. After approval → Superintendent signs
7. All parties receive completed PDF
8. **n8n automation**: Webhook on DOCUMENT_COMPLETED → store signed PDF in Google Drive HR folder → close Freshservice onboarding ticket

## Workflow 2: Seasonal Coaching Agreements

**Trigger**: Athletic Director batch-sends at season start
**Flow**:
1. Create envelope from Coaching Stipend template
2. Prefill coach name, sport, stipend amount
3. Distribute to coach for signature
4. AD receives as APPROVER after coach signs
5. **n8n automation**: Webhook → update coaching roster spreadsheet in Google Sheets

## Workflow 3: Vendor MOU Approval Chain

**Trigger**: Department head initiates
**Flow**:
1. Upload vendor MOU PDF
2. Add vendor contact as external SIGNER
3. Add CIO/CFO as APPROVER
4. Add Superintendent as final SIGNER
5. Sequential signing: Vendor → CIO/CFO approval → Superintendent
6. **n8n automation**: Webhook on DOCUMENT_COMPLETED → store in Google Drive Procurement folder → create Freshservice asset record

## Workflow 4: Field Trip Permission Batch

**Trigger**: Teacher prepares trip
**Flow**:
1. Create template with permission slip PDF
2. For each student's parent/guardian:
   - Use template with prefilled student name
   - Distribute to parent email
3. Track completion — identify unsigned forms
4. Teacher receives CC on each completion
5. **n8n automation**: Webhook → update Google Sheet tracker → alert teacher when all are signed

## Workflow 5: Board Policy Acknowledgement Annual

**Trigger**: Board secretary at fiscal year start
**Flow**:
1. Create template with policy document
2. For each board member:
   - Use template to create individual envelope
   - Distribute
3. Track which members have signed
4. **n8n automation**: Webhook → update compliance tracker → email board secretary when all complete

## Workflow 6: Compliance Training Acknowledgement

**Trigger**: HR compliance deadline
**Flow**:
1. Upload training acknowledgement form
2. Batch create envelopes for all staff
3. Track completion rates
4. Redistribute to non-responders at reminder intervals
5. **n8n automation**: Schedule trigger (weekly) → check for unsigned envelopes → auto-redistribute → alert HR of non-compliant staff

## n8n Integration Pattern

### Webhook Setup
Configure in Documenso Settings > Webhooks:
- **URL**: `http://N8N_HOST/webhook/documenso-events`
- **Secret**: Shared secret for `X-Documenso-Secret` header verification
- **Events**: DOCUMENT_COMPLETED, DOCUMENT_SIGNED, DOCUMENT_REJECTED

### n8n Workflow: Document Completion Handler
```
1. Webhook Trigger (receive Documenso event)
2. Switch on event type
3. IF DOCUMENT_COMPLETED:
   a. HTTP Request → Download signed PDF from Documenso
   b. Google Drive → Upload to appropriate folder
   c. IF Freshservice ticket exists → Update/close ticket
   d. Email notification to document owner
4. IF DOCUMENT_REJECTED:
   a. Email alert to document owner
   b. Create Freshservice ticket for follow-up
```

### Credential Setup in n8n
- **Type**: httpHeaderAuth
- **Header Name**: Authorization
- **Header Value**: api_xxxxxxxx (the full API key including `api_` prefix)
- **NOT Bearer** — do not add `Bearer` prefix
