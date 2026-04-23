#!/usr/bin/env bun

// Check DocuSign API connectivity and account info.
// Usage: bun health_check.js

const { getAccessToken, getBaseUri, getAccountInfo, docusignFetch } = require('./docusign_client.js');
const { runHealthCheck } = require('../../../scripts/health_check_base.js');

runHealthCheck(async () => {
  // Step 1: Test JWT authentication
  try {
    await getAccessToken();
  } catch (e) {
    return {
      status: 'error',
      error: `Authentication failed: ${e.message}`,
      hint: 'Check DOCUSIGN_INTEGRATION_KEY, DOCUSIGN_USER_ID, DOCUSIGN_ACCOUNT_ID, and DOCUSIGN_RSA_KEY_PATH. Ensure JWT consent has been granted.',
    };
  }

  // Step 2: Discover base URI
  let baseUri;
  try {
    baseUri = await getBaseUri();
  } catch (e) {
    return { status: 'error', error: `Base URI discovery failed: ${e.message}` };
  }

  // Step 3: Get account info
  const accountInfo = await docusignFetch('');
  if (accountInfo.error) {
    return { status: 'error', error: accountInfo.error };
  }

  const info = getAccountInfo();

  return {
    status: 'healthy',
    accountId: info.accountId,
    accountName: accountInfo.accountName || accountInfo.account_name || 'Unknown',
    environment: info.environment,
    baseUri: baseUri,
    planName: accountInfo.planInformation?.planName || accountInfo.currentPlanId || 'Unknown',
    billingPeriodStartDate: accountInfo.billingPeriodStartDate || null,
    billingPeriodEndDate: accountInfo.billingPeriodEndDate || null,
  };
});
