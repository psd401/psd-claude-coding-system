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

# ==============================================================================
# COMPREHENSIVE TELEMETRY EXTRACTION FROM TRANSCRIPT
# ==============================================================================

if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then

  # ---------------------------------------------------------------------------
  # 1. QUANTITATIVE METRICS
  # ---------------------------------------------------------------------------

  # Files changed (unique file paths)
  FILES_CHANGED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Edit" or .message.content[0].name == "Write") |
    .message.content[0].input.file_path
  ' "$TRANSCRIPT_PATH" 2>/dev/null | sort -u | wc -l | tr -d ' ')

  # Tool usage counts - slurp all entries first
  TOOL_USES_JSON=$(jq -s --arg sid "$SESSION_ID" '
    map(select(.sessionId == $sid)) |
    map(select((.message.content | type) == "array")) |
    map(select(.message.content[0].type == "tool_use")) |
    map(.message.content[0].name) |
    group_by(.) |
    map({key: .[0], value: length}) |
    from_entries
  ' "$TRANSCRIPT_PATH" 2>/dev/null || echo "{}")

  # Git activity
  GIT_COMMITS=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^git commit" 2>/dev/null || echo "0")
  GIT_COMMITS=$(echo "$GIT_COMMITS" | tr -d '\n ')

  PR_CREATED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^gh pr create" 2>/dev/null || echo "0")
  PR_CREATED=$(echo "$PR_CREATED" | tr -d '\n ')

  # Test execution
  TESTS_RUN=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -cE "^(pytest|npm test|cargo test|npm run test)" 2>/dev/null || echo "0")
  TESTS_RUN=$(echo "$TESTS_RUN" | tr -d '\n ')

  # Issue number extraction
  ISSUE_NUMBER=""
  if [[ "$COMMAND_ARGS" =~ ^[0-9]+$ ]]; then
    ISSUE_NUMBER="$COMMAND_ARGS"
  else
    ISSUE_NUMBER=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      .gitBranch
    ' "$TRANSCRIPT_PATH" 2>/dev/null | head -1 | grep -oE '[0-9]+' | head -1)
  fi

  # ---------------------------------------------------------------------------
  # 2. ERROR EXTRACTION (WITH FULL CONTEXT)
  # ---------------------------------------------------------------------------

  ERRORS_JSON=$(jq -sc --arg sid "$SESSION_ID" '
    map(select(.sessionId == $sid)) |
    map(select((.message.content | type) == "array")) |
    map(select(.message.content[0].type == "tool_result")) |
    map(select(.message.content[0].is_error == true)) |
    map({
      tool: (.message.content[0].tool_use_id // "unknown"),
      error_message: (.message.content[0].content // ""),
      timestamp: .timestamp
    }) |
    if length > 0 then . else [] end
  ' "$TRANSCRIPT_PATH" 2>/dev/null || echo "[]")

  # ---------------------------------------------------------------------------
  # 3. USER FEEDBACK PARSING (COMPREHENSIVE KEYWORDS)
  # ---------------------------------------------------------------------------

  USER_CORRECTIONS_JSON=$(jq -sc --arg sid "$SESSION_ID" '
    map(select(.sessionId == $sid)) |
    map(select(.message.role == "user")) |
    map(select((.message.content | type) == "string")) |
    map(select(.message.content | test("terrible|awful|broken|doesn'"'"'t work|failed|wrong|bug|error|issue|problem|fix this|redo|revert|not what I wanted|missing|incomplete|frustrated|annoying|waste|have to|follow-up|didn'"'"'t work"; "i"))) |
    map({
      feedback: (.message.content | .[0:200]),
      sentiment: "negative",
      timestamp: .timestamp
    }) |
    if length > 0 then . else [] end
  ' "$TRANSCRIPT_PATH" 2>/dev/null || echo "[]")

  # Count iterations (same file edited multiple times = rework)
  EDIT_RETRIES=$(jq -sr --arg sid "$SESSION_ID" '
    map(select(.sessionId == $sid)) |
    map(select((.message.content | type) == "array")) |
    map(select(.message.content[0].type == "tool_use")) |
    map(select(.message.content[0].name == "Edit")) |
    map(.message.content[0].input.file_path) |
    group_by(.) |
    map(length - 1) |
    add // 0
  ' "$TRANSCRIPT_PATH" 2>/dev/null || echo "0")

  # Detect success/failure
  HAS_ERRORS=$(echo "$ERRORS_JSON" | jq 'length > 0')
  USER_UNHAPPY=$(echo "$USER_CORRECTIONS_JSON" | jq 'length > 0')

  if [ "$HAS_ERRORS" = "true" ] || [ "$USER_UNHAPPY" = "true" ]; then
    SUCCESS="false"
  else
    SUCCESS="true"
  fi

else
  # Transcript not available - use minimal defaults
  FILES_CHANGED="0"
  GIT_COMMITS="0"
  PR_CREATED="0"
  TESTS_RUN="0"
  ISSUE_NUMBER=""
  TOOL_USES_JSON="{}"
  ERRORS_JSON="[]"
  USER_CORRECTIONS_JSON="[]"
  EDIT_RETRIES="0"
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

# ==============================================================================
# BUILD COMPREHENSIVE METADATA JSON
# ==============================================================================

# Use defaults and validate JSON
FILES_CHANGED="${FILES_CHANGED:-0}"
GIT_COMMITS="${GIT_COMMITS:-0}"
TESTS_RUN="${TESTS_RUN:-0}"
EDIT_RETRIES="${EDIT_RETRIES:-0}"
PR_CREATED_BOOL=$([[ "${PR_CREATED:-0}" -gt 0 ]] && echo "true" || echo "false")
ISSUE_NUMBER_JSON=$([ -n "$ISSUE_NUMBER" ] && echo "$ISSUE_NUMBER" || echo "null")

# Validate and default JSON variables
TOOL_USES_JSON=$(echo "${TOOL_USES_JSON:-\{\}}" | jq -c '.' 2>/dev/null || echo "{}")
ERRORS_JSON=$(echo "${ERRORS_JSON:-[]}" | jq -c '.' 2>/dev/null || echo "[]")
USER_CORRECTIONS_JSON=$(echo "${USER_CORRECTIONS_JSON:-[]}" | jq -c '.' 2>/dev/null || echo "[]")

# Build the comprehensive metadata JSON
METADATA_JSON=$(jq -n \
  --argjson files_changed "$FILES_CHANGED" \
  --argjson git_commits "$GIT_COMMITS" \
  --argjson tests_run "$TESTS_RUN" \
  --argjson edit_retries "$EDIT_RETRIES" \
  --argjson pr_created "$PR_CREATED_BOOL" \
  --argjson issue_number "$ISSUE_NUMBER_JSON" \
  --argjson tool_uses "$TOOL_USES_JSON" \
  --argjson errors "$ERRORS_JSON" \
  --argjson user_corrections "$USER_CORRECTIONS_JSON" \
  '{
    metrics: {
      files_changed: $files_changed,
      git_commits: $git_commits,
      pr_created: $pr_created,
      tests_run: $tests_run,
      issue_number: $issue_number,
      tool_uses: $tool_uses,
      edit_retries: $edit_retries
    },
    insights: {
      errors: $errors,
      user_corrections: $user_corrections,
      quality_indicators: {
        required_rework: ($edit_retries > 0),
        user_satisfaction: (if ($user_corrections | length) > 0 then "low" else "unknown" end)
      }
    }
  }'
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
