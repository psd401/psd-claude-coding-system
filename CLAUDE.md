# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is the **PSD Claude Coding System** - a unified Claude Code plugin for Peninsula School District combining:

1. **Workflow Automation** (Stable) - 15 skills + specialized agents
2. **Memory-Based Learning** - Automatic learning capture + `/evolve` for analysis

**Version**: 1.23.0
**Status**: ✅ Production-Ready Workflows + 🧪 Memory-Based Learning

### NEW in v1.15.0 - Compound Engineering Analysis + Implementation

**New Skill:**
- `/scope` - Scope classification and tiered planning on-ramp (tasks/issues/PRD)

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
All 42 agents organized into category subdirectories:
- `agents/review/` - 14 code review specialists
- `agents/domain/` - 7 domain specialists
- `agents/quality/` - 3 quality assurance agents
- `agents/research/` - 6 research agents
- `agents/workflow/` - 4 workflow agents
- `agents/external/` - 2 external AI providers
- `agents/meta/` - 1 meta-reviewer agent
- `agents/validation/` - 5 validator agents

**Knowledge Compounding System:**
- Project learnings: `./docs/learnings/`
- Plugin patterns: `plugins/.../docs/patterns/`
- Adaptive high-signal detection for `/compound` suggestions

**Memory-Based Learning (v1.19.0):**
- Automatic learning capture in `/work`, `/test`, `/review-pr`
- `memory: project` on key agents for cross-session knowledge
- `/meta-review` and `/meta-health` replace 9 broken meta-* skills

## Architecture

### Unified Plugin Structure

