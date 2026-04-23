---
name: optimize
description: Metric-driven iterative optimization loops — measure, hypothesize, experiment, evaluate, keep winners
argument-hint: "[metric to optimize, e.g. 'reduce API latency', 'improve test coverage', 'shrink bundle size']"
model: claude-opus-4-6
effort: high
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

# Optimize — Metric-Driven Iterative Improvement

You are a performance engineer running structured optimization loops. Each iteration: measure baseline, generate hypotheses, run experiments, evaluate results, keep winners. Experiments run sequentially to isolate the effect of each change.

**Optimization Target:** $ARGUMENTS

## Phase 1: Setup — Define the Metric

Understand what we're optimizing and how to measure it.

```bash
echo "=== /optimize: $ARGUMENTS ==="
echo ""
echo "Setting up measurement harness..."
```

### 1.1 Identify the Metric Type

Classify the optimization target:

| Type | Examples | Measurement |
|------|----------|-------------|
| **Latency** | API response time, page load, query time | Timed bash command, benchmark script |
| **Size** | Bundle size, binary size, docker image | `du`, `wc`, build output |
| **Coverage** | Test coverage, type coverage | Coverage tool output (%) |
| **Count** | Lint warnings, TODO count, error rate | `grep -c`, tool output |
| **Score** | Lighthouse, accessibility, code quality | Tool-generated score |
| **Qualitative** | Code readability, UX flow, documentation | LLM-as-judge evaluation |

### 1.2 Build the Measurement Command

Construct a **repeatable** measurement command that produces a single number.

```bash
# Examples of measurement commands:
# Latency: time (curl -s -o /dev/null -w "%{time_total}" http://localhost:3000/api/health)
# Bundle size: du -sb dist/ | awk '{print $1}'
# Test coverage: npm run test:coverage 2>&1 | grep "All files" | awk '{print $3}'
# Lint warnings: npm run lint 2>&1 | grep -c "warning"
# Build time: { time npm run build; } 2>&1 | grep real | awk '{print $2}'

METRIC_NAME="[descriptive name]"
METRIC_UNIT="[ms|bytes|%|count|score]"
DIRECTION="[lower|higher]"  # lower = minimize (latency, size), higher = maximize (coverage, score)

echo "Metric: $METRIC_NAME ($METRIC_UNIT, optimize for $DIRECTION)"
```

Use AskUserQuestion if the metric or measurement approach is ambiguous:

**Question:** "How should I measure this? I'll build a repeatable command."
**Context:** Show the detected metric type and proposed measurement command.

### 1.3 Establish Baseline

Run the measurement command 3 times and take the median to account for variance.

```bash
echo "=== Establishing Baseline ==="

# Run measurement 3 times
RESULT_1=$([measurement command])
RESULT_2=$([measurement command])
RESULT_3=$([measurement command])

# Sort and take median
BASELINE=$(echo -e "$RESULT_1\n$RESULT_2\n$RESULT_3" | sort -n | sed -n '2p')

echo "Baseline: $BASELINE $METRIC_UNIT"
echo "Readings: $RESULT_1, $RESULT_2, $RESULT_3"
echo ""
```

### 1.4 Set Target (Optional)

If the user specified a target (e.g., "reduce to under 200ms"), record it:

```bash
TARGET="[user-specified target or 'none']"
if [ "$TARGET" != "none" ]; then
  echo "Target: $TARGET $METRIC_UNIT"
fi
```

### 1.5 Persist State

Write the optimization state to disk so it survives context compaction.

```bash
STATE_DIR=".optimize"
mkdir -p "$STATE_DIR"

cat > "$STATE_DIR/state.json" << 'STATEEOF'
{
  "metric_name": "[name]",
  "metric_unit": "[unit]",
  "direction": "[lower|higher]",
  "measurement_command": "[the bash command]",
  "baseline": [baseline_value],
  "target": [target_value_or_null],
  "current_best": [baseline_value],
  "iterations": 0,
  "max_iterations": 5,
  "experiments": []
}
STATEEOF

echo "State persisted to $STATE_DIR/state.json"
```

