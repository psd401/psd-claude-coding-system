---
name: lfg
description: Autonomous end-to-end workflow — implement, test, review, fix, and capture learnings in one shot
argument-hint: "[issue number OR description of work]"
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

# LFG — Autonomous End-to-End Workflow

You are an experienced full-stack developer running an autonomous pipeline: implement → test → review → fix → learn. Heavy phases are delegated to Task agents to keep this orchestrator's context lean.

**Target:** $ARGUMENTS

---

## Phase 1: Determine Work Type

```bash
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  echo "=== Working on Issue #$ARGUMENTS ==="
  WORK_TYPE="issue"
  ISSUE_NUMBER=$ARGUMENTS

  gh issue view $ARGUMENTS
  echo -e "\n=== All Context (PM specs, research, architecture) ==="
  gh issue view $ARGUMENTS --comments

  ISSUE_BODY=$(gh issue view $ISSUE_NUMBER --json body --jq '.body')
  gh pr list --search "mentions:$ARGUMENTS"
else
  echo "=== Quick Fix Mode ==="
  echo "Description: $ARGUMENTS"
  WORK_TYPE="quick-fix"
  ISSUE_NUMBER=""
  ISSUE_BODY="$ARGUMENTS"
fi
```

## Phase 2: Create Branch

```bash
DEFAULT_BRANCH=$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name' 2>/dev/null || echo "main")
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

## Phase 3: Research (Task-Delegated)

Invoke the **work-researcher** agent to gather pre-implementation context.

- subagent_type: "psd-claude-coding-system:workflow:work-researcher"
- description: "Research for #$ISSUE_NUMBER"
- prompt: "WORK_TYPE=$WORK_TYPE ISSUE_NUMBER=$ISSUE_NUMBER ISSUE_BODY=$ISSUE_BODY ARGUMENTS=$ARGUMENTS — Gather pre-implementation context: knowledge lookup, codebase research, external research (if high-risk), git history, test strategy, security review, UX considerations. Return structured Research Brief."

**If the agent fails, proceed anyway** — incorporate available findings into implementation.

## Phase 4: Implementation (Inline — Main Context Consumer)

Implement the solution following the Research Brief, local CLAUDE.md conventions, and type safety.

### Commit Heuristic

Commit incrementally: **"Can I write a complete, meaningful commit message right now?"** If yes — commit now. Each commit should be atomic.

```bash
# After each meaningful unit of work:
git add [specific files]
git commit -m "feat(scope): [what this atomic change does]

- [Detail 1]
- [Detail 2]

Part of #$ISSUE_NUMBER"
```

### Inline Testing

Run tests as you go to catch issues early:

```bash
npm test || yarn test || pytest || cargo test || go test ./...
npm run typecheck 2>/dev/null || tsc --noEmit 2>/dev/null
npm run lint 2>/dev/null || true
```

## Phase 5: Thorough Testing (Task-Delegated)

Invoke the **test-specialist** agent for comprehensive test coverage beyond inline checks.

- subagent_type: "psd-claude-coding-system:quality:test-specialist"
- description: "Thorough testing for #$ISSUE_NUMBER"
- prompt: "Run comprehensive tests for recent changes. Write missing tests for new code paths. Validate coverage thresholds. Run quality gates (lint, typecheck, tests). Report: tests written, coverage %, failing tests, quality gate status."

**Handle results:**
- If tests fail: fix implementation code, re-run inline tests to verify
- If coverage gaps identified: write additional tests
- If agent fails: fall back to inline test results from Phase 4

## Phase 6: Validation (Task-Delegated)

Invoke the **work-validator** agent for language-specific reviews and deployment checks.

```bash
CHANGED_FILES=$(git diff --name-only "$DEFAULT_BRANCH"...HEAD 2>/dev/null || git diff --name-only HEAD~1 2>/dev/null || echo "")
echo "Changed files for validation:"
echo "$CHANGED_FILES"
```

- subagent_type: "psd-claude-coding-system:workflow:work-validator"
- description: "Validation for #$ISSUE_NUMBER"
- prompt: "ISSUE_NUMBER=$ISSUE_NUMBER CHANGED_FILES=$CHANGED_FILES — Run language-specific light reviews and deployment verification. Return Validation Report with status PASS/PASS_WITH_WARNINGS/FAIL."

**Handle results:**
- **PASS**: Proceed
- **PASS_WITH_WARNINGS**: Note warnings for PR body
- **FAIL**: Fix critical issues, then proceed
- **Agent failure**: Fall back to inline quality gates

## Phase 7: Commit & Create PR

```bash
# Commit any remaining changes
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

