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

# Parse transcript to extract rich outcome data
# Only parse if transcript file exists and is readable
if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then
  # Extract file paths from Edit and Write tool uses for this session
  FILES_CHANGED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Edit" or .message.content[0].name == "Write") |
    .message.content[0].input.file_path
  ' "$TRANSCRIPT_PATH" 2>/dev/null | sort -u | wc -l | tr -d ' ')

  # Extract git commits (count lines matching git commit)
  GIT_COMMITS=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^git commit" 2>/dev/null || echo "0")
  GIT_COMMITS=$(echo "$GIT_COMMITS" | tr -d '\n ')

  # Check for PR creation
  PR_CREATED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^gh pr create" 2>/dev/null || echo "0")
  PR_CREATED=$(echo "$PR_CREATED" | tr -d '\n ')

  # Check for test execution
  TESTS_RUN=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -cE "^(pytest|npm test|cargo test)" 2>/dev/null || echo "0")
  TESTS_RUN=$(echo "$TESTS_RUN" | tr -d '\n ')

  # Detect errors in tool results
  HAS_ERRORS=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_result") |
    select(.message.content[0].is_error == true)
  ' "$TRANSCRIPT_PATH" 2>/dev/null | head -1)

  # Extract issue number from command args or git branch
  ISSUE_NUMBER=""
  if [[ "$COMMAND_ARGS" =~ ^[0-9]+$ ]]; then
    ISSUE_NUMBER="$COMMAND_ARGS"
  else
    # Try to extract from git branch in transcript
    ISSUE_NUMBER=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      .gitBranch
    ' "$TRANSCRIPT_PATH" 2>/dev/null | head -1 | grep -oE '[0-9]+' | head -1)
  fi
else
  # Transcript not available, use defaults
  FILES_CHANGED="0"
  GIT_COMMITS="0"
  PR_CREATED="0"
  TESTS_RUN="0"
  HAS_ERRORS=""
  ISSUE_NUMBER=""
fi

# Determine success based on errors
if [ -n "$HAS_ERRORS" ]; then
  SUCCESS="false"
else
  SUCCESS="true"
fi

# Generate timestamp in ISO 8601 format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build agents array JSON
AGENTS_JSON="[]"
if [ -n "$COMMAND_AGENTS" ]; then
  # Convert comma-separated list to JSON array
  AGENTS_JSON="[\"$(echo "$COMMAND_AGENTS" | sed 's/,/", "/g')\"]"
fi

# Build rich metadata JSON
# Use defaults if variables are empty
FILES_CHANGED="${FILES_CHANGED:-0}"
GIT_COMMITS="${GIT_COMMITS:-0}"
TESTS_RUN="${TESTS_RUN:-0}"
PR_CREATED_BOOL=$([[ "${PR_CREATED:-0}" -gt 0 ]] && echo "true" || echo "false")
ISSUE_NUMBER_JSON=$([ -n "$ISSUE_NUMBER" ] && echo "$ISSUE_NUMBER" || echo "null")

METADATA_JSON=$(cat <<METAEOF
{
  "files_changed": $FILES_CHANGED,
  "git_commits": $GIT_COMMITS,
  "pr_created": $PR_CREATED_BOOL,
  "tests_run": $TESTS_RUN,
  "issue_number": $ISSUE_NUMBER_JSON
}
METAEOF
)

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