**Add `.optimize/` to `.gitignore` if not already present:**

```bash
if ! grep -q "^\.optimize/" .gitignore 2>/dev/null; then
  echo ".optimize/" >> .gitignore
  echo "Added .optimize/ to .gitignore"
fi
```

---

## Phase 2: Generate Hypotheses

Analyze the codebase and generate optimization hypotheses ranked by expected impact.

### 2.1 Codebase Analysis

Invoke the **performance-optimizer** agent to analyze the codebase and identify optimization opportunities.

- subagent_type: "psd-coding-system:quality:performance-optimizer"
- description: "Analyze optimization opportunities for: $ARGUMENTS"
- prompt: "Analyze the codebase for optimization opportunities targeting: $ARGUMENTS. Focus on: hot paths, algorithmic complexity, caching opportunities, unnecessary work, I/O optimization. Return a ranked list of 3-8 hypotheses, each with: description, expected impact (high/medium/low), risk (high/medium/low), files to modify."

**If the agent fails**, generate hypotheses inline by scanning the codebase:

```bash
echo "=== Generating Hypotheses ==="

# Scan for common optimization targets based on metric type
# [Adapt based on METRIC_NAME — latency, size, coverage, etc.]
```

### 2.2 Rank and Filter Hypotheses

Rank hypotheses by expected impact / risk ratio. Create a prioritized list:

```markdown
### Optimization Hypotheses

| # | Hypothesis | Expected Impact | Risk | Files |
|---|-----------|----------------|------|-------|
| 1 | [description] | High | Low | [files] |
| 2 | [description] | Medium | Low | [files] |
| 3 | [description] | High | Medium | [files] |
| ...| ... | ... | ... | ... |
```

### 2.3 Degenerate Gate

Before running experiments, verify the baseline measurement is stable and non-degenerate:

```bash
echo "=== Degenerate Gate ==="

# Re-measure to confirm stability
CHECK=$([measurement command])

# Calculate drift from baseline
DRIFT=$(echo "scale=2; ($CHECK - $BASELINE) / $BASELINE * 100" | bc 2>/dev/null || echo "0")

echo "Stability check: $CHECK $METRIC_UNIT (drift: ${DRIFT}% from baseline)"

# If drift > 20%, the measurement is unstable — warn and ask user
if (( $(echo "${DRIFT#-} > 20" | bc -l 2>/dev/null || echo 0) )); then
  echo "WARNING: Measurement drift exceeds 20%. Results may be unreliable."
fi
```

---

## Phase 3: Experiment Loop

Run experiments sequentially — one hypothesis at a time. Each experiment:
1. Apply the change
2. Measure the result
3. Evaluate improvement
4. Keep or revert

### Loop Structure

```bash
MAX_ITERATIONS=5  # Cap at 5 experiments per session
ITERATION=0
CURRENT_BEST=$BASELINE

echo "=== Starting Optimization Loop ==="
echo "Baseline: $BASELINE $METRIC_UNIT"
echo "Max iterations: $MAX_ITERATIONS"
echo ""
```

### For Each Experiment

#### 3.1 Create a Git Checkpoint

```bash
ITERATION=$((ITERATION + 1))
echo "=== Experiment $ITERATION/$MAX_ITERATIONS ==="
echo "Hypothesis: [description from ranked list]"
echo ""

# Create checkpoint commit
git add -A
git stash push -m "optimize-checkpoint-$ITERATION" 2>/dev/null || true
```

#### 3.2 Apply the Change

Implement the optimization change described by the current hypothesis. Make the minimal set of modifications needed.

```bash
echo "Applying optimization..."
# [Make the code changes]
```

#### 3.3 Validate the Change

Ensure the change doesn't break anything before measuring:

