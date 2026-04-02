# PSD Workflow Templates

Pre-built patterns for common PSD automation needs. Each template includes the workflow design and key node configurations. Use these as starting points with `/n8n build`.

## Template 1: Freshservice High-Priority Alert

**Trigger**: Schedule (every 5 minutes)
**Flow**: Check for recent P1/P2 tickets → Filter new ones → Send Slack alert

**Nodes**:
1. `Schedule - Every 5 Minutes` (scheduleTrigger) — cron: `*/5 * * * *`
2. `Fetch Recent Tickets` (httpRequest) — GET `/api/v2/tickets?workspace_id=2&updated_since=<5min_ago>`
3. `Filter High Priority` (if) — condition: `priority <= 2`
4. `Alert IT Channel` (slack) — post to `#it-alerts` with ticket details

**Credentials needed**: Freshservice API (httpHeaderAuth), Slack (slackOAuth2Api)

## Template 2: Daily Staff Absence Digest

**Trigger**: Cron (6:30 AM Pacific, weekdays only)
**Flow**: Fetch today's absences from Red Rover → Format summary → Email admin team

**Nodes**:
1. `Weekday Morning Trigger` (scheduleTrigger) — cron: `30 6 * * 1-5`
2. `Fetch Today Absences` (httpRequest) — GET Red Rover `/absences?startDate=today&endDate=today`
3. `Format Summary` (code) — JavaScript to group by school, count unfilled
4. `Email Admin Team` (emailSend) — to admin distribution list

**Credentials needed**: Red Rover (httpBasicAuth), SMTP (smtp)

## Template 3: New Student Intake Pipeline

**Trigger**: n8n Form (internal request form)
**Flow**: Parent submits form → Create Freshservice ticket → Create Calendar invite → Log to Google Sheet

**Nodes**:
1. `Intake Form` (formTrigger) — fields: student name, grade, school, parent email, start date
2. `Create Enrollment Ticket` (httpRequest) — POST Freshservice ticket with form data
3. `Create Meeting Invite` (googleCalendar) — enrollment meeting with parent
4. `Log to Tracking Sheet` (googleSheets) — append row to enrollment tracker

**Credentials needed**: Freshservice API, Google Calendar OAuth2, Google Sheets OAuth2

## Template 4: IT Equipment Request with Approval Routing

**Trigger**: n8n Form
**Flow**: Staff submits form → IF cost > $500 route to director, else auto-approve → Create ticket → Notify requester

**Nodes**:
1. `Equipment Request Form` (formTrigger) — fields: name, equipment type, cost, justification
2. `Check Cost Threshold` (if) — condition: `cost > 500`
3. `Route to Director` (emailSend) — approval request email (true branch)
4. `Auto-Approve` (set) — set status to approved (false branch)
5. `Create Ticket` (httpRequest) — POST Freshservice ticket
6. `Notify Requester` (emailSend) — confirmation email

**Credentials needed**: Freshservice API, SMTP

## Template 5: PowerSchool Report Scheduler

**Trigger**: Cron (nightly at 11 PM)
**Flow**: Fetch data from PowerSchool API → Process in Code node → Upload CSV to Google Drive → Email notification

**Nodes**:
1. `Nightly Trigger` (scheduleTrigger) — cron: `0 23 * * *`
2. `Fetch PS Data` (httpRequest) — GET PowerSchool API endpoint
3. `Process Data` (code) — transform to CSV format
4. `Upload to Drive` (googleDrive) — upload to shared reports folder
5. `Notify Team` (emailSend) — report ready notification

**Credentials needed**: PowerSchool API (httpHeaderAuth), Google Drive OAuth2, SMTP

## Template 6: Workflow Health Monitor

**Trigger**: Cron (hourly)
**Flow**: List recent executions → Filter for errors → If any errors → Slack alert with details

**Nodes**:
1. `Hourly Check` (scheduleTrigger) — cron: `0 * * * *`
2. `List Recent Executions` (httpRequest) — GET n8n API `/api/v1/executions?status=error`
3. `Any Errors?` (if) — condition: `result count > 0`
4. `Format Error Report` (code) — summarize failed workflows
5. `Alert Slack` (slack) — post to `#n8n-monitoring`

**Credentials needed**: n8n API (httpHeaderAuth — use the same API key), Slack

**Note**: This workflow monitors the n8n instance itself. The n8n API request uses the same `N8N_HOST` and `N8N_API_KEY` as the management scripts.

## Template 7: Google Form → Freshservice Ticket

