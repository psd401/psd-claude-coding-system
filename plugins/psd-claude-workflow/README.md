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

## Integration with Meta-Learning System

This plugin integrates seamlessly with the `psd-claude-meta-learning-system` plugin to enable automatic workflow learning and improvement.

### How It Works

When both plugins are installed:

1. **Automatic Telemetry**: Commands and agents submit usage data (durations, success/failure, agents used)
2. **Privacy-Safe**: Only metadata is collected (counts, durations) - never code content or issue details
3. **Local Only**: All data stays on your machine in the meta-learning plugin's `meta/` folder
4. **Graceful Degradation**: Works perfectly whether meta-learning is installed or not

### What Gets Tracked

**Commands track**:
- Command name (`/work`, `/test`, etc.)
- Duration (how long it took)
- Success/failure status
- Agents invoked during execution
- File counts (not file names or content)
- Test counts, coverage percentages

**Agents track**:
- Agent name when invoked
- Automatically reported to parent command's telemetry session

### Privacy Guarantees

**Collected** ✅:
- Command names and durations
- Agent invocations
- Success/failure status
- Counts (files changed, tests added)

**NOT collected** ❌:
- Your actual code
- File contents or paths
- Issue descriptions or titles
- Commit messages
- Personal information
- API keys or secrets

### Example Telemetry Entry

```json
{
  "id": "exec-2025-10-20-001",
  "command": "/work",
  "timestamp": "2025-10-20T10:30:00Z",
  "duration_seconds": 720,
  "success": true,
  "agents_invoked": ["backend-specialist", "test-specialist"],
  "metadata": {
    "work_type": "issue",
    "issue_number": "347",
    "files_changed": "8",
    "tests_added": "12"
  }
}
```

### Opting Out

**Option 1**: Don't install the meta-learning plugin
```bash
# Just use psd-claude-workflow alone
/plugin install psd-claude-workflow
```

**Option 2**: Disable telemetry in meta-learning plugin config
```bash
# Edit: plugins/psd-claude-meta-learning-system/.claude-plugin/plugin.json
# Set: "telemetry_enabled": false
```

### Benefits of Integration

When using both plugins together:

- **Learn from your patterns**: System notices you always run `/test` after `/work`
- **Automated suggestions**: Get recommendations to create combined workflows
- **Agent optimization**: AI agents improve themselves based on usage
- **Predictive alerts**: Get warnings before problems occur
- **Time savings**: 15-40 hours/month saved through learned optimizations

See the [Meta-Learning System README](../psd-claude-meta-learning-system/README.md) for full details.

## Contributing

See the main repository for contribution guidelines.

## License

MIT License - Peninsula School District