The plugin follows Claude Code 2.1.x architecture with skills-based organization:
```
plugins/psd-claude-coding-system/
  ├── .claude-plugin/
  │   └── plugin.json           # Plugin metadata (v1.15.0)
  ├── skills/                   # 15 user-invocable skills
  │   ├── work/SKILL.md         # Main implementation workflow
  │   ├── lfg/SKILL.md          # Autonomous end-to-end workflow
  │   ├── evolve/SKILL.md       # Auto-evolve (learnings, releases, comparison) (NEW v1.21.0)
  │   ├── test/SKILL.md         # Testing and validation
  │   ├── review-pr/SKILL.md    # PR feedback handling
  │   ├── architect/SKILL.md    # Architecture design
  │   ├── issue/SKILL.md        # Issue creation with research
  │   ├── product-manager/SKILL.md  # Product specs
  │   ├── security-audit/SKILL.md   # Security review
  │   ├── scope/SKILL.md        # Scope classification + planning
  │   ├── brainstorm/SKILL.md   # Collaborative requirements exploration (NEW v1.23.0)
  │   ├── worktree/SKILL.md     # Git worktree management (NEW v1.23.0)
  │   ├── swarm/SKILL.md        # Parallel agent orchestration (NEW v1.23.0)
  │   ├── triage/SKILL.md       # FreshService ticket triage
  │   └── clean-branch/SKILL.md # Post-merge cleanup
  ├── agents/                   # 42 specialized AI agents (organized by category)
  │   ├── review/               # 14 code review specialists
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
  │   │   ├── sql-reviewer.md
  │   │   ├── schema-drift-detector.md  (NEW v1.17.0)
  │   │   └── data-integrity-guardian.md  (NEW v1.17.0)
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
  │   ├── research/             # 6 research agents
  │   │   ├── learnings-researcher.md
  │   │   ├── spec-flow-analyzer.md
  │   │   ├── best-practices-researcher.md  (NEW v1.15.0)
  │   │   ├── framework-docs-researcher.md  (NEW v1.15.0)
  │   │   ├── git-history-analyzer.md  (NEW v1.17.0)
  │   │   └── repo-research-analyst.md  (NEW v1.17.0)
  │   ├── workflow/             # 4 workflow agents
  │   │   ├── bug-reproduction-validator.md
  │   │   ├── work-researcher.md
  │   │   ├── work-validator.md
  │   │   └── learning-writer.md  (NEW v1.19.0)
  │   ├── external/             # 2 external AI providers
  │   │   ├── gpt-5-codex.md
  │   │   └── gemini-3-pro.md
  │   ├── meta/                 # 1 meta agent
  │   │   └── meta-reviewer.md  (rewritten from meta-orchestrator v1.19.0)
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
  │   └── hooks.json            # PostToolUse syntax validation hook
  ├── scripts/
  │   ├── post-edit-validate.sh # PostToolUse hook — validates .ts/.tsx/.py/.json
  │   └── language-detector.sh  # Language detection utility
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
- Contain YAML frontmatter with name, description, tools, model, color, memory
- `memory: project` gives agents persistent cross-session knowledge
- Organized into categories: review, domain, quality, research, workflow, external, meta, validation
- Focused on specific domains (backend, frontend, security, testing, etc.)
- Run autonomously with specific tool access

**DEPRECATED: Commands** (in `commands/` directory) have been migrated to skills

### Workflow Commands (9 commands)

Production-ready workflows using latest Claude models (sonnet-4-6, opus-4-6) with extended-thinking enabled.

#### NEW in v1.11.2
- **UX Specialist Agent** - Evaluates UI against 68 usability heuristics from 7 HCI frameworks
- **Automatic UX review** - `/work`, `/product-manager`, `/review_pr`, `/architect`, `/test` auto-invoke for UI work
- **GPT-5.3-Codex upgrade** - Updated `gpt-5-codex` and `plan-validator` agents to use gpt-5.3-codex model

#### In v1.7.0
- **Opus 4.6** used for architecture/planning (upgraded from Opus 4.5 in v1.16.0)
- **Aggressive parallelism** - 2-3 agents dispatched simultaneously (Every's philosophy: speed > cost)
- **Pre-implementation security** - Security review before coding, not after PR
- **Skills layer** - Reusable workflow components for common patterns

**Command Workflow Pattern**: Most commands follow this structure:
1. **Phase 1**: Context gathering (git status, issue details, file analysis)
2. **Phase 2**: Setup (branch creation, dependency checks)
3. **Phase 3**: Implementation (may invoke specialized agents)
4. **Phase 4**: Validation (tests, commits, PRs)

**Key Commands**:
- `/work [issue-number|description]` - Slim orchestrator (~192 lines) backed by work-researcher + work-validator agents
- `/architect [issue-number|topic]` - Architecture design using opus-4-6 with parallel context gathering
- `/test [scope]` - Comprehensive testing with coverage validation
- `/review_pr [number]` - PR feedback handling with parallel categorization (v1.7.0)
- `/evolve` - Auto-evolve: analyzes learnings, checks releases, compares plugins, contributes patterns
- `/security_audit` - Security review and vulnerability analysis
- `/issue [description]` - Research and create GitHub issues (opus-4-6)
- `/product-manager [idea]` - Transform ideas into product specs (opus-4-6)
- `/clean_branch` - Post-merge cleanup

#### Agents by Category (42 total)

**Review Agents** (14 total) - `agents/review/`:
- **Security**: security-analyst, security-analyst-specialist
- **Deployment**: deployment-verification-agent, data-migration-expert
- **Architecture**: agent-native-reviewer, architecture-strategist
- **Code Quality**: code-simplicity-reviewer, pattern-recognition-specialist
- **Schema & Data**: schema-drift-detector, data-integrity-guardian
- **Language-Specific**: typescript-reviewer, python-reviewer, swift-reviewer, sql-reviewer

**Domain Specialists** (7 total) - `agents/domain/`:
- backend-specialist, frontend-specialist, database-specialist, llm-specialist
- ux-specialist (68 usability heuristics, accessibility, cognitive load)
- architect-specialist, shell-devops-specialist

**Quality Agents** (3 total) - `agents/quality/`:
- test-specialist (`memory: project`), performance-optimizer, documentation-writer

**Research Agents** (6 total) - `agents/research/`:
- learnings-researcher (`memory: project`) - Searches knowledge base before implementation
- spec-flow-analyzer - Gap analysis for feature specs
- best-practices-researcher - Two-phase knowledge lookup with deprecation validation
- framework-docs-researcher - Framework/API deprecation checking
- git-history-analyzer - Git archaeology for blame, churn, hot file detection
- repo-research-analyst - Codebase onboarding and deep research

**Workflow Agents** (4 total) - `agents/workflow/`:
- bug-reproduction-validator - Documented bug reproduction with evidence
- work-researcher (`memory: project`) - Pre-implementation research orchestrator dispatching 5+ sub-agents
- work-validator - Post-implementation validation orchestrator for language reviews and deployment checks
- learning-writer (`memory: project`) - Automatic lightweight learning capture (NEW v1.19.0)

**External AI** (2 total) - `agents/external/`:
- gpt-5-codex (GPT-5.3-Codex), gemini-3-pro (Gemini 3.1 Pro)

**Meta Agent** (1 total) - `agents/meta/`:
- meta-reviewer (`memory: project`) - Analyzes learnings and agent memory for patterns and improvements (rewritten v1.19.0)

**Validator Agents** (5 total) - `agents/validation/`:
- plan-validator, document-validator, configuration-validator
- breaking-change-validator, telemetry-data-specialist

### Skills Layer (Updated v1.13.0)

Skills are now the primary user-facing interface. There are two types:

**User-Invocable Skills** (15 total, in `skills/<name>/SKILL.md`):
- `/work` - Slim orchestrator with work-researcher and work-validator agents + always-run learning capture
- `/lfg` - Autonomous end-to-end workflow: implement → test → review → fix → learn
- `/test` - Comprehensive testing with self-healing retry loop + always-run learning capture
- `/review-pr` - PR feedback handling with 3 always-on review agents + always-run learning capture
- `/architect` - Architecture design
- `/brainstorm` - Collaborative requirements exploration before /scope or /work (NEW v1.23.0)
- `/issue` - GitHub issue creation
- `/product-manager` - Product specifications
- `/security-audit` - Security review
- `/scope` - Scope classification and tiered planning on-ramp
- `/evolve` - Auto-evolve: analyzes learnings, checks releases, compares plugins, contributes patterns
- `/worktree` - Git worktree management for parallel development (NEW v1.23.0)
- `/swarm` - Parallel agent team orchestration (NEW v1.23.0)
- `/clean-branch` - Post-merge cleanup
- `/triage` - FreshService ticket triage

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

**parallel-dispatch.md** - Multi-agent coordination
- Auto-detect which agents to invoke based on context
- Pattern for parallel Task tool invocations
- Synthesize multiple agent responses
- Track parallelism for telemetry

### Memory-Based Learning System (v1.19.0)

Replaced the previous telemetry-based meta-learning system (which never produced real data) with a memory-based approach.

**Architecture Principle**: Implement → Detect patterns → Capture learnings → Review → Improve

**How It Works**:

1. **Automatic Learning Capture** — `/work`, `/test`, `/review-pr`, `/lfg` always invoke the `learning-writer` agent (the agent handles deduplication and novelty detection)
2. **Cross-Session Memory** — 5 agents have `memory: project` for persistent knowledge (learnings-researcher, work-researcher, test-specialist, learning-writer, meta-reviewer)
3. **On-Demand Analysis** — `/evolve` auto-picks the highest-value action: deep pattern analysis, release gap check, plugin comparison, pattern contribution, or automation concepts

**Data Flow**:
```
/work, /test, /review-pr, /lfg (always-run)
  └── learning-writer agent
        ├── Deduplicates against docs/learnings/
        └── Writes docs/learnings/{category}/{date}-{slug}.md

