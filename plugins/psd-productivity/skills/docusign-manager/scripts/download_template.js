#!/usr/bin/env bun

// Download a template's PDF document(s) and field mapping for Documenso recreation.
// Usage: bun download_template.js <template-id> [output-dir]
//
// Downloads:
//   1. The original PDF document(s) from the template
//   2. A field mapping JSON (Documenso-compatible positions)
//
// To recreate in Documenso:
//   1. Upload the PDF to Documenso as a new template
//   2. Use the field mapping JSON to position fields
//   3. Assign recipients based on the recipient mapping

const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, sanitizeFilename } = require('./docusign_client.js');

const templateId = process.argv[2];
const outputDir = process.argv[3] || join(homedir(), 'DocuSign-Export', 'templates');

if (!templateId) {
  console.error(JSON.stringify({
    error: 'Template ID required. Usage: bun download_template.js <template-id> [output-dir]'
  }));
  process.exit(1);
}

// DocuSign pixel → Documenso percentage (US Letter 612x792 at 72 DPI)
function toDocumensoCoords(x, y, w, h) {
  return {
    positionX: Math.round((parseInt(x || '0', 10) / 612) * 100 * 100) / 100,
    positionY: Math.round((parseInt(y || '0', 10) / 792) * 100 * 100) / 100,
    width: Math.round((parseInt(w || '100', 10) / 612) * 100 * 100) / 100,
    height: Math.round((parseInt(h || '20', 10) / 792) * 100 * 100) / 100,
  };
}

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
};

async function downloadTemplate() {
  // Get full template details
  var template = await docusignFetch('/templates/' + templateId + '?include=recipients,tabs,documents');
  if (template.error) return template;

  var templateName = sanitizeFilename(template.name || 'unnamed-template');
  var templateDir = join(outputDir, templateName);
  mkdirSync(templateDir, { recursive: true });

  // Download each document PDF
  var docs = await docusignFetch('/templates/' + templateId + '/documents');
  if (docs.error) return docs;

  var downloadedDocs = [];
  for (var doc of (docs.templateDocuments || [])) {
    if (doc.type === 'content') {
      var pdfData = await docusignFetch('/templates/' + templateId + '/documents/' + doc.documentId, {
        responseType: 'arraybuffer',
      });

      if (!pdfData.error) {
        var ext = (doc.name || '').split('.').pop() || 'pdf';
        var filename = sanitizeFilename(doc.name || 'document-' + doc.documentId);
        if (!filename.endsWith('.' + ext)) filename += '.pdf';
        var filepath = join(templateDir, filename);
        writeFileSync(filepath, Buffer.from(pdfData));
        downloadedDocs.push({
          documentId: doc.documentId,
          name: doc.name,
          filepath: filepath,
          sizeBytes: Buffer.from(pdfData).length,
          pages: (doc.pages || []).length || parseInt(doc.pages || '1', 10),
        });
      }
    }
  }

  // Build Documenso field mapping
  var fieldMapping = {
    source: 'docusign',
    templateId: templateId,
    templateName: template.name,
    exportedAt: new Date().toISOString(),
    recipients: [],
    fields: [],
  };

  for (var signer of (template.recipients?.signers || [])) {
    var recipient = {
      role: 'SIGNER',
      roleName: signer.roleName || 'Signer ' + signer.routingOrder,
      signingOrder: parseInt(signer.routingOrder || '1', 10),
    };
    fieldMapping.recipients.push(recipient);

    if (signer.tabs) {
      for (var tabType in signer.tabs) {
        var documensoType = TAB_TYPE_MAP[tabType];
        if (!documensoType) continue;

        for (var tab of (signer.tabs[tabType] || [])) {
          var coords = toDocumensoCoords(tab.xPosition, tab.yPosition, tab.width, tab.height);
          fieldMapping.fields.push({
            type: documensoType,
            page: parseInt(tab.pageNumber || '1', 10),
            ...coords,
            label: tab.tabLabel || '',
            required: tab.required === 'true',
            recipientRole: recipient.roleName,
            documentId: tab.documentId || '1',
          });
        }
      }
    }
  }

  for (var cc of (template.recipients?.carbonCopies || [])) {
    fieldMapping.recipients.push({
      role: 'CC',
      roleName: cc.roleName || 'CC',
      signingOrder: parseInt(cc.routingOrder || '99', 10),
    });
  }

  // Save field mapping
  var mappingPath = join(templateDir, '_documenso-fields.json');
  writeFileSync(mappingPath, JSON.stringify(fieldMapping, null, 2));

  return {
    success: true,
    templateName: template.name,
    templateId: templateId,
    outputDir: templateDir,
    documents: downloadedDocs,
    fieldMapping: mappingPath,
    recipientCount: fieldMapping.recipients.length,
    fieldCount: fieldMapping.fields.length,
    hint: 'Upload the PDF(s) to Documenso, then use _documenso-fields.json to position fields',
  };
}

try {
  var result = await downloadTemplate();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
