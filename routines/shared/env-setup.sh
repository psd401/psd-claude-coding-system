#!/bin/bash
# Production environment setup script for the psd-automation cloud env.
# Used by all PSD routines (triage, lfg, pr-fix, etc.).
#
# What it does:
#   1. Diagnostics — prints cwd, HOME, and the layout the routine will see
#      during the session. Useful for debugging path issues.
#   2. Clones psd-claude-plugins fresh from main on every fire (always latest).
#   3. Copies every agent from plugins/psd-coding-system/agents/** into
#      ~/.claude/agents/ as user-scope subagents. Pilot confirmed this is
#      auto-discovered at session start by the routine.
#   4. Copies every skill directory from plugins/*/skills/ into
#      ~/.claude/skills/ as user-scope skills.
#   5. Validates FRESHSERVICE_API_KEY and FRESHSERVICE_DOMAIN env vars are
#      set (without printing them).
#
# Env vars required by the SESSION (not this setup script):
#   - FRESHSERVICE_API_KEY — API key for psd401.freshservice.com
#   - FRESHSERVICE_DOMAIN  — should be "psd401"
# Set these in the routine env config. They are injected into the session,
# not the setup phase — so this script does NOT validate them. The session
# prompt's Step 1 verifies them at session start instead.
#
# Required network access (set in env config):
#   - Trusted is fine for github.com / api.github.com
#   - Add psd401.freshservice.com to Allowed domains (it's not in the default
#     trusted allowlist). Without it, FreshService API calls fail with 403.

set -uo pipefail

echo "=== psd-automation env setup ==="
date -u +"setup start: %Y-%m-%dT%H:%M:%SZ"
echo "cwd: $(pwd)"
echo "HOME: $HOME"
echo "whoami: $(whoami 2>/dev/null || echo unknown)"

echo "--- existing $HOME contents ---"
ls -la "$HOME" 2>&1 | head -20 || true

# NOTE: setup script does not see env vars set in the routine env config —
# those are injected into the session, not the setup phase. Env-var validation
# happens at session start, not here.

# Clone psd-claude-plugins fresh — always pull main
PLUGINS_DIR="/tmp/psd-plugins"
rm -rf "$PLUGINS_DIR"
echo "Cloning psd-claude-plugins (main)..."
git clone --depth 1 --branch main https://github.com/psd401/psd-claude-plugins.git "$PLUGINS_DIR" 2>&1 | tail -5
echo "Clone HEAD: $(cd "$PLUGINS_DIR" && git rev-parse --short HEAD) $(cd "$PLUGINS_DIR" && git log -1 --pretty=%s)"

# Materialize agents into user scope
AGENTS_DIR="$HOME/.claude/agents"
mkdir -p "$AGENTS_DIR"
AGENT_COUNT=0
while IFS= read -r agent_file; do
  cp "$agent_file" "$AGENTS_DIR/"
  AGENT_COUNT=$((AGENT_COUNT + 1))
done < <(find "$PLUGINS_DIR/plugins/psd-coding-system/agents" -name "*.md" -type f)
echo "Agents installed to $AGENTS_DIR: $AGENT_COUNT"

# Materialize skills into user scope (both plugins' skills)
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"
SKILL_COUNT=0
for plugin_skills_root in "$PLUGINS_DIR/plugins/psd-coding-system/skills" "$PLUGINS_DIR/plugins/psd-productivity/skills"; do
  [ -d "$plugin_skills_root" ] || continue
  while IFS= read -r skill_md; do
    skill_dir="$(dirname "$skill_md")"
    skill_name="$(basename "$skill_dir")"
    rm -rf "$SKILLS_DIR/$skill_name"
    cp -r "$skill_dir" "$SKILLS_DIR/$skill_name"
    SKILL_COUNT=$((SKILL_COUNT + 1))
  done < <(find "$plugin_skills_root" -mindepth 2 -maxdepth 2 -name "SKILL.md" -type f)
done
echo "Skills installed to $SKILLS_DIR: $SKILL_COUNT"

# Sanity-check a couple of expected agents
for expected in repo-research-analyst.md git-history-analyzer.md bug-reproduction-validator.md; do
  if [ -f "$AGENTS_DIR/$expected" ]; then
    echo "  ✓ $expected"
  else
    echo "  ✗ MISSING: $expected" >&2
  fi
done

date -u +"setup complete: %Y-%m-%dT%H:%M:%SZ"
echo "=== end setup ==="
