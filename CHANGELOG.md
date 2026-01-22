# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.14.1] - 2026-01-22

### Fixed
- `learnings-researcher` agent now uses configured tools (Read, Grep, Glob) instead of bash commands
- Resolves "No such tool available: Bash" errors when agent is invoked

## [1.14.0] - 2026-01-22

### Added
- **Compound Engineering Integration** - Major update integrating best practices from Every's Compound Engineering plugin

**New Agents (9 total):**
- `deployment-verification-agent` - Go/No-Go checklists for risky deployments (migrations, schema changes)
- `data-migration-expert` - Validates ID mappings, foreign key integrity, data transformation logic
- `spec-flow-analyzer` - Gap analysis for feature specs, user flow permutations, edge case identification
- `agent-native-reviewer` - Validates AI-agent architecture parity, prompt consistency
- `learnings-researcher` - Searches knowledge base for relevant past learnings before implementation
- `typescript-reviewer` - Language-specific reviewer for TypeScript/JavaScript (light and full modes)
- `python-reviewer` - Language-specific reviewer for Python (type hints, async patterns, security)
- `swift-reviewer` - Language-specific reviewer for Swift (optionals, memory management, SwiftUI)
- `sql-reviewer` - Language-specific reviewer for SQL (injection prevention, performance, migrations)

**New Skills (2 total):**
- `/compound` - Capture learnings from current session for knowledge compounding
- `/contribute-pattern` - Share universal patterns to the plugin repository

**New Infrastructure:**
- `docs/patterns/` directory for plugin-wide universal patterns
- `scripts/language-detector.sh` for automatic language detection

### Changed
- **Agent Reorganization** - All 30 agents reorganized into category subdirectories:
  - `agents/review/` - 10 code review specialists
  - `agents/domain/` - 7 domain specialists
  - `agents/quality/` - 3 quality assurance agents
  - `agents/research/` - 2 research agents (NEW)
  - `agents/external/` - 2 external AI providers
  - `agents/meta/` - 3 meta-learning agents
  - `agents/validation/` - 5 validator agents

- **Enhanced `/work` skill** - Added three new phases:
  - Phase 1.5: Knowledge Lookup - Searches `docs/learnings/` and plugin patterns via `learnings-researcher`
  - Phase 4.3: Language-Specific Review - Light mode review before PR creation
  - Phase 4.4: Deployment Verification - Conditional checklist for migrations/schema changes

- **Enhanced `/review-pr` skill**:
  - Phase 2.5: Language-Specific Deep Review with full mode analysis
  - Phase 2.6: Deployment Verification for migration PRs
  - Auto-triggers based on file extensions in PR diff

- **Enhanced `/issue` skill**:
  - Phase 1.5: Spec Flow Analysis for complex user-flow features

- **Simplified telemetry-track.sh**:
  - Removed complex transcript parsing for errors/corrections
  - Added high-signal session detection
  - The `/compound` skill now handles sophisticated analysis

### Security
- Language reviewers check for SQL injection, XSS, command injection, and other OWASP vulnerabilities

## [1.13.2] - 2026-01-21

### Changed
- **Naming convention alignment** - All skill `name:` fields now use kebab-case to match directory names
  - `review_pr` → `review-pr`, `clean_branch` → `clean-branch`, `security_audit` → `security-audit`
  - `compound_concepts` → `compound-concepts`, `compound_plugin_analyzer` → `compound-plugin-analyzer`
  - `claude_code_updates` → `claude-code-updates`
  - All 10 `meta_*` skills → `meta-*` (meta-analyze, meta-learn, meta-implement, etc.)
- **Documentation updated** - All user-facing command references now use kebab-case invocations
  - README.md, all SKILL.md files, parallel-dispatch.md updated
- **Telemetry scripts updated** - `telemetry-command.sh` COMMAND_LIST now tracks kebab-case commands
  - Also added missing skills: triage, meta-compound-analyze, compound-plugin-analyzer, claude-code-updates

### Fixed
- Skill invocation commands now correctly match directory names per Claude Code 2.1.x conventions

## [1.13.1] - 2026-01-21

### Added
- **New `/compound_plugin_analyzer` skill** - Analyzes the Every Compound Engineering plugin and compares it to our plugin, generating prioritized improvement suggestions
  - Fetches remote plugin structure via WebFetch
  - Compares agents, skills, patterns, and commands
  - Outputs gap analysis with priorities and implementation roadmap
  - Supports optional focus area filtering (agents, skills, patterns, commands, safety)

## [1.13.0] - 2026-01-21

### Added
- **Skills Architecture Migration** - Aligned with Claude Code 2.1.x
  - All 20 commands migrated to `skills/<name>/SKILL.md` directory structure
  - New frontmatter fields: `context: fork`, `agent` type specification
  - Skills support hot-reload (changes apply without session restart)
- **New `/claude_code_updates` skill** - Analyzes Claude Code releases and recommends plugin improvements
- **Agent improvements**:
  - Added missing `color` fields to 8 agents (security-analyst, backend-specialist, frontend-specialist, database-specialist, documentation-writer, performance-optimizer, llm-specialist, test-specialist)
  - Fixed `security-analyst-specialist` missing `tools` field (added Bash, Read, Grep, Glob)

### Changed
- Directory structure: `commands/` deprecated in favor of `skills/`
- Updated CLAUDE.md with new skills-based architecture documentation
- All workflow and meta-learning commands now use skills format

### Deprecated
- `commands/` directory - all files migrated to `skills/`, directory kept for backwards compatibility

## [1.12.3] - 2026-01-20

### Fixed
- Correct hooks.json structure to enable telemetry collection

## [1.12.2] - 2026-01-19

### Added
- Gemini 3 Pro agent for multimodal analysis

## [1.12.1] - 2026-01-18

### Added
- Inline review comments feature for `/review_pr`

### Fixed
- Eliminated redundant API calls in `/review_pr`

## [1.12.0] - 2026-01-17

### Added
- UX Specialist Agent - evaluates UI against 68 usability heuristics from 7 HCI frameworks
- Automatic UX review auto-invoked for `/work`, `/product-manager`, `/review_pr`, `/architect`, `/test` when UI work detected

### Changed
- Upgraded `gpt-5-codex` and `plan-validator` agents to use gpt-5.2-pro model

## [1.11.0] - Previous

### Added
- Initial workflow automation system
- Meta-learning commands
- Telemetry integration via hooks
- Specialized domain agents

---

**Note**: For versions prior to 1.11.0, see git commit history.