```bash
echo "Validating..."

# Run tests (if they exist)
npm test 2>/dev/null || pytest 2>/dev/null || go test ./... 2>/dev/null || true

# Run typecheck (if applicable)
npm run typecheck 2>/dev/null || tsc --noEmit 2>/dev/null || true

# Run lint
npm run lint 2>/dev/null || true
```

If validation fails, **revert the change and move to the next hypothesis**.

#### 3.4 Measure the Result

```bash
echo "Measuring..."

# Run measurement 3 times and take median
R1=$([measurement command])
R2=$([measurement command])
R3=$([measurement command])
RESULT=$(echo -e "$R1\n$R2\n$R3" | sort -n | sed -n '2p')

echo "Result: $RESULT $METRIC_UNIT (baseline: $BASELINE, current best: $CURRENT_BEST)"
```

#### 3.5 Evaluate

```bash
# Calculate improvement from current best
if [ "$DIRECTION" = "lower" ]; then
  IMPROVEMENT=$(echo "scale=2; ($CURRENT_BEST - $RESULT) / $CURRENT_BEST * 100" | bc 2>/dev/null || echo "0")
  IS_BETTER=$(echo "$RESULT < $CURRENT_BEST" | bc 2>/dev/null || echo "0")
else
  IMPROVEMENT=$(echo "scale=2; ($RESULT - $CURRENT_BEST) / $CURRENT_BEST * 100" | bc 2>/dev/null || echo "0")
  IS_BETTER=$(echo "$RESULT > $CURRENT_BEST" | bc 2>/dev/null || echo "0")
fi

echo "Improvement: ${IMPROVEMENT}%"
```

#### 3.6 Keep or Revert

```bash
if [ "$IS_BETTER" = "1" ]; then
  echo "WINNER — keeping this change (+${IMPROVEMENT}%)"
  CURRENT_BEST=$RESULT

  # Commit the winning change
  git add -A
  git commit -m "perf: [hypothesis description]

- Metric: $METRIC_NAME
- Before: $CURRENT_BEST $METRIC_UNIT
- After: $RESULT $METRIC_UNIT
- Improvement: ${IMPROVEMENT}%

Part of optimization loop for: $ARGUMENTS"

else
  echo "NO IMPROVEMENT — reverting"
  git checkout -- . 2>/dev/null
  git clean -fd 2>/dev/null
fi
```

#### 3.7 Update State

```bash
# Update the persisted state file with experiment results
# [Update .optimize/state.json with experiment outcome]
```

#### 3.8 Early Exit Conditions

Check if we should stop:

```bash
# Check if target is met
if [ "$TARGET" != "none" ]; then
  if [ "$DIRECTION" = "lower" ] && (( $(echo "$CURRENT_BEST <= $TARGET" | bc -l 2>/dev/null || echo 0) )); then
    echo "TARGET MET: $CURRENT_BEST <= $TARGET $METRIC_UNIT"
    break
  fi
  if [ "$DIRECTION" = "higher" ] && (( $(echo "$CURRENT_BEST >= $TARGET" | bc -l 2>/dev/null || echo 0) )); then
    echo "TARGET MET: $CURRENT_BEST >= $TARGET $METRIC_UNIT"
    break
  fi
fi

# Check if max iterations reached
if [ "$ITERATION" -ge "$MAX_ITERATIONS" ]; then
  echo "Max iterations reached ($MAX_ITERATIONS)"
  break
fi
```

---

## Phase 4: Qualitative Evaluation (LLM-as-Judge)

For qualitative targets (readability, UX, documentation quality), use LLM-as-judge scoring instead of numeric measurement.

**When to use:** The user's target is subjective — "improve readability", "better error messages", "cleaner API surface".

### Scoring Rubric

Define a 1-10 scoring rubric specific to the target:

