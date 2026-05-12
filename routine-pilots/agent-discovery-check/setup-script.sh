#!/bin/bash
# Routine environment setup script for the agent-discovery-check pilot.
#
# Purposes:
#   1. Materialize routine-pilots/agent-discovery-check/pilot-setup-placed.md
#      into .claude/agents/ BEFORE the session starts, so we can test whether
#      setup-script-placed agents are auto-discovered at session start.
#   2. Append a timestamp to .claude/setup-marker.log so we can detect whether
#      this script re-runs on every routine fire or whether the result is cached.
#
# Assumed cwd: root of the cloned psd-claude-plugins repository.

set -euo pipefail

REPO_DIR="$(pwd)"
AGENTS_DIR="${REPO_DIR}/.claude/agents"
SOURCE_AGENT="${REPO_DIR}/routine-pilots/agent-discovery-check/pilot-setup-placed.md"
TARGET_AGENT="${AGENTS_DIR}/pilot-setup-placed.md"
MARKER_LOG="${REPO_DIR}/.claude/setup-marker.log"

mkdir -p "$AGENTS_DIR"

if [ -f "$SOURCE_AGENT" ]; then
  cp "$SOURCE_AGENT" "$TARGET_AGENT"
  echo "Copied pilot-setup-placed.md into .claude/agents/"
else
  echo "ERROR: source agent file not found at $SOURCE_AGENT" >&2
  exit 1
fi

# Caching probe: each script invocation appends one line.
# If we fire the routine 3 times and see only 1 line, the script result is cached.
# If we see 3 lines, the script re-runs every fire.
echo "setup-script ran at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$MARKER_LOG"
echo "Setup script complete."
