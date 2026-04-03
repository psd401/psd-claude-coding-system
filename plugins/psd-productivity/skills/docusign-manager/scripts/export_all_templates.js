#!/usr/bin/env bun

// Export ALL DocuSign templates as Documenso-compatible JSON files.
// Usage: bun export_all_templates.js [output-dir]
//
// Creates one JSON file per template plus a _manifest.json summary.

const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { execSync } = require('child_process');
const { docusignFetchAll, sanitizeFilename } = require('./docusign_client.js');

const outputDir = process.argv[2] || join(homedir(), 'DocuSign-Export', 'templates');
const scriptDir = new URL('.', import.meta.url).pathname;

async function exportAllTemplates() {
  // List all templates
  console.error('Fetching template list...');
  const listResult = await docusignFetchAll('/templates', {}, 'envelopeTemplates', 100);

  if (listResult.error) {
    return { error: listResult.error };
  }

  const templates = listResult.items;
  console.error(`Found ${templates.length} templates. Exporting...`);

  mkdirSync(outputDir, { recursive: true });

  const manifest = {
    exportedAt: new Date().toISOString(),
    outputDir: outputDir,
    total: templates.length,
    succeeded: 0,
    failed: 0,
    templates: [],
  };

  for (let i = 0; i < templates.length; i++) {
    const t = templates[i];
    const progress = `[${i + 1}/${templates.length}]`;

    try {
      console.error(`${progress} Exporting: ${t.name}`);

      // Call export_template.js for each template
      const result = execSync(
        `bun "${scriptDir}export_template.js" "${t.templateId}" "${outputDir}"`,
        { encoding: 'utf-8', timeout: 30000 }
      );

      const parsed = JSON.parse(result);
      manifest.templates.push({
        templateId: t.templateId,
        name: t.name,
        status: parsed.success ? 'success' : 'error',
        fieldCount: parsed.fieldCount || 0,
        recipientCount: parsed.recipientCount || 0,
        unmappedTabCount: parsed.unmappedTabCount || 0,
        outputPath: parsed.outputPath || '',
        error: parsed.error || null,
      });

      if (parsed.success) manifest.succeeded++;
      else manifest.failed++;

    } catch (e) {
      console.error(`${progress} FAILED: ${t.name} — ${e.message}`);
      manifest.templates.push({
        templateId: t.templateId,
        name: t.name,
        status: 'error',
        error: e.message,
      });
      manifest.failed++;
    }
  }

  // Write manifest
  const manifestPath = join(outputDir, '_manifest.json');
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  return {
    success: true,
    total: manifest.total,
    succeeded: manifest.succeeded,
    failed: manifest.failed,
    outputDir: outputDir,
    manifestPath: manifestPath,
  };
}

try {
  const result = await exportAllTemplates();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
