#!/bin/bash
# telemetry-agent.sh
#
# SubagentStop hook - Track agent invocations
# Called automatically when a subagent (Task tool) finishes
#
# Input: JSON via stdin with session_id, transcript_path, etc.
# Output: Silent success (exit 0)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
  exit 0  # Silent failure
fi

# Extract session_id and transcript_path
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // empty')
TRANSCRIPT_PATH=$(echo "$HOOK_INPUT" | jq -r '.transcript_path // empty')

# Skip if we don't have the required data
[ -z "$SESSION_ID" ] && exit 0
[ -z "$TRANSCRIPT_PATH" ] && exit 0

# Find plugin root and state file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"
STATE_FILE="$META_DIR/.session_state_${SESSION_ID}"

# If no state file exists, we're not tracking this session
[ ! -f "$STATE_FILE" ] && exit 0

# Check if transcript exists
[ ! -f "$TRANSCRIPT_PATH" ] && exit 0

# Extract subagent name from the MOST RECENT Task tool invocation in transcript
# The SubagentStop hook fires after each Task tool completes
# We need to find the last Task tool call for this session
SUBAGENT_NAME=$(jq -r --arg sid "$SESSION_ID" '
  select(.sessionId == $sid) |
  select((.message.content | type) == "array") |
  select(.message.content[0].type == "tool_use") |
  select(.message.content[0].name == "Task") |
  .message.content[0].input.subagent_type // empty
' "$TRANSCRIPT_PATH" 2>/dev/null | tail -1)

# Skip if we couldn't extract agent name
[ -z "$SUBAGENT_NAME" ] && exit 0

# Update state file with agent name (append to comma-separated list)
# First, source the existing state
source "$STATE_FILE"

# Add agent to the list
if [ -z "$COMMAND_AGENTS" ]; then
  COMMAND_AGENTS="$SUBAGENT_NAME"
else
  # Check if agent already in list (avoid duplicates)
  if ! echo "$COMMAND_AGENTS" | grep -q "$SUBAGENT_NAME"; then
    COMMAND_AGENTS="$COMMAND_AGENTS,$SUBAGENT_NAME"
  fi
fi

# Write updated state back to file
cat > "$STATE_FILE" <<EOF
COMMAND_NAME="$COMMAND_NAME"
COMMAND_ARGS="$COMMAND_ARGS"
COMMAND_START_TIME="$COMMAND_START_TIME"
COMMAND_AGENTS="$COMMAND_AGENTS"
COMMAND_METADATA="$COMMAND_METADATA"
EOF

# Success
exit 0
