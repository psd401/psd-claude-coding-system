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
# - Google API keys
# - Password/secret assignments in env output
# Uses perl instead of sed for portable case-insensitive matching (BSD sed
# does not support the /i flag with -E, which breaks on macOS).
REDACTED=$(echo "$OUTPUT" | perl -pe '
  s/(sk-[a-zA-Z0-9]{20,})/[REDACTED]/g;
  s/(xoxb-[a-zA-Z0-9-]{20,})/[REDACTED]/g;
  s/(xoxp-[a-zA-Z0-9-]{20,})/[REDACTED]/g;
  s/(ghp_[a-zA-Z0-9]{36,})/[REDACTED]/g;
  s/(ghu_[a-zA-Z0-9]{36,})/[REDACTED]/g;
  s/(ghs_[a-zA-Z0-9]{36,})/[REDACTED]/g;
  s/(AKIA[A-Z0-9]{16})/[REDACTED]/g;
  s/(Bearer [a-zA-Z0-9._-]{20,})/Bearer [REDACTED]/g;
  s/(AIza[a-zA-Z0-9_-]{35})/[REDACTED]/g;
  s/((password|secret|token|api_key|apikey|api-key|private_key)=)[^ \t"'"'"']*/$1\[REDACTED]/gi;
')

# Always output content — outputReplace: true means our stdout replaces
# the tool output entirely. Outputting nothing would blank valid output.
echo "$REDACTED"

exit 0
