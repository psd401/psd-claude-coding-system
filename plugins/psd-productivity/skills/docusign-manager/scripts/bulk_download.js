#!/usr/bin/env bun

// Bulk download all completed envelopes with checkpointing and resume.
// Usage: bun bulk_download.js [options]
//
// Options:
//   --status         Show current download progress
//   --retry-failed   Retry only previously failed downloads
//   --reset          Clear checkpoint and start fresh
//   --from YYYY-MM-DD  Only download envelopes after this date
//   --to YYYY-MM-DD    Only download envelopes before this date
//
// Downloads to: ~/DocuSign-Export/envelopes/{year}/{month}/{subject}-{id}.pdf
// Checkpoint:   ~/.docusign-export/checkpoint.json
//
// Rate limit: 3,000 API calls/hour (~50/min). 50,000 envelopes ≈ 17 hours.
// Designed for overnight runs. Safe to stop and resume.

const { existsSync, readFileSync, writeFileSync, mkdirSync, renameSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, docusignFetchAll, sanitizeFilename } = require('./docusign_client.js');

const CHECKPOINT_DIR = join(homedir(), '.docusign-export');
const CHECKPOINT_PATH = join(CHECKPOINT_DIR, 'checkpoint.json');
const ENVELOPE_IDS_PATH = join(CHECKPOINT_DIR, 'envelope-ids.json');
const OUTPUT_BASE = join(homedir(), 'DocuSign-Export', 'envelopes');
const PROGRESS_INTERVAL = 50; // Report progress every N downloads

// --- Parse CLI args ---
const args = process.argv.slice(2);
const flags = {
  status: args.includes('--status'),
  retryFailed: args.includes('--retry-failed'),
  reset: args.includes('--reset'),
  fromDate: null,
  toDate: null,
};

const fromIdx = args.indexOf('--from');
if (fromIdx >= 0 && args[fromIdx + 1]) flags.fromDate = args[fromIdx + 1];
const toIdx = args.indexOf('--to');
if (toIdx >= 0 && args[toIdx + 1]) flags.toDate = args[toIdx + 1];

// --- Checkpoint management ---

function loadCheckpoint() {
  if (existsSync(CHECKPOINT_PATH)) {
    return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf-8'));
  }
  return null;
}

function saveCheckpoint(checkpoint) {
  mkdirSync(CHECKPOINT_DIR, { recursive: true });
  const tmpPath = CHECKPOINT_PATH + '.tmp';
  writeFileSync(tmpPath, JSON.stringify(checkpoint, null, 2));
  renameSync(tmpPath, CHECKPOINT_PATH); // Atomic write
}

function loadEnvelopeIds() {
  if (existsSync(ENVELOPE_IDS_PATH)) {
    return JSON.parse(readFileSync(ENVELOPE_IDS_PATH, 'utf-8'));
  }
  return null;
}

function saveEnvelopeIds(ids) {
  mkdirSync(CHECKPOINT_DIR, { recursive: true });
  writeFileSync(ENVELOPE_IDS_PATH, JSON.stringify(ids));
}

// --- Show status ---

if (flags.status) {
  const checkpoint = loadCheckpoint();
  if (!checkpoint) {
    console.log(JSON.stringify({ status: 'no checkpoint', message: 'No bulk download in progress.' }));
    process.exit(0);
  }
  const elapsed = (Date.now() - new Date(checkpoint.startedAt).getTime()) / 1000 / 60;
  const rate = checkpoint.completed / Math.max(elapsed, 1);
  const remaining = checkpoint.total - checkpoint.lastIndex;
  const etaMinutes = remaining / Math.max(rate, 0.1);

  console.log(JSON.stringify({
    status: checkpoint.phase,
    total: checkpoint.total,
    completed: checkpoint.completed,
    skipped: checkpoint.skipped,
    failed: checkpoint.failed,
    failedIds: checkpoint.failedIds,
    lastIndex: checkpoint.lastIndex,
    percentDone: Math.round((checkpoint.lastIndex / checkpoint.total) * 100),
    elapsedMinutes: Math.round(elapsed),
    estimatedRemainingMinutes: Math.round(etaMinutes),
    startedAt: checkpoint.startedAt,
    lastUpdated: checkpoint.lastUpdated,
  }, null, 2));
  process.exit(0);
}

// --- Reset ---

if (flags.reset) {
  if (existsSync(CHECKPOINT_PATH)) {
    const { unlinkSync } = require('fs');
    unlinkSync(CHECKPOINT_PATH);
    if (existsSync(ENVELOPE_IDS_PATH)) unlinkSync(ENVELOPE_IDS_PATH);
    console.log(JSON.stringify({ success: true, message: 'Checkpoint cleared.' }));
  } else {
    console.log(JSON.stringify({ success: true, message: 'No checkpoint to clear.' }));
  }
  process.exit(0);
}

// --- Main bulk download ---

