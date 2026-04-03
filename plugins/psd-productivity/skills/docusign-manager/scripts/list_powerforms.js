#!/usr/bin/env bun

// List all PowerForms in the account.
// Usage: bun list_powerforms.js

const { docusignFetch } = require('./docusign_client.js');

async function listPowerForms() {
  const result = await docusignFetch('/powerforms');

  if (result.error) return result;

  return {
    count: (result.powerForms || []).length,
    powerForms: (result.powerForms || []).map(p => ({
      powerFormId: p.powerFormId,
      name: p.name,
      templateId: p.templateId,
      templateName: p.templateName || '',
      signingMode: p.signingMode || '',
      isActive: p.isActive,
      createdDateTime: p.createdDateTime,
      powerFormUrl: p.powerFormUrl || '',
      senderName: p.senderName || '',
      senderEmail: p.senderUserId || '',
    })),
  };
}

try {
  const result = await listPowerForms();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
