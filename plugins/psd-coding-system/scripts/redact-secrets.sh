#!/usr/bin/env bash
# redact-secrets.sh — PostToolUse output replacement hook for Bash
# Scans tool output for common secret patterns and replaces them with [REDACTED].
# Reads tool output from stdin, writes redacted output to stdout.

set -euo pipefail

INPUT=$(cat)

# Extract the tool output
OUTPUT=$(echo "$INPUT" | jq -r '.tool_output // empty' 2>/dev/null)

if [ -z "$OUTPUT" ]; then
  exit 0
fi

# Redact common secret patterns:
# - API keys (sk-*, xoxb-*, ghp_*, ghu_*, etc.)
# - Bearer tokens
# - AWS keys
# - Base64-encoded long strings that look like secrets
# - Password/secret assignments in env output
REDACTED=$(echo "$OUTPUT" | sed -E \
  -e 's/(sk-[a-zA-Z0-9]{20,})/[REDACTED]/g' \
  -e 's/(xoxb-[a-zA-Z0-9-]{20,})/[REDACTED]/g' \
  -e 's/(xoxp-[a-zA-Z0-9-]{20,})/[REDACTED]/g' \
  -e 's/(ghp_[a-zA-Z0-9]{36,})/[REDACTED]/g' \
  -e 's/(ghu_[a-zA-Z0-9]{36,})/[REDACTED]/g' \
  -e 's/(ghs_[a-zA-Z0-9]{36,})/[REDACTED]/g' \
  -e 's/(AKIA[A-Z0-9]{16})/[REDACTED]/g' \
  -e 's/(Bearer [a-zA-Z0-9._-]{20,})/Bearer [REDACTED]/g' \
  -e 's/(AIza[a-zA-Z0-9_-]{35})/[REDACTED]/g' \
  -e 's/((password|secret|token|api_key|apikey|api-key|private_key)=)[^ \t"'"'"']*/\1[REDACTED]/gi' \
)

# Only output replacement if something was actually redacted
if [ "$OUTPUT" != "$REDACTED" ]; then
  echo "$REDACTED"
fi

exit 0
