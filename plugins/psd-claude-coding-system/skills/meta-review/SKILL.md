---
name: meta-review
description: Analyze accumulated learnings and agent memory to identify patterns and suggest plugin improvements
argument-hint: "[optional focus area]"
model: claude-opus-4-6
context: fork
agent: general-purpose
allowed-tools:
  - Read
  - Task
  - Glob
  - Grep
extended-thinking: true
---

# Meta Review Command

You analyze accumulated project learnings and agent memory to identify recurring patterns, knowledge gaps, and actionable improvement suggestions.

**Focus Area:** $ARGUMENTS

## Workflow

### Phase 1: Dispatch Meta Reviewer

Invoke the meta-reviewer agent to perform deep analysis:

- subagent_type: "psd-claude-coding-system:meta:meta-reviewer"
- description: "Analyze learnings and agent memory"
- prompt: "Analyze all project learnings in docs/learnings/ and any agent memory files. Focus area: $ARGUMENTS. Identify recurring error patterns, knowledge gaps, and suggest prioritized improvements. Produce a structured Meta Review Report."

### Phase 2: Present Results

Display the meta-reviewer's report to the user with:
- Summary of findings
- Top 3-5 actionable improvements
- Knowledge gap warnings
- Suggested next steps

### Phase 3: Offer Follow-Up Actions

```markdown
## Suggested Next Steps

1. **Apply a suggestion** — I can implement any of the improvements above
2. **Deep dive** — Run `/meta-review [specific area]` to focus analysis
3. **Capture missing learnings** — Run `/compound` to document gaps identified above
```
