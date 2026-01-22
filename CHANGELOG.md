# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
