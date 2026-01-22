#!/bin/bash
# telemetry-command.sh
#
# UserPromptSubmit hook - Detect slash command execution and initialize tracking
# Called automatically when user submits a prompt
#
# Input: JSON via stdin with session_id, user_prompt, etc.
# Output: Silent success (exit 0)

# Read hook input JSON from stdin
HOOK_INPUT=$(cat)

# Check if jq is available
if ! command -v jq >/dev/null 2>&1; then
  exit 0  # Silent failure
fi

# Extract session_id and prompt (field name is "prompt" not "user_prompt")
SESSION_ID=$(echo "$HOOK_INPUT" | jq -r '.session_id // empty')
PROMPT=$(echo "$HOOK_INPUT" | jq -r '.prompt // empty')

# Skip if we don't have the required data
[ -z "$SESSION_ID" ] && exit 0
[ -z "$PROMPT" ] && exit 0

# Check if this is a slash command from our plugin
# Commands can be: /work OR /psd-claude-coding-system:work
COMMAND_LIST="work|test|architect|issue|product-manager|review-pr|security-audit|compound-concepts|clean-branch|triage|meta-analyze|meta-learn|meta-implement|meta-experiment|meta-evolve|meta-document|meta-predict|meta-health|meta-improve|meta-compound-analyze|compound-plugin-analyzer|claude-code-updates"
if ! echo "$PROMPT" | grep -qE "^/(psd-claude-coding-system:)?($COMMAND_LIST)"; then
  # Not a tracked slash command
  exit 0
fi

# Extract command name and arguments
# Handle both /command and /plugin:command formats
COMMAND_NAME=$(echo "$PROMPT" | sed -E 's#^/([a-z_-]+:)?([a-z_]+).*#\2#')
COMMAND_ARGS=$(echo "$PROMPT" | sed -E 's#^/([a-z_-]+:)?[a-z_]+[[:space:]]*(.*)#\2#')

# Find plugin root and create state file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$SCRIPT_DIR")"
META_DIR="$PLUGIN_ROOT/meta"
STATE_FILE="$META_DIR/.session_state_${SESSION_ID}"

# Ensure meta directory exists
mkdir -p "$META_DIR" 2>/dev/null || exit 0

# Initialize state file for this command execution
cat > "$STATE_FILE" <<EOF
COMMAND_NAME="/$COMMAND_NAME"
COMMAND_ARGS="$COMMAND_ARGS"
COMMAND_START_TIME="$(date +%s)"
COMMAND_AGENTS=""
COMMAND_METADATA="{}"
EOF

# Success - command tracking initialized
exit 0
