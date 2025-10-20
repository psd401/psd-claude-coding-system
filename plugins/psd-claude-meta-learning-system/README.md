# PSD Claude Meta-Learning System

Self-improving AI development system for Peninsula School District.

**Version**: 0.1.0
**Status**: 🧪 Experimental
**Author**: Kris Hagel (hagelk@psd401.net)

## Overview

This experimental plugin creates a self-improving AI system that learns from your development activity, automatically implements improvements, evolves agents, and predicts future issues.

## Commands

| Command | Description |
|---------|-------------|
| `/meta_analyze` | Analyze telemetry and extract development patterns |
| `/meta_learn` | Generate improvement suggestions from patterns |
| `/meta_implement` | Auto-implement improvements with dry-run mode |
| `/meta_experiment` | A/B testing framework with auto-rollback |
| `/meta_evolve` | Evolve agent prompts via genetic algorithms |
| `/meta_document` | Auto-generate living documentation from code |
| `/meta_predict` | Predict future issues before they occur |
| `/meta_health` | System health dashboard with metrics |
| `/meta_improve` | Master weekly improvement pipeline |

## Agents

- **meta-orchestrator** - Learn optimal agent workflows
- **code-cleanup-specialist** - Automated refactoring (3x faster)
- **pr-review-responder** - Multi-reviewer synthesis
- **document-validator** - Data validation at boundaries
- **breaking-change-validator** - Pre-deletion impact analysis

## How It Works

1. **Observes**: Logs every command execution, duration, success/failure
2. **Learns**: Analyzes patterns to identify improvement opportunities
3. **Suggests**: Generates compound engineering opportunities
4. **Implements**: Auto-applies high-confidence improvements (with review)
5. **Evolves**: Genetic algorithms improve agents over time
6. **Predicts**: Identifies future problems before they occur

## Installation

```bash
# Add PSD marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install meta-learning system (experimental)
/plugin install psd-claude-meta-learning-system
```

## Quick Start

```bash
# Let it observe for a week, then:
/meta_analyze

# See suggestions
/meta_learn

# Check system health
/meta_health

# Predict future issues
/meta_predict --horizon 30d
```

## Telemetry

All telemetry is stored locally in `meta/*.json` and **Git-ignored by default**.

Data collected:
- Command names and durations
- Success/failure rates
- Agents invoked
- Files changed count

**Not collected**: Code content, issue details, personal data

## Development Status

This plugin is experimental and actively being developed. Commands provide basic functionality now and will evolve to full self-improving capability over time.

## Contributing

See main repository for contribution guidelines.

## License

MIT License - Peninsula School District
