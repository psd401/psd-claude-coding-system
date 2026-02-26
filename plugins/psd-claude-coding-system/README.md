# PSD Claude Coding System

**Comprehensive AI-assisted development system for Peninsula School District**

Version: 1.20.1
Status: Production-Ready Workflows + Memory-Based Learning
Author: Kris Hagel (hagelk@psd401.net)

---

## What Is This?

A unified Claude Code plugin combining **battle-tested development workflows** with **memory-based learning** and **knowledge compounding**. Get immediate productivity gains from proven commands while the system captures learnings and compounds knowledge over time.

**One plugin. Three superpowers.**

1. **Workflow Automation** - 12 commands + 42 specialized agents
2. **Memory-Based Learning** - 2 meta commands + automatic learning capture
3. **Knowledge Compounding** - Capture and share learnings across projects

---

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install this plugin
/plugin install psd-claude-coding-system

# Start using workflow commands immediately
/work 347              # Implement an issue
/test                  # Run comprehensive tests
/review-pr 123         # Handle PR feedback
/compound              # Capture session learnings

# Review what the system has learned
/meta-health           # Quick system health check
/meta-review           # Deep analysis of learnings
```

---

## Workflow Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/work` | Implement solutions with auto reviews | `/work 347` or `/work "add logging"` |
| `/lfg` | Autonomous end-to-end: implement → test → review → fix → learn | `/lfg 347` or `/lfg "add caching"` |
| `/architect` | System architecture via architect-specialist | `/architect 347` |
| `/test` | Comprehensive testing with coverage validation | `/test auth` |
| `/review-pr` | Handle PR feedback systematically | `/review-pr 123` |
| `/security-audit` | Manual security audit (auto in /work) | `/security-audit 123` |
| `/issue` | AI-validated issues with spec flow analysis | `/issue "add caching"` |
| `/triage` | FreshService ticket to GitHub issue | `/triage 12345` |
| `/product-manager` | Validated specs to auto sub-issues | `/product-manager "dashboard"` |
| `/compound` | **NEW:** Capture session learnings | `/compound` |
| `/contribute-pattern` | **NEW:** Share universal patterns | `/contribute-pattern` |
| `/compound-concepts` | Find automation opportunities | `/compound-concepts` |
| `/clean-branch` | Cleanup + auto learning extraction | `/clean-branch` |

---

