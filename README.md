# PSD Claude Coding System

Peninsula School District's comprehensive Claude Code plugin for AI-assisted software development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Version](https://img.shields.io/badge/Version-1.20.1-green)]()

## Overview

**One unified plugin** combining battle-tested development workflows with memory-based learning and knowledge compounding.

**Version**: 1.20.1
**Status**: Production-Ready Workflows + Memory-Based Learning

---

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install the plugin
/plugin install psd-claude-coding-system

# Start using immediately
/work 347              # Implement an issue
/test                  # Run tests
/compound              # Capture learnings from session
```

---

## What's New in v1.20.1

**Context7 MCP + Autonomous Workflow + Swarm Foundation**

### Key Changes

- **Context7 MCP server** - Live framework docs for 100+ frameworks, configured in plugin.json (no API key)
- **`/lfg` skill** - Autonomous end-to-end workflow: implement → test → review → fix → learn in one shot
- **Always-run learning capture** - `/work`, `/test`, `/review-pr` now always dispatch learning-writer (agent handles deduplication)
- **Swarm documentation** - Agent Teams pattern documented in `docs/patterns/swarm-orchestration.md` (manual opt-in)
- **Cleaned stale references** - Removed "telemetry" and "self-improving" from plugin descriptions/keywords

---

## How It Works

![PSD Claude Coding System - Complete Workflow](./images/psd-complete-workflow.png)

The plugin provides a complete development lifecycle:

1. **Planning** - Create issues (`/issue`) or break down big ideas into epics (`/product-manager`), design architecture (`/architect`)
2. **Implementation** - Work on issues (`/work 347`) with automatic agent assistance
3. **Validation** - Run tests (`/test`), handle PR feedback (`/review-pr`)
4. **Completion** - Clean up (`/clean-branch`), capture learnings (`/compound`)

---

## Workflow Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/work` | Implement solutions with auto reviews + learning capture | `/work 347` |
| `/lfg` | Autonomous end-to-end: implement → test → review → fix → learn | `/lfg 347` |
| `/architect` | System architecture design | `/architect "caching system"` |
| `/test` | Comprehensive testing with self-healing + learning capture | `/test auth` |
| `/review-pr` | Handle PR feedback + learning capture | `/review-pr 123` |
| `/issue` | AI-validated GitHub issues | `/issue "add caching"` |
| `/product-manager` | Product specs to sub-issues | `/product-manager "dashboard"` |
| `/security-audit` | Security analysis | `/security-audit` |
| `/scope` | Scope classification + tiered planning | `/scope "add caching"` |
| `/compound` | Capture session learnings | `/compound` |
| `/contribute-pattern` | Share universal patterns | `/contribute-pattern` |
| `/compound-concepts` | Find automation opportunities | `/compound-concepts` |
| `/clean-branch` | Post-merge cleanup | `/clean-branch` |
| `/triage` | FreshService ticket triage | `/triage 12345` |
| `/claude-code-updates` | Analyze Claude Code releases | `/claude-code-updates` |
| `/compound-plugin-analyzer` | Compare with Every's plugin | `/compound-plugin-analyzer` |

---

## Meta-Learning Commands (2 total)

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/meta-review` | Analyze learnings + suggest improvements | Weekly/Monthly |
| `/meta-health` | Quick system health check | Anytime |

---

## AI Agents (42 total)

### Review Specialists (14 agents)
`security-analyst` · `security-analyst-specialist` · `deployment-verification-agent` · `data-migration-expert` · `agent-native-reviewer` · `architecture-strategist` · `code-simplicity-reviewer` · `pattern-recognition-specialist` · `schema-drift-detector` · `data-integrity-guardian` · `typescript-reviewer` · `python-reviewer` · `swift-reviewer` · `sql-reviewer`

### Domain Specialists (7 agents)
`backend-specialist` · `frontend-specialist` · `database-specialist` · `llm-specialist` · `ux-specialist` · `architect-specialist` · `shell-devops-specialist`

### Quality (3 agents)
`test-specialist` · `performance-optimizer` · `documentation-writer`

### Research (6 agents)
`learnings-researcher` · `spec-flow-analyzer` · `best-practices-researcher` · `framework-docs-researcher` · `git-history-analyzer` · `repo-research-analyst`

### Workflow (4 agents)
`bug-reproduction-validator` · `work-researcher` · `work-validator` · `learning-writer`

### Meta & Validation (6 agents)
`meta-reviewer` · `plan-validator` · `document-validator` · `configuration-validator` · `breaking-change-validator` · `telemetry-data-specialist`

### External AI (2 agents)
`gpt-5-codex` (GPT-5.3-Codex) · `gemini-3-pro` (Gemini 3.1 Pro)

---

## Knowledge Compounding System

![Knowledge Compounding System](./images/psd-knowledge-compounding.png)

The plugin includes a hybrid knowledge capture system:

### Project Learnings (`./docs/learnings/`)
- Store project-specific patterns and solutions
- Automatically searched before implementation via `learnings-researcher`
- Captured with `/compound` after sessions with issues or discoveries

### Plugin Patterns (`docs/patterns/`)
- Universal patterns shared across all projects
- Contributed via `/contribute-pattern`
- Available to all plugin users after merge

---

## Language-Specific Reviews

The plugin automatically detects languages in changed files and invokes appropriate reviewers:

| Language | Extensions | Reviewer |
|----------|------------|----------|
| TypeScript | `.ts`, `.tsx`, `.js`, `.jsx` | `typescript-reviewer` |
| Python | `.py` | `python-reviewer` |
| Swift | `.swift` | `swift-reviewer` |
| SQL | `.sql`, `*migration*` | `sql-reviewer` |

### Dual-Phase Review

1. **Light Mode** (pre-PR in `/work`): Quick checks, critical issues only
2. **Full Mode** (post-PR in `/review-pr`): Comprehensive deep analysis

---

## Installation

### From GitHub (Recommended)

```bash
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### Verify Installation