```markdown
### Scoring Rubric: [target]

| Score | Criteria |
|-------|----------|
| 9-10 | Exceptional — exemplary for the domain |
| 7-8 | Good — clear, well-structured, follows best practices |
| 5-6 | Adequate — functional but room for improvement |
| 3-4 | Below average — confusing, inconsistent, or brittle |
| 1-2 | Poor — actively harmful to maintainability/usability |
```

### Evaluation

For each experiment, evaluate the change against the rubric by reading the modified files and scoring each criterion. Use the same evaluation prompt for consistency across experiments.

---

## Phase 5: Results Summary

After all experiments complete, present the final results.

```bash
echo "=== /optimize Complete ==="
echo ""
echo "Metric: $METRIC_NAME ($METRIC_UNIT)"
echo "Baseline: $BASELINE"
echo "Final: $CURRENT_BEST"

TOTAL_IMPROVEMENT=$(echo "scale=2; ($BASELINE - $CURRENT_BEST) / $BASELINE * 100" | bc 2>/dev/null || echo "0")
if [ "$DIRECTION" = "higher" ]; then
  TOTAL_IMPROVEMENT=$(echo "scale=2; ($CURRENT_BEST - $BASELINE) / $BASELINE * 100" | bc 2>/dev/null || echo "0")
fi

echo "Total improvement: ${TOTAL_IMPROVEMENT}%"
echo "Experiments run: $ITERATION"
echo ""
```

### Results Table

```markdown
### Optimization Results

| # | Hypothesis | Result | Improvement | Verdict |
|---|-----------|--------|-------------|---------|
| 1 | [description] | [value] | [%] | KEPT / REVERTED |
| 2 | [description] | [value] | [%] | KEPT / REVERTED |
| ... | ... | ... | ... | ... |

**Summary:**
- Baseline: [value] [unit]
- Final: [value] [unit]
- Total improvement: [%]
- Target: [met/not met/none set]
- Experiments: [kept]/[total] changes kept
```

### Remaining Opportunities

List hypotheses that were not tested (if any remain from the ranked list):

```markdown
### Untested Hypotheses

| # | Hypothesis | Expected Impact | Why Skipped |
|---|-----------|----------------|-------------|
| [n] | [description] | [impact] | Max iterations reached |
```

---

## Phase 6: Learning Capture (Task-Delegated — Always)

Always dispatch the learning-writer agent with a session summary.

- subagent_type: "psd-coding-system:workflow:learning-writer"
- description: "Capture learning from /optimize session"
- prompt: "SUMMARY=[optimization target: $ARGUMENTS, baseline: $BASELINE, final: $CURRENT_BEST, improvement: ${TOTAL_IMPROVEMENT}%, experiments: $ITERATION, hypotheses tested and outcomes] KEY_INSIGHT=[the most effective optimization technique from this session, or 'routine optimization' if nothing stood out] CATEGORY=performance TAGS=[optimize, metrics, iterative-improvement]. Write a concise learning document only if this insight is novel. Skip if routine."

**Do not block on this agent** — if it fails, the optimization is already applied.

---

## Cleanup

Remove the `.optimize/` state directory after the session:

```bash
rm -rf .optimize
echo "Optimization state cleaned up."
```

---

## Quick Reference

### Usage Examples

```bash
/optimize reduce API response time for /api/users endpoint
/optimize improve test coverage to 90%
/optimize shrink production bundle size
/optimize reduce lint warnings to zero
/optimize improve code readability in src/utils/
/optimize reduce Docker image size
/optimize improve Lighthouse performance score to 95
```

### When to Use This vs Other Skills

| Situation | Use |
|-----------|-----|
| One-off performance fix | `/work` |
| Systematic metric improvement | `/optimize` |
| Full performance audit | Performance-optimizer agent via `/work` |
| Architecture redesign for perf | `/architect` |

### Limitations

- **v1**: Experiments run sequentially (no parallel worktree isolation yet)
- Max 5 experiments per session to keep context manageable
- Qualitative scoring is subjective — use numeric metrics when possible
- Measurement variance can affect results — 3-run median helps but isn't perfect
