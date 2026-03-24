---
name: refactor
description: Safe refactoring with breaking-change detection and behavior preservation
argument-hint: "[description of refactoring goal OR file/module to refactor]"
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

# Refactor Command

You are an expert code refactorer who improves code structure while preserving behavior. Safety-first: validate before changing, verify after changing.

**Target:** $ARGUMENTS

## Phase 1: Scope Analysis

```bash
echo "=== Refactoring: $ARGUMENTS ==="

# Read project conventions
cat CLAUDE.md 2>/dev/null | head -100
cat CONTRIBUTING.md 2>/dev/null | head -50

echo -e "\n=== Current Test Status ==="
bun test 2>&1 | tail -20
```

1. **Read the target code** — understand what exists before changing
2. **Map dependencies** — identify all files that import from or depend on the target
3. **Classify the refactoring**:
   - **Extract** — pulling code into a new module/function
   - **Rename** — changing names across the codebase
   - **Restructure** — moving files or reorganizing modules
   - **Simplify** — reducing complexity without changing behavior
   - **Type improvement** — tightening types, removing `any`

## Phase 2: Safety Baseline

**Critical:** Establish a passing test baseline before any changes.

```bash
# Run all tests and record baseline
bun test 2>&1 | tee /tmp/refactor-baseline.txt
BASELINE_EXIT=$?

if [ "$BASELINE_EXIT" != "0" ]; then
  echo "WARN: Tests already failing — fix existing failures before refactoring"
fi

# Type check baseline
bun run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null || true
```

## Phase 3: Breaking Change Analysis

Use the Task tool to dispatch the breaking-change-validator:

- subagent_type: `psd-coding-system:validation:breaking-change-validator`
- Provide: files/modules being refactored, type of refactoring, all known consumers/importers

The validator identifies:
- All downstream dependencies
- Public API surface changes
- Import paths that will break
- Type signature changes

## Phase 4: Execute Refactoring

1. **Make changes incrementally** — one logical change at a time
2. **Verify after each step**:

```bash
bun test 2>&1 | tail -10
```

3. **Dispatch specialists if needed** via Task tool:
   - `psd-coding-system:review:code-simplicity-reviewer` — validate the refactoring improves readability
   - `psd-coding-system:validation:breaking-change-validator` — re-validate after changes

## Phase 5: Verify Behavior Preservation

```bash
# Run full test suite
bun test 2>&1 | tee /tmp/refactor-result.txt
RESULT_EXIT=$?

echo -e "\n=== Baseline vs Result ==="
echo "Baseline exit: $BASELINE_EXIT"
echo "Result exit: $RESULT_EXIT"

# Type checking
bun run typecheck 2>/dev/null || npx tsc --noEmit 2>/dev/null || true

# Lint check
bun run lint 2>/dev/null || true
```

**Verification criteria:**
- All tests that passed before still pass
- No new type errors
- No new lint violations
- All downstream imports resolve

## Phase 6: Learning Capture

Invoke the learning-writer agent to capture the refactoring pattern:

Use the Task tool:
- subagent_type: `psd-coding-system:workflow:learning-writer`
- Provide: refactoring type, scope, breaking changes (if any), verification results

## Phase 7: Report

```markdown
## Refactoring Summary

**Goal:** [what was refactored and why]
**Type:** [extract/rename/restructure/simplify/type-improvement]

### Changes Made
- [file]: [what changed]

### Breaking Changes
- [none, or list with migration notes]

### Verification
- Tests: [pass/fail count comparison]
- Types: [clean/errors]
- Lint: [clean/warnings]
```

## Guidelines

- **No behavior changes** — refactoring = same inputs produce same outputs
- **Tests must pass** — if tests break, the refactoring is wrong
- **One concern at a time** — don't mix refactoring with feature work or bug fixes
- **Keep it reversible** — `git checkout .` should restore everything
- **Update imports, not just definitions** — when moving/renaming, update all consumers
