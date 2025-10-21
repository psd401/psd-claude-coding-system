# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **PSD Claude Coding System** - a unified Claude Code plugin for Peninsula School District combining:

1. **Workflow Automation** (Stable) - 9 battle-tested development commands + 10 specialized agents
2. **Meta-Learning System** (Experimental) - 9 commands + 5 agents that learn from usage and improve over time

**Version**: 1.1.0
**Status**: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning

## Architecture

### Unified Plugin Structure

The plugin follows Claude Code's architecture with automatic telemetry via hooks:
```
plugins/psd-claude-coding-system/
  ├── .claude-plugin/
  │   └── plugin.json          # Plugin metadata (v1.1.0)
  ├── commands/                 # 18 slash commands (*.md)
  ├── agents/                   # 17 specialized AI agents (*.md)
  ├── hooks/
  │   └── hooks.json            # Automatic telemetry collection
  ├── scripts/
  │   ├── telemetry-init.sh     # SessionStart hook
  │   ├── telemetry-command.sh  # UserPromptSubmit hook
  │   ├── telemetry-agent.sh    # SubagentStop hook
  │   └── telemetry-track.sh    # Stop hook
  ├── meta/                     # Telemetry data (git-ignored)
  └── README.md                 # Plugin documentation
```

### Command vs Agent Pattern

**Commands** are user-facing workflows invoked with `/command-name`:
- Contain YAML frontmatter defining allowed-tools, model, extended-thinking
- Include bash scripts and structured workflows
- May invoke agents via the Task tool for specialized work

**Agents** are specialized AI assistants invoked by commands or other Claude Code instances:
- Contain YAML frontmatter with name, description, model, color
- Focused on specific domains (backend, frontend, security, testing, etc.)
- Run autonomously with specific tool access

### Workflow Commands (9 commands)

Production-ready workflows all using latest Claude models (sonnet-4-5, opus-4-1) with extended-thinking enabled.

**Command Workflow Pattern**: Most commands follow this structure:
1. **Phase 1**: Context gathering (git status, issue details, file analysis)
2. **Phase 2**: Setup (branch creation, dependency checks)
3. **Phase 3**: Implementation (may invoke specialized agents)
4. **Phase 4**: Validation (tests, commits, PRs)

**Key Commands**:
- `/work [issue-number|description]` - Main implementation workflow, auto-detects issue vs quick-fix mode
- `/architect [issue-number|topic]` - Architecture design using opus-4-1 for deep reasoning
- `/test [scope]` - Comprehensive testing with coverage validation
- `/review_pr [number]` - Systematic PR feedback handling
- `/compound_concepts` - Finds automation/systematization opportunities
- `/security_audit` - Security review and vulnerability analysis
- `/issue [description]` - Research and create structured GitHub issues
- `/product-manager [idea]` - Transform ideas into product specs
- `/clean_branch` - Post-merge cleanup

**Workflow Agents** (10 total):
- Domain specialists: backend, frontend, database, llm
- Quality/security: test-specialist, security-analyst, performance-optimizer
- Documentation/planning: documentation-writer, plan-validator, gpt-5

### Meta-Learning Commands (9 commands)

Experimental self-improving system with telemetry-based learning.

**Architecture Principle**: Observes → Learns → Suggests → Implements → Evolves → Predicts

**Data Storage**: All telemetry stored in `plugins/psd-claude-meta-learning-system/meta/*.json` (git-ignored)
- `telemetry.json` - Command execution logs
- `experiments.json` - A/B test results
- `compound_history.json` - Improvement history
- `workflow_graph.json` - Agent workflow patterns
- `agent_variants.json` - Genetic algorithm variants

**Key Commands**:
- `/meta_analyze` - Pattern extraction from telemetry
- `/meta_learn` - Generate improvement suggestions
- `/meta_implement` - Auto-apply improvements (with dry-run)
- `/meta_evolve` - Genetic algorithm for agent improvement

### Telemetry Integration Architecture (NEW in v1.1.0)

**Hook-Based Automatic Telemetry** - Zero AI involvement, 100% reliable:

1. **SessionStart Hook** (`scripts/telemetry-init.sh`):
   - Runs when Claude Code session starts
   - Creates `meta/telemetry.json` if it doesn't exist
   - No output, silent initialization

