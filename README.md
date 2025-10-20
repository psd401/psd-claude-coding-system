# PSD Claude Coding System

Peninsula School District's comprehensive Claude Code plugin system for AI-assisted software development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Plugin-blue)](https://docs.claude.com/en/docs/claude-code)
[![Status](https://img.shields.io/badge/Status-Active-success)]()

## Overview

This marketplace contains two powerful plugins:

1. **psd-claude-workflow** (✅ Stable) - Proven development workflow automation
2. **psd-claude-meta-learning-system** (🧪 Experimental) - Self-improving AI system

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install workflow plugin (recommended for everyone)
/plugin install psd-claude-workflow

# Install meta-learning plugin (optional, experimental)
/plugin install psd-claude-meta-learning-system
```

## Plugins

### PSD Claude Workflow (v1.0.0)

Comprehensive workflow automation with 9 commands and 10 specialized agents.

**Status**: ✅ Production ready, battle-tested

**Commands**:
- `/work` - Implement solutions for issues
- `/architect` - System architecture design
- `/test` - Comprehensive testing
- `/review_pr` - Handle PR feedback
- `/security_audit` - Security review
- `/issue` - Create GitHub issues
- `/product-manager` - Product specifications
- `/compound_concepts` - Find improvements
- `/clean_branch` - Post-merge cleanup

**Agents**: backend-specialist, frontend-specialist, security-analyst, test-specialist, performance-optimizer, database-specialist, documentation-writer, llm-specialist, plan-validator, gpt-5

**Latest**: All using claude-sonnet-4-5 and claude-opus-4-1 (Oct 2025) with extended-thinking enabled

[Learn more →](./plugins/psd-claude-workflow/README.md)

### PSD Claude Meta-Learning System (v0.1.0)

Self-improving system that learns and evolves.

**Status**: 🧪 Experimental, actively developing

**Commands**:
- `/meta_analyze` - Analyze patterns
- `/meta_learn` - Generate improvements
- `/meta_implement` - Auto-implement changes
- `/meta_experiment` - A/B testing
- `/meta_evolve` - Evolve agents
- `/meta_document` - Living documentation
- `/meta_predict` - Predict issues
- `/meta_health` - System dashboard
- `/meta_improve` - Weekly pipeline

**Agents**: meta-orchestrator, code-cleanup-specialist, pr-review-responder, document-validator, breaking-change-validator

**Vision**: System that improves itself faster than humans could improve it

[Learn more →](./plugins/psd-claude-meta-learning-system/README.md)

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
/plugin install psd-claude-workflow
```

### From Local Directory

```bash
/plugin marketplace add ~/non-ic-code/psd-claude-coding-system
/plugin install psd-claude-workflow
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

### Workflow Plugin
- ✅ 9 battle-tested commands
- ✅ 10 specialized AI agents
- ✅ Compound engineering principles built-in
- ✅ Latest Claude models (Sonnet 4.5, Opus 4.1)
- ✅ Extended thinking enabled for deep analysis

### Meta-Learning Plugin
- 🧪 Telemetry-based learning
- 🧪 Auto-improvement suggestions
- 🧪 Agent evolution via genetic algorithms
- 🧪 Predictive issue detection
- 🧪 Living documentation generation
- 🧪 A/B testing framework

## Development Status

| Plugin | Version | Status | Stability |
|--------|---------|--------|-----------|
| psd-claude-workflow | 1.0.0 | ✅ Stable | Production-ready |
| psd-claude-meta-learning-system | 0.1.0 | 🧪 Beta | Experimental |

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
