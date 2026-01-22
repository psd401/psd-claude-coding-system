#!/bin/bash
# telemetry-track.sh
#
# Stop hook - Record command execution when Claude finishes responding
# Called automatically after each Claude response completes
#
# SIMPLIFIED in v1.14.0: Removed complex transcript parsing for errors/corrections
# The /compound skill now handles sophisticated analysis when invoked
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
# SIMPLIFIED TELEMETRY EXTRACTION (v1.14.0)
# Complex transcript parsing removed - /compound handles detailed analysis
# ==============================================================================

# Initialize defaults
FILES_CHANGED="0"
GIT_COMMITS="0"
PR_CREATED="0"
TESTS_RUN="0"
ISSUE_NUMBER=""
TOOL_USES_JSON="{}"
HIGH_SIGNAL_SESSION="false"

if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then

  # ---------------------------------------------------------------------------
  # SIMPLE METRICS (fast extraction)
  # ---------------------------------------------------------------------------

  # Files changed (unique file paths) - simplified extraction
  FILES_CHANGED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Edit" or .message.content[0].name == "Write") |
    .message.content[0].input.file_path
  ' "$TRANSCRIPT_PATH" 2>/dev/null | sort -u | wc -l | tr -d ' ')

  # Git commit count (simple grep)
  GIT_COMMITS=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^git commit" 2>/dev/null || echo "0")
  GIT_COMMITS=$(echo "$GIT_COMMITS" | tr -d '\n ')

  # PR created check
  PR_CREATED=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "^gh pr create" 2>/dev/null || echo "0")
  PR_CREATED=$(echo "$PR_CREATED" | tr -d '\n ')

  # Test run count
  TESTS_RUN=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_use") |
    select(.message.content[0].name == "Bash") |
    .message.content[0].input.command
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -cE "^(pytest|npm test|cargo test|npm run test)" 2>/dev/null || echo "0")
  TESTS_RUN=$(echo "$TESTS_RUN" | tr -d '\n ')

  # Issue number extraction (from arguments or branch name)
  if [[ "$COMMAND_ARGS" =~ ^[0-9]+$ ]]; then
    ISSUE_NUMBER="$COMMAND_ARGS"
  else
    ISSUE_NUMBER=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      .gitBranch
    ' "$TRANSCRIPT_PATH" 2>/dev/null | head -1 | grep -oE '[0-9]+' | head -1)
  fi

  # ---------------------------------------------------------------------------
  # HIGH SIGNAL DETECTION (simple check for /compound suggestion)
  # ---------------------------------------------------------------------------

  # Check for tool errors (is_error: true)
  ERROR_COUNT=$(jq -r --arg sid "$SESSION_ID" '
    select(.sessionId == $sid) |
    select((.message.content | type) == "array") |
    select(.message.content[0].type == "tool_result") |
    select(.message.content[0].is_error == true)
  ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -c "is_error" 2>/dev/null || echo "0")

  # Mark as high signal if 3+ errors
  if [ "$ERROR_COUNT" -ge 3 ]; then
    HIGH_SIGNAL_SESSION="true"
  fi

  # ---------------------------------------------------------------------------
  # SUCCESS DETECTION (simplified)
  # ---------------------------------------------------------------------------

  # Default to success unless we detect clear failure
  SUCCESS="true"

  # Check for any tool errors in the session
  if [ "$ERROR_COUNT" -gt 0 ]; then
    # Has errors - check if we recovered
    if [ "$GIT_COMMITS" -gt 0 ] || [ "$PR_CREATED" -gt 0 ] || [ "$FILES_CHANGED" -gt 0 ]; then
      SUCCESS="true"  # Recovered despite errors
    else
      SUCCESS="false"  # Errors without recovery
    fi
  fi

fi

# Generate timestamp in ISO 8601 format
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build agents array JSON
AGENTS_JSON="[]"
if [ -n "$COMMAND_AGENTS" ]; then
  # Convert comma-separated list to JSON array
  AGENTS_JSON="[\"$(echo "$COMMAND_AGENTS" | sed 's/,/", "/g')\"]"
