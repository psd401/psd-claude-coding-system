#!/bin/bash
# plugin-auto-update.sh
#
# SessionStart hook - Auto-update psd-claude-coding-system plugin
# Called automatically when Claude Code session starts
# Checks at most once per day to avoid slowing down every session
#
# Input: JSON via stdin with session_id, transcript_path, cwd, etc.
# Output: Silent success (exit 0) or error to stderr (exit 2)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
STAMP_FILE="$PLUGIN_ROOT/meta/.last-update-check"

# Only check once per day
if [ -f "$STAMP_FILE" ]; then
  LAST_CHECK=$(cat "$STAMP_FILE" 2>/dev/null)
  TODAY=$(date +%Y-%m-%d)
  if [ "$LAST_CHECK" = "$TODAY" ]; then
    exit 0  # Already checked today
  fi
fi

# Ensure meta directory exists
mkdir -p "$PLUGIN_ROOT/meta" 2>/dev/null || exit 0

# Run update in background so it doesn't block session start
(
  claude plugin update psd-claude-coding-system --scope user >/dev/null 2>&1
  date +%Y-%m-%d > "$STAMP_FILE" 2>/dev/null
) &

exit 0
