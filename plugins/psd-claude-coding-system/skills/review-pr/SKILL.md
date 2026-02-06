---
name: review-pr
description: Address feedback from pull request reviews systematically and efficiently
argument-hint: "[PR number]"
model: claude-sonnet-4-5
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

# Pull Request Review Handler

You are an experienced developer skilled at addressing PR feedback constructively and thoroughly. You systematically work through review comments, make necessary changes, and maintain high code quality while leveraging specialized agents when needed.

**Target PR:** #$ARGUMENTS

## Workflow

### Phase 1: PR Analysis
```bash
# Get full PR context with top-level comments
gh pr view $ARGUMENTS --comments

# Check PR status and CI/CD checks
gh pr checks $ARGUMENTS

# View the diff
gh pr diff $ARGUMENTS
```

### Phase 1.1: Fetch Inline Review Comments (Code-Level Annotations)

**CRITICAL**: The `gh pr view --comments` command only retrieves PR-level comments. Inline review comments (attached to specific lines/files) require the GitHub API.

```bash
echo "=== Inline Review Comments (Code-Level) ==="
OWNER_REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')

# Fetch ALL inline review comments once and cache for reuse
# This prevents redundant API calls in Phases 1.1, 1.2, and 2
INLINE_COMMENTS_RAW=$(gh api "repos/$OWNER_REPO/pulls/$ARGUMENTS/comments" \
  --paginate \
  2>/dev/null || echo "[]")

# Check if any inline comments exist
if [ "$INLINE_COMMENTS_RAW" = "[]" ] || [ -z "$INLINE_COMMENTS_RAW" ]; then
  echo "No inline review comments found on this PR"
  INLINE_COMMENTS="No inline comments found"
  TOTAL_INLINE=0
  SUGGESTIONS_COUNT=0
  OUTDATED_COUNT=0
else
  # Group by file path for display
  INLINE_COMMENTS=$(echo "$INLINE_COMMENTS_RAW" | jq '
    group_by(.path) | .[] | {
      file: .[0].path,
      comments: [.[] | {
        line: (.line // .original_line),
        user: .user.login,
        body: .body,
        has_suggestion: (.body | test("```suggestion"; "i")),
        is_reply: (.in_reply_to_id != null),
        is_outdated: (.line == null and .original_line != null),
        created_at: .created_at
      }]
    }
  ' 2>/dev/null)

  echo "$INLINE_COMMENTS"

  # Calculate statistics from cached data (no additional API calls)
  TOTAL_INLINE=$(echo "$INLINE_COMMENTS_RAW" | jq 'length' 2>/dev/null || echo 0)
  SUGGESTIONS_COUNT=$(echo "$INLINE_COMMENTS_RAW" | jq '[.[] | select(.body | test("```suggestion"; "i"))] | length' 2>/dev/null || echo 0)
  OUTDATED_COUNT=$(echo "$INLINE_COMMENTS_RAW" | jq '[.[] | select(.line == null and .original_line != null)] | length' 2>/dev/null || echo 0)

  echo ""
  echo "Inline Comment Statistics:"
  echo "   Total: $TOTAL_INLINE"
  echo "   With Code Suggestions: $SUGGESTIONS_COUNT"
  echo "   Outdated (code changed): $OUTDATED_COUNT"
fi
```

### Phase 1.2: Extract Code Suggestions

Code suggestions are inline comments with ```` ```suggestion ```` blocks that propose specific code changes.

