# Parallel Dispatch Skill

Coordinate multiple agents in parallel for maximum efficiency (Every's aggressive parallelism pattern).

## Determine Agents to Invoke

```bash
# Based on issue/PR context, determine which agents to invoke in parallel

AGENTS_TO_INVOKE=""

# Always invoke test-specialist for test strategy
AGENTS_TO_INVOKE="test-specialist"

# Check for security-sensitive changes
SECURITY_KEYWORDS="auth|login|password|token|session|permission|role|encrypt|decrypt|payment|billing"
if echo "$ISSUE_BODY $CHANGED_FILES" | grep -iEq "$SECURITY_KEYWORDS"; then
  AGENTS_TO_INVOKE="$AGENTS_TO_INVOKE security-analyst-specialist"
  echo "ℹ️  Security-sensitive changes detected - adding security-analyst"
fi

# Detect domain by file patterns
if echo "$CHANGED_FILES" | grep -Eq "\.(tsx|jsx|vue|svelte)"; then
  AGENTS_TO_INVOKE="$AGENTS_TO_INVOKE frontend-specialist"
  echo "ℹ️  Frontend files detected - adding frontend-specialist"
fi

if echo "$CHANGED_FILES" | grep -Eq "api|routes|controllers|services|\.go|\.rs"; then
  AGENTS_TO_INVOKE="$AGENTS_TO_INVOKE backend-specialist"
  echo "ℹ️  Backend files detected - adding backend-specialist"
fi

if echo "$CHANGED_FILES" | grep -Eq "schema|migration|\.sql|database"; then
  AGENTS_TO_INVOKE="$AGENTS_TO_INVOKE database-specialist"
  echo "ℹ️  Database changes detected - adding database-specialist"
fi

if echo "$ISSUE_BODY" | grep -iEq "ai|llm|gpt|claude|openai|anthropic"; then
  AGENTS_TO_INVOKE="$AGENTS_TO_INVOKE llm-specialist"
  echo "ℹ️  AI/LLM features detected - adding llm-specialist"
fi

echo "=== Agents to invoke in parallel: $AGENTS_TO_INVOKE ==="
```

## Parallel Agent Invocation Pattern

This is a TEMPLATE for how commands should invoke agents in parallel.
Commands cannot directly execute Task tool invocations - they should describe the pattern.

```markdown
### Phase: Parallel Agent Analysis

Based on detected context, invoke agents IN PARALLEL using multiple Task tool calls:

**Agent 1: test-specialist**
- subagent_type: "psd-claude-coding-system:quality:test-specialist"
- description: "Test strategy for issue #$ISSUE_NUMBER"
- prompt: "Design comprehensive test strategy for: $ISSUE_DESCRIPTION

  Provide:
  1. Unit test approach
  2. Integration test scenarios
  3. Edge cases to cover
  4. Mock/stub requirements"

**Agent 2: security-analyst-specialist** (if security-sensitive)
- subagent_type: "psd-claude-coding-system:review:security-analyst-specialist"
- description: "Security guidance for issue #$ISSUE_NUMBER"
- prompt: "Provide PRE-IMPLEMENTATION security guidance for: $ISSUE_DESCRIPTION

  Focus on:
  1. Security requirements to follow
  2. Common pitfalls to avoid
  3. Recommended secure patterns
  4. Testing security aspects"

**Agent 3: [domain]-specialist** (if detected)
- subagent_type: "psd-claude-coding-system:domain:[backend/frontend/database/llm]-specialist"
- description: "[Domain] implementation for issue #$ISSUE_NUMBER"
- prompt: "Provide implementation guidance for: $ISSUE_DESCRIPTION

  Include:
  1. Architecture patterns
  2. Best practices for this domain
  3. Common mistakes to avoid
  4. Integration points"

**CRITICAL: Invoke ALL agents simultaneously in a SINGLE response with multiple Task tool uses.**

Wait for all agents to return, then synthesize their recommendations.
```

## Synthesize Agent Recommendations

After all agents return:

```bash
# Collect insights from all agents
echo "=== Synthesizing Agent Recommendations ==="

# Agent responses will be in variables like:
# $TEST_SPECIALIST_RESPONSE
# $SECURITY_ANALYST_RESPONSE
# $DOMAIN_SPECIALIST_RESPONSE

# Create consolidated implementation plan
echo "## Consolidated Implementation Plan"
echo ""
echo "### Testing Strategy (from test-specialist)"
echo "$TEST_SPECIALIST_RESPONSE" | grep -A 20 "test"
echo ""
echo "### Security Requirements (from security-analyst)"
echo "$SECURITY_ANALYST_RESPONSE" | grep -A 20 "security"
echo ""
echo "### Domain Implementation (from $DOMAIN-specialist)"
echo "$DOMAIN_SPECIALIST_RESPONSE" | grep -A 20 "implementation"
echo ""
echo "✓ Agent recommendations synthesized - proceeding with implementation"
```

## Track Parallel Execution

```bash
# Mark this execution as using parallel agents for telemetry

if [ -n "$SESSION_ID" ]; then
  SESSION_FILE="plugins/psd-claude-coding-system/meta/.session_state_${SESSION_ID}"

  # Write parallel execution metadata
  echo "PARALLEL=true" >> "$SESSION_FILE"
  echo "PARALLEL_AGENTS=$AGENTS_TO_INVOKE" >> "$SESSION_FILE"
  echo "PARALLEL_START=$(date +%s%3N)" >> "$SESSION_FILE"
fi

# After agents complete
if [ -n "$SESSION_ID" ]; then
  PARALLEL_END=$(date +%s%3N)
  PARALLEL_START=$(grep "^PARALLEL_START=" "$SESSION_FILE" | cut -d= -f2)
  PARALLEL_DURATION=$((PARALLEL_END - PARALLEL_START))

  echo "PARALLEL_DURATION_MS=$PARALLEL_DURATION" >> "$SESSION_FILE"
  echo "✓ Parallel execution completed in ${PARALLEL_DURATION}ms"
fi
```

## Usage

### In /work Command

```markdown
### Phase 2.5: Parallel Agent Analysis (NEW)

Always dispatch 2-3 agents in parallel for maximum insight (Every's philosophy: speed > cost).

**Step 1: Detect which agents are needed**
```bash
# Include "Determine Agents to Invoke" section from @skills/parallel-dispatch.md
```

**Step 2: Invoke agents in parallel**
```markdown
# Include "Parallel Agent Invocation Pattern" section from @skills/parallel-dispatch.md
# This describes HOW to use Task tool with multiple simultaneous invocations
```

**Step 3: Synthesize recommendations**
```bash
# Include "Synthesize Agent Recommendations" section from @skills/parallel-dispatch.md
```

**Step 4: Track for telemetry**
```bash
# Include "Track Parallel Execution" section from @skills/parallel-dispatch.md
```
```

### In /review-pr Command

Similar pattern - detect feedback types, dispatch categorization agents in parallel, synthesize responses.
