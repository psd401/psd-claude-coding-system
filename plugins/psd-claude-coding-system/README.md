# PSD Claude Coding System

**Comprehensive AI-assisted development system for Peninsula School District**

Version: 1.18.0
Status: Production-Ready Workflows + Experimental Meta-Learning
Author: Kris Hagel (hagelk@psd401.net)

---

## What Is This?

A unified Claude Code plugin combining **battle-tested development workflows** with **self-improving meta-learning** and **knowledge compounding**. Get immediate productivity gains from proven commands while the system learns your patterns and compounds knowledge over time.

**One plugin. Three superpowers.**

1. **Workflow Automation** - 11 commands + 43 specialized agents
2. **Meta-Learning** - 10 commands that learn from your usage
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

# After 2-4 weeks, check what the system learned
/meta-health           # System status
/meta-analyze          # Your patterns
/meta-learn            # Improvement suggestions
```

---

## Workflow Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/work` | Implement solutions with auto reviews | `/work 347` or `/work "add logging"` |
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
| `/meta-health` | Check system status | Daily/Weekly |
| `/meta-analyze` | Find patterns in your workflow | Weekly |
| `/meta-learn` | Get improvement suggestions | Weekly |
| `/meta-implement` | Apply improvements safely | As needed |
| `/meta-improve` | Full weekly improvement pipeline | Weekly (automated) |
| `/meta-document` | Auto-update documentation | As needed |
| `/meta-predict` | Forecast future issues | Monthly |
| `/meta-experiment` | A/B test ideas safely | Advanced |
| `/meta-evolve` | Improve AI agents | Monthly |
| `/meta-compound-analyze` | Analyze compound learnings | Monthly |

---

## AI Agents (43 total)

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

### External AI (`agents/external/`)

| Agent | Purpose |
|-------|---------|
| `gpt-5-codex` | GPT-5.2-pro for second opinions |
| `gemini-3-pro` | Gemini 3 Pro for multimodal analysis |

### Meta-Learning (`agents/meta/`)

| Agent | Purpose |
|-------|---------|
| `meta-orchestrator` | Coordinates agents optimally |
| `code-cleanup-specialist` | Dead code removal |
| `pr-review-responder` | Multi-reviewer synthesis |

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

### `/work` (v1.18.0 — Slim Orchestrator)

| Phase | Description |
|-------|-------------|
| 1 | Determine work type |
| **2** | **Create branch [REQUIRED]** (auto-detects default branch) |
| 3 | Research via work-researcher agent |
| 4 | Implementation + incremental commits + testing |
| 5 | Validation via work-validator agent |
| **6** | **Commit & Create PR [REQUIRED]** |

### `/review-pr` (v1.14.0)

| Phase | Description |
|-------|-------------|
| 1 | Fetch PR details |
| 2 | Parallel agent analysis |
| **2.5** | **NEW:** Language-specific deep review |
| **2.6** | **NEW:** Deployment verification (if migrations) |
| 3 | Synthesize feedback |
| 4 | Apply changes |

### `/issue` (v1.14.0)

| Phase | Description |
|-------|-------------|
| 1 | Research and context |
| **1.5** | **NEW:** Spec flow analysis (if complex feature) |
| 2 | Issue creation |

---

## Automatic Telemetry

**Zero configuration required!** The system automatically tracks usage via hooks.

### What Gets Tracked

| Collected | NOT Collected |
|-----------|---------------|
| Command names | Your actual code |
| Duration | File names or paths |
| Success/failure | Issue descriptions |
| Agents invoked | Personal information |
| File counts | API keys or secrets |

### High-Signal Session Detection

The telemetry system detects sessions worth capturing:
- Tool errors (`is_error: true`)
- User negative sentiment
- Multiple edit retries (>3x same file)
- Long duration (>2x average)

When detected, suggests running `/compound`.

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

### Week 3+: Meta-Learning

```bash
# Weekly routine
/meta-improve

# Or step by step
/meta-analyze          # Find patterns
/meta-learn            # Get suggestions
/meta-implement        # Apply improvements
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

### No Telemetry Data

```bash
# Check hooks installed
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/

# Check jq installed
which jq
# If not: brew install jq (macOS)
```

### Plugin Not Found

```bash
cd ~/.claude/plugins/marketplaces/psd-claude-coding-system
git pull origin main
/plugin install psd-claude-coding-system
```

---

## Privacy & Security

- All data stays local in `meta/` folder (git-ignored)
- No external network requests
- Only metadata collected, never code content
- Opt-out by disabling hooks or removing plugin

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
