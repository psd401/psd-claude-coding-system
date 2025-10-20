# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **PSD Claude Coding System** - a marketplace containing two Claude Code plugin systems for Peninsula School District:

1. **psd-claude-workflow** (v1.0.0, Stable) - Production-ready development workflow automation
2. **psd-claude-meta-learning-system** (v0.1.0, Experimental) - Self-improving AI system that learns from usage

## Architecture

### Plugin Structure

Each plugin follows Claude Code's plugin architecture:
```
plugins/[plugin-name]/
  ├── .claude-plugin/
  │   └── plugin.json          # Plugin metadata
  ├── commands/                 # Slash commands (*.md)
  ├── agents/                   # Specialized AI agents (*.md)
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

### psd-claude-workflow Plugin

Production-ready workflow with 9 commands and 10 agents, all using latest Claude models (sonnet-4-5, opus-4-1) with extended-thinking enabled.

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

**Agent Specializations**:
- Domain specialists: backend, frontend, database, llm
- Quality/security: test-specialist, security-analyst, performance-optimizer
- Planning: plan-validator (validates plans using codex), gpt-5 (second opinions)

### psd-claude-meta-learning-system Plugin

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

### Telemetry Integration Architecture

**How the plugins work together**:

1. **Workflow commands initialize telemetry** (Phase 0 in each command):
   ```bash
   source lib/telemetry-helper.sh
   TELEMETRY_SESSION=$(telemetry_init "/work" "$ARGUMENTS")
   ```

2. **Agents report their invocation** (automatically to parent session):
   ```bash
   telemetry_track_agent "backend-specialist"
   ```

3. **Commands finalize with metadata** (at completion):
   ```bash
   telemetry_set_metadata "files_changed" "8"
   telemetry_finalize "$TELEMETRY_SESSION" "success" "$DURATION"
   ```

**Telemetry Helper Library** (`psd-claude-workflow/lib/telemetry-helper.sh`):
- **Plugin Discovery**: Dynamically finds meta-learning plugin (no hardcoded paths)
- **Graceful Degradation**: Commands work perfectly without meta-learning installed
- **Privacy-Safe**: Only collects metadata (counts, durations), never code content
- **Session Management**: Unique session IDs, error trapping, automatic cleanup

**Data Flow**:
```
/work command
  ├─> Phase 0: Initialize telemetry session
  ├─> Phase 1-4: Execute workflow
  │    ├─> Invoke backend-specialist → reports to session
  │    └─> Invoke test-specialist → reports to session
  ├─> Collect metadata (files_changed, tests_added)
  └─> Finalize session → Append to meta/telemetry.json
```

**Detection Logic**:
```bash
# Find plugins directory relative to current plugin (no hardcoded paths)
WORKFLOW_PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PLUGINS_DIR="$(dirname "$WORKFLOW_PLUGIN_DIR")"
META_PLUGIN_DIR="$PLUGINS_DIR/psd-claude-meta-learning-system"

# Check if meta-learning plugin exists and is enabled
if [ -d "$META_PLUGIN_DIR" ] && [ -f "$META_PLUGIN_DIR/.claude-plugin/plugin.json" ]; then
  TELEMETRY_ENABLED=true
else
  TELEMETRY_ENABLED=false
fi
```

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
/plugin install psd-claude-workflow
/plugin list

# Verify command availability
/work --help

# Uninstall for clean testing
/plugin uninstall psd-claude-workflow
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
