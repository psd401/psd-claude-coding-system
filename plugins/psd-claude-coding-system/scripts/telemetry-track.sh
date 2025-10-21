#!/bin/bash
# telemetry-track.sh
#
# Stop hook - Record command execution when Claude finishes responding
# Called automatically after each Claude response completes
#
# Input: JSON via stdin with session_id, transcript_path, hook_event_name
# Output: Silent success (exit 0) or error to stderr (exit 2)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Check if jq is available (required for JSON manipulation)
if ! command -v jq >/dev/null 2>&1; then
  # Silent failure - jq not available, can't process telemetry
  exit 0
fi

# Extract session_id and transcript_path from hook input
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // empty')
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty')

# Skip if we don't have the required data
[ -z "$SESSION_ID" ] && exit 0
[ -z "$TRANSCRIPT_PATH" ] && exit 0

# Find plugin root and telemetry file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"
TELEMETRY_FILE="$META_DIR/telemetry.json"
STATE_FILE="$META_DIR/.session_state_${SESSION_ID}"

# Skip if telemetry file doesn't exist yet
[ ! -f "$TELEMETRY_FILE" ] && exit 0

# Check if we have a pending command execution to record
# State file is created by slash command detection (user prompt analysis)
if [ ! -f "$STATE_FILE" ]; then
  # No pending command to track
  exit 0
fi

# Read state from file (command_name, start_time, agents)
source "$STATE_FILE"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - COMMAND_START_TIME))

# Determine success (for now, assume success - we can enhance this later)
SUCCESS="true"

# Generate timestamp in ISO 8601 format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build agents array JSON
AGENTS_JSON="[]"
if [ -n "$COMMAND_AGENTS" ]; then
  # Convert comma-separated list to JSON array
  AGENTS_JSON="[\"$(echo "$COMMAND_AGENTS" | sed 's/,/", "/g')\"]"
fi

# Build metadata JSON (extract from state file if available)
METADATA_JSON="${COMMAND_METADATA:-{}}"

# Build execution JSON entry
EXECUTION_ID="exec-${SESSION_ID}-${COMMAND_NAME}"
EXECUTION_JSON=$(cat <<EOF
{
  "id": "$EXECUTION_ID",
  "command": "$COMMAND_NAME",
  "arguments": "$COMMAND_ARGS",
  "timestamp": "$TIMESTAMP",
  "duration_seconds": $DURATION,
  "success": $SUCCESS,
  "agents_invoked": $AGENTS_JSON,
  "metadata": $METADATA_JSON
}
EOF
)

# UPSERT to telemetry.json using jq
# Remove any existing execution with this ID, then append new one
TEMP_FILE="${TELEMETRY_FILE}.tmp.$$"

jq --argjson new_exec "$EXECUTION_JSON" \
  '.executions = (.executions | map(select(.id != $new_exec.id))) + [$new_exec]' \
  "$TELEMETRY_FILE" > "$TEMP_FILE" 2>/dev/null

# Verify jq succeeded and temp file is valid
if [ $? -eq 0 ] && [ -s "$TEMP_FILE" ]; then
  mv "$TEMP_FILE" "$TELEMETRY_FILE"
else
  # jq failed, clean up temp file
  rm -f "$TEMP_FILE" 2>/dev/null
fi

# Clean up state file
rm -f "$STATE_FILE" 2>/dev/null

# Success
exit 0
