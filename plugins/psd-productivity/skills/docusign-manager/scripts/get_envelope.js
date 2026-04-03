#!/usr/bin/env bun

// Get full envelope details including recipients, tabs, and documents.
// Usage: bun get_envelope.js <envelope-id>

const { docusignFetch } = require('./docusign_client.js');

const envelopeId = process.argv[2];
if (!envelopeId) {
  console.error(JSON.stringify({ error: 'Envelope ID required. Usage: bun get_envelope.js <envelope-id>' }));
  process.exit(1);
}

async function getEnvelope() {
  const result = await docusignFetch(`/envelopes/${envelopeId}?include=recipients,tabs,documents,custom_fields`);

  if (result.error) return result;

  return {
    envelopeId: result.envelopeId,
    emailSubject: result.emailSubject,
    emailBlurb: result.emailBlurb || '',
    status: result.status,
    sentDateTime: result.sentDateTime,
    completedDateTime: result.completedDateTime,
    createdDateTime: result.createdDateTime,
    sender: {
      name: result.sender?.userName || '',
      email: result.sender?.email || '',
    },
    documents: (result.envelopeDocuments || result.documents || []).map(d => ({
      documentId: d.documentId,
      name: d.name,
      type: d.type,
      pages: d.pages,
    })),
    recipients: {
      signers: (result.recipients?.signers || []).map(s => ({
        name: s.name,
        email: s.email,
        status: s.status,
        signedDateTime: s.signedDateTime,
        routingOrder: s.routingOrder,
      })),
      carbonCopies: (result.recipients?.carbonCopies || []).map(c => ({
        name: c.name,
        email: c.email,
        status: c.status,
        routingOrder: c.routingOrder,
      })),
    },
  };
}

try {
  const result = await getEnvelope();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
