# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.20.0] - 2026-02-18

### Added
- **Context7 MCP server** - Live framework docs for 100+ frameworks via `resolve-library-id` and `query-docs` tools. Configured in plugin.json, no API key required
- **`/lfg` skill** - Autonomous end-to-end workflow: implement → test → review → fix → learn. Delegates 5 of 10 phases to Task agents for context budget management. Dispatches test-specialist, work-validator, security-analyst-specialist, and language reviewers
- **Swarm orchestration documentation** - `docs/patterns/swarm-orchestration.md` documenting Agent Teams (experimental) leader/teammate/inbox pattern for future integration

### Changed
- **Learning capture now always-run** - `/work` (Phase 7), `/test` (Phase 6), `/review-pr` (Phase 6) always dispatch learning-writer agent instead of conditional triggers. Agent handles deduplication and novelty detection internally
- **plugin.json description/keywords cleaned** - Removed stale "telemetry", "self-improving", "meta-learning" references from plugin.json and marketplace.json
- **Skill count** 17 → 18 (added `/lfg`)

## [1.19.0] - 2026-02-18

### Added
- **`learning-writer` agent** (workflow) - Lightweight automatic learning capture agent with `memory: project`. Deduplicates against existing learnings and writes to `docs/learnings/{category}/`
- **`meta-reviewer` agent** (meta) - Deep analysis of accumulated learnings and agent memory. Uses opus-4-6 with `memory: project` and extended-thinking. Complete rewrite of the former meta-orchestrator
- **`/meta-review` skill** - On-demand analysis of accumulated learnings, producing prioritized improvement roadmaps via meta-reviewer agent
- **Conditional learning capture** in `/work` (Phase 7), `/test` (Phase 6), `/review-pr` (Phase 6) — triggers only when notable patterns detected (3+ errors, self-healing activated, P1 issues found, etc.)
- **`memory: project`** frontmatter on 4 agents: learnings-researcher, work-researcher, test-specialist, learning-writer, meta-reviewer — enables cross-session knowledge retention

### Changed
- **Sonnet 4.5 → 4.6** - Upgraded `claude-sonnet-4-5` to `claude-sonnet-4-6` across all 51 agent and skill files
- **`/meta-health` rewritten** - Replaced 759-line aspirational dashboard with simple, honest health check that counts learnings, lists agent memory files, and shows recent activity
- **hooks.json stripped** to PostToolUse only — removed SessionStart, UserPromptSubmit, SubagentStop, and Stop hook events
- **Agent counts** updated: 43 → 42 total, meta 3 → 1, workflow 3 → 4
- **Skill counts** updated: 25 → 17 total (removed 9 meta-*, added /meta-review, rewrote /meta-health)
- **Model strategy** updated in CLAUDE.md to reference sonnet-4-6 as default

### Removed
- **9 meta-* skills** that never worked on real data: meta-analyze, meta-learn, meta-implement, meta-experiment, meta-evolve, meta-document, meta-predict, meta-improve, meta-compound-analyze
- **2 dead meta agents**: code-cleanup-specialist, pr-review-responder
- **4 telemetry scripts**: telemetry-init.sh, telemetry-command.sh, telemetry-agent.sh, telemetry-track.sh (telemetry.json was always empty)
- **Telemetry architecture section** from CLAUDE.md (hooks data flow diagram, debugging instructions for telemetry)
- **Stale telemetry references** from /test and /review-pr skills

## [1.18.0] - 2026-02-05

### Added
- **New agents (2):**
  - `work-researcher` (workflow) - Pre-implementation research orchestrator that dispatches learnings-researcher, repo-research-analyst, best-practices-researcher, git-history-analyzer, test-specialist, domain specialists, security-analyst, and ux-specialist in parallel
  - `work-validator` (workflow) - Post-implementation validation orchestrator that dispatches language reviewers in LIGHT mode and deployment/migration validators based on changed files
- **`/test` self-healing loop** - Phase 4.5 "Fix & Retry Loop" automatically categorizes test failures as FIXABLE or NOT_FIXABLE, applies targeted fixes, and retries (max 3 iterations)
- **Post-edit validation hook** - PostToolUse hook (`scripts/post-edit-validate.sh`) validates syntax after Edit/Write operations: `.ts/.tsx` via tsc, `.py` via py_compile, `.json` via jq. Non-blocking with 10s timeout

### Changed
- **Refactored `/work` skill** from 594 lines to ~192 lines — decomposed into slim 6-phase orchestrator backed by work-researcher and work-validator agents. Research phases (1.5, 1.55, 1.6, 2.5, 2.6) collapsed into single work-researcher Task call. Validation phases (4.3, 4.4) collapsed into single work-validator Task call. Critical steps (branch creation Phase 2, commit/PR Phase 6) marked with `[REQUIRED — DO NOT SKIP]` headers
- **`/work` auto-detects default branch** via `gh repo view --json defaultBranchRef` instead of hardcoding `dev`
- **`/work` uses `git push -u origin HEAD`** for simpler push that works with any branch name
- **Updated agent counts** from 41 to 43 across all documentation (CLAUDE.md, README.md, plugins/README.md)
- **Workflow agents category** expanded from 1 to 3 agents

## [1.17.0] - 2026-02-05

