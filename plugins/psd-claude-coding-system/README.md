# PSD Claude Coding System

**Comprehensive AI-assisted development system for Peninsula School District**

Version: 1.1.1
Status: ✅ Production-Ready Workflows + 🧪 Experimental Meta-Learning
Author: Kris Hagel (hagelk@psd401.net)

---

## What Is This?

A unified Claude Code plugin combining **battle-tested development workflows** with **self-improving meta-learning**. Get immediate productivity gains from proven commands while the system learns your patterns and suggests improvements over time.

**One plugin. Two superpowers.**

1. **Workflow Automation** - 9 commands + 10 workflow specialist agents
2. **Meta-Learning** - 9 commands + 5 meta-learning agents that learn from your usage

---

## Quick Start

```bash
# Install the marketplace
/plugin marketplace add psd401/psd-claude-coding-system

# Install this plugin (one command!)
/plugin install psd-claude-coding-system

# Start using workflow commands immediately
/work 347              # Implement an issue
/test                  # Run comprehensive tests
/review_pr 123         # Handle PR feedback

# After 2-4 weeks, check what the system learned
/meta_health           # System status
/meta_analyze          # Your patterns
/meta_learn            # Improvement suggestions
```

---

## Workflow Commands (Use Immediately)

| Command | Description | Example |
|---------|-------------|---------|
| `/work` | Implement solutions for issues or quick fixes | `/work 347` or `/work "add logging"` |
| `/architect` | System architecture & technical decision making | `/architect 347` |
| `/test` | Comprehensive testing with coverage validation | `/test auth` |
| `/review_pr` | Handle PR feedback systematically | `/review_pr 123` |
| `/security_audit` | Security review and vulnerability analysis | `/security_audit` |
| `/issue` | Research and create structured GitHub issues | `/issue "add caching"` |
| `/product-manager` | Transform ideas into product specs | `/product-manager "user dashboard"` |
| `/compound_concepts` | Find automation opportunities | `/compound_concepts` |
| `/clean_branch` | Post-merge cleanup | `/clean_branch` |

---

## Meta-Learning Commands (After 2-4 Weeks)

| Command | Description | When to Use |
|---------|-------------|-------------|
| `/meta_health` | Check system status | Daily/Weekly |
| `/meta_analyze` | Find patterns in your workflow | Weekly |
| `/meta_learn` | Get improvement suggestions | Weekly |
| `/meta_implement` | Apply improvements safely | As needed |
| `/meta_improve` | Full weekly improvement pipeline | Weekly (automated) |
| `/meta_document` | Auto-update documentation | As needed |
| `/meta_predict` | Forecast future issues | Monthly |
| `/meta_experiment` | A/B test ideas safely | Advanced |
| `/meta_evolve` | Improve AI agents | Monthly |

---

## AI Agents

### Workflow Specialists

**Domain Experts:**
- `backend-specialist` - APIs, server logic, system integration
- `frontend-specialist` - React, UI components, UX
- `database-specialist` - Schema design, query optimization
- `llm-specialist` - AI integration, prompt engineering

**Quality & Security:**
- `security-analyst` - Vulnerability analysis, security hardening
- `test-specialist` - Test coverage, automation, QA
- `performance-optimizer` - Web vitals, API latency, system performance

**Documentation & Planning:**
- `documentation-writer` - API docs, user guides, architecture docs
- `plan-validator` - Validate technical plans iteratively
- `gpt-5` - Second opinions for complex problem solving

### Meta-Learning Specialists

- `meta-orchestrator` - Coordinates other agents optimally
- `code-cleanup-specialist` - Finds and removes dead code
- `pr-review-responder` - Handles feedback from multiple reviewers
- `document-validator` - Validates data at system boundaries
- `breaking-change-validator` - Prevents accidental breakage

---

## Automatic Telemetry (NEW in v1.1.0)

**Zero configuration required!** The system automatically tracks your usage via hooks:

### How It Works

Every time you run a command:
1. **UserPromptSubmit hook** detects slash command execution
2. **SubagentStop hook** tracks which agents were invoked
3. **Stop hook** records duration and success/failure
4. **Data written** to `meta/telemetry.json` automatically

### What Gets Tracked

✅ **Collected** (privacy-safe):
- Command names (`/work`, `/test`, etc.)
- Duration (how long each took)
- Success/failure status
- Agents invoked
- File counts (not names or content)
- Test counts

❌ **NOT Collected:**
- Your actual code
- File names or paths
- Issue descriptions
- Personal information
- API keys or secrets

### Example Telemetry

```json
{
  "command": "/work",
  "duration_seconds": 720,
  "success": true,
  "agents_invoked": ["backend-specialist", "test-specialist"],
  "metadata": {
    "files_changed": 8,
    "tests_added": 12
  }
}
```

**Privacy**: All data stays local in `meta/` folder (git-ignored).

---

## Typical Usage Flow

### Week 1-2: Learn the Commands

```bash
# Work on features
/work 347

# Run tests
/test

# Handle reviews
/review_pr 123

# Clean up
/clean_branch
```

**Behind the scenes**: System quietly observes via hooks (you do nothing).

### Week 3: First Analysis

```bash
# See what patterns emerged
/meta_analyze

# Output example:
# - You ran /work 23 times (avg 18 min)
# - You always run /test after /work (92%)
# - Security bugs always involve auth/ directory
```

### Week 4: First Suggestions

```bash
# Get improvement ideas
/meta_learn

# Output example:
# SUGGESTION #1: Combine /work and /test
#   Confidence: 94%
#   Time savings: 5 min per task = 115 min/month
#   To apply: /meta_implement suggestion-1 --dry-run
```

