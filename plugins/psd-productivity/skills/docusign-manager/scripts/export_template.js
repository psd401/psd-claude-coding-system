#!/usr/bin/env bun

// Export a DocuSign template as a Documenso-compatible JSON mapping.
// Usage: bun export_template.js <template-id> [output-dir]
//
// Transforms DocuSign tab types and pixel coordinates to Documenso
// field types and percentage coordinates for migration.

const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, sanitizeFilename } = require('./docusign_client.js');

const templateId = process.argv[2];
const outputDir = process.argv[3] || join(homedir(), 'DocuSign-Export', 'templates');

if (!templateId) {
  console.error(JSON.stringify({ error: 'Template ID required. Usage: bun export_template.js <template-id> [output-dir]' }));
  process.exit(1);
}

// DocuSign tab type → Documenso field type mapping
const TAB_TYPE_MAP = {
  signHereTabs: 'SIGNATURE',
  initialHereTabs: 'INITIALS',
  dateSignedTabs: 'DATE',
  textTabs: 'TEXT',
  numberTabs: 'NUMBER',
  emailTabs: 'EMAIL',
  fullNameTabs: 'NAME',
  checkboxTabs: 'CHECKBOX',
  radioGroupTabs: 'RADIO',
  listTabs: 'DROPDOWN',
  dateTabs: 'DATE',
  noteTabs: 'TEXT',
  titleTabs: 'TEXT',
  companyTabs: 'TEXT',
  ssnTabs: 'TEXT',
  zipTabs: 'TEXT',
};

// DocuSign uses absolute pixel positions at 72 DPI
// US Letter: 612 x 792 points
const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;

function pixelToPercent(x, y, w, h) {
  return {
    positionX: Math.round((x / PAGE_WIDTH) * 100 * 100) / 100,
    positionY: Math.round((y / PAGE_HEIGHT) * 100 * 100) / 100,
    width: Math.round(((w || 100) / PAGE_WIDTH) * 100 * 100) / 100,
    height: Math.round(((h || 20) / PAGE_HEIGHT) * 100 * 100) / 100,
  };
}

// DocuSign recipient role → Documenso role
const ROLE_MAP = {
  signer: 'SIGNER',
  carbonCopy: 'CC',
  certifiedDelivery: 'CC',
  inPersonSigner: 'SIGNER',
  agent: 'SIGNER',
  editor: 'SIGNER',
  intermediary: 'CC',
  seal: 'SIGNER',
  witness: 'SIGNER',
};

async function exportTemplate() {
  const result = await docusignFetch(`/templates/${templateId}?include=recipients,tabs,documents,custom_fields`);

  if (result.error) return result;

  // Build Documenso-compatible structure
  const exported = {
    source: 'docusign',
    sourceTemplateId: templateId,
    exportedAt: new Date().toISOString(),
    name: result.name,
    description: result.description || '',
    emailSubject: result.emailSubject || '',
    emailMessage: result.emailBlurb || '',
    documents: (result.documents || []).map(d => ({
      documentId: d.documentId,
      name: d.name,
      fileExtension: d.fileExtension,
      pages: d.pages,
    })),
    recipients: [],
    fields: [],
    unmappedTabs: [],
  };

  // Process signers
  for (const signer of (result.recipients?.signers || [])) {
    const recipient = {
      role: ROLE_MAP.signer,
      roleName: signer.roleName || `Signer ${signer.routingOrder}`,
      signingOrder: parseInt(signer.routingOrder || '1', 10),
      fields: [],
    };

    if (signer.tabs) {
      for (const [tabType, tabs] of Object.entries(signer.tabs)) {
        const documensoType = TAB_TYPE_MAP[tabType];
        if (!documensoType) {
          // Track unmapped tabs
          if (Array.isArray(tabs) && tabs.length > 0) {
            exported.unmappedTabs.push({
              tabType,
              count: tabs.length,
              note: `No Documenso equivalent for ${tabType}`,
            });
          }
          continue;
        }

        for (const tab of (tabs || [])) {
          const coords = pixelToPercent(
            parseInt(tab.xPosition || '0', 10),
            parseInt(tab.yPosition || '0', 10),
            parseInt(tab.width || '100', 10),
            parseInt(tab.height || '20', 10)
          );

          const field = {
            type: documensoType,
            page: parseInt(tab.pageNumber || '1', 10),
            ...coords,
            label: tab.tabLabel || '',
            required: tab.required === 'true',
            readOnly: tab.locked === 'true',
            value: tab.value || '',
          };

          // Add dropdown options if applicable
          if (tabType === 'listTabs' && tab.listItems) {
            field.options = tab.listItems.map(i => i.text || i.value);
          }

          recipient.fields.push(field);
          exported.fields.push({
            ...field,
            recipientRole: recipient.roleName,
          });
        }
      }
    }

    exported.recipients.push(recipient);
  }

  // Process carbon copies
  for (const cc of (result.recipients?.carbonCopies || [])) {
    exported.recipients.push({
      role: ROLE_MAP.carbonCopy,
      roleName: cc.roleName || `CC ${cc.routingOrder}`,
      signingOrder: parseInt(cc.routingOrder || '99', 10),
      fields: [],
    });
  }

  // Save to file
  mkdirSync(outputDir, { recursive: true });
  const filename = sanitizeFilename(result.name) + '.json';
  const filepath = join(outputDir, filename);
  writeFileSync(filepath, JSON.stringify(exported, null, 2));

  return {
    success: true,
    templateName: result.name,
    outputPath: filepath,
    recipientCount: exported.recipients.length,
    fieldCount: exported.fields.length,
    unmappedTabCount: exported.unmappedTabs.length,
    unmappedTabs: exported.unmappedTabs,
  };
}

try {
  const result = await exportTemplate();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
