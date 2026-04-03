#!/usr/bin/env bun

// Download signed documents from an envelope as a combined PDF.
// Usage: bun download_document.js <envelope-id> [output-path]
//
// Downloads all documents combined into a single PDF.
// If output-path is omitted, saves to ~/DocuSign-Export/envelopes/

const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, sanitizeFilename } = require('./docusign_client.js');

const envelopeId = process.argv[2];
const outputPath = process.argv[3];

if (!envelopeId) {
  console.error(JSON.stringify({
    error: 'Envelope ID required. Usage: bun download_document.js <envelope-id> [output-path]'
  }));
  process.exit(1);
}

async function downloadDocument() {
  // Get envelope info for the filename
  const envelope = await docusignFetch(`/envelopes/${envelopeId}`);
  if (envelope.error) return envelope;

  // Download combined PDF
  const pdfData = await docusignFetch(`/envelopes/${envelopeId}/documents/combined`, {
    responseType: 'arraybuffer',
  });

  if (pdfData.error) return pdfData;

  // Determine output path
  let filepath;
  if (outputPath) {
    filepath = outputPath;
  } else {
    const subject = sanitizeFilename(envelope.emailSubject || 'untitled');
    const date = (envelope.completedDateTime || envelope.createdDateTime || '').substring(0, 10);
    const dir = join(homedir(), 'DocuSign-Export', 'envelopes');
    mkdirSync(dir, { recursive: true });
    filepath = join(dir, `${subject}-${envelopeId.substring(0, 8)}.pdf`);
  }

  // Write to disk
  const buffer = Buffer.from(pdfData);
  writeFileSync(filepath, buffer);

  return {
    success: true,
    envelopeId: envelopeId,
    emailSubject: envelope.emailSubject,
    status: envelope.status,
    outputPath: filepath,
    sizeBytes: buffer.length,
  };
}

try {
  const result = await downloadDocument();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