```bash
/plugin list
# Should show: psd-claude-coding-system (v1.20.1)

# Test a command
/meta-health
```

---

## Usage Examples

### Basic Workflow

```bash
# Work on an issue
/work 347

# Run tests
/test

# Create PR and handle feedback
/review-pr 123

# Clean up after merge
/clean-branch

# Capture what you learned
/compound
```

### Knowledge Compounding

```bash
# After a session where you discovered something useful
/compound

# If the learning applies to all projects
/contribute-pattern ./docs/learnings/build-errors/2026-01-22-vite-config-gotcha.md
```

### Meta-Learning

```bash
# Review accumulated learnings for improvement suggestions
/meta-review

# Quick health check — learning counts, agent memory, recent activity
/meta-health
```

---

## Architecture

```
plugins/psd-claude-coding-system/
├── skills/                    # 18 user-invocable skills
│   ├── work/SKILL.md          # Main implementation workflow
│   ├── lfg/SKILL.md           # Autonomous end-to-end workflow
│   ├── compound/SKILL.md      # Knowledge capture
│   ├── meta-review/SKILL.md   # Learning analysis
│   ├── meta-health/SKILL.md   # System health check
│   └── ...                    # Other workflow skills
├── agents/                    # 42 specialized agents
│   ├── review/                # 14 code review specialists
│   ├── domain/                # 7 domain experts
│   ├── quality/               # 3 quality assurance
│   ├── research/              # 6 research agents
│   ├── workflow/              # 4 workflow agents
│   ├── external/              # 2 external AI providers
│   ├── meta/                  # 1 meta-reviewer
│   └── validation/            # 5 validators
├── docs/
│   ├── learnings/             # Project learnings (auto-captured)
│   └── patterns/              # Universal patterns
├── scripts/
│   ├── post-edit-validate.sh  # PostToolUse syntax validation
│   └── language-detector.sh   # Language detection utility
└── hooks/
    └── hooks.json             # PostToolUse validation hook
```

---

## Compound Engineering Principles

Every interaction creates improvement opportunities:

- Every bug → prevention system
- Every manual process → automation candidate
- Every solution → template for similar problems
- Every workflow → captured learning for future sessions

Use `/compound` after sessions to capture learnings. `/work`, `/test`, `/review-pr`, and `/lfg` always dispatch the learning-writer agent (it handles deduplication).

---

## Documentation

- [Plugin README](./plugins/psd-claude-coding-system/README.md) - Detailed plugin docs
- [CLAUDE.md](./CLAUDE.md) - Technical reference

---

## Support

- **Author**: Kris Hagel (hagelk@psd401.net)
- **Organization**: Peninsula School District
- **Repository**: [psd401/psd-claude-coding-system](https://github.com/psd401/psd-claude-coding-system)
- **Issues**: https://github.com/psd401/psd-claude-coding-system/issues

---

## Acknowledgments

- [Every's Compound Engineering Plugin](https://github.com/EveryInc/compound-engineering-plugin) - Inspiration for v1.15.1 knowledge compounding and language-specific review patterns
- Built with [Claude Code](https://docs.anthropic.com/en/docs/claude-code) by Anthropic

## License

MIT License - see [LICENSE](./LICENSE) for details

---

**Peninsula School District** - Innovating education through technology
