# Security Scan Skill

Automated security scanning and vulnerability analysis for pull requests.

## Invoke Security Analyst Agent

```bash
# This skill invokes the security-analyst-specialist agent to perform comprehensive analysis

# Get the current PR number (if in PR context)
if [ -n "$PR_NUMBER" ]; then
  SCAN_CONTEXT="PR #$PR_NUMBER"
else
  SCAN_CONTEXT="current branch changes"
fi

echo "=== Running Security Analysis on $SCAN_CONTEXT ==="

# The command should use the Task tool to invoke security-analyst-specialist
# This is a template for commands to follow:

# Example invocation pattern:
# Task tool with:
#   subagent_type: "psd-claude-coding-system:security-analyst-specialist"
#   description: "Security audit for $SCAN_CONTEXT"
#   prompt: "Perform comprehensive security audit on $SCAN_CONTEXT. Analyze all changed files for:
#
#   1. Security vulnerabilities (SQL injection, XSS, auth issues, secrets)
#   2. Architecture violations (business logic in UI, improper layer separation)
#   3. Best practices compliance (TypeScript quality, error handling, testing)
#
#   Return structured findings in the specified format so they can be posted as a single consolidated PR comment."
```

## Post Security Findings to PR

```bash
# After agent returns findings, post as consolidated comment

if [ -n "$PR_NUMBER" ]; then
  # Format findings from agent into PR comment
  gh pr comment $PR_NUMBER --body "## 🔍 Automated Security & Best Practices Review

$AGENT_FINDINGS

### Summary
- 🔴 Critical Issues: $CRITICAL_COUNT
- 🟡 High Priority: $HIGH_COUNT
- 🟢 Suggestions: $SUGGESTION_COUNT

### Critical Issues (🔴 Must Fix Before Merge)
$CRITICAL_FINDINGS

### High Priority (🟡 Should Fix Before Merge)
$HIGH_FINDINGS

### Suggestions (🟢 Consider for Improvement)
$SUGGESTIONS

### Positive Practices Observed
$POSITIVE_FINDINGS

### Required Actions
1. Address all 🔴 critical issues before merge
2. Consider 🟡 high priority fixes
3. Run tests after fixes: \`npm run test\`, \`npm run lint\`, \`npm run typecheck\`

---
*Automated security review by security-analyst-specialist agent*"

  echo "✅ Security review posted to PR #$PR_NUMBER"
else
  echo "=== Security Findings ==="
  echo "$AGENT_FINDINGS"
fi
```

## Pre-Implementation Security Check

For sensitive changes (auth, data, payments), run security check BEFORE implementation:

```bash
# Detect sensitive file changes
SENSITIVE_PATTERNS="auth|login|password|token|payment|billing|credit|card|ssn|encrypt|decrypt|session"

if echo "$CHANGED_FILES" | grep -iE "$SENSITIVE_PATTERNS"; then
  echo "⚠️  Sensitive files detected - running pre-implementation security check"

  # Invoke security-analyst for guidance
  # Agent should provide:
  # - Security requirements to follow
  # - Common pitfalls to avoid
  # - Recommended patterns
  # - Testing strategies

  echo "✓ Review security guidance before proceeding with implementation"
fi
```

## Security Checklist

Common security checks to validate:

```bash
# Check for secrets in code
echo "=== Checking for exposed secrets ==="
if git diff --cached | grep -iE "api[_-]?key|secret|password|token" | grep -v "example"; then
  echo "⚠️  Possible secrets detected in staged changes"
  echo "Review carefully before committing"
fi

# Check for SQL injection vulnerabilities
echo "=== Checking for SQL injection risks ==="
if git diff --cached | grep -E "execute\(|query\(" | grep -v "prepared"; then
  echo "⚠️  Direct SQL execution detected - ensure using prepared statements"
fi

# Check for XSS vulnerabilities
echo "=== Checking for XSS risks ==="
if git diff --cached | grep -iE "innerHTML|dangerouslySetInnerHTML" | grep -v "sanitize"; then
  echo "⚠️  innerHTML usage detected - ensure proper sanitization"
fi

# Check for authentication bypass
echo "=== Checking authentication patterns ==="
if git diff --cached | grep -iE "req\.user|auth|permission" | grep -v "check"; then
  echo "ℹ️  Authentication-related changes detected - verify authorization checks"
fi

echo "✓ Basic security checks complete"
```

## Usage

### Pre-Implementation (in /work command)

```bash
# Before starting implementation, check if security review needed
CHANGED_FILES=$(gh issue view $ISSUE_NUMBER --json body --jq '.body' | grep -oE '\w+\.(ts|js|py|go|rs)' || echo "")

# Include Pre-Implementation Security Check section
```

### Post-Implementation (traditional)

```bash
# After PR created
PR_NUMBER=$(gh pr list --author "@me" --limit 1 --json number --jq '.[0].number')

# Include Invoke Security Analyst Agent section
# Then include Post Security Findings to PR section
```
