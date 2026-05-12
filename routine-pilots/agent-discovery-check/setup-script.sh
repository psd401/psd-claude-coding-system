#!/bin/bash
# Routine environment setup script for the agent-discovery-check pilot.
#
# v2 — uses user-scope agents dir (~/.claude/agents/) so it doesn't depend on
# where the cloned repo lands. The original v1 assumed cwd was the repo root,
# but in practice the routine env setup runs in /home/user with no repo present.
#
# Purposes:
#   1. Write pilot-setup-placed.md into ~/.claude/agents/ BEFORE the session
#      starts, so we can test whether user-scope agents placed by the setup
#      script are auto-discovered.
#   2. Print diagnostic info about the filesystem layout (where does the repo
#      get cloned? when?) — relevant for designing the production routines.
#   3. Append a timestamp to ~/.claude/setup-marker.log so we can detect
#      whether this script re-runs every fire or is cached.

set -uo pipefail

echo "=== Pilot setup diagnostics ==="
echo "cwd: $(pwd)"
echo "HOME: $HOME"
echo "whoami: $(whoami 2>/dev/null || echo unknown)"
echo "--- listing \$HOME ---"
ls -la "$HOME" 2>&1 | head -30 || true
echo "--- /workspace (if it exists) ---"
ls -la /workspace 2>&1 | head -20 || echo "(no /workspace)"
echo "--- searching for psd-claude-plugins under / ---"
find / -maxdepth 5 -name "psd-claude-plugins" -type d 2>/dev/null | head -10 || true
echo "=== end diagnostics ==="

mkdir -p "$HOME/.claude/agents"

cat > "$HOME/.claude/agents/pilot-setup-placed.md" <<'AGENT_EOF'
---
name: pilot-setup-placed
description: Pilot test agent placed into ~/.claude/agents/ by the routine's environment setup script (NOT committed to .claude/agents/). Used to verify that setup-script-materialized user-scope subagents are discovered at session start.
tools: []
model: haiku
---

You are a test agent used to validate Claude Code routine behavior.

When invoked, reply with **exactly** the following string and nothing else:

SETUP_PLACED_AGENT_REACHED

Do not add commentary, formatting, or punctuation. Do not call any tools.
AGENT_EOF

echo "Wrote pilot-setup-placed agent to $HOME/.claude/agents/"

# Caching probe: each script invocation appends one line.
# If three fires produce one line, the script ran once and is cached.
# If three fires produce three lines, the script re-runs every fire.
echo "setup-script ran at $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> "$HOME/.claude/setup-marker.log"

echo "Setup script complete."
