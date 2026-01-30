# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **PSD Claude Coding System** - a unified Claude Code plugin for Peninsula School District combining:

1. **Workflow Automation** (Stable) - 9 battle-tested commands + 10 workflow specialist agents
2. **Meta-Learning System** (Experimental) - 10 commands + 5 meta-learning agents that learn from usage

**Version**: 1.15.0
**Status**: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning

### NEW in v1.15.0 - Compound Engineering Analysis + Implementation

**New Skill:**
- `/plan` - Flexible planning on-ramp with tiered output (tasks/issues/PRD)

**New Agents (6):**
- `best-practices-researcher` - Two-phase knowledge lookup with deprecation validation
- `framework-docs-researcher` - Framework/API deprecation checking
- `bug-reproduction-validator` - Documented bug reproduction with evidence (new `agents/workflow/` category)
- `architecture-strategist` - SOLID compliance + anti-pattern detection
- `code-simplicity-reviewer` - YAGNI enforcement + complexity scoring
- `pattern-recognition-specialist` - Code duplication detection

**Enhanced Workflows:**
- `/review-pr` gains massive parallelism (3 always-on review agents) + P1/P2/P3 severity output + conditional agent activation
- `/work` gains incremental commit heuristic (Phase 3) + risk-based external research routing (Phase 1.6)
- `/compound` gains YAML validation gates blocking save until frontmatter is complete and valid

**Agent Organization:**
All 38 agents organized into category subdirectories:
- `agents/review/` - 13 code review specialists
- `agents/domain/` - 7 domain specialists
- `agents/quality/` - 3 quality assurance agents
- `agents/research/` - 4 research agents
- `agents/workflow/` - 1 workflow agent
- `agents/external/` - 2 external AI providers
- `agents/meta/` - 3 meta-learning agents
- `agents/validation/` - 5 validator agents

**Knowledge Compounding System:**
- Project learnings: `./docs/learnings/`
- Plugin patterns: `plugins/.../docs/patterns/`
- Adaptive high-signal detection for `/compound` suggestions

**Simplified Telemetry:**
- Removed complex transcript parsing (now handled by `/compound`)
- High-signal session detection for learning capture suggestions

## Architecture

### Unified Plugin Structure