**Trigger**: Webhook (Google Apps Script sends POST on form submit)
**Flow**: Receive form data → Map fields to ticket schema → Create ticket → Reply to submitter

**Nodes**:
1. `Google Form Webhook` (webhook) — POST, path: `google-form-to-ticket`
2. `Map Form Fields` (set) — transform Google Form field names to Freshservice ticket fields
3. `Create Ticket` (httpRequest) — POST Freshservice `/tickets`
4. `Send Confirmation` (emailSend) — reply to form submitter

**Google Apps Script** (add to the Google Form):
```javascript
function onFormSubmit(e) {
  var data = {};
  var items = e.response.getItemResponses();
  items.forEach(function(item) {
    data[item.getItem().getTitle()] = item.getResponse();
  });
  data.email = e.response.getRespondentEmail();

  UrlFetchApp.fetch('http://N8N_HOST/webhook/google-form-to-ticket', {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(data)
  });
}
```

**Credentials needed**: Freshservice API, SMTP

## Template 8: Document Completion Router

**Trigger**: Webhook (single endpoint for all Documenso DOCUMENT_COMPLETED events)
**Flow**: Receive webhook → extract document info → switch by title prefix → dispatch to handler sub-workflow

**Nodes**:
1. `Documenso Webhook` (webhook) — path: `documenso-completed`, method: POST, `responseMode: 'onReceived'` (respond immediately)
2. `Extract Document Info` (code) — parse webhook payload, determine document type from title prefix
3. `Route by Document Type` (switch) — routes by `documentType` field: "evaluation" → handler, unknown → log
4. `Handle Evaluation` (executeWorkflow) — calls the ESS handler sub-workflow. **Must use `__rl` format for workflowId.**
5. `Log Unknown Document` (code) — logs unhandled document types for review

**Key pattern**: One Documenso webhook → one router → many handler sub-workflows. Add new document types by adding cases to the Switch node and creating handler workflows.

**Credentials needed**: None (webhook is unauthenticated; Documenso secret verification optional)

## Template 9: Asset Server (Logo/Template)

**Trigger**: Webhook (GET request serves binary assets)
**Flow**: Receive GET request → Code node outputs base64-embedded binary → Respond with binary + Content-Type header

**Nodes**:
1. `Asset Request` (webhook) — path: `psd-template`, method: GET, `responseMode: 'responseNode'`
2. `Serve Asset` (code) — contains base64-embedded assets in a lookup object, selected by `$input.first().json.query.name`
3. `Respond` (respondToWebhook) — `respondWith: 'binary'`, sets `Content-Type` (image/png or application/pdf) and `Cache-Control: public, max-age=86400`

**Multi-asset pattern**: The Code node contains a `templates` object with named entries. URL: `/webhook/psd-template?name=classified-evaluation`. Add new templates by adding entries to the templates object.

**Use cases**: Serve logos for form branding (avoids `<img>` sanitization), serve PDF templates (avoids Google Drive download bugs), serve any static asset without filesystem dependencies.

**Credentials needed**: None

## Template 10: Error Notification Handler

**Trigger**: Error Trigger (fires when another workflow fails)
**Flow**: Receive error data → format message → POST to Google Chat webhook

**Nodes**:
1. `Workflow Error` (errorTrigger) — receives error data from failed workflows
2. `Format Error Message` (code) — extracts workflow name, error message, execution ID, timestamp. **No optional chaining (`?.`)** — use `|| {}` fallback. **No `$http` or `fetch()`** — format data only.
3. `Send to Google Chat` (httpRequest) — POST to Google Chat webhook URL with `{ "text": "..." }` body

**Setup**: Set `errorWorkflow` in each production workflow's `settings` to this workflow's ID. Community Edition has no instance-level error workflow setting.

**Credentials needed**: Google Chat incoming webhook URL (no OAuth needed)

## Tag Convention

All PSD workflows should be tagged:

| Tag | Use For |
|-----|---------|
| `psd-production` | Live, active workflows |
| `psd-staging` | Testing/development |
| `psd-template` | Reusable patterns (not activated) |
| `psd-freshservice` | Freshservice integrations |
| `psd-powerschool` | PowerSchool integrations |
| `psd-google` | Google Workspace integrations |
| `psd-redrover` | Red Rover integrations |
| `psd-monitoring` | Health/status monitoring |
| `psd-ess` | Employee Support Services |
| `psd-documenso` | Documenso signing integrations |
| `psd-infrastructure` | Shared services (logo, template, error handler, router) |
