#!/usr/bin/env bash
# pre-compact-context.sh — PreCompact hook
# Outputs critical context that should be preserved during context compaction.
# The output of this script is injected into the compacted conversation.

set -euo pipefail

echo "=== Pre-Compaction Context Snapshot ==="

# Guard: exit cleanly if not inside a git worktree (e.g., non-git directory).
# Without this, set -e would abort on any failing git command.
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not inside a git repository — skipping context snapshot."
  echo "=== End Context Snapshot ==="
  exit 0
fi

# 1. Current branch and uncommitted work
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
echo "Branch: $BRANCH"

UNCOMMITTED=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
if [ "$UNCOMMITTED" -gt 0 ]; then
  echo "Uncommitted changes: $UNCOMMITTED files"
  git status --short 2>/dev/null | head -15
fi

# 2. Recent commits on this branch (what we've done so far)
DEFAULT_BRANCH=$(git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@' || echo "main")
COMMIT_COUNT=$(git rev-list --count "$DEFAULT_BRANCH"..HEAD 2>/dev/null || echo "0")
if [ "$COMMIT_COUNT" -gt 0 ]; then
  echo ""
  echo "Commits on this branch ($COMMIT_COUNT):"
  git log --oneline "$DEFAULT_BRANCH"..HEAD 2>/dev/null | head -10
fi

# 3. Active issue (if branch matches feature/NNN pattern)
if [[ "$BRANCH" =~ ^feature/([0-9]+) ]]; then
  ISSUE_NUM="${BASH_REMATCH[1]}"
  echo ""
  echo "Active issue: #$ISSUE_NUM"
fi

echo "=== End Context Snapshot ==="

exit 0