The plugin follows Claude Code 2.1.x architecture with skills-based organization:
```
plugins/psd-claude-coding-system/
  ├── .claude-plugin/
  │   └── plugin.json           # Plugin metadata (v1.15.0)
  ├── skills/                   # 25 user-invocable skills
  │   ├── work/SKILL.md         # Main implementation workflow
  │   ├── test/SKILL.md         # Testing and validation
  │   ├── review-pr/SKILL.md    # PR feedback handling
  │   ├── architect/SKILL.md    # Architecture design
  │   ├── issue/SKILL.md        # Issue creation with research
  │   ├── product-manager/SKILL.md  # Product specs
  │   ├── security-audit/SKILL.md   # Security review
  │   ├── plan/SKILL.md         # Flexible planning on-ramp (NEW v1.15.0)
  │   ├── compound/SKILL.md     # Knowledge capture
  │   ├── contribute-pattern/SKILL.md  # Pattern sharing
  │   ├── claude-code-updates/SKILL.md  # Release monitoring
  │   └── meta-*/SKILL.md       # 10 meta-learning skills
  ├── agents/                   # 38 specialized AI agents (organized by category)
  │   ├── review/               # 13 code review specialists
  │   │   ├── security-analyst.md
  │   │   ├── security-analyst-specialist.md
  │   │   ├── deployment-verification-agent.md
  │   │   ├── data-migration-expert.md
  │   │   ├── agent-native-reviewer.md
  │   │   ├── architecture-strategist.md  (NEW v1.15.0)
  │   │   ├── code-simplicity-reviewer.md  (NEW v1.15.0)
  │   │   ├── pattern-recognition-specialist.md  (NEW v1.15.0)
  │   │   ├── typescript-reviewer.md
  │   │   ├── python-reviewer.md
  │   │   ├── swift-reviewer.md
  │   │   └── sql-reviewer.md
  │   ├── domain/               # 7 domain specialists
  │   │   ├── backend-specialist.md
  │   │   ├── frontend-specialist.md
  │   │   ├── database-specialist.md
  │   │   ├── llm-specialist.md
  │   │   ├── ux-specialist.md
  │   │   ├── architect-specialist.md
  │   │   └── shell-devops-specialist.md
  │   ├── quality/              # 3 quality assurance
  │   │   ├── test-specialist.md
  │   │   ├── performance-optimizer.md
  │   │   └── documentation-writer.md
  │   ├── research/             # 4 research agents
  │   │   ├── learnings-researcher.md
  │   │   ├── spec-flow-analyzer.md
  │   │   ├── best-practices-researcher.md  (NEW v1.15.0)
  │   │   └── framework-docs-researcher.md  (NEW v1.15.0)
  │   ├── workflow/             # 1 workflow agent (NEW v1.15.0)
  │   │   └── bug-reproduction-validator.md  (NEW v1.15.0)
  │   ├── external/             # 2 external AI providers
  │   │   ├── gpt-5-codex.md
  │   │   └── gemini-3-pro.md
  │   ├── meta/                 # 3 meta-learning agents
  │   │   ├── meta-orchestrator.md
  │   │   ├── code-cleanup-specialist.md
  │   │   └── pr-review-responder.md
  │   └── validation/           # 5 validator agents
  │       ├── plan-validator.md
  │       ├── document-validator.md
  │       ├── configuration-validator.md
  │       ├── breaking-change-validator.md
  │       └── telemetry-data-specialist.md
  ├── docs/
  │   ├── learnings/            # Project learnings (NEW v1.15.0)
  │   └── patterns/             # Plugin-wide patterns
  ├── hooks/
  │   └── hooks.json            # Automatic telemetry collection
  ├── scripts/
  │   ├── telemetry-init.sh     # SessionStart hook
  │   ├── telemetry-command.sh  # UserPromptSubmit hook
  │   ├── telemetry-agent.sh    # SubagentStop hook
  │   ├── telemetry-track.sh    # Stop hook (simplified v1.14.0)
  │   └── language-detector.sh  # Language detection (NEW v1.14.0)
  ├── meta/                     # Telemetry data (git-ignored)
  └── README.md                 # Plugin documentation
```

### Skills vs Agents Pattern (Claude Code 2.1.x)

**Skills** are user-facing workflows invoked with `/skill-name`:
- Located in `skills/<name>/SKILL.md` directory structure
- Contain YAML frontmatter with new fields:
  - `name`: Skill identifier
  - `description`: What the skill does
  - `argument-hint`: Usage hint shown to user
  - `model`: Which Claude model to use
  - `context: fork`: Run in isolated subagent context
  - `agent`: Agent type when forking (Explore, Plan, general-purpose)
  - `allowed-tools`: YAML list of permitted tools
  - `extended-thinking`: Enable deep reasoning
- Include bash scripts and structured workflows
- May invoke agents via the Task tool for specialized work
- Support hot-reload (changes apply without session restart)

**Agents** are specialized AI assistants invoked by skills or other Claude Code instances:
- Located in `agents/<category>/<name>.md` (reorganized v1.14.0)
- Contain YAML frontmatter with name, description, tools, model, color
- Organized into categories: review, domain, quality, research, workflow, external, meta, validation
- Focused on specific domains (backend, frontend, security, testing, etc.)
- Run autonomously with specific tool access

**DEPRECATED: Commands** (in `commands/` directory) have been migrated to skills

### Workflow Commands (9 commands)

Production-ready workflows using latest Claude models (sonnet-4-5, opus-4-5) with extended-thinking enabled.

