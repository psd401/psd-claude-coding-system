# Test Runner Skill

Universal test execution patterns for various testing frameworks.

## Auto-Detect Test Framework

```bash
# Detect which test framework is being used
if [ -f "package.json" ]; then
  if grep -q "\"jest\"" package.json; then
    TEST_FRAMEWORK="jest"
  elif grep -q "\"vitest\"" package.json; then
    TEST_FRAMEWORK="vitest"
  elif grep -q "\"mocha\"" package.json; then
    TEST_FRAMEWORK="mocha"
  else
    TEST_FRAMEWORK="bun"
  fi
elif [ -f "Cargo.toml" ]; then
  TEST_FRAMEWORK="cargo"
elif [ -f "go.mod" ]; then
  TEST_FRAMEWORK="go"
elif [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  TEST_FRAMEWORK="pytest"
else
  TEST_FRAMEWORK="unknown"
fi

echo "Detected test framework: $TEST_FRAMEWORK"
```

## Run All Tests

```bash
case "$TEST_FRAMEWORK" in
  jest)
    bun test || npm test || yarn test
    ;;
  vitest)
    bun run test || yarn test
    ;;
  mocha)
    bun test || npm test || yarn test
    ;;
  npm)
    bun test
    ;;
  cargo)
    cargo test
    ;;
  go)
    go test ./...
    ;;
  pytest)
    pytest
    ;;
  *)
    echo "Unknown test framework, attempting bun test..."
    bun test
    ;;
esac
```

## Run Specific Test Suite

```bash
# Run unit tests
case "$TEST_FRAMEWORK" in
  jest|vitest)
    bun run test:unit || npx jest --testPathPattern=unit
    ;;
  cargo)
    cargo test --lib
    ;;
  go)
    go test ./... -run Unit
    ;;
  pytest)
    pytest tests/unit/
    ;;
esac

# Run integration tests
case "$TEST_FRAMEWORK" in
  jest|vitest)
    bun run test:integration || npx jest --testPathPattern=integration
    ;;
  cargo)
    cargo test --test integration
    ;;
  go)
    go test ./... -run Integration
    ;;
  pytest)
    pytest tests/integration/
    ;;
esac

# Run e2e tests
case "$TEST_FRAMEWORK" in
  jest|vitest)
    bun run test:e2e || npx jest --testPathPattern=e2e
    ;;
  cargo)
    cargo test --test e2e
    ;;
  go)
    go test ./... -run E2E
    ;;
  pytest)
    pytest tests/e2e/
    ;;
esac
```

## Test Coverage

```bash
case "$TEST_FRAMEWORK" in
  jest)
    bun run test:coverage || npx jest --coverage
    ;;
  vitest)
    bun run test:coverage || npx vitest --coverage
    ;;
  cargo)
    cargo tarpaulin --out Html
    ;;
  go)
    go test -cover ./...
    ;;
  pytest)
    pytest --cov=. --cov-report=html
    ;;
esac

echo "✓ Coverage report generated"
```

## Quality Checks

```bash
# Type checking
if [ -f "tsconfig.json" ]; then
  bun run typecheck || npx tsc --noEmit
  echo "✓ Type checking passed"
fi

# Linting
if [ -f ".eslintrc" ] || [ -f ".eslintrc.json" ] || grep -q "eslint" package.json; then
  bun run lint || npx eslint .
  echo "✓ Linting passed"
elif [ -f "Cargo.toml" ]; then
  cargo clippy
  echo "✓ Clippy passed"
elif [ -f "go.mod" ]; then
  go vet ./...
  golint ./...
  echo "✓ Go vet passed"
fi

# Formatting check
if [ -f ".prettierrc" ] || grep -q "prettier" package.json; then
  bun run format:check || npx prettier --check .
  echo "✓ Format check passed"
elif [ -f "Cargo.toml" ]; then
  cargo fmt --check
  echo "✓ Format check passed"
elif [ -f "go.mod" ]; then
  gofmt -l .
  echo "✓ Go format check passed"
fi
```

## Usage

```bash
# From commands, set TEST_SCOPE then source appropriate sections:
TEST_SCOPE="unit"  # or "integration", "e2e", "all"

# Auto-detect framework
# ... (include Auto-Detect section)

# Run tests
if [ "$TEST_SCOPE" = "all" ]; then
  # ... (include Run All Tests section)
else
  # ... (include Run Specific Test Suite section)
fi

# Run quality checks
# ... (include Quality Checks section)
```