### Month 2+: Weekly Improvements

```bash
# Monday morning routine (15 minutes)
/meta_improve

# System automatically:
# ✓ Analyzes patterns
# ✓ Generates suggestions
# ✓ Auto-implements high-confidence improvements
# ✓ Creates PR for your review
# ✓ Evolves agents to be smarter

# You just review and merge the PR
gh pr merge <number>
```

**Result**: 15-40 hours saved monthly through compound improvements.

---

## Compound Engineering Principles

This system embodies compound engineering:
- Every bug → prevention system
- Every manual process → automation candidate
- Every solution → template for similar problems
- Every workflow → data for meta-learning

Use `/compound_concepts` to extract systematization opportunities.

---

## Installation

### From GitHub (Recommended)

```bash
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### From Local Directory

```bash
/plugin marketplace add ~/path/to/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### Verify Installation

```bash
/plugin list
# Should show: psd-claude-coding-system (v1.1.0)

# Test a command
/meta_health
```

---

## What's New

### v1.1.1 (Bug Fix)

**CRITICAL FIX**: Telemetry hooks now work correctly!

- Fixed UserPromptSubmit hook field name (`prompt` not `user_prompt`)
- Commands are now properly tracked in telemetry.json
- All users should update to this version

### v1.1.0 (Major Release)

### Hook-Based Telemetry

Previously, commands had bash blocks trying to call telemetry functions. This was unreliable because Claude doesn't always execute bash blocks.

**Now**: Hooks automatically track commands via `hooks/hooks.json`:
- `SessionStart` - Initialize telemetry file
- `UserPromptSubmit` - Detect slash command execution
- `SubagentStop` - Track agent invocations
- `Stop` - Finalize and write telemetry entry

**Benefit**: 100% reliable telemetry collection without AI involvement.

### Unified Plugin

Previously: Two separate plugins (`psd-claude-workflow` + `psd-claude-meta-learning-system`)

**Now**: One plugin with everything:
- Simpler installation (one command)
- Unified versioning
- Tighter integration
- Less confusion

---

## Privacy & Security

**Local Only**:
- All data stays on your machine
- No external network requests
- Git-ignored by default

**Opt-Out Options**:

```bash
# Option 1: Just use workflow commands, no telemetry
# (Meta-learning won't work without data)

# Option 2: Clear data periodically
rm meta/telemetry.json
```

**View Your Data**:

```bash
# Check what's being collected
cat meta/telemetry.json | jq .

# Or use meta commands for readable reports
/meta_health --dashboard
```

---

## Examples

### Example 1: Implement a Feature

```bash
# Start work on issue #347
/work 347

# System automatically:
# ✓ Fetches issue details
# ✓ Creates feature branch from dev
# ✓ Implements solution following project patterns
# ✓ Invokes backend-specialist and test-specialist
# ✓ Tracks telemetry: duration, agents used, files changed
```

### Example 2: Weekly Improvement

```bash
# After using the system for a month
/meta_improve

# Output:
# [1/9] Analyzing 127 events...
#   ✓ Found 12 patterns
# [2/9] Generating suggestions...
#   ✓ 3 high-confidence suggestions
# [3/9] Auto-implementing improvements...
#   ✓ Parallel PR review agents (saves 15 hr/month)
#   ✓ Auto-cleanup after refactoring (saves 2 hr/month)
# [4/9] Evolving agents...
#   ✓ security-analyst v5: 95% success rate (+1%)
# [5/9] Creating PR...
#   ✓ PR #462 created

# You review and merge
gh pr view 462
gh pr merge 462
```

---

## Troubleshooting

### Commands Not Working

```bash
# Check installation
/plugin list

# Reinstall if needed
/plugin uninstall psd-claude-coding-system
/plugin install psd-claude-coding-system
```

### No Telemetry Data

```bash
# Check system status
/meta_health

# If "Events: 0" after using commands:
# 1. Check hooks are installed
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/

# 2. Check if jq is installed (required for JSON manipulation)
which jq
# If not: brew install jq (macOS) or apt install jq (Linux)

# 3. Check meta directory exists
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/
```

### No Patterns Detected

**Cause**: Not enough usage data yet.

**Solution**: Use commands for 2-4 weeks (need 20-30 executions minimum).

### Plugin Installation Issues

**"Plugin not found in any marketplace"**

This usually means Claude Code's plugin cache is stale or marketplace.json doesn't match the actual plugin structure.

**Solution:**
```bash
# 1. Force refresh the marketplace
cd ~/.claude/plugins/marketplaces/psd-claude-coding-system
git pull origin main

# 2. Retry installation
/plugin install psd-claude-coding-system
```

**If that doesn't work (Nuclear Option):**
```bash
# Exit Claude Code completely, then:
mv ~/.claude/plugins ~/.claude/plugins.backup
# Restart Claude Code, then:
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system
```

---

## Support

- **Issues**: https://github.com/psd401/psd-claude-coding-system/issues
- **Email**: hagelk@psd401.net
- **Documentation**: This README + command-specific docs

---

## License

MIT License - Peninsula School District

---

## Summary

The **PSD Claude Coding System** gives you immediate productivity gains through proven workflow commands while quietly learning your patterns and suggesting improvements over time. Install once, use immediately, see compound benefits within weeks.

**Get Started**:
1. Install: `/plugin install psd-claude-coding-system`
2. Use: `/work`, `/test`, `/review_pr` (like normal)
3. After 2-4 weeks: `/meta_improve` (weekly)
4. Watch productivity compound over time

Happy coding! 🚀
