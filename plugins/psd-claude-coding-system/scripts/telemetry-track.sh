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
    map(select(.message.content | test("(this|that|it).{0,20}(doesn'"'"'t work|didn'"'"'t work|broke|broken|failed|wrong|not what I wanted|incomplete)|(you|it) (broke|broken|failed)|\\b(terrible|awful|redo|revert|waste|frustrated|annoying)\\b"; "i"))) |
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
else
  # FALLBACK: Extract agents from transcript if SubagentStop hook didn't capture them
  # This handles cases where the hook failed or wasn't running yet
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

# Check if session used parallel agent execution
PARALLEL_EXECUTION="false"
PARALLEL_AGENTS_JSON="null"
PARALLEL_DURATION_MS="null"

if grep -q "^PARALLEL=true" "$STATE_FILE" 2>/dev/null; then
  PARALLEL_EXECUTION="true"

  # Extract parallel agents list
  PARALLEL_AGENTS=$(grep "^PARALLEL_AGENTS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)
  if [ -n "$PARALLEL_AGENTS" ]; then
    PARALLEL_AGENTS_JSON="[\"$(echo "$PARALLEL_AGENTS" | sed 's/ /", "/g')\"]"
  fi

  # Extract parallel execution duration
  PARALLEL_DURATION=$(grep "^PARALLEL_DURATION_MS=" "$STATE_FILE" 2>/dev/null | cut -d= -f2)
  if [ -n "$PARALLEL_DURATION" ]; then
    PARALLEL_DURATION_MS="$PARALLEL_DURATION"
  fi
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
  --argjson parallel_exec "$PARALLEL_EXECUTION" \
  --argjson parallel_agents "$PARALLEL_AGENTS_JSON" \
  --argjson parallel_duration "$PARALLEL_DURATION_MS" \
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
    parallelism: {
      enabled: $parallel_exec,
      agents: $parallel_agents,
      duration_ms: $parallel_duration
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

# ==============================================================================
# COMPOUND LEARNING: PR RETROSPECTIVE (only for /clean_branch command)
# ==============================================================================

# Match command name (handles /clean_branch, clean_branch, or with plugin prefix)
if [[ "$COMMAND_NAME" =~ clean_branch$ ]]; then
  # Extract PR number and branch name from transcript if available
  if [ -f "$TRANSCRIPT_PATH" ] && [ -r "$TRANSCRIPT_PATH" ]; then
    # Try to find PR number from gh pr view or gh issue close commands
    # Look for patterns like "gh pr view 123" or "gh issue close 456"
    PR_NUMBER=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      select((.message.content | type) == "array") |
      select(.message.content[0].type == "tool_use") |
      select(.message.content[0].name == "Bash") |
      .message.content[0].input.command
    ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -oE "gh (pr view|issue close) [0-9]+" | grep -oE "[0-9]+" | head -1)

    # Try to find branch name from git branch -d or git push --delete commands
    # Look for patterns like "git branch -d feature/123-name" or "git push origin --delete feature/123-name"
    BRANCH_NAME=$(jq -r --arg sid "$SESSION_ID" '
      select(.sessionId == $sid) |
      select((.message.content | type) == "array") |
      select(.message.content[0].type == "tool_use") |
      select(.message.content[0].name == "Bash") |
      .message.content[0].input.command
    ' "$TRANSCRIPT_PATH" 2>/dev/null | grep -oE "git (branch -d|push origin --delete) [^ ]+" | sed -E 's/.* ([^ ]+)$/\1/' | head -1)

    # Only proceed if we found a PR number
    if [ -n "$PR_NUMBER" ] && command -v gh >/dev/null 2>&1; then
      # Get PR data
      PR_DATA=$(gh pr view "$PR_NUMBER" --json number,title,body,state,commits,reviews,comments,files 2>/dev/null)

      if [ -n "$PR_DATA" ]; then
        # Extract metrics
        COMMITS_COUNT=$(echo "$PR_DATA" | jq '.commits | length' 2>/dev/null || echo "0")
        REVIEWS_COUNT=$(echo "$PR_DATA" | jq '.reviews | length' 2>/dev/null || echo "0")
        COMMENTS_COUNT=$(echo "$PR_DATA" | jq '.comments | length' 2>/dev/null || echo "0")
        FILES_CHANGED_PR=$(echo "$PR_DATA" | jq '.files | length' 2>/dev/null || echo "0")

        # Get PR comments for theme analysis
        PR_COMMENTS=$(gh pr view "$PR_NUMBER" --comments 2>/dev/null || echo "")

        # Count fix commits
        FIX_COMMITS=$(echo "$PR_DATA" | jq '[.commits[] | select(.messageHeadline | test("fix|Fix|FIX"))] | length' 2>/dev/null || echo "0")

        # Detect themes in comments
        THEME_TYPE_SAFETY=$(echo "$PR_COMMENTS" | grep -ioE '\b(type|types|typescript|any type|type error)\b' 2>/dev/null | wc -l | tr -d ' ')
        THEME_TESTING=$(echo "$PR_COMMENTS" | grep -ioE '\b(test|tests|testing|coverage)\b' 2>/dev/null | wc -l | tr -d ' ')
        THEME_ERROR_HANDLING=$(echo "$PR_COMMENTS" | grep -ioE '\b(error|errors|exception|catch|try-catch)\b' 2>/dev/null | wc -l | tr -d ' ')
        THEME_SECURITY=$(echo "$PR_COMMENTS" | grep -ioE '\b(security|vulnerable|vulnerability|auth|authentication)\b' 2>/dev/null | wc -l | tr -d ' ')
        THEME_PERFORMANCE=$(echo "$PR_COMMENTS" | grep -ioE '\b(performance|slow|optimize|cache)\b' 2>/dev/null | wc -l | tr -d ' ')

        # Default to 0
        THEME_TYPE_SAFETY="${THEME_TYPE_SAFETY:-0}"
        THEME_TESTING="${THEME_TESTING:-0}"
        THEME_ERROR_HANDLING="${THEME_ERROR_HANDLING:-0}"
        THEME_SECURITY="${THEME_SECURITY:-0}"
        THEME_PERFORMANCE="${THEME_PERFORMANCE:-0}"

        # Extract issue number from PR body
        ISSUE_NUMBER_PR=$(echo "$PR_DATA" | jq -r '.body // "" | match("#([0-9]+)") | .captures[0].string // empty' 2>/dev/null)

        # Build suggestions based on patterns
        SUGGESTIONS_JSON="[]"

        # Type Safety suggestion
        if [ "$THEME_TYPE_SAFETY" -ge 3 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_TYPE_SAFETY" '. + [{
            type: "automation",
            suggestion: "Enable stricter TypeScript configuration or add pre-commit type checking",
            compound_benefit: "Catch type errors before PR submission, reducing review cycles by ~30%",
            implementation: "Add tsconfig strict mode or pre-commit hook with tsc --noEmit",
            confidence: "high",
            evidence: ("Type safety mentioned " + $count + " times in PR discussion")
          }]')
        fi

        # Testing suggestion
        if [ "$THEME_TESTING" -ge 3 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_TESTING" '. + [{
            type: "systematization",
            suggestion: "Document testing requirements and patterns in CONTRIBUTING.md",
            compound_benefit: "Consistent test coverage, reduce \"where should I add tests?\" questions",
            implementation: "Add testing section to CONTRIBUTING.md with examples",
            confidence: "medium",
            evidence: ("Testing discussed " + $count + " times, indicates unclear patterns")
          }]')
        fi

        # Security suggestion
        if [ "$THEME_SECURITY" -ge 2 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_SECURITY" '. + [{
            type: "delegation",
            suggestion: "security-analyst-specialist agent now runs automatically in /work",
            compound_benefit: "Catch security issues before PR creation, not during review",
            implementation: "Already implemented in v1.4.0 - security analysis runs after PR creation",
            confidence: "high",
            evidence: ("Security concerns raised " + $count + " times in review")
          }]')
        fi

        # Error handling suggestion
        if [ "$THEME_ERROR_HANDLING" -ge 3 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_ERROR_HANDLING" '. + [{
            type: "systematization",
            suggestion: "Document error handling patterns in project guidelines",
            compound_benefit: "Consistent error handling reduces review discussions",
            implementation: "Add error handling section to CLAUDE.md or CONTRIBUTING.md",
            confidence: "medium",
            evidence: ("Error handling discussed " + $count + " times in PR")
          }]')
        fi

        # High iteration suggestion
        if [ "$REVIEWS_COUNT" -ge 3 ] || [ "$FIX_COMMITS" -ge 5 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg reviews "$REVIEWS_COUNT" --arg fixes "$FIX_COMMITS" '. + [{
            type: "prevention",
            suggestion: "Use /architect command before /work for complex issues",
            compound_benefit: "Better upfront design reduces review iterations",
            implementation: "Workflow: /issue → /architect → /work for complex features",
            confidence: "medium",
            evidence: ("PR required " + $reviews + " review rounds and " + $fixes + " fix commits")
          }]')
        fi

        # Performance suggestion
        if [ "$THEME_PERFORMANCE" -ge 2 ]; then
          SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_PERFORMANCE" '. + [{
            type: "delegation",
            suggestion: "Invoke performance-optimizer agent for performance-critical code",
            compound_benefit: "Catch performance issues early in development",
            implementation: "Use Task tool with psd-claude-coding-system:performance-optimizer",
            confidence: "medium",
            evidence: ("Performance discussed " + $count + " times in PR")
          }]')
        fi

        # Build compound learning entry
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
          --arg theme_type "$THEME_TYPE_SAFETY" \
          --arg theme_test "$THEME_TESTING" \
          --arg theme_err "$THEME_ERROR_HANDLING" \
          --arg theme_sec "$THEME_SECURITY" \
          --arg theme_perf "$THEME_PERFORMANCE" \
          --argjson suggestions "$SUGGESTIONS_JSON" \
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
              comments_count: $comments,
              common_themes: {
                type_safety: ($theme_type | tonumber),
                testing: ($theme_test | tonumber),
                error_handling: ($theme_err | tonumber),
                security: ($theme_sec | tonumber),
                performance: ($theme_perf | tonumber)
              }
            },
            suggestions: $suggestions
          }')

        # Append to compound_learnings array
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

        # Verify and commit
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
