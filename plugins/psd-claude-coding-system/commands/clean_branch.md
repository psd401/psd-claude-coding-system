---
description: Clean up merged branches, close issues, and extract compound learning insights
model: claude-sonnet-4-5
extended-thinking: true
---

Ok, great, thank you! I merged in the changes to dev, so please:
1. Get latest dev code
2. Remove feature branch locally and remotely
3. Close the corresponding issue with a comment on the work that was done
4. Analyze the PR for compound engineering opportunities

## Workflow

### Phase 1: Branch Cleanup

Perform standard cleanup operations:
- Pull latest dev
- Delete local and remote feature branches
- Close associated GitHub issue with summary

### Phase 2: PR Retrospective & Compound Analysis

After cleanup, analyze the merged PR for compound engineering insights:

```bash
# ==============================================================================
# DYNAMIC PATH RESOLUTION (same proven pattern as telemetry-track.sh)
# ==============================================================================

# Find plugin root dynamically from script execution context
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"  # commands/ is 2 levels deep
META_DIR="$PLUGIN_ROOT/meta"
TELEMETRY_FILE="$META_DIR/telemetry.json"

# Verify prerequisites
if [ ! -f "$TELEMETRY_FILE" ]; then
  echo "⚠️  Telemetry file not found at $TELEMETRY_FILE, skipping compound analysis"
  echo "✅ Branch cleanup completed!"
  exit 0
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "⚠️  jq not installed, skipping compound analysis"
  echo "✅ Branch cleanup completed!"
  exit 0
fi

# ==============================================================================
# GET CURRENT BRANCH AND FIND MERGED PR
# ==============================================================================

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "")

if [ -z "$CURRENT_BRANCH" ]; then
  echo "⚠️  Could not determine current branch, skipping compound analysis"
  echo "✅ Branch cleanup completed!"
  exit 0
fi

# Find merged PR for this branch
PR_NUMBER=$(gh pr list --state merged --head "$CURRENT_BRANCH" --limit 1 --json number --jq '.[0].number // empty' 2>/dev/null)

if [ -z "$PR_NUMBER" ]; then
  echo "ℹ️  No merged PR found for branch $CURRENT_BRANCH, skipping compound analysis"
  echo "✅ Branch cleanup completed!"
  exit 0
fi

echo ""
echo "=== Analyzing PR #$PR_NUMBER for compound opportunities ==="

# ==============================================================================
# GATHER PR CONTEXT
# ==============================================================================

# Get PR data as JSON for analysis
PR_DATA=$(gh pr view $PR_NUMBER --json number,title,body,state,commits,reviews,comments,files 2>/dev/null)

if [ -z "$PR_DATA" ]; then
  echo "⚠️  Could not fetch PR data, skipping compound analysis"
  echo "✅ Branch cleanup completed!"
  exit 0
fi

# Extract key metrics
COMMITS_COUNT=$(echo "$PR_DATA" | jq '.commits | length')
REVIEWS_COUNT=$(echo "$PR_DATA" | jq '.reviews | length')
COMMENTS_COUNT=$(echo "$PR_DATA" | jq '.comments | length')
FILES_CHANGED=$(echo "$PR_DATA" | jq '.files | length')

# Get full conversation thread for pattern analysis
PR_COMMENTS=$(gh pr view $PR_NUMBER --comments 2>/dev/null || echo "")

# ==============================================================================
# PATTERN DETECTION
# ==============================================================================

# Count fix commits (suggests iterative problem-solving)
FIX_COMMITS=$(echo "$PR_DATA" | jq '[.commits[] | select(.messageHeadline | test("fix|Fix|FIX"))] | length')

# Detect common themes in comments using case-insensitive grep
THEME_TYPE_SAFETY=$(echo "$PR_COMMENTS" | grep -ioE '\b(type|types|typescript|any type|type error)\b' 2>/dev/null | wc -l | tr -d ' ')
THEME_TESTING=$(echo "$PR_COMMENTS" | grep -ioE '\b(test|tests|testing|coverage)\b' 2>/dev/null | wc -l | tr -d ' ')
THEME_ERROR_HANDLING=$(echo "$PR_COMMENTS" | grep -ioE '\b(error|errors|exception|catch|try-catch)\b' 2>/dev/null | wc -l | tr -d ' ')
THEME_SECURITY=$(echo "$PR_COMMENTS" | grep -ioE '\b(security|vulnerable|vulnerability|auth|authentication)\b' 2>/dev/null | wc -l | tr -d ' ')
THEME_PERFORMANCE=$(echo "$PR_COMMENTS" | grep -ioE '\b(performance|slow|optimize|cache)\b' 2>/dev/null | wc -l | tr -d ' ')

# Default to 0 if empty
THEME_TYPE_SAFETY="${THEME_TYPE_SAFETY:-0}"
THEME_TESTING="${THEME_TESTING:-0}"
THEME_ERROR_HANDLING="${THEME_ERROR_HANDLING:-0}"
THEME_SECURITY="${THEME_SECURITY:-0}"
THEME_PERFORMANCE="${THEME_PERFORMANCE:-0}"

# Extract issue number if present in PR body
ISSUE_NUMBER=$(echo "$PR_DATA" | jq -r '.body // "" | match("#([0-9]+)") | .captures[0].string // empty')

# ==============================================================================
# COMPOUND ANALYSIS (using compound_concepts framework)
# ==============================================================================

SUGGESTIONS_JSON="[]"

# Suggestion 1: Type Safety (if mentioned >= 3 times)
if [ "$THEME_TYPE_SAFETY" -ge 3 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_TYPE_SAFETY" '. + [{
    type: "automation",
    suggestion: "Enable stricter TypeScript configuration or add pre-commit type checking",
    compound_benefit: "Catch type errors before PR submission, reducing review cycles by ~30%",
    implementation: "Add tsconfig strict mode or pre-commit hook with tsc --noEmit",
    confidence: "high",
    evidence: ("Type safety mentioned " + $count + " times in PR discussion")
  }]')
fi

# Suggestion 2: Testing (if mentioned >= 3 times)
if [ "$THEME_TESTING" -ge 3 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_TESTING" '. + [{
    type: "systematization",
    suggestion: "Document testing requirements and patterns in CONTRIBUTING.md",
    compound_benefit: "Consistent test coverage, reduce \"where should I add tests?\" questions",
    implementation: "Add testing section to CONTRIBUTING.md with examples",
    confidence: "medium",
    evidence: ("Testing discussed " + $count + " times, indicates unclear patterns")
  }]')
fi

# Suggestion 3: Security (if mentioned >= 2 times)
if [ "$THEME_SECURITY" -ge 2 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_SECURITY" '. + [{
    type: "delegation",
    suggestion: "security-analyst-specialist agent now runs automatically in /work",
    compound_benefit: "Catch security issues before PR creation, not during review",
    implementation: "Already implemented in v1.4.0 - security analysis runs after PR creation",
    confidence: "high",
    evidence: ("Security concerns raised " + $count + " times in review")
  }]')
fi

# Suggestion 4: Error Handling (if mentioned >= 3 times)
if [ "$THEME_ERROR_HANDLING" -ge 3 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_ERROR_HANDLING" '. + [{
    type: "systematization",
    suggestion: "Document error handling patterns in project guidelines",
    compound_benefit: "Consistent error handling reduces review discussions",
    implementation: "Add error handling section to CLAUDE.md or CONTRIBUTING.md",
    confidence: "medium",
    evidence: ("Error handling discussed " + $count + " times in PR")
  }]')
fi

# Suggestion 5: High iteration (>= 3 reviews OR >= 5 fix commits)
if [ "$REVIEWS_COUNT" -ge 3 ] || [ "$FIX_COMMITS" -ge 5 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg reviews "$REVIEWS_COUNT" --arg fixes "$FIX_COMMITS" '. + [{
    type: "prevention",
    suggestion: "Use /architect command before /work for complex issues",
    compound_benefit: "Better upfront design reduces review iterations",
    implementation: "Workflow: /issue → /architect → /work for complex features",
    confidence: "medium",
    evidence: ("PR required " + $reviews + " review rounds and " + $fixes + " fix commits")
  }]')
fi

# Suggestion 6: Performance (if mentioned >= 2 times)
if [ "$THEME_PERFORMANCE" -ge 2 ]; then
  SUGGESTIONS_JSON=$(echo "$SUGGESTIONS_JSON" | jq --arg count "$THEME_PERFORMANCE" '. + [{
    type: "delegation",
    suggestion: "Invoke performance-optimizer agent for performance-critical code",
    compound_benefit: "Catch performance issues early in development",
    implementation: "Use Task tool with psd-claude-coding-system:performance-optimizer",
    confidence: "medium",
    evidence: ("Performance discussed " + $count + " times in PR")
  }]')
fi

# ==============================================================================
# BUILD COMPOUND LEARNING ENTRY
# ==============================================================================

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LEARNING_ID="learning-pr-${PR_NUMBER}-$(date +%s)"

COMPOUND_LEARNING=$(jq -n \
  --arg id "$LEARNING_ID" \
  --arg pr "$PR_NUMBER" \
  --arg issue "$ISSUE_NUMBER" \
  --arg timestamp "$TIMESTAMP" \
  --arg branch "$CURRENT_BRANCH" \
  --argjson reviews "$REVIEWS_COUNT" \
  --argjson commits "$COMMITS_COUNT" \
  --argjson fixes "$FIX_COMMITS" \
  --argjson comments "$COMMENTS_COUNT" \
  --arg theme_type "$THEME_TYPE_SAFETY" \
  --arg theme_test "$THEME_TESTING" \
  --arg theme_err "$THEME_ERROR_HANDLING" \
  --arg theme_sec "$THEME_SECURITY" \
  --arg theme_perf "$THEME_PERFORMANCE" \
  --argjson suggestions "$SUGGESTIONS_JSON" \
  '{
    id: $id,
    source: "pr_retrospective",
    pr_number: ($pr | tonumber),
    issue_number: (if $issue != "" then ($issue | tonumber) else null end),
    timestamp: $timestamp,
    branch_name: $branch,
    patterns_observed: {
      review_iterations: $reviews,
      commits_count: $commits,
      fix_commits: $fixes,
      comments_count: $comments,
      common_themes: {
        type_safety: ($theme_type | tonumber),
        testing: ($theme_test | tonumber),
        error_handling: ($theme_err | tonumber),
        security: ($theme_sec | tonumber),
        performance: ($theme_perf | tonumber)
      }
    },
    suggestions: $suggestions
  }'
)

# ==============================================================================
# UPSERT TO TELEMETRY.JSON (Atomic write with validation)
# ==============================================================================

TEMP_FILE="${TELEMETRY_FILE}.tmp.$$"

jq --argjson learning "$COMPOUND_LEARNING" '
  # Ensure compound_learnings array exists
  if has("compound_learnings") | not then
    .compound_learnings = []
  else
    .
  end |
  # Remove any existing entry with same ID (deduplication)
  .compound_learnings = (.compound_learnings | map(select(.id != $learning.id))) |
  # Append new learning
  .compound_learnings += [$learning]
' "$TELEMETRY_FILE" > "$TEMP_FILE" 2>/dev/null

# Verify jq succeeded and JSON is valid
if [ $? -eq 0 ] && [ -s "$TEMP_FILE" ] && jq empty "$TEMP_FILE" 2>/dev/null; then
  mv "$TEMP_FILE" "$TELEMETRY_FILE"
  echo "✅ Compound learning insights saved to telemetry"

  # Display summary to user
  SUGGESTION_COUNT=$(echo "$SUGGESTIONS_JSON" | jq 'length')
  if [ "$SUGGESTION_COUNT" -gt 0 ]; then
    echo ""
    echo "🔍 COMPOUND ENGINEERING OPPORTUNITIES IDENTIFIED: $SUGGESTION_COUNT"
    echo ""
    echo "$SUGGESTIONS_JSON" | jq -r '.[] | "  \(.type | ascii_upcase): \(.suggestion)\n    → Benefit: \(.compound_benefit)\n    → Evidence: \(.evidence)\n"'
    echo "💾 Full analysis saved to meta/telemetry.json"
  else
    echo "ℹ️  No specific compound opportunities detected (clean PR!)"
  fi
else
  # JSON generation failed, cleanup
  rm -f "$TEMP_FILE" 2>/dev/null
  echo "⚠️  Failed to save compound learning (invalid JSON)"
fi

echo ""
echo "✅ Branch cleanup completed!"
```

