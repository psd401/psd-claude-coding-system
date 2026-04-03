#!/usr/bin/env bun

// Export a complete inventory of the DocuSign account for migration planning.
// Usage: bun export_account.js [output-dir]
//
// Exports: templates (count + names), PowerForms, custom fields, brands,
// groups, folders, and envelope statistics by year.

const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');
const { homedir } = require('os');
const { docusignFetch, docusignFetchAll } = require('./docusign_client.js');

const outputDir = process.argv[2] || join(homedir(), 'DocuSign-Export');

async function exportAccount() {
  mkdirSync(outputDir, { recursive: true });
  const inventory = {
    exportedAt: new Date().toISOString(),
    account: {},
    templates: { count: 0, withNames: 0, items: [] },
    powerForms: { count: 0, items: [] },
    customFields: {},
    brands: [],
    groups: [],
    envelopeStats: {},
  };

  // Account info
  console.error('Fetching account info...');
  var acct = await docusignFetch('');
  inventory.account = {
    accountId: acct.accountIdGuid || acct.accountId,
    accountName: acct.accountName || acct.account_name,
    planName: acct.currentPlanId || '',
  };

  // Templates
  console.error('Fetching templates...');
  var templates = await docusignFetchAll('/templates', {}, 'envelopeTemplates', 100);
  if (!templates.error) {
    inventory.templates.count = templates.totalCount;
    inventory.templates.items = templates.items.map(t => ({
      templateId: t.templateId,
      name: t.name || '(unnamed)',
      created: t.created,
      folderName: t.folderName || '',
    }));
    inventory.templates.withNames = templates.items.filter(t => t.name).length;
  }

  // PowerForms
  console.error('Fetching PowerForms...');
  var pf = await docusignFetch('/powerforms');
  if (!pf.error && pf.powerForms) {
    inventory.powerForms.count = pf.powerForms.length;
    inventory.powerForms.items = pf.powerForms.map(p => ({
      powerFormId: p.powerFormId,
      name: p.name,
      templateId: p.templateId,
      isActive: p.isActive,
      powerFormUrl: p.powerFormUrl || '',
    }));
  }

  // Custom fields
  console.error('Fetching custom fields...');
  var cf = await docusignFetch('/custom_fields');
  if (!cf.error) inventory.customFields = cf;

  // Brands
  console.error('Fetching brands...');
  var brands = await docusignFetch('/brands');
  if (!brands.error && brands.brands) {
    inventory.brands = brands.brands.map(b => ({
      brandId: b.brandId,
      brandName: b.brandName,
      isDefault: b.isDefault,
    }));
  }

  // Groups
  console.error('Fetching groups...');
  var groups = await docusignFetch('/groups');
  if (!groups.error && groups.groups) {
    inventory.groups = groups.groups.map(g => ({
      groupId: g.groupId,
      groupName: g.groupName,
      usersCount: g.usersCount,
    }));
  }

  // Envelope stats by year
  console.error('Fetching envelope stats...');
  for (var year = 2020; year <= 2026; year++) {
    var envs = await docusignFetch(`/envelopes?from_date=${year}-01-01T00:00:00Z&to_date=${year}-12-31T23:59:59Z&status=completed&count=1`);
    if (!envs.error) {
      inventory.envelopeStats[year] = {
        completed: parseInt(envs.totalSetSize || '0', 10),
      };
      console.error(`  ${year}: ${envs.totalSetSize || 0} completed`);
    }
  }

  // Save
  var filepath = join(outputDir, 'account-inventory.json');
  writeFileSync(filepath, JSON.stringify(inventory, null, 2));

  return {
    success: true,
    outputPath: filepath,
    summary: {
      templates: inventory.templates.count,
      templatesWithNames: inventory.templates.withNames,
      powerForms: inventory.powerForms.count,
      brands: inventory.brands.length,
      groups: inventory.groups.length,
      envelopesByYear: inventory.envelopeStats,
    },
  };
}

try {
  const result = await exportAccount();
  console.log(JSON.stringify(result, null, 2));
} catch (e) {
  console.error(JSON.stringify({ error: e.message }));
  process.exit(1);
}
