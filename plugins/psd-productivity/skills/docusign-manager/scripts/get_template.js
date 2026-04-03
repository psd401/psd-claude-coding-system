#!/usr/bin/env bun

// Get full template details including recipients, tabs (fields), and documents.
// Usage: bun get_template.js <template-id>

const { docusignFetch } = require('./docusign_client.js');

const templateId = process.argv[2];
if (!templateId) {
  console.error(JSON.stringify({ error: 'Template ID required. Usage: bun get_template.js <template-id>' }));
  process.exit(1);
}

async function getTemplate() {
  const result = await docusignFetch(`/templates/${templateId}?include=recipients,tabs,documents,custom_fields`);

  if (result.error) return result;

  return {
    templateId: result.templateId,
    name: result.name,
    description: result.description || '',
    emailSubject: result.emailSubject || '',
    emailBlurb: result.emailBlurb || '',
    created: result.created,
    lastModified: result.lastModified,
    shared: result.shared === 'true',
    documents: (result.documents || []).map(d => ({
      documentId: d.documentId,
      name: d.name,
      fileExtension: d.fileExtension,
      pages: d.pages,
      order: d.order,
    })),
    recipients: {
      signers: (result.recipients?.signers || []).map(s => ({
        recipientId: s.recipientId,
        roleName: s.roleName,
        routingOrder: s.routingOrder,
        tabs: summarizeTabs(s.tabs),
      })),
      carbonCopies: (result.recipients?.carbonCopies || []).map(c => ({
        recipientId: c.recipientId,
        roleName: c.roleName,
        routingOrder: c.routingOrder,
      })),
      certifiedDeliveries: (result.recipients?.certifiedDeliveries || []),
    },
  };
}

function summarizeTabs(tabs) {
  if (!tabs) return {};
  const summary = {};
  for (const [tabType, tabList] of Object.entries(tabs)) {
    if (Array.isArray(tabList) && tabList.length > 0) {
      summary[tabType] = tabList.map(t => ({
        tabLabel: t.tabLabel,
        documentId: t.documentId,
        pageNumber: t.pageNumber,
        xPosition: t.xPosition,
        yPosition: t.yPosition,
        width: t.width,
        height: t.height,
        required: t.required,
        value: t.value || '',
      }));
    }
  }
  return summary;
}

try {
  const result = await getTemplate();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