## Meta-Learning Commands

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/meta-review` | Analyze learnings + suggest improvements | Weekly/Monthly |
| `/meta-health` | Quick system health check | Anytime |

---

## AI Agents (42 total)

### Review Specialists (`agents/review/`)

| Agent | Purpose |
|-------|---------|
| `security-analyst` | Security vulnerability analysis |
| `security-analyst-specialist` | Comprehensive security review |
| `deployment-verification-agent` | Go/No-Go deployment checklists |
| `data-migration-expert` | ID mappings, foreign key validation |
| `agent-native-reviewer` | AI architecture parity checks |
| `architecture-strategist` | SOLID compliance, anti-pattern detection |
| `code-simplicity-reviewer` | YAGNI enforcement, complexity scoring |
| `pattern-recognition-specialist` | Code duplication detection |
| `schema-drift-detector` | ORM vs migration schema drift detection |
| `data-integrity-guardian` | PII/FERPA/GDPR compliance scanning |
| `typescript-reviewer` | TypeScript/JavaScript code review |
| `python-reviewer` | Python code review |
| `swift-reviewer` | Swift code review |
| `sql-reviewer` | SQL code review |

### Domain Specialists (`agents/domain/`)

| Agent | Purpose |
|-------|---------|
| `backend-specialist` | APIs, server logic, system integration |
| `frontend-specialist` | React, UI components, UX |
| `database-specialist` | Schema design, query optimization |
| `llm-specialist` | AI integration, prompt engineering |
| `ux-specialist` | 68 usability heuristics, accessibility |
| `architect-specialist` | Architecture design |
| `shell-devops-specialist` | Shell scripting, DevOps |

### Quality Assurance (`agents/quality/`)

| Agent | Purpose |
|-------|---------|
| `test-specialist` | Test coverage, automation, QA |
| `performance-optimizer` | Web vitals, API latency, Big O analysis, N+1 detection |
| `documentation-writer` | API docs, user guides |

### Research (`agents/research/`)

| Agent | Purpose |
|-------|---------|
| `spec-flow-analyzer` | Gap analysis, user flow mapping |
| `learnings-researcher` | Knowledge base search |
| `best-practices-researcher` | Two-phase knowledge lookup with deprecation validation |
| `framework-docs-researcher` | Framework/API deprecation checking |
| `git-history-analyzer` | Git archaeology, hot files, churn patterns |
| `repo-research-analyst` | Codebase onboarding and deep research |

### Workflow (`agents/workflow/`)

| Agent | Purpose |
|-------|---------|
| `bug-reproduction-validator` | Documented bug reproduction with evidence |
| `work-researcher` | Pre-implementation research orchestrator |
| `work-validator` | Post-implementation validation orchestrator |
| `learning-writer` | Automatic lightweight learning capture |

### External AI (`agents/external/`)

| Agent | Purpose |
|-------|---------|
| `gpt-5-codex` | GPT-5.3-Codex for second opinions |
| `gemini-3-pro` | Gemini 3.1 Pro for multimodal analysis |

### Meta (`agents/meta/`)

| Agent | Purpose |
|-------|---------|
| `meta-reviewer` | Analyzes learnings + agent memory for patterns |

### Validators (`agents/validation/`)

| Agent | Purpose |
|-------|---------|
| `plan-validator` | GPT-5 powered plan validation |
| `document-validator` | Data validation at boundaries |
| `configuration-validator` | Multi-file consistency |
| `breaking-change-validator` | Dependency analysis |
| `telemetry-data-specialist` | Data pipeline correctness |

---

## Knowledge Compounding System

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE CAPTURE SYSTEM                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Session Event           AI Synthesis                           │
│  ┌───────────────────┐  ┌───────────────────┐                  │
│  │ Error detected    │  │ /compound skill   │                  │
│  │ Rework observed   │  │ - Analyze session │                  │
│  │ User frustration  │──▶ - Extract pattern │                  │
│  │ Discovery made    │  │ - Generate doc    │                  │
│  └───────────────────┘  └─────────┬─────────┘                  │
│                                   │                             │
│                                   ▼                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    KNOWLEDGE STORES                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  Project-Specific           Plugin-Wide (Shared)          │ │
│  │  ./docs/learnings/          plugin/docs/patterns/         │ │
│  │  - Project patterns         - Common anti-patterns        │ │
│  │  - Domain knowledge         - Framework gotchas           │ │
│  │  - Team conventions         - Security patterns           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Capturing Learnings

After a session where you discovered something useful:

```bash
/compound
```

The system will:
1. Analyze the session for patterns
2. Extract what went wrong/right
3. Generate structured markdown with YAML frontmatter
4. Save to `./docs/learnings/[category]/[date]-[topic].md`

### Learning Document Format

```yaml
---
title: Short descriptive title
category: build-errors | test-failures | runtime-errors | performance | security | database | ui | integration | logic
tags: [framework, feature, pattern]
severity: critical | high | medium | low
date: YYYY-MM-DD
applicable_to: project | universal
---

## Summary
Brief description of what was learned.

## Problem
What went wrong or what was discovered.

## Solution
How it was resolved or what the insight means.