else
  # FALLBACK: Extract agents from transcript if SubagentStop hook didn't capture them
  if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then
    AGENTS_FROM_TRANSCRIPT=$(jq -sr --arg sid "$SESSION_ID" '
      map(select(.sessionId == $sid)) |
      map(select((.message.content | type) == "array")) |
      map(select(.message.content[0].type == "tool_use")) |
      map(select(.message.content[0].name == "Task")) |
      map(.message.content[0].input.subagent_type // empty) |
      map(select(. != "")) |
      unique
    ' "$TRANSCRIPT_PATH" 2>/dev/null || echo "[]")

    # Use the extracted agents if we found any
    if [ "$AGENTS_FROM_TRANSCRIPT" != "[]" ] && [ -n "$AGENTS_FROM_TRANSCRIPT" ]; then
      AGENTS_JSON="$AGENTS_FROM_TRANSCRIPT"
    fi
  fi
fi

# ==============================================================================
# PARALLEL EXECUTION TRACKING (v1.7.0+)
# ==============================================================================

PARALLEL_EXECUTION="false"
PARALLEL_AGENTS_JSON="null"
PARALLEL_DURATION_MS="null"

if grep -q "^PARALLEL=true" "$STATE_FILE" 2>/dev/null; then
  PARALLEL_EXECUTION="true"

  PARALLEL_AGENTS=$(grep "^PARALLEL_AGENTS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)
  if [ -n "$PARALLEL_AGENTS" ]; then
    PARALLEL_AGENTS_JSON="[\"$(echo "$PARALLEL_AGENTS" | sed 's/ /", "/g')\"]"
  fi

  PARALLEL_DURATION=$(grep "^PARALLEL_DURATION_MS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)
  if [ -n "$PARALLEL_DURATION" ]; then
    PARALLEL_DURATION_MS="$PARALLEL_DURATION"
  fi
fi

# ==============================================================================
# BUILD SIMPLIFIED METADATA JSON
# ==============================================================================

FILES_CHANGED="${FILES_CHANGED:-0}"
GIT_COMMITS="${GIT_COMMITS:-0}"
TESTS_RUN="${TESTS_RUN:-0}"
PR_CREATED_BOOL=$([[ "${PR_CREATED:-0}" -gt 0 ]] && echo "true" || echo "false")
ISSUE_NUMBER_JSON=$([ -n "$ISSUE_NUMBER" ] && echo "$ISSUE_NUMBER" || echo "null")

# Build the simplified metadata JSON
METADATA_JSON=$(jq -n \
  --argjson files_changed "$FILES_CHANGED" \
  --argjson git_commits "$GIT_COMMITS" \
  --argjson tests_run "$TESTS_RUN" \
  --argjson pr_created "$PR_CREATED_BOOL" \
  --argjson issue_number "$ISSUE_NUMBER_JSON" \
  --argjson parallel_exec "$PARALLEL_EXECUTION" \
  --argjson parallel_agents "$PARALLEL_AGENTS_JSON" \
  --argjson parallel_duration "$PARALLEL_DURATION_MS" \
  --argjson high_signal "$HIGH_SIGNAL_SESSION" \
  '{
    metrics: {
      files_changed: $files_changed,
      git_commits: $git_commits,
      pr_created: $pr_created,
      tests_run: $tests_run,
      issue_number: $issue_number
    },
    parallelism: {
      enabled: $parallel_exec,
      agents: $parallel_agents,
      duration_ms: $parallel_duration
    },
    signals: {
      high_signal_session: $high_signal,
      compound_suggested: $high_signal
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
TEMP_FILE="${TELEMETRY_FILE}.tmp.$$"

jq --argjson new_exec "$EXECUTION_JSON" \
  '.executions = (.executions | map(select(.id != $new_exec.id))) + [$new_exec]' \
  "$TELEMETRY_FILE" > "$TEMP_FILE" 2>/dev/null

# Verify jq succeeded and temp file is valid
if [ $? -eq 0 ] && [ -s "$TEMP_FILE" ]; then
  mv "$TEMP_FILE" "$TELEMETRY_FILE"
else
  rm -f "$TEMP_FILE" 2>/dev/null
fi

# ==============================================================================
# COMPOUND LEARNING: PR RETROSPECTIVE (only for /clean-branch command)
# Kept from original - this is valuable compound engineering data
# ==============================================================================

if [[ "$COMMAND_NAME" =~ clean-branch$ ]]; then
  if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then
    PR_NUMBER=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      select((.message.content | type) == "array") |
      select(.message.content[0].type == "tool_use") |
      select(.message.content[0].name == "Bash") |
      .message.content[0].input.command
    ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -oE "gh (pr view|issue close) [0-9]+" | grep -oE "[0-9]+" | head -1)

    BRANCH_NAME=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      select((.message.content | type) == "array") |
      select(.message.content[0].type == "tool_use") |
      select(.message.content[0].name == "Bash") |
      .message.content[0].input.command
    ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -oE "git (branch -d|push origin --delete) [^ ]+" | sed -E 's/.* ([^ ]+)$/\1/' | head -1)

    if [ -n "$PR_NUMBER" ] && command -v gh >/dev/null 2>&1; then
      PR_DATA=$(gh pr view "$PR_NUMBER" --json number,title,body,state,commits,reviews,comments,files 2>/dev/null)

      if [ -n "$PR_DATA" ]; then
        COMMITS_COUNT=$(echo "$PR_DATA" | jq '.commits | length' 2>/dev/null || echo "0")
        REVIEWS_COUNT=$(echo "$PR_DATA" | jq '.reviews | length' 2>/dev/null || echo "0")
        COMMENTS_COUNT=$(echo "$PR_DATA" | jq '.comments | length' 2>/dev/null || echo "0")
        FILES_CHANGED_PR=$(echo "$PR_DATA" | jq '.files | length' 2>/dev/null || echo "0")
        FIX_COMMITS=$(echo "$PR_DATA" | jq '[.commits[] | select(.messageHeadline | test("fix|Fix|FIX"))] | length' 2>/dev/null || echo "0")
        ISSUE_NUMBER_PR=$(echo "$PR_DATA" | jq -r '.body // "" | match("#([0-9]+)") | .captures[0].string // empty' 2>/dev/null)

        LEARNING_TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
        LEARNING_ID="learning-pr-${PR_NUMBER}-$(date +%s)"
        BRANCH_NAME="${BRANCH_NAME:-unknown}"

        COMPOUND_LEARNING=$(jq -n \
          --arg id "$LEARNING_ID" \
          --arg pr "$PR_NUMBER" \
          --arg issue "$ISSUE_NUMBER_PR" \
          --arg timestamp "$LEARNING_TIMESTAMP" \
          --arg branch "$BRANCH_NAME" \
          --argjson reviews "$REVIEWS_COUNT" \
          --argjson commits "$COMMITS_COUNT" \
          --argjson fixes "$FIX_COMMITS" \
          --argjson comments "$COMMENTS_COUNT" \
          '{
            id: $id,
            source: "pr_retrospective",
            pr_number: ($pr | tonumber),
            issue_number: (if $issue != "" then ($issue | tonumber) else null end),
            timestamp: $timestamp,
            branch_name: $branch,
            patterns_observed: {
              review_iterations: $reviews,
              commits_count: $commits,
              fix_commits: $fixes,
              comments_count: $comments
            }
          }')

        COMPOUND_TEMP_FILE="${TELEMETRY_FILE}.compound.tmp.$$"

        jq --argjson learning "$COMPOUND_LEARNING" '
          if has("compound_learnings") | not then
            .compound_learnings = []
          else
            .
          end |
          .compound_learnings = (.compound_learnings | map(select(.id != $learning.id))) |
          .compound_learnings += [$learning]
        ' "$TELEMETRY_FILE" > "$COMPOUND_TEMP_FILE" 2>/dev/null

        if [ $? -eq 0 ] && [ -s "$COMPOUND_TEMP_FILE" ] && jq empty "$COMPOUND_TEMP_FILE" 2>/dev/null; then
          mv "$COMPOUND_TEMP_FILE" "$TELEMETRY_FILE"
        else
          rm -f "$COMPOUND_TEMP_FILE" 2>/dev/null
        fi
      fi
    fi
  fi
fi

# Clean up state file
rm -f "$STATE_FILE" 2>/dev/null

# Success
exit 0