## Compound Engineering Framework

This analysis uses the compound_concepts framework to identify:

1. **DELEGATION OPPORTUNITIES**: When specialized agents could have helped
2. **AUTOMATION CANDIDATES**: Recurring manual processes that could be systematic
3. **SYSTEMATIZATION TARGETS**: Knowledge that should be captured in documentation
4. **PREVENTION**: Patterns that indicate need for earlier intervention
5. **LEARNING EXTRACTION**: Insights that could prevent future issues

## Data Structure

Compound learnings are stored in `meta/telemetry.json`:

```json
{
  "version": "1.1.0",
  "executions": [...],
  "compound_learnings": [
    {
      "id": "learning-pr-123-1729900000",
      "source": "pr_retrospective",
      "pr_number": 123,
      "issue_number": 347,
      "timestamp": "2025-10-26T12:00:00Z",
      "branch_name": "feature/347-description",
      "patterns_observed": {
        "review_iterations": 3,
        "commits_count": 8,
        "fix_commits": 4,
        "comments_count": 12,
        "common_themes": {
          "type_safety": 5,
          "testing": 3,
          "error_handling": 2,
          "security": 1,
          "performance": 0
        }
      },
      "suggestions": [
        {
          "type": "automation",
          "suggestion": "Enable stricter TypeScript configuration",
          "compound_benefit": "Catch type errors before PR, reduce review cycles by ~30%",
          "implementation": "Add tsconfig strict mode",
          "confidence": "high",
          "evidence": "Type safety mentioned 5 times in PR discussion"
        }
      ]
    }
  ]
}
```

## Safety Features

- ✅ Dynamic path resolution (no hardcoded paths)
- ✅ Graceful degradation (missing jq, telemetry file, or PR)
- ✅ Atomic writes with temp file
- ✅ JSON validation before commit
- ✅ Deduplication logic
- ✅ Cleanup on failure