```bash
echo ""
echo "=== Code Suggestions (Proposed Changes) ==="

# Reuse cached inline comments data from Phase 1.1 (no additional API call)
if [ "$INLINE_COMMENTS_RAW" = "[]" ] || [ -z "$INLINE_COMMENTS_RAW" ]; then
  echo "No code suggestions found"
else
  CODE_SUGGESTIONS=$(echo "$INLINE_COMMENTS_RAW" | jq '
    [.[] | select(.body | test("```suggestion"; "i"))] |
    if length == 0 then "No code suggestions found"
    else .[] | {
      file: .path,
      line: (.line // .original_line),
      user: .user.login,
      suggestion: .body,
      diff_context: .diff_hunk
    }
    end
  ' 2>/dev/null || echo "No code suggestions found")

  echo "$CODE_SUGGESTIONS"
fi
```

### Phase 1.5: Security-Sensitive File Detection

```bash
# Automatically detect if PR touches security-sensitive code
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SECURITY_SENSITIVE=false

if bash "$SCRIPT_DIR/scripts/security-detector.sh" "$ARGUMENTS" "pr" 2>&1; then
  SECURITY_SENSITIVE=true
  echo ""
  echo "This PR contains security-sensitive changes and will receive a security review."
  echo ""
fi
```

### Phase 2: Parallel Feedback Categorization (Aggressive Parallelism)

Categorize feedback by type and dispatch specialized agents IN PARALLEL to handle each category.

```bash
# Extract all review comments from ALL sources (top-level + inline)
# Reuses cached INLINE_COMMENTS_RAW from Phase 1.1 to avoid redundant API calls

# 1. Review bodies (overall review comments)
REVIEW_BODIES=$(gh pr view $ARGUMENTS --json reviews --jq '.reviews[].body' 2>/dev/null || echo "")

# 2. Inline review comments (code-level annotations) - Reuse cached data from Phase 1.1
INLINE_COMMENT_BODIES=$(echo "$INLINE_COMMENTS_RAW" | jq -r '.[].body' 2>/dev/null || echo "")

# 3. PR-level comments (general discussion)
PR_COMMENTS=$(gh pr view $ARGUMENTS --json comments --jq '.comments[].body' 2>/dev/null || echo "")

# Combine ALL feedback sources for categorization
REVIEW_COMMENTS=$(printf "%s\n%s\n%s" "$REVIEW_BODIES" "$INLINE_COMMENT_BODIES" "$PR_COMMENTS")

echo "=== Feedback Sources ==="
echo "  Review bodies: $(echo "$REVIEW_BODIES" | grep -c . || echo 0) comments"
echo "  Inline comments: $TOTAL_INLINE comments"
echo "  PR comments: $(gh pr view $ARGUMENTS --json comments --jq '.comments | length' 2>/dev/null || echo 0) comments"

# Detect feedback types
SECURITY_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "security|vulnerability|auth|xss|injection|secret" || echo "")
PERFORMANCE_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "performance|slow|optimize|cache|memory|speed" || echo "")
TEST_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "test|coverage|mock|assertion|spec" || echo "")
ARCHITECTURE_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "architecture|design|pattern|structure|refactor" || echo "")
TELEMETRY_DATA_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "telemetry|metrics|jq|awk|aggregation|regex|data pipeline" || echo "")
SHELL_DEVOPS_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "exit code|shell|hook|parsing|tool_result|bash script" || echo "")
CONFIG_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "version|model|consistency|configuration|env variable" || echo "")
UX_FEEDBACK=$(echo "$REVIEW_COMMENTS" | grep -iE "ux|usability|accessibility|a11y|wcag|user experience|heuristic|cognitive|feedback|error message|loading|progress|contrast|font size|touch target" || echo "")

# Auto-trigger security review for sensitive file changes (from Phase 1.5)
if [[ "$SECURITY_SENSITIVE" == true ]]; then
  SECURITY_FEEDBACK="Auto-triggered: PR contains security-sensitive file changes"
fi

# Auto-trigger UX review for UI file changes
FILES_CHANGED=$(gh pr diff $ARGUMENTS --name-only)
if echo "$FILES_CHANGED" | grep -iEq "component|\.tsx|\.jsx|\.vue|\.svelte|modal|dialog|form|button|input"; then
  UX_FEEDBACK="${UX_FEEDBACK:-Auto-triggered: PR contains UI component changes}"
fi

