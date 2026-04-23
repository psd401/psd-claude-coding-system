#!/usr/bin/env bun

/**
 * Health Check Base — shared runner for API-backed skill health checks.
 *
 * Provides consistent JSON output formatting and error handling.
 * Each service implements its own healthCheck() function with service-specific
 * logic, then passes it to runHealthCheck() for standardized execution.
 *
 * Usage:
 *   const { runHealthCheck } = require('../../../scripts/health_check_base.js');
 *   runHealthCheck(async () => {
 *     // service-specific connectivity test
 *     return { status: 'healthy', ...details };
 *   });
 */

/**
 * Execute a health check function with consistent error handling and JSON output.
 *
 * @param {Function} checkFn - Async function returning { status: 'healthy'|'error', ... }
 */
async function runHealthCheck(checkFn) {
  try {
    const result = await checkFn();
    console.log(JSON.stringify(result, null, 2));
    if (result.status === 'error') process.exit(1);
  } catch (e) {
    console.error(JSON.stringify({ status: 'error', message: e.message }, null, 2));
    process.exit(1);
  }
}

module.exports = { runHealthCheck };