git push -u origin HEAD

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
PR_NUMBER=$(gh pr view --json number --jq '.number')
```

## Phase 8: Review (Task-Delegated — Parallel)

Dispatch review agents in parallel for a self-review before requesting human review.

**Detect languages from changed files:**

```bash
HAS_TYPESCRIPT=$(echo "$CHANGED_FILES" | grep -E '\.(ts|tsx|js|jsx)$' | head -1)
HAS_PYTHON=$(echo "$CHANGED_FILES" | grep -E '\.py$' | head -1)
HAS_SWIFT=$(echo "$CHANGED_FILES" | grep -E '\.swift$' | head -1)
HAS_SQL=$(echo "$CHANGED_FILES" | grep -E '\.sql$' | head -1)
```

**Always invoke security review:**

- subagent_type: "psd-claude-coding-system:review:security-analyst-specialist"
- description: "Security review for PR #$PR_NUMBER"
- prompt: "Review changed files for security vulnerabilities: XSS, injection, auth bypass, secrets, OWASP top 10. Changed files: $CHANGED_FILES. Report findings with severity (P1/P2/P3)."

**Invoke language reviewers based on detected languages (in parallel with security):**

If TypeScript/JavaScript detected:
- subagent_type: "psd-claude-coding-system:review:typescript-reviewer"
- description: "TS review for PR #$PR_NUMBER"
- prompt: "Review changed TypeScript/JavaScript files for type safety, error handling, async patterns, performance. Report findings with severity (P1/P2/P3)."

If Python detected:
- subagent_type: "psd-claude-coding-system:review:python-reviewer"
- description: "Python review for PR #$PR_NUMBER"
- prompt: "Review changed Python files for type hints, error handling, async patterns, security. Report findings with severity (P1/P2/P3)."

If Swift detected:
- subagent_type: "psd-claude-coding-system:review:swift-reviewer"
- description: "Swift review for PR #$PR_NUMBER"
- prompt: "Review changed Swift files for optionals, memory management, concurrency. Report findings with severity (P1/P2/P3)."

If SQL detected:
- subagent_type: "psd-claude-coding-system:review:sql-reviewer"
- description: "SQL review for PR #$PR_NUMBER"
- prompt: "Review changed SQL files for injection prevention, performance, constraints. Report findings with severity (P1/P2/P3)."

**Synthesize all agent findings into P1/P2/P3 severity tiers.**

## Phase 9: Fix Review Findings (Inline)

Address P1 and P2 findings from Phase 8. P3 items are left for manual follow-up.

**P1 (Blocks Merge):** Security vulnerabilities, data loss risks, auth bypasses, breaking API changes.
**P2 (Must Fix):** Missing error handling, missing tests on critical paths, SOLID violations, accessibility issues.
**P3 (Suggestions):** Style, naming, minor optimizations — skip these.

```bash
# After fixing P1 + P2 issues:
git add [specific fixed files]
git commit -m "fix: address P1/P2 review findings

- [P1 fix description]
- [P2 fix description]

Self-review fixes for PR #$PR_NUMBER"

git push
```

If no P1/P2 findings, skip this phase.

## Phase 10: Learning Capture (Task-Delegated — Always)

Always dispatch the learning-writer agent with a session summary. The agent handles deduplication and novelty detection — it will skip writing if the insight isn't novel.

- subagent_type: "psd-claude-coding-system:workflow:learning-writer"
- description: "Capture learning from /lfg session"
- prompt: "SUMMARY=[end-to-end session: implementation approach, errors encountered, test results, review findings, fixes applied] KEY_INSIGHT=[the most notable learning from this autonomous session, or 'routine implementation' if nothing stood out] CATEGORY=[appropriate category] TAGS=[lfg, autonomous, relevant-tags]. Write a concise learning document only if this insight is novel. Skip if routine."

**Do not block on this agent** — if it fails, the PR is already created and pushed.

---

## Summary

Print a final summary:

```bash
echo "=== /lfg Complete ==="
echo "Branch: $(git branch --show-current)"
echo "PR: #$PR_NUMBER"
echo "Commits: $(git log --oneline $DEFAULT_BRANCH..HEAD | wc -l | tr -d ' ')"
echo "Review: P1=[count] P2=[count] P3=[count]"
echo "Status: Ready for human review"
```
