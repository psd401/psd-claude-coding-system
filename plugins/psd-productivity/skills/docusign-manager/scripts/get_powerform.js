#!/usr/bin/env bun

// Get PowerForm details including its template, recipients, and signing URL.
// Usage: bun get_powerform.js <powerform-id>
//
// PowerForms are self-service signing links. To recreate in Documenso/n8n:
// 1. Note the templateId — export that template with export_template.js
// 2. Build an n8n Form Trigger workflow that collects signer info
// 3. Wire the form to create a Documenso envelope from the template

const { docusignFetch } = require('./docusign_client.js');

const powerFormId = process.argv[2];
if (!powerFormId) {
  console.error(JSON.stringify({ error: 'PowerForm ID required. Usage: bun get_powerform.js <powerform-id>' }));
  process.exit(1);
}

async function getPowerForm() {
  const result = await docusignFetch(`/powerforms/${powerFormId}`);
  if (result.error) return result;

  // Also get the PowerForm's submission data
  const formData = await docusignFetch(`/powerforms/${powerFormId}/form_data`);

  return {
    powerFormId: result.powerFormId,
    name: result.name,
    templateId: result.templateId,
    templateName: result.templateName || '',
    isActive: result.isActive,
    signingMode: result.signingMode,
    powerFormUrl: result.powerFormUrl || '',
    createdDateTime: result.createdDateTime,
    senderName: result.senderName || '',
    maxUseAge: result.maxUseAge || '',
    usesRemaining: result.usesRemaining || '',
    recipients: (result.recipients || []).map(r => ({
      recipientType: r.recipientType,
      roleName: r.roleName,
      routingOrder: r.routingOrder,
      accessCode: r.accessCode || '',
      idCheckConfigurationName: r.idCheckConfigurationName || '',
    })),
    submissionCount: formData.error ? 'unknown' : (formData.envelopes || []).length,
    migrationNotes: {
      templateId: result.templateId,
      hint: 'Export the template with: bun export_template.js ' + result.templateId,
      rebuiltAs: 'n8n Form Trigger → Documenso envelope workflow',
    },
  };
}

try {
  const result = await getPowerForm();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