2. **UserPromptSubmit Hook** (`scripts/telemetry-command.sh`):
   - Runs when user submits a prompt
   - Detects slash command execution (e.g., `/work`, `/test`, `/meta_analyze`)
   - Creates session state file in `meta/.session_state_{SESSION_ID}`
   - Records: command name, arguments, start time

3. **SubagentStop Hook** (`scripts/telemetry-agent.sh`):
   - Runs when a Task tool (agent) completes
   - Appends agent name to session state file
   - Tracks which agents were invoked during command execution

4. **Stop Hook** (`scripts/telemetry-track.sh`):
   - Runs when Claude finishes responding
   - Reads session state file
   - Calculates duration
   - Uses `jq` to UPSERT entry into `meta/telemetry.json`
   - Cleans up session state file

**Data Flow** (completely automatic):
```
User runs: /work 347
  ├─> UserPromptSubmit hook: Create session state
  ├─> Claude executes command workflow
  │    ├─> Invokes backend-specialist
  │    │    └─> SubagentStop hook: Add "backend-specialist" to session
  │    └─> Invokes test-specialist
  │         └─> SubagentStop hook: Add "test-specialist" to session
  ├─> Claude finishes responding
  └─> Stop hook: Finalize and write to telemetry.json
```

**Key Advantages**:
- **Reliable**: Hooks always execute (no AI involvement)
- **Zero Config**: Works automatically on plugin install
- **Privacy-Safe**: Only metadata collected, never code content
- **Graceful**: Uses `jq` if available, degrades gracefully if not
- **Local Only**: All data stays in git-ignored `meta/` folder

**Privacy Safeguards**:
- All data stored locally in git-ignored `meta/` folder
- Only metadata collected (never code, issues, commits, personal info)
- User can opt-out by not installing meta-learning or disabling in config
- No external network requests

## Development Commands

### Testing the Marketplace

```bash
# Install locally for testing
/plugin marketplace add ~/non-ic-code/psd-claude-coding-system
/plugin install psd-claude-coding-system
/plugin list

# Verify command availability
/work 1  # Test with dummy issue number

# Check telemetry hooks installed
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/

# Uninstall for clean testing
/plugin uninstall psd-claude-coding-system
/plugin marketplace remove psd-claude-coding-system
```

### Publishing to GitHub

```bash
# This is a git repository
git status
git add .
git commit -m "Detailed message"
git push origin main

# Users install via GitHub
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-workflow
```

### Modifying Commands or Agents

1. Edit the relevant `.md` file in `plugins/[plugin]/commands/` or `plugins/[plugin]/agents/`
2. Frontmatter YAML controls behavior (model, tools, extended-thinking, color)
3. Test changes by reinstalling: `/plugin uninstall [name]` then `/plugin install [name]`
4. No build step required - Claude Code reads markdown directly

### Testing Individual Commands

```bash
# Commands can only be tested after plugin installation
/plugin install psd-claude-workflow
/work "add logging to auth module"
/test auth
/compound_concepts
```

## Compound Engineering Principles

This system embodies compound engineering - every interaction creates improvement opportunities:

- Every bug → prevention system
- Every manual process → automation candidate
- Every solution → template for similar problems
- Every workflow → data for meta-learning system

Use `/compound_concepts` after completing work to extract systematization opportunities.

## Important Notes

### Git Workflow
- Always branch from `dev`, not `main` (see `/work` command Phase 2)
- Branch naming: `feature/[issue-number]-brief-description` for issues, `fix/brief-description` for quick fixes
- Detailed commit messages required (per user's global CLAUDE.md)

### Telemetry & Privacy
- Meta-learning telemetry is **git-ignored by default**
- Only logs: command names, durations, success/failure, file counts
- Never logs: code content, issue details, personal data
- Users can opt-out by not installing meta-learning plugin

### Model Selection Strategy
- **sonnet-4-5**: Default for commands, agents, and coding tasks (fast + capable)
- **opus-4-1**: Architecture and product-manager commands only (deep reasoning)
- **extended-thinking: true**: Enabled on all commands/agents for thorough analysis

## Future Development

Documentation stubs exist in `docs/` but are not yet written:
- GETTING_STARTED.md
- WORKFLOW_PLUGIN.md
- META_LEARNING_SYSTEM.md
- ARCHITECTURE.md

External planning docs referenced in README exist on user's Desktop but are not in repository.