### Added
- **New agents (4):**
  - `git-history-analyzer` (research) - Git archaeology agent for blame analysis, change velocity, hot file detection, fix-on-fix patterns, and ownership mapping
  - `repo-research-analyst` (research) - Codebase onboarding and deep research for architecture mapping, tech stack identification, and convention discovery
  - `schema-drift-detector` (review) - ORM-agnostic schema drift detection comparing model definitions, migrations, and raw SQL schemas across Prisma, Django, SQLAlchemy, TypeORM, Drizzle, and ActiveRecord
  - `data-integrity-guardian` (review) - PII and compliance scanning for GDPR, FERPA (K-12 education), sensitive data handling, and access control validation

### Changed
- **Enhanced `performance-optimizer` agent** - Added Big O complexity analysis (flag O(n^2)+ in hot paths), scalability projections (10x/100x load estimates), sub-200ms response time targets, memory leak pattern detection (unbounded caches, event listener leaks, closure captures), and database N+1 query detection with ORM-specific fix patterns
- **Enhanced `/work` skill** - Added Phase 1.55 (codebase research for unfamiliar repos via repo-research-analyst), Phase 2.5 (git history analysis for existing files via git-history-analyzer), Phase 4.4 schema-drift-detector alongside deployment-verification
- **Enhanced `/architect` skill** - Added repo-research-analyst invocation in parallel during Phase 1 context gathering for codebase structure context
- **Enhanced `/review-pr` skill** - Added conditional schema-drift-detector (triggers on migration/schema/ORM changes) and data-integrity-guardian (triggers on PII-related file changes) in Phase 2 parallel agent dispatch
- **Enhanced `/security-audit` skill** - Added Step 1.5 data-integrity-guardian invocation for PII/FERPA/GDPR compliance scanning on every security audit
- **Corrected agent counts** - Fixed total from 38 to 41, review from 13 to 14, research from 4 to 6 (previous counts were inaccurate)

## [1.16.0] - 2026-02-05

### Fixed
- **Critical: Agent subagent_type path resolution** - All subagent_type references in skill files now include category subdirectory prefixes (e.g., `psd-claude-coding-system:security-analyst-specialist` → `psd-claude-coding-system:review:security-analyst-specialist`). The v1.14.0 agent reorganization into category subdirectories broke agent invocation from skills that still used flat paths. Affected skills: `/security-audit`, `/work`, `/test`, `/issue`, `/architect`, `/product-manager`, `/review-pr`, plus `parallel-dispatch.md` and `security-scan.md` helper skills.

### Changed
- **Upgraded all Opus model references from 4.5 to 4.6** - Updated `claude-opus-4-5-20251101` → `claude-opus-4-6` across 16 skill frontmatter files, 3 agent files (plan-validator, architect-specialist, meta-orchestrator), and 2 agent documentation references (configuration-validator, agent-native-reviewer). Opus 4.6 is the latest frontier model available in Claude Code 2.1.32+.

## [1.15.2] - 2026-01-29

### Changed
- **Renamed `/plan` skill to `/scope`** - Resolves collision with Claude Code's built-in `/plan` command (which enters plan mode). The skill's core value is scope classification + tiered routing to execution, making `/scope` a more accurate name.
- Skill directory: `skills/plan/` → `skills/scope/`
- Frontmatter: `name: plan` → `name: scope`
- All documentation references updated (CLAUDE.md, README.md, plugin README)

## [1.15.1] - 2026-01-29

### Fixed
- hooks.json schema corrected to use nested `"hooks"` array wrapper required by Claude Code validator
- Previous flat format caused "expected array, received undefined" validation errors on plugin load

## [1.15.0] - 2026-01-29

### Added
- **New `/plan` skill** - Flexible planning on-ramp with tiered output (tasks/issues/PRD), scope classification, parallel research, and execution routing
- **New agents (6)**:
  - `best-practices-researcher` - Two-phase knowledge lookup (local → online) with mandatory deprecation validation
  - `framework-docs-researcher` - Framework/API deprecation checking with traffic-light status output
  - `bug-reproduction-validator` - Documented bug reproduction with evidence collection and root cause verification
  - `architecture-strategist` - SOLID compliance review and anti-pattern detection with structured checklists
  - `code-simplicity-reviewer` - YAGNI enforcement, complexity scoring, and simplification recommendations
  - `pattern-recognition-specialist` - Code duplication detection with threshold-based analysis (50+ tokens)
- New `agents/workflow/` category directory for workflow-specific agents
- `docs/learnings/` directory (was referenced by `/work` and `/compound` but missing)

### Changed
- **Enhanced `/review-pr`** - Massive parallelism with 3 new always-on review agents (architecture-strategist, code-simplicity-reviewer, pattern-recognition-specialist) + P1/P2/P3 severity classification output + conditional agent activation (data-migration-expert only for migrations, bug-reproduction-validator only for bug PRs)
- **Enhanced `/work`** - Incremental commit heuristic in Phase 3 ("Can I write a complete commit message right now?") + risk-based external research routing in Phase 1.6 for security/payments/auth topics via best-practices-researcher
- **Enhanced `/compound`** - YAML validation gates (Phase 4.5) block saving until frontmatter is complete and valid, with auto-fix for date/severity/title-length and re-prompting for missing required sections
- Updated CLAUDE.md with accurate agent/skill counts (38 agents, 25 skills) and new components

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