/evolve (on-demand, zero-argument auto-decision)
  ├── Priority 1: ≥8 unanalyzed learnings → meta-reviewer agent (opus)
  ├── Priority 2: Release check stale → fetch Claude Code changelog
  ├── Priority 3: Universal learnings not contributed → offer PR
  ├── Priority 4: Plugin comparison stale → compare vs Every's plugin
  ├── Priority 5: No recent learnings → extract automation concepts
  └── Priority 6: Everything current → show health dashboard
```

**Key Command**:
- `/evolve` - Auto-picks highest-value action based on `.evolve-state.json` timestamps

### Context7 MCP Server (v1.20.0)

The plugin configures a Context7 MCP server providing live framework documentation for 100+ frameworks. No API key required.

**Tools available:**
- `resolve-library-id` — Find the Context7 ID for a framework/library
- `query-docs` — Query live documentation for a specific library

**Configuration** (in `plugin.json`):
```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

### Swarm Orchestration (v1.20.0 — Documentation Only)

Agent Teams (experimental) enable leader/teammate/inbox patterns for parallel agent coordination. Documented in `docs/patterns/swarm-orchestration.md`. No code changes in v1.20.0 — manual opt-in via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`.

### Hooks

**PostToolUse Hook** (`scripts/post-edit-validate.sh`):
- Runs after Edit or Write tool calls (matcher: `Edit|Write`)
- Validates file syntax by extension: `.ts/.tsx` (tsc), `.py` (py_compile), `.json` (jq)
- Non-blocking, 10s timeout, exits cleanly for unknown file types

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
  │       ├── skills/         # 15 user-invocable skills
  │       ├── agents/         # 42 AI agents
  │       │   ├── review/     # 14 review agents
  │       │   ├── domain/     # 7 domain specialists
  │       │   ├── quality/    # 3 quality agents
  │       │   ├── research/   # 6 research agents
  │       │   ├── workflow/   # 4 workflow agents
  │       │   ├── external/   # 2 external AI
  │       │   ├── meta/       # 1 meta-reviewer
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

# Check hooks installed
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
/evolve
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
# Should show: post-edit-validate.sh, language-detector.sh
```

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

Use `/evolve` to analyze accumulated learnings and improve the plugin.

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

### Learning Data & Privacy
- Project learnings stored in `docs/learnings/` (committed to repo)
- Agent memory stored by Claude Code in `.claude/agent-memory/` (local only)
- `meta/` directory is git-ignored
- Only the PostToolUse hook runs automatically (syntax validation on Edit/Write)
- No telemetry collection — removed in v1.19.0

### Model Selection Strategy
- **sonnet-4-6**: Default for commands, agents, and coding tasks (fast + capable)
- **opus-4-6**: Architecture, planning, meta-review, and product-manager commands (deep reasoning)
- **extended-thinking: true**: Enabled on all commands/agents for thorough analysis
- **memory: project**: Enabled on key agents for cross-session knowledge retention

## Future Development

Documentation stubs exist in `docs/` but are not yet written:
- GETTING_STARTED.md
- WORKFLOW_PLUGIN.md
- META_LEARNING_SYSTEM.md
- ARCHITECTURE.md

External planning docs referenced in README exist on user's Desktop but are not in repository.
