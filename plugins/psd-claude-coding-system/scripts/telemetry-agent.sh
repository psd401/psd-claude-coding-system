#!/bin/bash
# telemetry-agent.sh
#
# SubagentStop hook - Track agent invocations
# Called automatically when a subagent (Task tool) finishes
#
# Input: JSON via stdin with session_id, subagent_name, etc.
# Output: Silent success (exit 0)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
  exit 0  # Silent failure
fi

# Extract session_id and subagent info
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // empty')
SUBAGENT_NAME=$(echo "$HOOK_INPUT" | jq -r '.subagent_name // .description // empty')

# Skip if we don't have the required data
[ -z "$SESSION_ID" ] && exit 0
[ -z "$SUBAGENT_NAME" ] && exit 0

# Find plugin root and state file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"
STATE_FILE="$META_DIR/.session_state_${SESSION_ID}"

# If no state file exists, we're not tracking this session
[ ! -f "$STATE_FILE" ] && exit 0

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
