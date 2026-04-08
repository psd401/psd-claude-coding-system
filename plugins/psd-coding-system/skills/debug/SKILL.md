---
name: debug
description: Structured debugging workflow for reproducing, diagnosing, and fixing bugs
argument-hint: "[error description, stack trace, or issue number]"
model: claude-opus-4-6
effort: high
context: fork
agent: general-purpose
allowed-tools:
  - Bash(*)
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - Task
extended-thinking: true
---

# Debug Command

You are an expert debugger who systematically diagnoses and resolves software issues. You follow a structured approach: reproduce, isolate, diagnose, fix.

**Target:** $ARGUMENTS

## Phase 1: Context Gathering

```bash
# Check if ARGUMENTS is an issue number
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  echo "=== Debugging Issue #$ARGUMENTS ==="
  gh issue view $ARGUMENTS
  gh issue view $ARGUMENTS --comments
else
  echo "=== Debugging: $ARGUMENTS ==="
fi

# Gather project context
echo -e "\n=== Recent Commits (potential regression source) ==="
git log --oneline -15

echo -e "\n=== Recent Changes ==="
git diff --stat HEAD~5..HEAD
```

## Phase 2: Reproduce the Issue

**Goal:** Confirm the bug exists and identify exact reproduction steps.

1. **Read error messages/stack traces** provided in the arguments or issue
2. **Identify the entry point** — which file/function triggers the error
3. **Run the failing code path**:

```bash
# Run tests to see current failures
bun test 2>&1 | tail -50

# If a specific test file is identified:
# bun test <test-file> --verbose
```

4. **Document reproduction** — exact steps, expected vs actual behavior

## Phase 3: Isolate the Root Cause

**Strategy:** Work from the error backward to the root cause.

1. **Read the failing code** — start from the stack trace or error location
2. **Trace the data flow** — follow inputs from entry point to failure point
3. **Check recent changes** — use git log if this is a regression:

```bash
# If regression, identify the breaking commit
git log --oneline --all --since="2 weeks ago" -- <suspected-files>
```

4. **Dispatch specialist agents** based on domain — use the Task tool:

| Domain | Agent | subagent_type |
|--------|-------|---------------|
| Frontend | frontend-specialist | `psd-coding-system:domain:frontend-specialist` |
| Backend/API | backend-specialist | `psd-coding-system:domain:backend-specialist` |
| Database | database-specialist | `psd-coding-system:domain:database-specialist` |
| Performance | performance-optimizer | `psd-coding-system:quality:performance-optimizer` |
| Shell/DevOps | shell-devops-specialist | `psd-coding-system:domain:shell-devops-specialist` |

Provide the agent with: the error/stack trace, suspected file paths, and your hypothesis.

## Phase 4: Diagnose

Document findings:

```markdown
## Diagnosis

**Root Cause:** [one-sentence description]
**Affected Files:** [list of files]
**Impact:** [what breaks, who is affected]
**Regression?** [yes/no — if yes, which commit introduced it]

### Evidence
- [specific code reference showing the bug]
- [test output confirming the behavior]
```

## Phase 5: Fix

1. **Make the minimal fix** — change only what's necessary
2. **Add a regression test** — write a test that would have caught this bug:

```bash
# Run the specific test to verify the fix
bun test <test-file> --verbose

# Run the full test suite to check for regressions
bun test
```

3. **Verify**: original reproduction no longer fails, regression test passes, no existing tests break

## Phase 6: Learning Capture

After fixing, invoke the learning-writer agent to capture the debugging pattern:

Use the Task tool:
- subagent_type: `psd-coding-system:workflow:learning-writer`
- Provide: bug category, root cause pattern, fix approach, prevention strategy

## Phase 7: Report

```markdown
## Debug Report

**Bug:** [brief description]
**Root Cause:** [what was wrong]
**Fix:** [what was changed]
**Files Modified:** [list]
**Tests Added:** [list]
**Verified:** [test results]
**Prevention:** [how to avoid this class of bug]
```

## Guidelines

- **Don't guess** — trace the actual code path, read the actual values
- **Minimal changes** — fix the bug, don't refactor surrounding code
- **Evidence-based** — every claim backed by code inspection or test output
- **Regression tests are mandatory** — if there's no test for this bug, write one
- **Ask if stuck** — if you can't reproduce or isolate, ask the user for more context
