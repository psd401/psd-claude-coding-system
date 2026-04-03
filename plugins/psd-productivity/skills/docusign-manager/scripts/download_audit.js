#!/usr/bin/env bun

// Download audit trail or Certificate of Completion for an envelope.
// Usage: bun download_audit.js <envelope-id> [type]
//
// Types: "events" (JSON audit trail) or "certificate" (PDF Certificate of Completion)
// Default: events

const { writeFileSync, mkdirSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, sanitizeFilename } = require('./docusign_client.js');

const envelopeId = process.argv[2];
const type = process.argv[3] || 'events';

if (!envelopeId) {
  console.error(JSON.stringify({
    error: 'Envelope ID required. Usage: bun download_audit.js <envelope-id> [events|certificate]'
  }));
  process.exit(1);
}

async function downloadAudit() {
  const envelope = await docusignFetch(`/envelopes/${envelopeId}`);
  if (envelope.error) return envelope;

  const subject = sanitizeFilename(envelope.emailSubject || 'untitled');
  const dir = join(homedir(), 'DocuSign-Export', 'audits');
  mkdirSync(dir, { recursive: true });

  if (type === 'certificate') {
    // Download Certificate of Completion PDF
    const pdfData = await docusignFetch(`/envelopes/${envelopeId}/documents/certificate`, {
      responseType: 'arraybuffer',
    });

    if (pdfData.error) return pdfData;

    const filepath = join(dir, `${subject}-${envelopeId.substring(0, 8)}-certificate.pdf`);
    const buffer = Buffer.from(pdfData);
    writeFileSync(filepath, buffer);

    return {
      success: true,
      type: 'certificate',
      envelopeId: envelopeId,
      outputPath: filepath,
      sizeBytes: buffer.length,
    };
  } else {
    // Download audit events as JSON
    const events = await docusignFetch(`/envelopes/${envelopeId}/audit_events`);
    if (events.error) return events;

    const filepath = join(dir, `${subject}-${envelopeId.substring(0, 8)}-audit.json`);
    writeFileSync(filepath, JSON.stringify(events, null, 2));

    return {
      success: true,
      type: 'events',
      envelopeId: envelopeId,
      outputPath: filepath,
      eventCount: (events.auditEvents || []).length,
    };
  }
}

try {
  const result = await downloadAudit();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