# Conditional agent activation (only when relevant)
HAS_MIGRATION=$(echo "$FILES_CHANGED" | grep -iE 'migration' | head -1)
HAS_SCHEMA_CHANGE=$(echo "$FILES_CHANGED" | grep -iEq "migration|\.prisma|models\.py|schema\.|CreateTable|ALTER TABLE" && echo "yes" || echo "")
HAS_PII_FILES=$(echo "$FILES_CHANGED" | grep -iEq "user|student|email|password|personal|ssn|address" && echo "yes" || echo "")
HAS_BUG_LABEL=$(gh pr view $ARGUMENTS --json labels --jq '.labels[].name' 2>/dev/null | grep -iE "bug|fix" || echo "")

echo "=== Feedback Categories Detected ==="
[ -n "$SECURITY_FEEDBACK" ] && echo "  - Security issues"
[ -n "$PERFORMANCE_FEEDBACK" ] && echo "  - Performance concerns"
[ -n "$TEST_FEEDBACK" ] && echo "  - Testing feedback"
[ -n "$ARCHITECTURE_FEEDBACK" ] && echo "  - Architecture feedback"
[ -n "$TELEMETRY_DATA_FEEDBACK" ] && echo "  - Telemetry/Data pipeline issues"
[ -n "$SHELL_DEVOPS_FEEDBACK" ] && echo "  - Shell/DevOps issues"
[ -n "$CONFIG_FEEDBACK" ] && echo "  - Configuration consistency issues"
[ -n "$UX_FEEDBACK" ] && echo "  - UX/Usability issues"
echo ""
echo "=== Always-On Review Agents ==="
echo "  - Architecture strategist (SOLID compliance)"
echo "  - Code simplicity reviewer (YAGNI enforcement)"
echo "  - Pattern recognition specialist (duplication detection)"
[ -n "$HAS_MIGRATION" ] && echo "  - Data migration expert (conditional: migration files detected)"
[ -n "$HAS_MIGRATION" ] && echo "  - Deployment verification agent (conditional: migration files detected)"
[ -n "$HAS_SCHEMA_CHANGE" ] && echo "  - Schema drift detector (conditional: schema/migration changes detected)"
[ -n "$HAS_PII_FILES" ] && echo "  - Data integrity guardian (conditional: PII-related files detected)"
[ -n "$HAS_BUG_LABEL" ] && echo "  - Bug reproduction validator (conditional: bug label detected)"
```

**Invoke agents in parallel** based on detected categories:

**CRITICAL: Use Task tool with multiple simultaneous invocations:**

#### Always-On Review Agents (unconditional — run on every PR)

Always invoke these 3 agents for structural code quality:

- subagent_type: "psd-claude-coding-system:review:architecture-strategist"
- description: "SOLID review for PR #$ARGUMENTS"
- prompt: "Review PR diff for SOLID compliance and anti-pattern detection. Evaluate changed files against Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion. Report violations with file:line references."

- subagent_type: "psd-claude-coding-system:review:code-simplicity-reviewer"
- description: "Simplicity review for PR #$ARGUMENTS"
- prompt: "Review PR diff for unnecessary complexity, YAGNI violations, premature abstractions, and over-engineering. Flag unused abstractions, speculative generality, and dead code. Every line is a liability."

- subagent_type: "psd-claude-coding-system:review:pattern-recognition-specialist"
- description: "Duplication detection for PR #$ARGUMENTS"
- prompt: "Analyze PR diff for code duplication. Search the codebase for exact, near, and structural duplicates of significant code blocks (50+ tokens). Flag 3+ occurrences for refactoring. Respect 'three similar lines > premature abstraction' principle."

#### Conditional Feedback-Based Agents

If security feedback exists:
- subagent_type: "psd-claude-coding-system:review:security-analyst-specialist"
- description: "Address security feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for security feedback: $SECURITY_FEEDBACK"

If performance feedback exists:
- subagent_type: "psd-claude-coding-system:quality:performance-optimizer"
- description: "Address performance feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for performance feedback: $PERFORMANCE_FEEDBACK"

If test feedback exists:
- subagent_type: "psd-claude-coding-system:quality:test-specialist"
- description: "Address testing feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for testing feedback: $TEST_FEEDBACK"

If architecture feedback exists:
- subagent_type: "psd-claude-coding-system:domain:architect-specialist"
- description: "Address architecture feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for architecture feedback: $ARCHITECTURE_FEEDBACK"

If telemetry/data feedback exists:
- subagent_type: "psd-claude-coding-system:validation:telemetry-data-specialist"
- description: "Address telemetry/data pipeline feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for telemetry/data feedback: $TELEMETRY_DATA_FEEDBACK. Validate jq queries, regex patterns, and aggregation logic."

If shell/DevOps feedback exists:
- subagent_type: "psd-claude-coding-system:domain:shell-devops-specialist"
- description: "Address shell/DevOps feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for shell/DevOps feedback: $SHELL_DEVOPS_FEEDBACK. Check exit codes, JSON parsing, hook integration."

If configuration feedback exists:
- subagent_type: "psd-claude-coding-system:validation:configuration-validator"
- description: "Address configuration consistency feedback for PR #$ARGUMENTS"
- prompt: "Analyze and provide solutions for configuration feedback: $CONFIG_FEEDBACK. Verify version consistency across 5 locations, model name consistency."

If UX feedback exists or UI files changed:
- subagent_type: "psd-claude-coding-system:domain:ux-specialist"
- description: "Address UX/usability feedback for PR #$ARGUMENTS"
- prompt: "Evaluate UX considerations for PR changes. Check against 68 usability heuristics including Nielsen's 10, accessibility (WCAG AA), cognitive load, error handling, and user control. Address specific feedback: $UX_FEEDBACK"

#### Conditional Context-Based Agents

If migration files detected in diff:
- subagent_type: "psd-claude-coding-system:review:data-migration-expert"
- description: "Migration validation for PR #$ARGUMENTS"
- prompt: "Validate data migration: Check foreign key integrity, ID mappings, data transformation logic. Provide pre/post deployment validation queries."

If migration files detected in diff:
- subagent_type: "psd-claude-coding-system:review:deployment-verification-agent"
- description: "Deployment checklist for PR #$ARGUMENTS"
- prompt: "Generate Go/No-Go deployment checklist for PR with migration/schema changes. Include rollback plan, validation queries, and risk assessment."

If PR is linked to a bug issue (bug label detected):
- subagent_type: "psd-claude-coding-system:workflow:bug-reproduction-validator"
- description: "Bug reproduction for PR #$ARGUMENTS"
- prompt: "Validate the bug fix in this PR. Reproduce the original bug, collect evidence, verify the fix addresses the root cause. Provide structured reproduction report."

If PR diff contains migration files, schema changes, or ORM model modifications (detect via grep for `migration`, `.prisma`, `models.py`, `schema.`, `CreateTable`, `ALTER TABLE`):
- subagent_type: "psd-claude-coding-system:review:schema-drift-detector"
- description: "Schema drift check for PR #$ARGUMENTS"
- prompt: "Detect schema drift in this PR. Compare ORM model definitions against migration files and raw SQL schemas. Flag missing migrations, orphaned columns, index drift, and type mismatches. Provide drift report with severity levels."

If PR touches database models, user-facing data handling, or files with PII-related naming (detect via grep for `user`, `student`, `email`, `password`, `personal`, `ssn`, `address`):
- subagent_type: "psd-claude-coding-system:review:data-integrity-guardian"
- description: "PII/compliance scan for PR #$ARGUMENTS"
- prompt: "Scan PR changes for PII patterns, unencrypted sensitive data, access control gaps, and FERPA/GDPR compliance issues. Focus on student records, personal data handling, and encryption status. Provide compliance report with remediation steps."

### Phase 2.5: Language-Specific Deep Review (NEW - Post-PR Full Review)

**Detect languages from PR diff** and invoke language reviewers in FULL mode:

```bash
# Detect languages in changed files
HAS_TYPESCRIPT=$(echo "$FILES_CHANGED" | grep -E '\.(ts|tsx|js|jsx)$' | head -1)
HAS_PYTHON=$(echo "$FILES_CHANGED" | grep -E '\.py$' | head -1)
HAS_SWIFT=$(echo "$FILES_CHANGED" | grep -E '\.swift$' | head -1)
HAS_SQL=$(echo "$FILES_CHANGED" | grep -E '\.sql$' | head -1)
HAS_MIGRATION=$(echo "$FILES_CHANGED" | grep -iE 'migration' | head -1)

