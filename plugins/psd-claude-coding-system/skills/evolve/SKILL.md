---
name: evolve
description: Auto-evolve the plugin — analyzes learnings, checks releases, compares competition, contributes patterns
model: claude-sonnet-4-6
context: fork
agent: general-purpose
allowed-tools:
  - Bash(*)
  - Read
  - Edit
  - Write
  - Task
  - Glob
  - Grep
  - WebFetch
  - WebSearch
extended-thinking: true
---

# Evolve Command

You are the plugin evolution engine. You take no arguments — instead you read system state and auto-pick the highest-value action to improve the plugin.

## Phase 1: Read State

```bash
echo "=== Evolve State ==="
PLUGIN_DIR="$(pwd)"
STATE_FILE="$PLUGIN_DIR/docs/learnings/.evolve-state.json"

# Ensure learnings directory exists
mkdir -p "$PLUGIN_DIR/docs/learnings"

# Load or initialize state
if [ -f "$STATE_FILE" ]; then
  cat "$STATE_FILE"
else
  echo '{"last_analyze":null,"last_updates_check":null,"last_compare":null,"last_concepts":null,"learnings_at_last_analyze":0}'
fi

echo ""
echo "=== Learnings Count ==="
TOTAL_LEARNINGS=$(find "$PLUGIN_DIR/docs/learnings" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
echo "Total learning files: $TOTAL_LEARNINGS"

# Count by category
for dir in "$PLUGIN_DIR/docs/learnings"/*/; do
  if [ -d "$dir" ]; then
    CATEGORY=$(basename "$dir")
    COUNT=$(find "$dir" -name "*.md" -type f | wc -l | tr -d ' ')
    echo "  $CATEGORY: $COUNT"
  fi
done

echo ""
echo "=== Universal Learnings ==="
UNIVERSAL_COUNT=0
if [ -d "$PLUGIN_DIR/docs/learnings" ]; then
  UNIVERSAL_COUNT=$(grep -rl "applicable_to: universal" "$PLUGIN_DIR/docs/learnings" 2>/dev/null | wc -l | tr -d ' ')
fi
echo "Universal learnings: $UNIVERSAL_COUNT"

echo ""
echo "=== Agent Memory Files ==="
find .claude/agent-memory -name "MEMORY.md" -type f 2>/dev/null || echo "(none)"

echo ""
echo "=== 5 Most Recent Learnings ==="
if [ "$TOTAL_LEARNINGS" -gt 0 ]; then
  find "$PLUGIN_DIR/docs/learnings" -name "*.md" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | \
    sort -rn | head -5 | while read -r ts file; do
      TITLE=$(grep -m1 "^title:" "$file" 2>/dev/null | sed 's/^title: *//' || basename "$file" .md)
      DATE=$(grep -m1 "^date:" "$file" 2>/dev/null | sed 's/^date: *//' || echo "unknown")
      echo "  [$DATE] $TITLE"
    done
else
  echo "  (none)"
fi

echo ""
echo "=== Plugin Summary ==="
echo "Skills: $(find "$PLUGIN_DIR/skills" -name 'SKILL.md' -type f 2>/dev/null | wc -l | tr -d ' ')"
echo "Agents: $(find "$PLUGIN_DIR/agents" -name '*.md' -type f 2>/dev/null | wc -l | tr -d ' ')"
```

## Phase 2: Decision Engine

Evaluate the following priority list top-to-bottom. **First match wins.**

Load the state file values:
- `last_analyze` — timestamp of last deep pattern analysis
- `last_updates_check` — timestamp of last Claude Code release check
- `last_compare` — timestamp of last plugin comparison
- `last_concepts` — timestamp of last automation concepts extraction
- `learnings_at_last_analyze` — number of learnings at the time of last analysis

### Priority 1: Deep Pattern Analysis

**Condition:** `TOTAL_LEARNINGS - learnings_at_last_analyze >= 8`

There are 8+ unanalyzed learnings since the last deep analysis. This is the highest-value action because accumulated learnings contain compounding insights.

**Action:** Proceed to Phase 3A.

### Priority 2: Claude Code Release Gap Analysis

**Condition:** `last_updates_check` is null OR more than 30 days ago

Claude Code releases frequently. Staying current prevents drift and unlocks new capabilities.

