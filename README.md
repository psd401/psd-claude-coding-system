# PSD Claude Coding System

Peninsula School District's comprehensive Claude Code plugin for AI-assisted software development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Version](https://img.shields.io/badge/Version-1.23.0-green)]()

## Overview

**One unified plugin** combining battle-tested development workflows with memory-based learning and knowledge compounding.

**Version**: 1.23.0
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
/evolve               # Auto-evolve the plugin
```

---

## What's New in v1.23.0

**Unified `/evolve` Command — 7 Knowledge Skills Collapsed Into 1**

### Key Changes

- **`/evolve` skill** - Zero-argument auto-decision command that reads system state and picks the highest-value action: deep pattern analysis, release gap check, pattern contribution, plugin comparison, or automation concepts
- **7 skills removed** - `/compound`, `/meta-review`, `/meta-health`, `/claude-code-updates`, `/compound-plugin-analyzer`, `/compound-concepts`, `/contribute-pattern` all consolidated into `/evolve`
- **State tracking** - `docs/learnings/.evolve-state.json` tracks when each action was last run for intelligent priority selection
- **Skill count** 18 → 12 (removed 7, added 1)

---

## How It Works

![PSD Claude Coding System - Complete Workflow](./images/psd-complete-workflow.png)

The plugin provides a complete development lifecycle:

1. **Planning** - Create issues (`/issue`) or break down big ideas into epics (`/product-manager`), design architecture (`/architect`)
2. **Implementation** - Work on issues (`/work 347`) with automatic agent assistance
3. **Validation** - Run tests (`/test`), handle PR feedback (`/review-pr`)
4. **Completion** - Clean up (`/clean-branch`), evolve the plugin (`/evolve`)

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
| `/evolve` | Auto-evolve: analyze learnings, check releases, compare plugins | `/evolve` |
| `/clean-branch` | Post-merge cleanup | `/clean-branch` |
| `/triage` | FreshService ticket triage | `/triage 12345` |

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
- Automatically captured by `/work`, `/test`, `/review-pr`, `/lfg` via learning-writer agent

### Plugin Patterns (`docs/patterns/`)
- Universal patterns shared across all projects
- Contributed via `/evolve` (auto-detects uncontributed universal learnings)
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
# Should show: psd-claude-coding-system (v1.23.0)

# Test a command
/evolve
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

# Evolve the plugin (auto-picks highest-value action)
/evolve
```

---

## Architecture

```
plugins/psd-claude-coding-system/
├── skills/                    # 12 user-invocable skills
│   ├── work/SKILL.md          # Main implementation workflow
│   ├── lfg/SKILL.md           # Autonomous end-to-end workflow
│   ├── evolve/SKILL.md        # Auto-evolve (learnings, releases, comparison)
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

Use `/evolve` to analyze accumulated learnings and improve the plugin. `/work`, `/test`, `/review-pr`, and `/lfg` always dispatch the learning-writer agent automatically (it handles deduplication).

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
