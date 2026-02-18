# Swarm Orchestration Pattern

## Overview

Claude Code's **Agent Teams** (experimental, available since Feb 6 2026) enables a leader-teammate pattern where a leader agent spawns teammates that work in parallel with shared communication via inboxes.

This is distinct from the `Task` tool pattern we use today. Agent Teams use `TeammateTool` for spawning and `InboxTool` for inter-agent messaging.

## Status

**Experimental** — requires manual opt-in. No skill code changes in v1.20.0. This document captures the pattern for future integration.

## Enabling Agent Teams

Set the environment variable before launching Claude Code:

```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

Or add to your shell profile (`~/.zshrc`, `~/.bashrc`).

## How It Works

### Leader/Teammate/Inbox Pattern

1. **Leader** — the main agent orchestrating the workflow
2. **Teammates** — spawned agents that run in parallel, each with their own context
3. **Inboxes** — message queues for communication between leader and teammates

### Key Differences from Task Tool

| Aspect | Task Tool | Agent Teams |
|--------|-----------|-------------|
| Communication | One-shot: send prompt, get result | Bidirectional: inbox messages |
| Parallelism | Multiple Task calls in one message | Teammates run truly concurrently |
| Context | Each Task gets fresh context | Teammates maintain their own context |
| Resume | Supports resume via agent ID | No resume support yet |
| Nesting | Agents can spawn sub-agents | No nested teams |
| Token cost | Lower (single round-trip per agent) | Higher (ongoing communication overhead) |
| Maturity | Stable, production-ready | Experimental, API may change |

### When to Use Agent Teams vs Task

**Use Task tool when:**
- One-shot delegation (send work, get result)
- Agent doesn't need to communicate mid-task
- You need resume capability
- Token cost matters

**Use Agent Teams when:**
- Agents need to coordinate in real-time
- Multiple agents working on the same codebase simultaneously
- Leader needs to adjust based on teammate progress
- Complex multi-phase workflows with interdependencies

## Example: Parallel Review with Agent Teams

This is a conceptual example of how `/review-pr` could use Agent Teams instead of sequential Task calls:

```
Leader (review orchestrator):
  1. Spawn teammate: security-reviewer
  2. Spawn teammate: typescript-reviewer
  3. Spawn teammate: architecture-reviewer
  4. All three work simultaneously on the PR diff
  5. Leader reads inbox for findings from each
  6. Leader synthesizes into P1/P2/P3 report
```

With the Task tool today, these agents run in parallel via multiple Task calls in one message — but the leader must wait for all to complete before processing. With Agent Teams, the leader could process findings as they arrive.

## Limitations

- **No resume** — if a teammate crashes, it cannot be resumed
- **No nested teams** — a teammate cannot spawn its own teammates
- **Higher token cost** — inbox polling and message passing add overhead
- **Experimental API** — interfaces may change without notice
- **No plugin integration yet** — Agent Teams don't have a SKILL.md frontmatter equivalent

## Future Plans

Once the Agent Teams API stabilizes:
1. Add swarm-aware skill code to `/review-pr` for parallel review
2. Explore swarm patterns for `/lfg` multi-phase orchestration
3. Consider leader/teammate patterns for `/architect` design reviews
