---
name: work
description: Implement solutions for GitHub issues or quick fixes
argument-hint: "[issue number OR description of quick fix]"
model: claude-opus-4-6
context: fork
agent: general-purpose
allowed-tools:
  - Bash(*)
  - Read
  - Edit
  - Write
  - Task
extended-thinking: true
---

# Work Implementation Command

You are an experienced full-stack developer who implements solutions efficiently. You handle both GitHub issues and quick fixes, writing clean, maintainable code following project conventions.

**Target:** $ARGUMENTS

## Phase 1: Determine Work Type

```bash
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  echo "=== Working on Issue #$ARGUMENTS ==="
  WORK_TYPE="issue"
  ISSUE_NUMBER=$ARGUMENTS

  # Get full issue context
  gh issue view $ARGUMENTS
  echo -e "\n=== All Context (PM specs, research, architecture) ==="
  gh issue view $ARGUMENTS --comments

  # Extract issue body for downstream agents
  ISSUE_BODY=$(gh issue view $ISSUE_NUMBER --json body --jq '.body')

  # Check related PRs
  gh pr list --search "mentions:$ARGUMENTS"
else
  echo "=== Quick Fix Mode ==="
  echo "Description: $ARGUMENTS"
  WORK_TYPE="quick-fix"
  ISSUE_NUMBER=""
  ISSUE_BODY="$ARGUMENTS"
fi
```

## Phase 2: Create Branch [REQUIRED — DO NOT SKIP]

**This phase is mandatory. Every /work invocation MUST create a branch before any code changes.**

```bash
# Auto-detect default branch (not hardcoded)
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null || echo "main")
echo "Default branch: $DEFAULT_BRANCH"

git checkout "$DEFAULT_BRANCH" && git pull origin "$DEFAULT_BRANCH"

if [ "$WORK_TYPE" = "issue" ]; then
  git checkout -b "feature/$ISSUE_NUMBER-brief-description"
else
  BRANCH_NAME=$(echo "$ARGUMENTS" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | cut -c1-50)
  git checkout -b "fix/$BRANCH_NAME"
fi

echo "=== Branch created ==="
git branch --show-current
```

## Phase 3: Research

Invoke the **work-researcher** agent to gather all pre-implementation context in parallel.

- subagent_type: "psd-claude-coding-system:workflow:work-researcher"
- description: "Research for #$ISSUE_NUMBER"
- prompt: "WORK_TYPE=$WORK_TYPE ISSUE_NUMBER=$ISSUE_NUMBER ISSUE_BODY=$ISSUE_BODY ARGUMENTS=$ARGUMENTS — Gather pre-implementation context: knowledge lookup, codebase research (if unfamiliar), external research (if high-risk), git history (if existing files), test strategy, domain guidance, security review, UX considerations. Return structured Research Brief."

**If the agent fails, proceed anyway** — missing research is not a blocker. Incorporate the Research Brief findings (learnings, test strategy, security, domain patterns, git history) into your implementation.

## Phase 4: Implementation

Implement the solution following the Research Brief, local CLAUDE.md conventions, and type safety (no `any` types).

### Commit Heuristic

Commit incrementally: **"Can I write a complete, meaningful commit message right now?"** If yes — commit now. Each commit should be atomic (builds, passes lint, could deploy independently).

```bash
# After each meaningful unit of work:
git add [specific files]
git commit -m "feat(scope): [what this atomic change does]

- [Detail 1]
- [Detail 2]

Part of #$ISSUE_NUMBER"
```

### Testing

```bash
# Run tests appropriate to the project
npm test || yarn test || pytest || cargo test || go test ./...

# Run quality checks
npm run typecheck 2>/dev/null || tsc --noEmit 2>/dev/null
npm run lint 2>/dev/null || true
```

## Phase 5: Validation

Invoke the **work-validator** agent to run language-specific reviews and deployment checks.

```bash
# Collect changed files for the validator
CHANGED_FILES=$(git diff --name-only "$DEFAULT_BRANCH"...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo "")
echo "Changed files for validation:"
echo "$CHANGED_FILES"
```

- subagent_type: "psd-claude-coding-system:workflow:work-validator"
- description: "Validation for #$ISSUE_NUMBER"
- prompt: "ISSUE_NUMBER=$ISSUE_NUMBER CHANGED_FILES=$CHANGED_FILES — Run language-specific light reviews and deployment verification. Return Validation Report with status PASS/PASS_WITH_WARNINGS/FAIL."

**Handle validation results:**
- **PASS**: Proceed to Phase 6
- **PASS_WITH_WARNINGS**: Proceed, note warnings in PR body
- **FAIL**: Fix critical issues identified in the report, then re-validate or proceed if fixes are applied
- **Agent failure**: Fall back to inline quality gates (tests pass, lint clean, types check) and proceed

## Phase 6: Commit & Create PR [REQUIRED — DO NOT SKIP]

**This phase is mandatory. Every /work invocation MUST push code and create a PR.**

```bash
# Check if there are uncommitted changes
if ! git diff --cached --quiet 2>/dev/null || ! git diff --quiet 2>/dev/null; then
  git add [specific changed files]

  if [ "$WORK_TYPE" = "issue" ]; then
    git commit -m "feat: implement solution for #$ISSUE_NUMBER

- [List key changes]
- [Note any breaking changes]

Closes #$ISSUE_NUMBER"
  else
    git commit -m "fix: $ARGUMENTS

- [Describe what was fixed]
- [Note any side effects]"
  fi
fi

# Push to remote
git push -u origin HEAD

# Create PR
if [ "$WORK_TYPE" = "issue" ]; then
  gh pr create \
    --title "feat: #$ISSUE_NUMBER - [Descriptive Title]" \
    --body "## Summary
Implements #$ISSUE_NUMBER

## Changes
- [Key change 1]
- [Key change 2]

## Test Plan
- [ ] Tests pass
- [ ] Manual verification

Closes #$ISSUE_NUMBER" \
    --assignee "@me"
else
  gh pr create \
    --title "fix: $ARGUMENTS" \
    --body "## Summary
Quick fix: $ARGUMENTS

## Changes
- [What was changed]

## Test Plan
- [ ] Tests pass" \
    --assignee "@me"
fi

echo "=== PR created ==="
```

## Phase 7: Learning Capture

Always dispatch the learning-writer agent with a session summary. The agent handles deduplication and novelty detection — it will skip writing if the insight isn't novel.

- subagent_type: "psd-claude-coding-system:workflow:learning-writer"
- description: "Capture learning from #$ISSUE_NUMBER"
- prompt: "SUMMARY=[brief description of what happened during implementation — errors hit, patterns used, workarounds applied] KEY_INSIGHT=[the most notable learning or pattern from this session, or 'routine implementation' if nothing stood out] CATEGORY=[appropriate category] TAGS=[relevant tags]. Write a concise learning document only if this insight is novel. Skip if routine."

**Do not block on this agent** — if it fails, proceed without learning capture.
