---
description: Analyze telemetry data and extract development patterns
model: claude-opus-4-1
extended-thinking: true
---

# Meta Analysis Command

Analyze all recorded telemetry to identify patterns, bottlenecks, and improvement opportunities.

## What This Does

Reads telemetry data from `meta/telemetry.json` and provides insights on:
- Command usage patterns
- Agent effectiveness
- Time bottlenecks
- Success/failure rates
- Workflow optimization opportunities

## Usage

```bash
# Analyze all activity
/meta_analyze

# Analyze recent activity
/meta_analyze --since 7d

# Analyze specific command
/meta_analyze --command work
```

## Output

Generates a detailed analysis report with:
- Activity summary
- Pattern detection
- Workflow optimization suggestions
- Predictive alerts

---

**Implementation**: Read and analyze `$REPO_ROOT/non-ic-code/psd-claude-coding-system/plugins/psd-claude-meta-learning-system/meta/telemetry.json` to identify patterns and generate actionable insights.

Currently in development - provides basic telemetry analysis.