async function enumerate() {
  console.error('Phase 1: Enumerating all completed envelopes...');

  const params = {
    status: 'completed',
    from_date: flags.fromDate || '2015-01-01T00:00:00Z',
  };
  if (flags.toDate) params.to_date = flags.toDate;

  const result = await docusignFetchAll('/envelopes', params, 'envelopes', 100);

  if (result.error) {
    console.error(JSON.stringify({ error: result.error }));
    process.exit(1);
  }

  const ids = result.items.map(e => ({
    envelopeId: e.envelopeId,
    emailSubject: e.emailSubject || 'untitled',
    completedDateTime: e.completedDateTime || e.createdDateTime || '',
  }));

  saveEnvelopeIds(ids);
  console.error(`Found ${ids.length} completed envelopes.`);
  return ids;
}

async function downloadAll() {
  // Load or create envelope list
  let envelopeIds = loadEnvelopeIds();
  if (!envelopeIds) {
    envelopeIds = await enumerate();
  }

  // Handle retry-failed mode
  let idsToProcess;
  let checkpoint = loadCheckpoint();

  if (flags.retryFailed && checkpoint && checkpoint.failedIds.length > 0) {
    console.error(`Retrying ${checkpoint.failedIds.length} failed downloads...`);
    idsToProcess = envelopeIds.filter(e => checkpoint.failedIds.includes(e.envelopeId));
    checkpoint.failedIds = [];
    checkpoint.phase = 'retrying';
  } else if (checkpoint && checkpoint.phase === 'downloading') {
    // Resume from checkpoint
    console.error(`Resuming from index ${checkpoint.lastIndex}/${checkpoint.total}...`);
    idsToProcess = envelopeIds.slice(checkpoint.lastIndex);
  } else {
    // Fresh start
    checkpoint = {
      phase: 'downloading',
      total: envelopeIds.length,
      lastIndex: 0,
      completed: 0,
      skipped: 0,
      failed: 0,
      failedIds: [],
      startedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    idsToProcess = envelopeIds;
  }

  const startTime = Date.now();
  const totalToProcess = idsToProcess.length;

  console.error(`\nPhase 2: Downloading ${totalToProcess} envelopes...`);
  console.error(`Estimated time: ~${Math.ceil(totalToProcess / 180)} hours at 3,000 API calls/hour`);
  console.error(`Output: ${OUTPUT_BASE}`);
  console.error('');

  for (let i = 0; i < idsToProcess.length; i++) {
    const env = idsToProcess[i];

    // Build output path: year/month/subject-id.pdf
    const dateStr = env.completedDateTime || '';
    const year = dateStr.substring(0, 4) || 'unknown';
    const month = dateStr.substring(5, 7) || '00';
    const dir = join(OUTPUT_BASE, year, month);
    const filename = sanitizeFilename(env.emailSubject) + '-' + env.envelopeId.substring(0, 8) + '.pdf';
    const filepath = join(dir, filename);

    // Skip if already downloaded
    if (existsSync(filepath)) {
      checkpoint.skipped++;
      checkpoint.lastIndex = envelopeIds.indexOf(env) + 1;
      continue;
    }

    // Download
    try {
      mkdirSync(dir, { recursive: true });

      const pdfData = await docusignFetch(`/envelopes/${env.envelopeId}/documents/combined`, {
        responseType: 'arraybuffer',
      });

      if (pdfData.error) {
        checkpoint.failed++;
        checkpoint.failedIds.push(env.envelopeId);
      } else {
        writeFileSync(filepath, Buffer.from(pdfData));
        checkpoint.completed++;
      }
    } catch (e) {
      checkpoint.failed++;
      checkpoint.failedIds.push(env.envelopeId);
    }

    checkpoint.lastIndex = envelopeIds.indexOf(env) + 1;
    checkpoint.lastUpdated = new Date().toISOString();

    // Progress reporting
    if ((checkpoint.completed + checkpoint.failed) % PROGRESS_INTERVAL === 0) {
      const elapsed = (Date.now() - startTime) / 1000 / 60;
      const processed = checkpoint.completed + checkpoint.failed + checkpoint.skipped;
      const rate = processed / Math.max(elapsed, 0.1);
      const remaining = totalToProcess - i;
      const eta = remaining / Math.max(rate, 0.1);

      console.error(
        `Progress: ${processed}/${totalToProcess} (${Math.round((processed / totalToProcess) * 100)}%) | ` +
        `Downloaded: ${checkpoint.completed} | Skipped: ${checkpoint.skipped} | Failed: ${checkpoint.failed} | ` +
        `Rate: ${rate.toFixed(1)}/min | ETA: ${Math.round(eta)} min`
      );

      saveCheckpoint(checkpoint);
    }
  }

  // Final checkpoint save
  checkpoint.phase = 'complete';
  checkpoint.lastUpdated = new Date().toISOString();
  saveCheckpoint(checkpoint);

  const elapsed = (Date.now() - startTime) / 1000 / 60;

  return {
    success: true,
    phase: 'complete',
    total: checkpoint.total,
    completed: checkpoint.completed,
    skipped: checkpoint.skipped,
    failed: checkpoint.failed,
    failedIds: checkpoint.failedIds,
    elapsedMinutes: Math.round(elapsed),
    outputDir: OUTPUT_BASE,
  };
}

try {
  const result = await downloadAll();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