**Action:** Proceed to Phase 3B.

### Priority 3: Pattern Contribution

**Condition:** There exist learnings with `applicable_to: universal` that have NOT been contributed to the plugin repo patterns directory

Universal learnings benefit all users. Check if any `docs/learnings/**/*.md` files with `applicable_to: universal` have no corresponding file in `docs/patterns/`.

**Action:** Proceed to Phase 3C.

### Priority 4: Plugin Comparison

**Condition:** `last_compare` is null OR more than 30 days ago

Comparing against Every's Compound Engineering plugin reveals gaps and opportunities.

**Action:** Proceed to Phase 3D.

### Priority 5: Automation Concepts Extraction

**Condition:** `last_concepts` is null OR more than 14 days ago AND no new learnings in 14+ days

When learning capture has been quiet, there may be automation opportunities hiding in recent work sessions.

**Action:** Proceed to Phase 3E.

### Priority 6: Health Dashboard (Default)

**Condition:** Nothing above matched — everything is current.

**Action:** Proceed to Phase 3F.

---

**After selecting a priority, announce what you're doing and why:**

```markdown
## Evolve: [Action Name]

**Why:** [One sentence explaining why this was selected]
**Priority:** [N] of 6
```

## Phase 3: Execute Selected Action

### Phase 3A: Deep Pattern Analysis

Dispatch the meta-reviewer agent to analyze accumulated learnings:

```
Task tool invocation:
  subagent_type: "psd-claude-coding-system:meta:meta-reviewer"
  model: opus
  description: "Analyze learnings for patterns"
  prompt: "Analyze all project learnings in docs/learnings/ and any agent memory files. Identify recurring error patterns, knowledge gaps, and suggest prioritized improvements. Produce a structured Meta Review Report with top 3-5 actionable improvements."
```

Present the meta-reviewer's report with:
- Summary of findings
- Top 3-5 actionable improvements
- Knowledge gap warnings
- Suggested next steps

### Phase 3B: Claude Code Release Gap Analysis

Use WebFetch to check for Claude Code updates:

1. Fetch `https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md` — extract recent versions
2. Compare against our plugin structure:
   - Check for new frontmatter fields we should adopt
   - Check for new hook events
   - Check for new tool permissions
   - Check for model deprecations
   - Check for breaking changes

Present a structured report:
```markdown
### Claude Code Release Analysis

| Version | Key Changes | Impact on Plugin |
|---------|-------------|-----------------|
| X.Y.Z   | ...         | ...             |

### Required Actions
- [List any breaking changes]

### Recommended Improvements
- [List new features we should adopt]
```

### Phase 3C: Pattern Contribution

1. List all learnings with `applicable_to: universal`
2. Check which ones already have corresponding files in `docs/patterns/`
3. Present the uncontributed universal learnings to the user:

```markdown
### Universal Learnings Ready to Contribute

| Learning | Category | Date |
|----------|----------|------|
| ...      | ...      | ...  |

**Would you like me to create a PR contributing these patterns to the plugin repo?**
```

**IMPORTANT:** Wait for explicit user confirmation before creating any PR. Do NOT auto-create PRs.

If confirmed, for each learning:
- Fork/clone the plugin repo via `gh` CLI
- Create a branch, copy the pattern, create PR
- Report the PR URL

### Phase 3D: Plugin Comparison

Use WebFetch to analyze Every's Compound Engineering plugin:

1. Fetch `https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/README.md`
2. Fetch `https://raw.githubusercontent.com/EveryInc/compound-engineering-plugin/main/plugins/compound-engineering/.claude-plugin/plugin.json`
3. Compare agent counts, skill patterns, architecture approaches

Present a structured comparison:
```markdown
### Plugin Comparison: PSD vs Every

| Dimension | PSD | Every | Gap |
|-----------|-----|-------|-----|
| Agents    | X   | Y     | ... |
| Skills    | X   | Y     | ... |

### Agents/Skills They Have That We Don't
- [List with priority]

### Our Unique Strengths
- [List]

### Top 3 Adoption Recommendations
1. ...
```

### Phase 3E: Automation Concepts Extraction

Analyze recent git activity and session patterns for compound engineering opportunities:

```bash
# Recent git activity
git log --oneline -20 2>/dev/null || echo "No git history"

# Recently modified files
git diff --stat HEAD~10 2>/dev/null || echo "No recent changes"
```