## Prevention
How to avoid this in the future.
```

### Sharing Universal Patterns

If a learning applies to all projects (not project-specific):

```bash
/contribute-pattern ./docs/learnings/build-errors/2026-01-22-vite-config-gotcha.md
```

This creates a PR to the plugin repository with the pattern.

---

## Language-Specific Reviews

The plugin automatically detects languages and invokes appropriate reviewers.

### Detection

Using `scripts/language-detector.sh`:

```bash
./scripts/language-detector.sh
# Output: typescript python sql migration
```

### Dual-Phase Review

**Light Mode** (in `/work` before PR):
- Quick critical checks only
- Blocks on security issues
- Fast turnaround

**Full Mode** (in `/review-pr`):
- Comprehensive deep analysis
- Style and best practices
- Performance considerations

### Supported Languages

| Language | Extensions | Focus Areas |
|----------|------------|-------------|
| TypeScript | `.ts`, `.tsx`, `.js`, `.jsx` | Types, null safety, async patterns, React |
| Python | `.py` | Type hints, async, security, imports |
| Swift | `.swift` | Optionals, memory, SwiftUI, concurrency |
| SQL | `.sql`, `*migration*` | Injection, performance, constraints |

---

## Enhanced Workflow Phases

### `/work` (v1.20.1 — Slim Orchestrator)

| Phase | Description |
|-------|-------------|
| 1 | Determine work type |
| **2** | **Create branch [REQUIRED]** (auto-detects default branch) |
| 3 | Research via work-researcher agent |
| 4 | Implementation + incremental commits + testing |
| 5 | Validation via work-validator agent |
| **6** | **Commit & Create PR [REQUIRED]** |
| 7 | Learning capture (conditional — 3+ errors, novel solution, etc.) |

### `/review-pr` (v1.20.1)

| Phase | Description |
|-------|-------------|
| 1 | Fetch PR details + inline comments |
| 2 | Parallel agent analysis (3 always-on + conditional) |
| 2.5 | Language-specific deep review |
| 2.6 | Deployment verification (if migrations) |
| 3 | Severity classification (P1/P2/P3) + fix |
| 4 | Update PR |
| 5 | Quality checks |
| 6 | Learning capture (conditional — recurring patterns, P1 issues) |

### `/test` (v1.20.1)

| Phase | Description |
|-------|-------------|
| 1 | Test analysis |
| 2 | Test execution |
| 3 | Write missing tests |
| 3.5 | UX testing validation (if UI components) |
| 4 | Quality gates |
| 4.5 | Self-healing retry loop (max 3 iterations) |
| 5 | Test documentation |
| 6 | Learning capture (conditional — self-healing activated, investigation needed) |

---

## Hooks

The plugin uses a single PostToolUse hook for automatic syntax validation:

| Hook | Trigger | What It Does |
|------|---------|--------------|
| `post-edit-validate.sh` | After Edit/Write | Validates `.ts/.tsx` (tsc), `.py` (py_compile), `.json` (jq) |

Non-blocking with 10s timeout. Exits cleanly for unknown file types.

---

## Typical Usage Flow

### Week 1-2: Learn the Commands

```bash
/work 347              # Implement feature
/test                  # Run tests
/review-pr 123         # Handle feedback
/clean-branch          # Cleanup

# If you learn something useful
/compound              # Capture it
```

### Ongoing: Review Learnings

```bash
# Quick health check
/meta-health

# Deep analysis of accumulated learnings
/meta-review
```

### Monthly: Knowledge Contribution

```bash
# Review captured learnings
ls ./docs/learnings/

# Share universal patterns
/contribute-pattern ./docs/learnings/security/2026-01-15-sql-injection-gotcha.md
```

---

## Installation

### From GitHub

```bash
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### Verify

```bash
/plugin list
# Should show: psd-claude-coding-system (v1.14.0)
```

### Configure FreshService (Optional)

```bash
cp ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/.freshservice.env.example ~/.claude/freshservice.env
# Edit with your credentials
/triage 12345
```

---

## Troubleshooting

### Commands Not Working

```bash
/plugin uninstall psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### Plugin Not Found

```bash
cd ~/.claude/plugins/marketplaces/psd-claude-coding-system
git pull origin main
/plugin install psd-claude-coding-system
```

---

## Privacy & Security

- Project learnings stored in `docs/learnings/` (committed to repo, you control what's captured)
- Agent memory stored locally by Claude Code in `.claude/agent-memory/`
- No telemetry collection — removed in v1.20.1
- Only hook is PostToolUse syntax validation (no data collection)
- No external network requests

---

## Compound Engineering Principles

Every interaction creates improvement opportunities:

- Every bug → prevention system
- Every manual process → automation candidate
- Every solution → template for similar problems
- Every workflow → data for meta-learning

Use `/compound` to capture learnings.

---

## Support

- **Issues**: https://github.com/psd401/psd-claude-coding-system/issues
- **Email**: hagelk@psd401.net

---

## License

MIT License - Peninsula School District