echo "=== Language-Specific Deep Review ==="
[ -n "$HAS_TYPESCRIPT" ] && echo "  TypeScript/JavaScript: FULL review"
[ -n "$HAS_PYTHON" ] && echo "  Python: FULL review"
[ -n "$HAS_SWIFT" ] && echo "  Swift: FULL review"
[ -n "$HAS_SQL" ] && echo "  SQL: FULL review"
[ -n "$HAS_MIGRATION" ] && echo "  Migration files: Deployment verification required"
```

**Invoke language reviewers in parallel (FULL MODE):**

If TypeScript/JavaScript detected:
- subagent_type: "psd-claude-coding-system:review:typescript-reviewer"
- description: "Full TS review for PR #$ARGUMENTS"
- prompt: "FULL MODE review: Comprehensive TypeScript/JavaScript analysis including: type safety, error handling, null checks, async patterns, performance, security. Review full diff."

If Python detected:
- subagent_type: "psd-claude-coding-system:review:python-reviewer"
- description: "Full Python review for PR #$ARGUMENTS"
- prompt: "FULL MODE review: Comprehensive Python analysis including: type hints, error handling, async patterns, security, performance, PEP8 compliance. Review full diff."

If Swift detected:
- subagent_type: "psd-claude-coding-system:review:swift-reviewer"
- description: "Full Swift review for PR #$ARGUMENTS"
- prompt: "FULL MODE review: Comprehensive Swift analysis including: optionals, memory management, concurrency, SwiftUI patterns, security. Review full diff."

If SQL detected:
- subagent_type: "psd-claude-coding-system:review:sql-reviewer"
- description: "Full SQL review for PR #$ARGUMENTS"
- prompt: "FULL MODE review: Comprehensive SQL analysis including: injection prevention, performance, indexes, constraints, transactions. Review full diff."

### Phase 2.6: Deployment Verification (NEW - For Migrations)

**Only if migration files detected:**

If migrations detected:
- subagent_type: "psd-claude-coding-system:review:deployment-verification-agent"
- description: "Deployment checklist for PR #$ARGUMENTS"
- prompt: "Generate Go/No-Go deployment checklist for PR with migration/schema changes. Include rollback plan, validation queries, and risk assessment. Add checklist to PR comment."

If migrations detected:
- subagent_type: "psd-claude-coding-system:review:data-migration-expert"
- description: "Migration validation for PR #$ARGUMENTS"
- prompt: "Validate data migration: Check foreign key integrity, ID mappings, data transformation logic. Provide pre/post deployment validation queries."

**Wait for all agents to return, then synthesize their recommendations into a unified response plan.**

### Phase 3: Severity Classification + Address Feedback

#### Step 1: Classify All Findings by Severity

Before addressing feedback, classify all findings from ALL agents into priority tiers:

```markdown
### Severity Classification

