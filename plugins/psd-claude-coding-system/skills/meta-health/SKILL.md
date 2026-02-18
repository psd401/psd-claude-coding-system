---
name: meta-health
description: Quick system health check — counts learnings, lists agent memory, shows recent activity
model: claude-sonnet-4-6
context: fork
agent: Explore
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
---

# Meta Health Command

Quick health check of the learning and memory system. Shows what knowledge has been captured, not fabricated metrics.

## Workflow

### Phase 1: Count Learnings by Category

```bash
echo "=== Project Learnings ==="
LEARNINGS_DIR="./docs/learnings"

if [ -d "$LEARNINGS_DIR" ]; then
  TOTAL=$(find "$LEARNINGS_DIR" -name "*.md" -type f | wc -l | tr -d ' ')
  echo "Total learnings: $TOTAL"
  echo ""

  # Count by category subdirectory
  for dir in "$LEARNINGS_DIR"/*/; do
    if [ -d "$dir" ]; then
      CATEGORY=$(basename "$dir")
      COUNT=$(find "$dir" -name "*.md" -type f | wc -l | tr -d ' ')
      echo "  $CATEGORY: $COUNT"
    fi
  done
else
  echo "No learnings directory found at $LEARNINGS_DIR"
  echo "Run /compound after a session to start capturing learnings."
fi
```

### Phase 2: List Agent Memory Files

```bash
echo ""
echo "=== Agent Memory Files ==="
# Check for agent memory in the project
MEMORY_FILES=$(find .claude/agent-memory -name "MEMORY.md" -type f 2>/dev/null || echo "")

if [ -n "$MEMORY_FILES" ]; then
  echo "$MEMORY_FILES" | while read -r file; do
    SIZE=$(wc -c < "$file" | tr -d ' ')
    LINES=$(wc -l < "$file" | tr -d ' ')
    echo "  $file ($LINES lines, ${SIZE}B)"
  done
else
  echo "  No agent memory files found yet."
  echo "  Agents with memory: project will create these automatically."
fi
```

### Phase 3: Show Recent Learnings

```bash
echo ""
echo "=== 5 Most Recent Learnings ==="
if [ -d "$LEARNINGS_DIR" ]; then
  find "$LEARNINGS_DIR" -name "*.md" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | \
    sort -rn | head -5 | while read -r ts file; do
      TITLE=$(grep -m1 "^title:" "$file" 2>/dev/null | sed 's/^title: *//' || basename "$file" .md)
      DATE=$(grep -m1 "^date:" "$file" 2>/dev/null | sed 's/^date: *//' || echo "unknown")
      echo "  [$DATE] $TITLE"
      echo "         $file"
    done
else
  echo "  (none)"
fi
```

### Phase 4: Plugin Summary

```bash
echo ""
echo "=== Plugin Summary ==="
echo "Skills: $(find ./skills -name 'SKILL.md' -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "Agents: $(find ./agents -name '*.md' -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "Hook events: $(cat ./hooks/hooks.json 2>/dev/null | jq '.hooks | keys | length' 2>/dev/null || echo 'unknown')"

echo ""
echo "=== Next Steps ==="
echo "  /compound        — Capture learnings from this session"
echo "  /meta-review     — Deep analysis of accumulated learnings"
```
