# PSD Claude Workflow Plugin

Comprehensive development workflow for Peninsula School District.

**Version**: 1.0.0
**Status**: Stable
**Author**: Kris Hagel (hagelk@psd401.net)

## Overview

This plugin provides a battle-tested workflow automation system with slash commands and specialized AI agents, incorporating compound engineering principles to systematically improve development processes.

## Commands

| Command | Description |
|---------|-------------|
| `/architect` | System architecture design and technical decision making |
| `/work` | Implement solutions for GitHub issues or quick fixes |
| `/issue` | Research and create well-structured GitHub issues |
| `/product-manager` | Transform ideas into comprehensive product specifications |
| `/review_pr` | Address PR feedback systematically and efficiently |
| `/test` | Comprehensive testing with coverage validation |
| `/security_audit` | Security review and vulnerability analysis |
| `/compound_concepts` | Analyze for automation and systematization opportunities |
| `/clean_branch` | Clean up merged branches and close associated issues |

## Agents

### Domain Specialists
- **backend-specialist** - APIs, server logic, system integration
- **frontend-specialist** - React, UI components, user experience
- **database-specialist** - Schema design, query optimization, migrations
- **llm-specialist** - AI integration, prompt engineering, multi-provider implementations

### Quality & Security
- **security-analyst** - Vulnerability analysis, security hardening
- **test-specialist** - Test coverage, automation, quality assurance
- **performance-optimizer** - Web vitals, API latency, system performance

### Documentation & Planning
- **documentation-writer** - API docs, user guides, architectural documentation
- **plan-validator** - Validate and improve technical plans iteratively
- **gpt-5** - Second opinions using GPT-5 for complex problem solving

## Latest Features

All commands and agents now use:
- **claude-sonnet-4-5** - Best coding and agent model (Oct 2025)
- **claude-opus-4-1** - Best reasoning for architect/product-manager (Oct 2025)
- **extended-thinking: true** - Deep analysis up to 128k tokens

## Installation

```bash
# Add PSD marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install this plugin
/plugin install psd-claude-workflow

# Verify installation
/plugin list
```

## Quick Start

```bash
# Work on an issue
/work 347

# Get architecture guidance
/architect 347

# Run comprehensive tests
/test

# Review PR feedback
/review_pr 123

# Clean up after merge
/clean_branch
```

## Compound Engineering

This workflow incorporates compound engineering principles:
- Every bug becomes a prevention system
- Every manual process becomes an automation candidate
- Every solution becomes a template for similar problems
- Every interaction generates improvement opportunities

Use `/compound_concepts` after completing work to get suggestions for systematization.

## Contributing

See the main repository for contribution guidelines.

## License

MIT License - Peninsula School District
