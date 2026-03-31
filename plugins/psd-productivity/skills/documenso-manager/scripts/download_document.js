#!/usr/bin/env bun

// Download original or signed PDF from an envelope item.
// Usage: bun download_document.js <envelope-item-id> [signed|original] [output-path]
//
// Default version: signed
// Default output: ./<title>-signed.pdf or ./<title>-original.pdf

const { writeFileSync } = require('fs');
const { SECRETS } = require('../../../scripts/secrets.js');

const itemId = process.argv[2];
const version = process.argv[3] || 'signed';
const outputPath = process.argv[4];

if (!itemId) {
  console.error(JSON.stringify({ error: 'Envelope item ID required. Usage: bun download_document.js <item-id> [signed|original] [output-path]' }));
  process.exit(1);
}

if (!['signed', 'original'].includes(version)) {
  console.error(JSON.stringify({ error: 'Version must be "signed" or "original"' }));
  process.exit(1);
}

async function downloadDocument() {
  const { host, apiKey } = SECRETS.documenso;
  const baseUrl = host.startsWith('http') ? host : `http://${host}`;
  const url = `${baseUrl}/api/v2/envelope/item/${itemId}/download?version=${version}`;

  const response = await fetch(url, {
    headers: { Authorization: apiKey },
  });

  if (!response.ok) {
    const error = await response.text();
    return { error: `Download failed (${response.status}): ${error}` };
  }

  const buffer = await response.arrayBuffer();
  const filename = outputPath || `document-${itemId}-${version}.pdf`;
  writeFileSync(filename, Buffer.from(buffer));

  return {
    success: true,
    file: filename,
    size: buffer.byteLength,
    version,
  };
}

try {
  const result = await downloadDocument();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
