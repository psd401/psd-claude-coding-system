# PSD Claude Coding System

Peninsula School District's comprehensive Claude Code plugin system for AI-assisted software development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Status](https://img.shields.io/badge/Status-Active-success)]()

## Overview

**One unified plugin** combining battle-tested development workflows with self-improving meta-learning.

**Version**: 1.11.1
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
- [**Meta-Learning System Guide**](./docs/META_LEARNING_GUIDE.md) ✅ - Command reference, schedules, workflows
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

### New in v1.7.0 (November 2025)
- 🚀 **Opus 4.5 upgrade** - Architecture/planning commands use new model (80.9% SWE-bench, 66% cost savings)
- 🚀 **Aggressive parallelism** - `/work` always dispatches 2-3 agents simultaneously (Every's pattern)
- 🚀 **Pre-implementation security** - Security review happens before coding, not after PR
- 🚀 **Skills layer** - 5 reusable workflow components for git, testing, security, telemetry, parallelism
- 🚀 **Parallel context gathering** - `/architect` fetches context concurrently (4 parallel operations)
- 🚀 **Parallel PR feedback** - `/review_pr` categorizes and dispatches agents by feedback type
- 🚀 **Enhanced telemetry** - Tracks parallel execution patterns, duration, agent combinations

## Development Status

**Version**: 1.8.0
**Status**: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning
**Stability**: Workflow commands battle-tested, meta-learning in active development

### Architecture Philosophy (v1.7.0)

**Aggressive Parallelism** (inspired by Every's compounding-engineering plugin):
- Speed > Cost: Always dispatch 2-3 agents in parallel
- Cost: ~$1.50/issue (+$1 parallel agents, +$0.50 opus-4-5)
- Value: $23-33/issue (15-20 min rework reduction @ $100/hr)
- ROI: 15x-22x return on investment

**Skills Layer** - DRY principle for workflows:
- Extract common patterns (git, testing, security, telemetry, parallelism)
- Single source of truth reduces maintenance
- Reusable across commands
- Easier to enhance and test

**Pre-Implementation Security**:
- Security-analyst runs BEFORE coding (Phase 2.5 in `/work`)
- Prevents issues rather than finding them in PR review
- Reduces post-PR security findings from ~2-3 to <1 per PR

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