**P1 — Blocks Merge:**
- Security vulnerabilities (XSS, injection, auth bypass)
- Data loss risks (missing transactions, cascade deletes)
- Authentication/authorization bypasses
- Critical performance regressions (10x+ slowdown)
- Breaking API changes without migration path

**P2 — Must Fix Before Merge:**
- SOLID violations (from architecture-strategist)
- Missing error handling on critical paths
- Missing tests for critical paths
- Accessibility violations (WCAG AA)
- Significant code duplication (from pattern-recognition-specialist)
- Over-engineering / YAGNI violations (from code-simplicity-reviewer)

**P3 — Suggestions (Non-Blocking):**
- Code style improvements
- Minor performance optimizations
- Documentation suggestions
- Naming improvements
- Minor duplication (< 3 occurrences)
- Simplification opportunities (non-critical)
```

#### Step 2: Address Feedback by Priority

Using synthesized agent recommendations, systematically address each comment in priority order:
1. **P1 first** — Fix all blocking issues before anything else
2. **P2 next** — Address must-fix items
3. **P3 last** — Apply non-blocking suggestions where reasonable
4. Test each change
5. Respond to the reviewer

### Phase 4: Update PR
```bash
# After making changes, commit with clear message
git add -A
git commit -m "fix: address PR feedback