#### NEW in v1.11.2
- **UX Specialist Agent** - Evaluates UI against 68 usability heuristics from 7 HCI frameworks
- **Automatic UX review** - `/work`, `/product-manager`, `/review_pr`, `/architect`, `/test` auto-invoke for UI work
- **GPT-5.2-pro upgrade** - Updated `gpt-5-codex` and `plan-validator` agents to use gpt-5.2-pro model

#### In v1.7.0
- **Opus 4.5** used for architecture/planning (80.9% SWE-bench, 66% cost reduction vs opus-4-1)
- **Aggressive parallelism** - 2-3 agents dispatched simultaneously (Every's philosophy: speed > cost)
- **Pre-implementation security** - Security review before coding, not after PR
- **Skills layer** - Reusable workflow components for common patterns

**Command Workflow Pattern**: Most commands follow this structure:
1. **Phase 1**: Context gathering (git status, issue details, file analysis)
2. **Phase 2**: Setup (branch creation, dependency checks)
3. **Phase 3**: Implementation (may invoke specialized agents)
4. **Phase 4**: Validation (tests, commits, PRs)

**Key Commands**:
- `/work [issue-number|description]` - Main implementation workflow with parallel agent analysis (v1.7.0: always 2-3 agents)
- `/architect [issue-number|topic]` - Architecture design using opus-4-5 with parallel context gathering
- `/test [scope]` - Comprehensive testing with coverage validation
- `/review_pr [number]` - PR feedback handling with parallel categorization (v1.7.0)
- `/compound_concepts` - Finds automation/systematization opportunities
- `/security_audit` - Security review and vulnerability analysis
- `/issue [description]` - Research and create GitHub issues (opus-4-5)
- `/product-manager [idea]` - Transform ideas into product specs (opus-4-5)
- `/clean_branch` - Post-merge cleanup

#### Agents by Category (38 total)

**Review Agents** (13 total) - `agents/review/`:
- **Security**: security-analyst, security-analyst-specialist
- **Deployment**: deployment-verification-agent, data-migration-expert
- **Architecture**: agent-native-reviewer, architecture-strategist (NEW v1.15.0)
- **Code Quality**: code-simplicity-reviewer (NEW v1.15.0), pattern-recognition-specialist (NEW v1.15.0)
- **Language-Specific**: typescript-reviewer, python-reviewer, swift-reviewer, sql-reviewer

**Domain Specialists** (7 total) - `agents/domain/`:
- backend-specialist, frontend-specialist, database-specialist, llm-specialist
- ux-specialist (68 usability heuristics, accessibility, cognitive load)
- architect-specialist, shell-devops-specialist

**Quality Agents** (3 total) - `agents/quality/`:
- test-specialist, performance-optimizer, documentation-writer

**Research Agents** (4 total) - `agents/research/`:
- learnings-researcher - Searches knowledge base before implementation
- spec-flow-analyzer - Gap analysis for feature specs
- best-practices-researcher (NEW v1.15.0) - Two-phase knowledge lookup with deprecation validation
- framework-docs-researcher (NEW v1.15.0) - Framework/API deprecation checking

**Workflow Agents** (1 total) - `agents/workflow/` (NEW v1.15.0):
- bug-reproduction-validator (NEW v1.15.0) - Documented bug reproduction with evidence

**External AI** (2 total) - `agents/external/`:
- gpt-5-codex (GPT-5.2-pro), gemini-3-pro (Gemini 3 Pro)

**Meta-Learning Agents** (3 total) - `agents/meta/`:
- meta-orchestrator, code-cleanup-specialist, pr-review-responder

**Validator Agents** (5 total) - `agents/validation/`:
- plan-validator, document-validator, configuration-validator
- breaking-change-validator, telemetry-data-specialist

### Skills Layer (Updated v1.13.0)

Skills are now the primary user-facing interface. There are two types:

**User-Invocable Skills** (in `skills/<name>/SKILL.md`):
- `/work` - Main implementation workflow (enhanced v1.15.0: incremental commits, risk-based research)
- `/test` - Comprehensive testing
- `/review-pr` - PR feedback handling (enhanced v1.15.0: 3 always-on review agents, P1/P2/P3 severity)
- `/architect` - Architecture design
- `/issue` - GitHub issue creation
- `/product-manager` - Product specifications
- `/security-audit` - Security review
- `/plan` - **NEW v1.15.0** - Flexible planning on-ramp with tiered output
- `/compound` - Capture learnings for knowledge compounding (enhanced v1.15.0: validation gates)
- `/contribute-pattern` - Share patterns to plugin repository
- `/compound-concepts` - Automation opportunities
- `/clean-branch` - Post-merge cleanup
- `/triage` - FreshService ticket triage
- `/claude-code-updates` - Analyze Claude Code releases
- `/meta-*` - 10 meta-learning skills

**Reusable Workflow Components** (helper skills):

**git-workflow.md** - Git operations (branching, committing, PR creation)
- Standardizes branch naming (feature/N-desc, fix/desc)
- Handles issue vs quick-fix commit patterns
- PR creation with proper templates

**test-runner.md** - Universal test execution
- Auto-detects framework (Jest, Vitest, pytest, cargo, go test)
- Runs specific suites (unit, integration, e2e)
- Coverage reporting
- Quality checks (linting, type checking, formatting)

**security-scan.md** - Security analysis workflows
- Pre-implementation security guidance
- Post-PR security review
- Secret/vulnerability detection
- Security checklist validation

**telemetry-report.md** - Telemetry utilities
- Query command history
- Track parallel execution patterns
- Get recommendations from historical data

**parallel-dispatch.md** - Multi-agent coordination
- Auto-detect which agents to invoke based on context
- Pattern for parallel Task tool invocations
- Synthesize multiple agent responses
- Track parallelism for telemetry

### Meta-Learning Commands (9 commands)

Experimental self-improving system with telemetry-based learning.

**Architecture Principle**: Observes → Learns → Suggests → Implements → Evolves → Predicts

**Data Storage**: All telemetry stored in `plugins/psd-claude-coding-system/meta/*.json` (git-ignored)
- `telemetry.json` - Command execution logs (auto-generated by hooks)
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
- User can opt-out by disabling hooks or removing plugin
- No external network requests

## Marketplace Structure & Critical Files

### marketplace.json (CRITICAL)

Located at `.claude-plugin/marketplace.json`, this file is **essential** for Claude Code to discover plugins.

**Structure:**
```json
{
  "name": "psd-claude-coding-system",
  "owner": { "name": "...", "email": "..." },
  "metadata": {
    "description": "...",
    "version": "1.1.0",
    "pluginRoot": "./plugins"
  },
  "plugins": [
    {
      "name": "psd-claude-coding-system",
      "source": "./plugins/psd-claude-coding-system",
      "description": "...",
      "version": "1.1.0",
      "category": "productivity",
      "keywords": [...]
    }
  ]
}
```

**CRITICAL RULES:**

1. **plugins[] must match actual directory structure**
   - If you rename/merge plugins, update marketplace.json immediately
   - Each entry's `source` must point to an existing plugin directory
   - Version numbers should match plugin.json in each plugin

2. **Common mistake:** Deleting plugin directories but not updating marketplace.json
   - Symptom: "Plugin not found in any marketplace" error
   - Fix: Remove stale entries from `plugins[]` array

3. **When changing plugin structure:**
   - ✅ Update marketplace.json FIRST
   - ✅ Commit and push to GitHub
   - ✅ Force refresh in Claude Code: `cd ~/.claude/plugins/marketplaces/[name] && git pull`
   - ✅ Then run `/plugin install [name]`

### Repository Structure

```
psd-claude-coding-system/
  ├── .claude-plugin/
  │   └── marketplace.json    # CRITICAL - lists all plugins
  ├── plugins/
  │   └── psd-claude-coding-system/
  │       ├── .claude-plugin/
  │       │   └── plugin.json # Plugin metadata
  │       ├── skills/         # 25 user-invocable skills (v1.15.0)
  │       ├── agents/         # 38 AI agents (v1.15.0)
  │       │   ├── review/     # 13 review agents
  │       │   ├── domain/     # 7 domain specialists
  │       │   ├── quality/    # 3 quality agents
  │       │   ├── research/   # 4 research agents
  │       │   ├── workflow/   # 1 workflow agent (NEW v1.15.0)
  │       │   ├── external/   # 2 external AI
  │       │   ├── meta/       # 3 meta-learning
  │       │   └── validation/ # 5 validators
  │       ├── docs/
  │       │   ├── learnings/  # Project learnings
  │       │   └── patterns/   # Plugin-wide patterns
  │       ├── hooks/          # Hook configurations
  │       └── scripts/        # Hook scripts
  ├── README.md              # User-facing documentation
  └── CLAUDE.md              # THIS FILE - AI guidance
```

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
/plugin install psd-claude-coding-system
```

### Modifying Skills or Agents

1. Edit the relevant file:
   - Skills: `plugins/[plugin]/skills/<name>/SKILL.md`
   - Agents: `plugins/[plugin]/agents/<name>.md`
2. Frontmatter YAML controls behavior:
   - Skills: name, description, argument-hint, model, context, agent, allowed-tools, extended-thinking
   - Agents: name, description, tools, model, extended-thinking, color
3. Skills support hot-reload - changes apply without reinstalling
4. No build step required - Claude Code reads markdown directly

### Testing Individual Commands

```bash
# Commands can only be tested after plugin installation
/plugin install psd-claude-coding-system
/work "add logging to auth module"
/test auth
/compound_concepts
```

### Troubleshooting Plugin Installation

**Problem: "Plugin not found in any marketplace"**

This means marketplace.json doesn't list the plugin or points to wrong path.

**Solution:**
1. Verify marketplace.json lists the plugin:
   ```bash
   cat .claude-plugin/marketplace.json | jq '.plugins[].name'
   ```
2. Verify plugin directory exists:
   ```bash
   ls -la plugins/psd-claude-coding-system/.claude-plugin/
   ```
3. If mismatch, update marketplace.json and push
4. Force refresh:
   ```bash
   cd ~/.claude/plugins/marketplaces/psd-claude-coding-system
   git pull origin main
   ```
5. Retry install:
   ```bash
   /plugin install psd-claude-coding-system
   ```

**Problem: Old plugins still showing up**

Claude Code caches plugin metadata in `~/.claude/settings.json`.

**Solution (Nuclear Option):**
1. Exit Claude Code completely
2. Backup and remove cache:
   ```bash
   mv ~/.claude/plugins ~/.claude/plugins.backup
   ```
3. Restart Claude Code (recreates plugins/ directory)
4. Re-add marketplace:
   ```bash
   /plugin marketplace add psd401/psd-claude-coding-system
   /plugin install psd-claude-coding-system
   ```

**Problem: Plugin installs but commands don't work**

Check hooks are installed:
```bash
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/
# Should show: hooks.json

ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/scripts/
# Should show: telemetry-*.sh files
```

**Problem: Hooks not firing / telemetry not collecting**

Hooks were fixed in v1.1.2. If you're on an older version, update:

```bash
cd ~/.claude/plugins/marketplaces/psd-claude-coding-system
git pull origin main
/plugin uninstall psd-claude-coding-system
/plugin install psd-claude-coding-system
# Restart Claude Code for hooks to take effect
```

**Debugging hooks:**
1. Check hooks are registered (they load at startup):
   ```bash
   ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/hooks.json
   ```

2. Verify scripts are executable:
   ```bash
   ls -la ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/scripts/*.sh
   # All should have 'x' permission
   ```

3. Test hooks manually:
   ```bash
   cd ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system
   echo '{"session_id":"test"}' | ./scripts/telemetry-init.sh
   ls -la meta/telemetry.json  # Should exist
   ```

4. Check if telemetry is being collected:
   ```bash
   cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/telemetry.json | jq '.executions | length'
   # Should show number of tracked commands
   ```

**Note**: Hooks load at Claude Code startup. Changes to hooks require restarting Claude Code.

### hooks.json Format (CRITICAL)

The `hooks.json` file structure is critical. Each event array must contain objects with a nested `hooks` array.

**Correct format:**
```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          { "type": "command", "command": "...", "timeout": 5 }
        ]
      }
    ]
  }
}
```

**WRONG format (won't work):**
```json
{
  "hooks": {
    "SessionStart": [
      { "type": "command", "command": "...", "timeout": 5 }
    ]
  }
}
```

Hook definitions must be wrapped in a `"hooks"` array inside each event entry. Placing them directly in the event array causes validation errors.

## Compound Engineering Principles

This system embodies compound engineering - every interaction creates improvement opportunities:

- Every bug → prevention system
- Every manual process → automation candidate
- Every solution → template for similar problems
- Every workflow → data for meta-learning system

Use `/compound_concepts` after completing work to extract systematization opportunities.

## Important Notes

### Version Management

**CRITICAL**: Always bump version numbers when making changes to the plugin!

**Version bumping locations** (update ALL of these):
1. `plugins/psd-claude-coding-system/.claude-plugin/plugin.json` - `"version": "X.Y.Z"`
2. `.claude-plugin/marketplace.json` - `metadata.version` AND `plugins[0].version`
3. `CLAUDE.md` - `**Version**: X.Y.Z` in Repository Overview section
4. `README.md` - `**Version**: X.Y.Z` (may have multiple instances, use replace_all)
5. `plugins/psd-claude-coding-system/README.md` - `Version: X.Y.Z`
6. **CHANGELOG.md** - Add new version section at top with date and changes (REQUIRED)

**Semantic versioning:**
- **Major (2.0.0)**: Breaking changes, incompatible API changes
- **Minor (1.2.0)**: New features, backward compatible
- **Patch (1.1.1)**: Bug fixes, backward compatible

**When to bump:**
- ✅ After fixing bugs (patch: 1.1.0 → 1.1.1)
- ✅ After adding features (minor: 1.1.0 → 1.2.0)
- ✅ After breaking changes (major: 1.1.0 → 2.0.0)

**CHANGELOG.md format** (Keep a Changelog standard):
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features

### Changed
- Changes to existing functionality

### Deprecated
- Features to be removed in future

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security improvements
```

**Example commit:**
```bash
git add [all 6 files above including CHANGELOG.md]
git commit -m "chore: Bump version to X.Y.Z ([reason])"
git push origin main
```

**Release tagging** (REQUIRED for all version bumps):
```bash
# Create annotated tag with release summary
git tag -a vX.Y.Z -m "Release vX.Y.Z - Brief description

- Key change 1
- Key change 2
- Key change 3"

# Push tag to origin
git push origin vX.Y.Z
```

**Tag naming convention:**
- Always prefix with `v` (e.g., `v1.13.0`)
- Use annotated tags (`-a`) with descriptive messages
- Push tags immediately after creating them

**Complete release workflow:**
1. Update all 6 version locations listed above
2. Add CHANGELOG.md entry
3. Commit: `git commit -m "chore: Bump version to X.Y.Z ([reason])"`
4. Push: `git push origin main`
5. Tag: `git tag -a vX.Y.Z -m "Release summary..."`
6. Push tag: `git push origin vX.Y.Z`

### Git Workflow
- Always branch from `dev`, not `main` (see `/work` command Phase 2)
- Branch naming: `feature/[issue-number]-brief-description` for issues, `fix/brief-description` for quick fixes
- Detailed commit messages required (per user's global CLAUDE.md)

### Telemetry & Privacy
- Meta-learning telemetry is **git-ignored by default** (in `meta/` folder)
- Only logs: command names, durations, success/failure, file counts
- Never logs: code content, issue details, personal data
- Collected automatically via hooks (v1.1.0+)
- Users can opt-out by disabling hooks or removing plugin

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
