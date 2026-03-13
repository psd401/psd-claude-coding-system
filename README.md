# PSD Plugin Marketplace

Peninsula School District's plugin marketplace for Claude Code and Claude Cowork.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Version](https://img.shields.io/badge/Version-2.0.0-green)]()

## Overview

**Two independently installable plugins** — one for software development workflows, one for general productivity.

**Version**: 2.0.0

---

## Plugins

### psd-coding-system

AI-assisted development system with 19 skills, 42 specialized agents, memory-based learning, and Context7 framework docs.

```bash
/plugin install psd-coding-system
```

| Skill | Description |
|-------|-------------|
| `/work` | Implement solutions with auto reviews + learning capture |
| `/lfg` | Autonomous end-to-end: implement → test → review → fix → learn |
| `/architect` | System architecture design |
| `/test` | Comprehensive testing with self-healing + learning capture |
| `/review-pr` | Iterative PR feedback (rounds 2+ process only new comments) |
| `/issue` | AI-validated GitHub issues |
| `/product-manager` | Product specs to sub-issues |
| `/security-audit` | Security analysis |
| `/scope` | Scope classification + tiered planning |
| `/evolve` | Auto-evolve: analyze learnings, check releases, compare plugins |
| `/brainstorm` | Collaborative requirements exploration |
| `/changelog` | Auto-generate changelog entries |
| `/deepen-plan` | Parallel per-section plan research |
| `/setup` | Per-project review agent configuration |
| `/worktree` | Git worktree management |
| `/swarm` | Parallel agent orchestration |
| `/bump-version` | Automate version bump ritual |
| `/clean-branch` | Post-merge cleanup |
| `/triage` | FreshService ticket triage |

[Full documentation →](./plugins/psd-coding-system/README.md)

### psd-productivity

General-purpose productivity workflows for district operations. Works in both Claude Code and Claude Cowork.

```bash
/plugin install psd-productivity
```

| Skill | Description | Status |
|-------|-------------|--------|
| `/enrollment` | PSD enrollment workflow | Placeholder |
| `/chief-of-staff` | Daily briefings and priority management | Placeholder |

[Full documentation →](./plugins/psd-productivity/README.md)

---

## Quick Start

```bash
# Add the marketplace
/plugin marketplace add psd401/psd-claude-plugins

# Install the plugin(s) you want
/plugin install psd-coding-system        # Development workflows
/plugin install psd-productivity          # Productivity workflows

# Verify
/plugin list
```

---

## AI Agents (42 total — psd-coding-system)

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

## Architecture

```
psd-claude-plugins/
├── .claude-plugin/
│   └── marketplace.json           # Lists both plugins
├── plugins/
│   ├── psd-coding-system/         # Development workflows
│   │   ├── skills/                # 19 user-invocable skills
│   │   ├── agents/                # 42 specialized agents
│   │   ├── hooks/                 # PostToolUse syntax validation
│   │   ├── scripts/               # Hook scripts
│   │   └── docs/                  # Learnings + patterns
│   └── psd-productivity/          # Productivity workflows
│       ├── skills/                # Enrollment, Chief of Staff, etc.
│       └── agents/                # Workflow-specific agents
├── CLAUDE.md
├── CHANGELOG.md
└── README.md
```

---

## Support

- **Author**: Kris Hagel (hagelk@psd401.net)
- **Organization**: Peninsula School District
- **Repository**: [psd401/psd-claude-plugins](https://github.com/psd401/psd-claude-plugins)
- **Issues**: https://github.com/psd401/psd-claude-plugins/issues

## License

MIT License - see [LICENSE](./LICENSE) for details

---

**Peninsula School District** — Innovating education through technology