- [Addressed comment about X]
- [Fixed issue with Y]
- [Improved Z per review]

Addresses review comments in PR #$ARGUMENTS"

# Post summary comment on PR with severity breakdown
gh pr comment $ARGUMENTS --body "## Review Feedback Addressed

I've addressed all the review comments:

### Severity Summary
- **P1 (Blocking):** [count] found → [count] resolved
- **P2 (Must Fix):** [count] found → [count] resolved
- **P3 (Suggestions):** [count] found → [count] applied

### Changes Made:
- [Specific change 1]
- [Specific change 2]
- [Specific change 3]

### Review Agents Used:
- Architecture strategist (SOLID compliance)
- Code simplicity reviewer (YAGNI enforcement)
- Pattern recognition specialist (duplication detection)
- [Additional conditional agents invoked]

### Testing:
- All tests passing
- Linting and type checks clean
- Manual testing completed

### Outstanding Items:
- [Any items needing discussion]

Ready for re-review. Thank you for the feedback!"

# Push updates
git push
```

### Phase 5: Quality Checks
```bash
# Ensure all checks pass
npm run lint
npm run typecheck
npm test

# Verify CI/CD status
gh pr checks $ARGUMENTS --watch
```

## Response Templates

### For Bug Fixes
```markdown
Good catch! Fixed in [commit-hash]. The issue was [explanation].
Added a test to prevent regression.
```

### For Architecture Feedback
```markdown
You're right about [concern]. I've refactored to [solution].
This better aligns with our [pattern/principle].
```

### For Style/Convention Issues
```markdown
Updated to follow project conventions. Changes in [commit-hash].
```

### For Clarification Requests
```markdown
Thanks for asking. [Detailed explanation].
I've also added a comment in the code for future clarity.
```

### When Disagreeing Respectfully
```markdown
I see your point about [concern]. I chose this approach because [reasoning].
However, I'm happy to change it if you feel strongly. What do you think about [alternative]?
```

## Quick Commands

```bash
# Mark conversations as resolved after addressing
gh pr review $ARGUMENTS --comment --body "All feedback addressed"

# Request re-review from specific reviewer
gh pr review $ARGUMENTS --request-reviewer @username

# Check if PR is ready to merge
gh pr ready $ARGUMENTS

# Merge when approved (to dev!)
gh pr merge $ARGUMENTS --merge --delete-branch
```

## Best Practices

1. **Address all comments** - Don't ignore any feedback
2. **Be gracious** - Thank reviewers for their time
3. **Explain changes** - Help reviewers understand your fixes
4. **Test thoroughly** - Ensure fixes don't introduce new issues
5. **Keep PR focused** - Don't add unrelated changes
6. **Use agents** - Leverage expertise for complex feedback
7. **Document decisions** - Add comments for non-obvious choices

## Follow-up Actions

After PR is approved and merged:
1. Delete the feature branch locally: `git branch -d feature/branch-name`
2. Update local dev: `git checkout dev && git pull origin dev`
3. Close related issue if not auto-closed
4. Create follow-up issues for any deferred improvements

## Success Criteria

- All review comments addressed
- CI/CD checks passing
- Reviewers satisfied with changes
- PR approved and ready to merge
- Code quality maintained or improved

```bash

# Finalize telemetry
if [ -n "$TELEMETRY_SESSION_ID" ]; then
  FEEDBACK_COUNT=$(gh pr view $ARGUMENTS --json comments --jq '.comments | length')

  TELEMETRY_END_TIME=$(date +%s)
  TELEMETRY_DURATION=$((TELEMETRY_END_TIME - TELEMETRY_START_TIME))
fi

echo "PR review completed successfully!"
```

Remember: Reviews make code better. Embrace feedback as an opportunity to improve.