Then analyze for:
1. **Delegation opportunities** — subtasks that could be handled by specialized agents
2. **Automation candidates** — recurring manual processes
3. **Systematization targets** — knowledge that should be captured
4. **Parallel processing** — independent workstreams that could run simultaneously

Present 3-5 actionable suggestions in this format:
```markdown
### Compound Engineering Opportunities

**1. [Suggestion]**
- Compound Benefit: [Long-term value]
- Implementation: [How]
- Confidence: [High/Medium/Low]
```

### Phase 3F: Health Dashboard

Display current system status:

```markdown
### System Health

| Metric | Value |
|--------|-------|
| Total Learnings | X |
| Agent Memory Files | X |
| Skills | X |
| Agents | X |

### Recent Activity
[5 most recent learnings]

### Staleness Report
| Check | Last Run | Status |
|-------|----------|--------|
| Pattern Analysis | [date] | Current/Stale |
| Release Check | [date] | Current/Stale |
| Plugin Comparison | [date] | Current/Stale |
| Concepts Extraction | [date] | Current/Stale |

**You're current. Keep shipping.**
```

## Phase 4: Update State

After executing the selected action, update `.evolve-state.json`:

```bash
# Read current state or initialize
STATE_FILE="./docs/learnings/.evolve-state.json"
CURRENT_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
TOTAL_LEARNINGS=$(find ./docs/learnings -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')

# Update the appropriate field based on which action was executed:
# - Priority 1 (Pattern Analysis): update last_analyze + learnings_at_last_analyze
# - Priority 2 (Release Check): update last_updates_check
# - Priority 3 (Contribution): no state update needed
# - Priority 4 (Comparison): update last_compare
# - Priority 5 (Concepts): update last_concepts
# - Priority 6 (Health): no state update needed
```

Use the Write tool to save the updated JSON to `docs/learnings/.evolve-state.json`.

## Phase 4.5: Plugin Feedback Loop

If the executed action produced **actionable findings that require changes to the plugin itself** (not the current project), create a GitHub issue on the plugin repo to close the loop.

**Trigger conditions** (any of these):
- Pattern analysis found recurring issues that suggest a new agent or skill modification
- Release check found breaking changes or new features the plugin should adopt
- Plugin comparison found high-priority gaps to close
- Automation concepts identified a new workflow to add

**Do NOT create an issue if:**
- The action was health dashboard (Priority 6) — nothing actionable
- The findings are project-specific (not plugin-level)
- The action was pattern contribution (Priority 3) — that creates a PR instead

**Issue creation:**

```bash
PLUGIN_REPO="psd401/psd-claude-coding-system"

# Verify gh access
gh repo view "$PLUGIN_REPO" --json nameWithOwner > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Cannot access $PLUGIN_REPO — skipping feedback loop"
  echo "Manual action needed: bring these findings to the plugin repo"
else
  # Create the issue
  gh issue create \
    --repo "$PLUGIN_REPO" \
    --title "evolve: [Brief description of what needs changing]" \
    --label "evolve-feedback" \
    --body "$(cat <<'ISSUE_EOF'
## Source

Auto-created by `/evolve` running in project: [project name/path]

## Findings

[Summary of what /evolve discovered]

## Recommended Plugin Changes

- [ ] [Specific change 1]
- [ ] [Specific change 2]

## Evidence

[Key data points from the analysis]

---
*Auto-generated by `/evolve` Phase 4.5 — Plugin Feedback Loop*
ISSUE_EOF
)"

  echo "Issue created on $PLUGIN_REPO"
fi
```

**Present the issue URL to the user** so they can track it. Then continue to Phase 5.

## Phase 5: Suggest Next

Based on remaining staleness in the state file, suggest when to run `/evolve` again:

```markdown
### Next Steps

- Run `/evolve` again after [condition] to [action]
- Meanwhile, `/work`, `/test`, `/review-pr`, and `/lfg` continue capturing learnings automatically
```

## Success Criteria

- State file read (or initialized if first run)
- Correct priority selected based on current state
- Selected action executed fully
- State file updated with new timestamp
- GitHub issue created on plugin repo if findings are actionable (Phase 4.5)
- Next suggestion provided
