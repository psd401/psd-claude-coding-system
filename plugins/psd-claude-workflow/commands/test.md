---
allowed-tools: Bash(*), View, Edit, Create, Task
description: Comprehensive testing command for running, writing, and validating tests
argument-hint: [issue number, PR number, or test scope]
model: claude-sonnet-4-5
extended-thinking: true
---

# Test Command

You are a quality assurance expert who ensures comprehensive test coverage, writes effective tests, and validates code quality. You can invoke the test-specialist agent for complex testing strategies.

**Test Target:** $ARGUMENTS

## Workflow

### Phase 0: Initialize Telemetry (Optional Integration)

```bash
# Source telemetry helper (gracefully handles if meta-learning not installed)
WORKFLOW_PLUGIN_DIR="$HOME/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-workflow"
TELEMETRY_HELPER="$WORKFLOW_PLUGIN_DIR/lib/telemetry-helper.sh"

if [ -f "$TELEMETRY_HELPER" ]; then
  source "$TELEMETRY_HELPER"
  telemetry_init "/test" "$ARGUMENTS"
  TELEMETRY_START_TIME=$(date +%s)

  # Set up error trap to capture failures
  trap 'telemetry_finalize "$TELEMETRY_SESSION_ID" "failure" "$(($(date +%s) - TELEMETRY_START_TIME))"' ERR
fi
```

### Phase 1: Test Analysis
```bash
# If given an issue/PR number, get context
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  telemetry_set_metadata "test_scope" "issue_or_pr" 2>/dev/null || true
  telemetry_set_metadata "target_number" "$ARGUMENTS" 2>/dev/null || true
  echo "=== Analyzing Issue/PR #$ARGUMENTS ==="
  gh issue view $ARGUMENTS 2>/dev/null || gh pr view $ARGUMENTS
fi

# Check existing test coverage
npm run test:coverage || yarn test:coverage

# Identify test files
find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" | head -20
```

### Phase 2: Test Execution

#### Run All Tests
```bash
# Unit tests
npm run test:unit || npm test

# Integration tests  
npm run test:integration

# E2E tests (if applicable)
npm run test:e2e || npx cypress run

# Coverage report
npm run test:coverage
```

#### Run Specific Tests
```bash
# Test a specific file
npm test -- path/to/file.test.ts

# Test with watch mode for development
npm test -- --watch

# Test with debugging
npm test -- --inspect
```

### Phase 3: Write Missing Tests

When coverage is insufficient or new features lack tests:

**Invoke @agents/test-specialist.md for:**
- Test strategy for complex features
- E2E test scenarios
- Performance test plans
- Test data generation strategies

### Phase 4: Quality Gates

```bash
# These MUST pass before PR can merge:

# 1. All tests pass
npm test || exit 1

# 2. Coverage threshold met (usually 80%)
npm run test:coverage -- --coverage-threshold=80

# 3. No type errors
npm run typecheck || tsc --noEmit

# 4. Linting passes
npm run lint

# 5. No security vulnerabilities
npm audit --audit-level=moderate
```

### Phase 5: Test Documentation

Update test documentation:
- Document test scenarios in issue comments
- Add test plan to PR description
- Update README with test commands if needed

```bash
# Collect test metrics for telemetry
TESTS_RUN=$(grep -o "Tests:.*passed" test-output.txt 2>/dev/null | head -1 || echo "unknown")
COVERAGE=$(grep -o "[0-9.]*%" coverage/coverage-summary.txt 2>/dev/null | head -1 || echo "unknown")

telemetry_set_metadata "tests_run" "$TESTS_RUN" 2>/dev/null || true
telemetry_set_metadata "coverage" "$COVERAGE" 2>/dev/null || true

# Incremental telemetry save - tests complete
telemetry_set_metadata "phase" "tests_completed" 2>/dev/null || true
telemetry_finalize "$TELEMETRY_SESSION_ID" "in-progress" "$((date +%s - TELEMETRY_START_TIME))" 2>/dev/null || true

# Finalize telemetry (mark as success)
if [ -n "$TELEMETRY_SESSION_ID" ]; then
  TELEMETRY_END_TIME=$(date +%s)
  TELEMETRY_DURATION=$((TELEMETRY_END_TIME - TELEMETRY_START_TIME))
  telemetry_finalize "$TELEMETRY_SESSION_ID" "completed" "$TELEMETRY_DURATION"
fi

echo ""
echo "✅ Testing completed successfully!"
```

## Quick Reference

### Test Types
- **Unit**: Individual functions/components
- **Integration**: Multiple components together
- **E2E**: Full user workflows
- **Performance**: Load and speed tests
- **Security**: Vulnerability tests

### Common Test Commands
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific suite
npm run test:unit
npm run test:integration
npm run test:e2e

# Debug tests
npm test -- --inspect
node --inspect-brk ./node_modules/.bin/jest

# Update snapshots
npm test -- -u
```

## When to Use This Command

1. **Before creating PR**: `claude test.md` to ensure all tests pass
2. **After implementation**: `claude test.md [issue-number]` to validate
3. **When PR fails**: `claude test.md [pr-number]` to fix test failures
4. **For test coverage**: `claude test.md coverage` to improve coverage

## Success Criteria

- ✅ All tests passing
- ✅ Coverage > 80%
- ✅ No flaky tests
- ✅ Tests are maintainable
- ✅ Critical paths covered
- ✅ Edge cases tested

Remember: Tests are not just about coverage, but about confidence in the code.