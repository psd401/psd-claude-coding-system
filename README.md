# PSD Claude Coding System

Peninsula School District's comprehensive Claude Code plugin system for AI-assisted software development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Status](https://img.shields.io/badge/Status-Active-success)]()

## Overview

**One unified plugin** combining battle-tested development workflows with self-improving meta-learning.

**Version**: 1.6.0
**Status**: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install the unified plugin (one command!)
/plugin install psd-claude-coding-system

# Start using immediately
/work 347              # Implement an issue
/test                  # Run tests
/meta_health           # Check system status (after 2-4 weeks)
```

## What's Inside

### Workflow Commands (18 total)

**Development Workflows** (9 commands):
- `/work` - Implement solutions + **automatic security review** on PR creation
- `/architect` - System architecture via architect-specialist agent
- `/test` - Comprehensive testing with coverage validation
- `/review_pr` - Handle PR feedback systematically
- `/security_audit` - Manual security audit wrapper (auto-runs in /work)
- `/issue` - **AI-validated** GitHub issues with latest docs + optional architecture
- `/product-manager` - Product specs → **validated** epic + auto-created sub-issues
- `/compound_concepts` - Find automation opportunities (manual)
- `/clean_branch` - Post-merge cleanup + **automatic compound learning extraction**

**Meta-Learning Commands** (9 commands):
- `/meta_health` - Check system status & metrics
- `/meta_analyze` - Find patterns in your workflow
- `/meta_learn` - Get improvement suggestions
- `/meta_implement` - Apply improvements safely (with dry-run)
- `/meta_improve` - Full weekly improvement pipeline
- `/meta_document` - Auto-update documentation from code
- `/meta_predict` - Forecast future issues
- `/meta_experiment` - A/B test ideas safely
- `/meta_evolve` - Improve AI agents via genetic algorithms

### AI Agents (17 total)

**Workflow Specialists** (12 agents):
- **NEW:** architect-specialist, security-analyst-specialist
- Existing: backend-specialist, frontend-specialist, test-specialist, performance-optimizer, database-specialist, documentation-writer, llm-specialist, plan-validator, gpt-5

**Meta-Learning Specialists** (5 agents):
meta-orchestrator, code-cleanup-specialist, pr-review-responder, document-validator, breaking-change-validator

**Latest Models**: All agents use claude-sonnet-4-5 and claude-opus-4-1 (Oct 2025) with extended-thinking enabled

[Read full documentation →](./plugins/psd-claude-coding-system/README.md)

## Documentation

- [Getting Started](./docs/GETTING_STARTED.md) (Coming soon)
- [Workflow Plugin Guide](./docs/WORKFLOW_PLUGIN.md) (Coming soon)
- [Meta-Learning System Guide](./docs/META_LEARNING_SYSTEM.md) (Coming soon)
- [Architecture](./docs/ARCHITECTURE.md) (Coming soon)

**For detailed planning docs**, see:
- Desktop: `~/Desktop/PSD-Meta-Learning-System-Plan.md` (Full 6-phase plan)
- Desktop: `~/Desktop/PSD-Plugin-Migration-Guide.md` (Installation guide)

## Installation

### From GitHub (Recommended)

```bash
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### From Local Directory

```bash
/plugin marketplace add ~/non-ic-code/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

## Usage Examples

### Basic Workflow

```bash
# Work on an issue
/work 347

# Run tests
/test

# Review PR
/review_pr 123

# Clean up after merge
/clean_branch
```

### Meta-Learning (Experimental)

```bash
# Let it observe for a week, then:
/meta_analyze

# See improvement suggestions
/meta_learn

# Check system health
/meta_health
```

## Features

### Workflow Automation
- ✅ 9 battle-tested development commands
- ✅ 10 workflow specialist agents
- ✅ Compound engineering principles built-in
- ✅ Latest Claude models (Sonnet 4.5, Opus 4.1)
- ✅ Extended thinking enabled for deep analysis

### Meta-Learning System
- 🧪 Automatic telemetry via hooks (NEW in v1.1.0)
- 🧪 Pattern detection and analysis
- 🧪 Auto-improvement suggestions with confidence scores
- 🧪 Agent evolution via genetic algorithms
- 🧪 Predictive issue detection (70%+ accuracy)
- 🧪 Living documentation generation
- 🧪 A/B testing framework for safe experimentation

### New in v1.1.0
- 🚀 **Hook-based telemetry** - Reliable, zero-config usage tracking
- 🚀 **Unified plugin** - One install, one version, simpler architecture
- 🚀 **Automatic agent tracking** - SubagentStop hook tracks all agent invocations
- 🚀 **Improved reliability** - No reliance on AI executing bash blocks

## Development Status

**Version**: 1.6.0
**Status**: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning
**Stability**: Workflow commands battle-tested, meta-learning in active development

### What's New in v1.4.0 (October 2025)

**Enhanced Issue & Architecture Workflow:**
- `/issue` command now:
  - Auto-detects complexity and invokes architecture design when needed
  - Validates plans with GPT-5 (via plan-validator) before creating issues
  - Always uses current documentation (dynamic date queries, MCP servers)
  - Only asks clarifying questions when critically needed
- `/architect` refactored to use architect-specialist agent (shared with /issue)
- `/product-manager` now validates breakdown with plan-validator and uses `/issue` for sub-issues

**Automatic Security Review:**
- `/work` command now automatically runs security analysis after PR creation
- Single consolidated security review comment (no more spam)
- Powered by new security-analyst-specialist agent
- `/security_audit` still available for manual audits

**Compound Learning Extraction:**
- `/clean_branch` now automatically analyzes merged PRs for learning opportunities
- Extracts patterns: type safety issues, testing gaps, security concerns, iteration problems
- Generates actionable suggestions using compound engineering framework
- Saves insights to telemetry data for meta-learning system
- No manual `/compound_concepts` invocation needed (still available standalone)

**New Agents:**
- `architect-specialist` - Shared architecture design logic
- `security-analyst-specialist` - Comprehensive security analysis

**Enhanced plan-validator:**
- Now uses GPT-5 with high reasoning effort (`model_reasoning_effort="high"`)
- Provides deeper analysis for plan validation

**Telemetry Cleanup:**
- Removed obsolete manual telemetry code from all commands
- Hook-based telemetry (v1.1.0+) handles everything automatically

## Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## Support

- **Author**: Kris Hagel (hagelk@psd401.net)
- **Organization**: Peninsula School District
- **Repository**: [psd401/psd-claude-coding-system](https://github.com/psd401/psd-claude-coding-system)

## License

MIT License - see [LICENSE](./LICENSE) for details

## Acknowledgments

Built with Claude Code by Anthropic, incorporating compound engineering principles for systematic improvement.

---

**Peninsula School District** - Innovating education through technology
