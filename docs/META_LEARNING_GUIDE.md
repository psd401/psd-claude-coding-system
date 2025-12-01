# Meta-Learning System Usage Guide

**Version**: 1.9.0
**Status**: 🧪 Experimental
**Last Updated**: 2025-11-30

## Overview

The PSD Claude Coding System includes a **self-improving meta-learning system** that learns from your development workflow and automatically suggests improvements. This guide explains how to use the meta commands and establish a routine for continuous improvement.

**Key Principle**: The system **observes** → **learns** → **suggests** → **implements** → **evolves** → **predicts**

## Table of Contents

- [Quick Start](#quick-start)
- [Command Reference](#command-reference)
- [Recommended Schedules](#recommended-schedules)
- [Command Dependencies](#command-dependencies)
- [Usage Workflows](#usage-workflows)
- [Troubleshooting](#troubleshooting)
- [Data Privacy](#data-privacy)

## Quick Start

### First Time Setup

1. **Install the plugin** (if not already installed):
   ```bash
   /plugin marketplace add psd401/psd-claude-coding-system
   /plugin install psd-claude-coding-system
   ```

2. **Use the system normally** for 1-2 weeks:
   ```bash
   /work 347          # Implement issues
   /test              # Run tests
   /review_pr 123     # Handle PR feedback
   /clean_branch      # Clean up after merge (triggers compound learning)
   ```

3. **Telemetry automatically collects** (via hooks, zero AI involvement):
   - Command names and durations
   - Success/failure rates
   - Agent invocations
   - File counts (no code content)

4. **After 1-2 weeks, check system health**:
   ```bash
   /meta_health       # View dashboard
   ```

5. **Run your first analysis**:
   ```bash
   /meta_analyze --since 7d
   /meta_learn        # Generate improvement suggestions
   ```

## Command Reference

### Core Meta Commands

#### 1. `/meta_health` - System Health Dashboard

**Purpose**: View comprehensive system metrics and health status

**When to run**: Weekly (Monday mornings) or on-demand

**Dependencies**: None (reads all meta data sources)

**Usage**:
```bash
/meta_health                              # Basic dashboard
/meta_health --publish                     # Save to docs/
/meta_health --output dashboard.md         # Custom output location
```

**Outputs**:
- Compound engineering metrics (auto-improvements, success rates)
- Developer velocity (current vs baseline, time saved)
- System intelligence (agent evolution, patterns learned)
- Code quality trends (test coverage, technical debt)
- Active experiments status
- High-confidence predictions
- ROI summary (investment vs returns)

**Example output**:
```markdown
📊 System Health - 2025-11-30
Status: 🟢 Healthy
Velocity: 2.3x (↑35% vs baseline)
Compound ROI: 9.4x
Time Saved This Month: 47 hours
```

---

#### 2. `/meta_analyze` - Pattern Detection

**Purpose**: Analyze telemetry data to detect patterns, bottlenecks, and optimization opportunities

**When to run**: Weekly (every Friday) or after significant development cycles

**Dependencies**: Requires telemetry data (auto-collected via hooks)

**Usage**:
```bash
/meta_analyze                              # All time analysis
/meta_analyze --since 7d                   # Last week only
/meta_analyze --command work               # Analyze specific command
/meta_analyze --since 30d --output analysis.md  # Custom output
```

**Outputs**:
- Activity summary (commands executed, success rates)
- Pattern detection (agent correlations, time bottlenecks)
- Workflow inefficiencies (sequential operations that could be parallel)
- Predictive alerts (security risks, performance degradation)

**Minimum data**: 10+ executions required for meaningful analysis

---

#### 3. `/meta_learn` - Generate Improvement Suggestions

**Purpose**: Transform patterns into concrete improvement suggestions with ROI calculations

**When to run**: After `/meta_analyze` or when you want suggestions

**Dependencies**: Requires telemetry data and/or analysis report

**Usage**:
```bash
/meta_learn                                            # Generate from telemetry
/meta_learn --from-analysis meta/weekly-analysis.md    # Use specific analysis
/meta_learn --confidence-threshold 0.80                # Only high confidence
/meta_learn --output suggestions.md                    # Custom output
```

**Outputs**:
- Quick wins (high confidence, low effort)
- Medium-term improvements (moderate effort)
- Experimental ideas (need A/B testing)
- Each with ROI estimate and auto-implementation plan

**Example suggestion**:
```markdown
### QUICK WIN #1: Auto-invoke security-analyst before test-specialist
Confidence: 92%
ROI: 5min per PR (15 hours/month)
Pattern: Security audits always precede tests (92% correlation)
Implementation: [executable code provided]
```

---

#### 4. `/meta_implement` - Auto-Apply Improvements

**Purpose**: Safely implement high-confidence suggestions with rollback capability

**When to run**: After reviewing suggestions from `/meta_learn`

**Dependencies**: Requires suggestions from `/meta_learn` in `compound_history.json`

**Usage**:
```bash
/meta_implement SUGG-123 --dry-run         # Test implementation
/meta_implement SUGG-123 --confirm         # Apply for real
/meta_implement --auto --dry-run           # Test all high-confidence
/meta_implement --auto --confirm           # Apply all safe suggestions
/meta_implement --rollback                 # Undo last implementation
```

**Safety mechanisms**:
- Dry-run mode tests without changes
- Only implements ≥85% confidence suggestions
- Creates git branch before changes
- Runs validation tests
- Creates PR for human review (never direct commit)
- Automatic rollback if tests fail

---

#### 5. `/meta_compound_analyze` - PR Retrospective Analysis

**Purpose**: Analyze `compound_learnings` from merged PRs to identify recurring improvement themes

**When to run**: Monthly or after 10+ PR merges

**Dependencies**: Requires `compound_learnings[]` data generated by `/clean_branch`

**Usage**:
```bash
/meta_compound_analyze                     # All time
/meta_compound_analyze --since 30d         # Last month
/meta_compound_analyze --min-confidence high  # High confidence only
/meta_compound_analyze --output roadmap.md    # Custom output
```

**Outputs**:
- Theme frequency analysis (security, performance, documentation, etc.)
- Recurring suggestions (similar ideas from multiple PRs)
- Quality trends (review iterations, fix commits, comments)
- Prioritized improvement roadmap (ranked by frequency × impact)

**Related**: Works with `/clean_branch` which auto-generates compound learnings

---

#### 6. `/meta_improve` - Master Weekly Pipeline

**Purpose**: Run the complete improvement cycle in one command (orchestrates all meta commands)

**When to run**: Weekly (Sunday 2am recommended via cron)

**Dependencies**: All meta commands (but continues on failure)

**Usage**:
```bash
/meta_improve                              # Full pipeline
/meta_improve --dry-run                    # Test pipeline without changes
/meta_improve --skip evolve                # Skip expensive phases
/meta_improve --only analyze               # Run single phase
```

**Pipeline phases** (9 total):
1. **Analyze** → Pattern detection (`/meta_analyze --since 7d`)
2. **Learn** → Generate suggestions (`/meta_learn`)
3. **Document** → Living documentation (`/meta_document`)
4. **Predict** → Future issue forecasting (`/meta_predict`)
5. **Experiment** → A/B test management (`/meta_experiment --auto`)
6. **Implement** → Auto-apply improvements (`/meta_implement --auto`)
7. **Evolve** → Agent evolution (`/meta_evolve --agents all`)
8. **Health** → Dashboard generation (`/meta_health --publish`)
9. **Report** → Weekly summary

**Outputs**: Comprehensive weekly report with all metrics, suggestions, and actions

---

#### 7. `/meta_document` - Living Documentation

**Purpose**: Auto-generate and sync documentation from code changes

**When to run**: Weekly (part of `/meta_improve`) or after major code changes

**Dependencies**: Requires git history and code files

**Usage**:
```bash
/meta_document --sync-from-code            # Extract patterns from code
/meta_document --validate-patterns         # Check docs match code
/meta_document --from-pr 123               # Document specific PR
```

**Outputs**:
- Pattern documentation in `docs/patterns/`
- API documentation updates
- Architecture diagrams (if configured)
- Validation report (docs vs code accuracy)

---

#### 8. `/meta_predict` - Future Issue Prediction

**Purpose**: Forecast potential issues based on historical patterns and current trends

**When to run**: Weekly (part of `/meta_improve`) or before major releases

**Dependencies**: Requires telemetry data with ≥30 days history

**Usage**:
```bash
/meta_predict --horizon 3m                 # Predict 3 months ahead
/meta_predict --confidence-threshold 0.70  # High confidence only
/meta_predict --output predictions.md      # Custom output
```

**Outputs**:
- High-confidence predictions (>80% based on ≥3 historical incidents)
- Medium-confidence predictions (60-79%, similar to 1-2 past incidents)
- Preventive action plans
- Estimated cost if not prevented vs prevention cost

**Example prediction**:
```markdown
⚠️ UTF-8 encoding bug risk within 2 weeks
Confidence: 82% (occurred 3 times in similar pattern)
Evidence: Document processing code changed without validator
Prevention: 1. Add document-validator agent, 2. Test UTF-8 edge cases
Cost if not prevented: ~40 hours debugging
Prevention cost: ~2 hours (ROI = 20x)
```

---

#### 9. `/meta_experiment` - A/B Testing Framework

**Purpose**: Safely test experimental improvements with statistical validation

**When to run**: On-demand when testing new approaches or ideas

**Dependencies**: None (creates experiments.json)

**Usage**:
```bash
/meta_experiment create "parallel-agents"  # Create experiment
/meta_experiment status                    # View active experiments
/meta_experiment analyze EXP-123           # Check statistical significance
/meta_experiment promote EXP-123           # Deploy if successful
/meta_experiment rollback EXP-123          # Undo if failed
/meta_experiment --auto                    # Auto-promote/rollback (in /meta_improve)
```

**Outputs**:
- Experiment tracking in `meta/experiments.json`
- Statistical analysis (p-value, confidence intervals)
- Auto-promotion recommendations
- Rollback capability

**Safety**: Requires statistical significance before promotion

---

#### 10. `/meta_evolve` - Agent Genetic Algorithm

**Purpose**: Evolve agent prompts using genetic algorithms and historical performance data

**When to run**: Monthly (resource intensive)

**Dependencies**: Requires agent performance data from telemetry

**Usage**:
```bash
/meta_evolve --agents all                  # Evolve all agents
/meta_evolve --agents security-analyst     # Evolve specific agent
/meta_evolve --generations 10              # Run 10 generations
/meta_evolve --parallel                    # Parallel evolution
/meta_evolve --output evolution-report.md  # Custom output
```

**Outputs**:
- Agent variants in `meta/agent_variants.json`
- Performance comparisons (v1 vs current)
- Promoted agents (best performers)
- Evolution report with avg improvement percentage

**How it works**:
1. Generate agent variants (mutations, crossovers)
2. Test variants on historical tasks
3. Score performance (success rate, quality, time)
4. Promote best performers
5. Repeat for N generations

---

## Recommended Schedules

### Daily (Optional)

**No commands required** - telemetry auto-collects via hooks during normal development.

Just use workflow commands as usual:
```bash
/work 347              # Implement issues
/test                  # Run tests
/review_pr 123         # Handle feedback
```

### Weekly (Recommended)

**Friday Afternoon** - Analyze the week:
```bash
/meta_health           # Quick health check
/meta_analyze --since 7d
```

**OR use the full automated pipeline:**

**Sunday 2am** - Full weekly improvement cycle:
```bash
/meta_improve          # Runs all 9 phases
```

**Monday Morning** - Review results:
```bash
cat meta/weekly-report-*.md    # Read report
/meta_implement SUGG-123       # Manually apply specific suggestions
```

### Monthly (Recommended)

**First Monday of the month**:
```bash
/meta_compound_analyze --since 30d     # PR retrospective analysis
/meta_predict --horizon 3m             # Long-term forecasting
/meta_evolve --agents all              # Agent improvement (resource intensive)
```

**Full data review**:
```bash
/meta_health --publish                 # Generate stakeholder dashboard
# Review and clean up meta/ directory if needed
```

### After Each Event

**After PR Merge**:
```bash
/clean_branch          # Auto-triggers compound learning extraction
```

**After Major Release**:
```bash
/meta_predict --horizon 1m     # Check for post-release risks
/meta_health                   # System health check
```

**When Ready to Apply Improvements**:
```bash
/meta_learn                    # Generate suggestions
/meta_implement SUGG-123 --dry-run   # Test implementation
/meta_implement SUGG-123 --confirm   # Apply for real
```

### Automation (Advanced)

**Weekly Cron Job** (Sunday 2am):
```bash
# Add to crontab
0 2 * * 0 /path/to/claude /meta_improve >> meta/logs/cron.log 2>&1
```

## Command Dependencies

### Dependency Graph

```
Telemetry (auto-collected via hooks)
    │
    ├─> /meta_analyze ─────────────────────────────┐
    │        │                                      │
    │        └─> /meta_learn                        │
    │                 │                             │
    │                 └─> /meta_implement           │
    │                                               │
    ├─> /meta_compound_analyze (independent)       │
    │                                               │
    ├─> /meta_predict (needs telemetry) ──────────┤
    │                                               │
    ├─> /meta_experiment (independent)             │
    │                                               │
    ├─> /meta_evolve (needs agent performance) ────┤
    │                                               │
    ├─> /meta_document (uses git history) ─────────┤
    │                                               │
    └─> /meta_health (reads all sources) ──────────┘
              │
              └─> /meta_improve (orchestrates all)
```

### Dependency Details

**No dependencies (can run anytime)**:
- `/meta_health` - Reads all data sources
- `/meta_experiment` - Creates/manages experiments
- `/meta_document` - Uses git history

**Requires telemetry data (≥10 executions)**:
- `/meta_analyze`
- `/meta_predict` (≥30 days recommended)

**Requires analysis first**:
- `/meta_learn` (needs patterns from `/meta_analyze` or telemetry)

**Requires suggestions first**:
- `/meta_implement` (needs suggestions from `/meta_learn`)

**Requires PR retrospectives**:
- `/meta_compound_analyze` (needs data from `/clean_branch`)

**Requires agent performance data**:
- `/meta_evolve` (needs historical agent invocations)

## Usage Workflows

### Workflow 1: Basic Weekly Review

**Goal**: Quick health check and pattern detection

```bash
# Monday morning
/meta_health           # Check overall system status

# If issues detected or curiosity:
/meta_analyze --since 7d    # See what happened last week
```

**Time**: 5-10 minutes
**Frequency**: Weekly

---

### Workflow 2: Full Improvement Cycle

**Goal**: Generate and apply improvements

```bash
# Step 1: Analyze patterns
/meta_analyze --since 7d --output meta/analysis.md

# Step 2: Generate suggestions
/meta_learn --from-analysis meta/analysis.md --output meta/suggestions.md

# Step 3: Review suggestions
cat meta/suggestions.md

# Step 4: Test implementation (safe)
/meta_implement SUGG-123 --dry-run

# Step 5: Apply if safe
/meta_implement SUGG-123 --confirm

# Step 6: Verify health
/meta_health
```

**Time**: 30-60 minutes
**Frequency**: Weekly or bi-weekly

---

### Workflow 3: Automated Weekly Pipeline

**Goal**: Fully automated improvement cycle

```bash
# Sunday 2am (via cron)
/meta_improve

# Monday morning - review report
cat meta/weekly-report-*.md

# Review and merge any PRs created by auto-implementation
gh pr list --author "@me"
```

**Time**: 5-10 minutes review (automation does the work)
**Frequency**: Weekly

---

### Workflow 4: PR Retrospective Analysis

**Goal**: Learn from merged PRs

```bash
# After merging PRs throughout the month:
# (Each /clean_branch auto-generates compound learnings)

# Monthly - analyze accumulated learnings
/meta_compound_analyze --since 30d --output meta/roadmap.md

# Review roadmap
cat meta/roadmap.md

# Prioritize improvements for next sprint
```

**Time**: 15-30 minutes
**Frequency**: Monthly

---

### Workflow 5: Predictive Maintenance

**Goal**: Prevent future issues

```bash
# Before major release
/meta_predict --horizon 1m --output meta/pre-release-risks.md

# Review predictions
cat meta/pre-release-risks.md

# Address high-confidence risks
# Example: Add validation if UTF-8 bug predicted

# After implementing preventive actions
/meta_health           # Confirm risk addressed
```

**Time**: 20-40 minutes
**Frequency**: Before releases or monthly

---

### Workflow 6: Experiment-Driven Optimization

**Goal**: Test and validate new approaches

```bash
# Create experiment
/meta_experiment create "parallel-3-agents" "Test 3 agents in parallel vs 2"

# Use system normally (experiment runs in background)
/work 347
/work 348
# ... continue development ...

# After sufficient trials (≥30)
/meta_experiment analyze EXP-123

# If statistically significant improvement:
/meta_experiment promote EXP-123

# If no improvement or regression:
/meta_experiment rollback EXP-123
```

**Time**: Ongoing (experiment runs passively)
**Frequency**: When testing new ideas

---

## Troubleshooting

### No Telemetry Data

**Symptom**: `/meta_analyze` says "Telemetry file not found"

**Cause**: Hooks not installed or not collecting data

**Solution**:
```bash
# Check hooks are installed
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/hooks/hooks.json

# Verify telemetry file exists
ls ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/telemetry.json

# If missing, reinstall plugin
/plugin uninstall psd-claude-coding-system
/plugin install psd-claude-coding-system

# Restart Claude Code for hooks to load
```

---

### Insufficient Data

**Symptom**: `/meta_analyze` says "Insufficient data" (< 10 executions)

**Cause**: System is new or not used enough

**Solution**:
```bash
# Use workflow commands normally for 1-2 weeks
/work 347
/test
/review_pr 123

# Check telemetry collection
cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/telemetry.json

# Should show executions array with entries
```

**Minimum requirements**:
- `/meta_analyze`: 10+ executions
- `/meta_predict`: 30+ days of data
- `/meta_evolve`: 5+ agent invocations per agent

---

### Commands Not Found

**Symptom**: `/meta_health` not recognized

**Cause**: Plugin not installed or not loaded

**Solution**:
```bash
# Check plugin installed
/plugin list

# If not installed
/plugin marketplace add psd401/psd-claude-coding-system
/plugin install psd-claude-coding-system

# Verify commands available
# (Try typing /meta and press tab for autocomplete)
```

---

### Low Confidence Suggestions

**Symptom**: `/meta_learn` only generates low-confidence suggestions

**Cause**: Insufficient historical data or weak patterns

**Solution**:
```bash
# Continue using system to build more data
# Low confidence suggestions need more validation:

# Option 1: Use experiments to validate
/meta_experiment create "test-low-confidence-suggestion"

# Option 2: Wait for more telemetry data
# (Confidence improves with more examples)

# Option 3: Manually review and implement if valuable
/meta_implement SUGG-123 --dry-run   # Test it
```

---

### `/meta_implement` Fails

**Symptom**: Auto-implementation fails or creates broken code

**Cause**: Suggestion too complex or context changed

**Solution**:
```bash
# Always dry-run first
/meta_implement SUGG-123 --dry-run

# If dry-run looks wrong, skip
# Low-confidence or complex suggestions need manual implementation

# If implemented but broken:
/meta_implement --rollback           # Undo last implementation

# Report issue for improvement
# (System learns from failures)
```

---

### Hooks Not Firing

**Symptom**: No new telemetry data after using commands

**Cause**: Hooks didn't load at startup

**Solution**:
```bash
# Hooks load once at Claude Code startup
# Solution: Restart Claude Code

# After restart, test manually:
cd ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system
echo '{"session_id":"test"}' | ./scripts/telemetry-init.sh
ls -la meta/telemetry.json  # Should exist

# Verify hooks executable:
ls -la scripts/*.sh         # Should have 'x' permission
```

---

### `/meta_improve` Takes Too Long

**Symptom**: Full pipeline runs for hours

**Cause**: `/meta_evolve` is resource intensive

**Solution**:
```bash
# Skip expensive phases
/meta_improve --skip evolve --skip experiment

# Or run only critical phases
/meta_improve --only analyze --only learn --only health

# Or reduce evolution scope
# (Edit command to use --generations 3 instead of 10)
```

---

### Clean Branch Not Generating Learnings

**Symptom**: `/meta_compound_analyze` shows no data

**Cause**: `/clean_branch` requires GitHub PR context

**Solution**:
```bash
# Check you're running after PR merge (not direct commit)
/clean_branch

# Verify PR was merged properly
gh pr list --state merged --limit 5

# Check telemetry for compound_learnings array:
cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/telemetry.json | jq '.compound_learnings'
```

---

## Data Privacy

### What Gets Collected

**YES - Collected**:
- Command names (e.g., `/work`, `/test`)
- Execution durations (seconds)
- Success/failure status (boolean)
- Agent names invoked (e.g., `security-analyst`)
- File counts (number of files changed)
- Test counts (number of tests added)
- Timestamps

**NO - Never Collected**:
- Code content or diffs
- Issue descriptions or comments
- Commit messages
- PR descriptions or reviews
- Personal information
- API keys or secrets
- User credentials

### Data Storage

**Location**: All telemetry stored locally in git-ignored `meta/` directory:
```
plugins/psd-claude-coding-system/meta/
  ├── telemetry.json           # Command execution logs
  ├── compound_history.json    # Improvement suggestions
  ├── experiments.json         # A/B test data
  ├── agent_variants.json      # Agent evolution data
  └── workflow_graph.json      # Workflow patterns
```

**Network**: No external requests. All data stays on your machine.

**Git**: `meta/` is in `.gitignore` - never committed to repository.

### Opt-Out

**Disable telemetry entirely**:
```bash
# Option 1: Uninstall plugin
/plugin uninstall psd-claude-coding-system

# Option 2: Disable hooks
# Remove hooks/hooks.json from plugin directory

# Option 3: Delete meta data
rm -rf ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/*
```

**Continue using workflow commands without meta-learning**:
```bash
# Workflow commands work independently of meta-learning
/work 347              # Still works
/test                  # Still works
/review_pr 123         # Still works

# Just meta commands won't have data
```

### Transparency

**View collected data**:
```bash
# View telemetry
cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/telemetry.json | jq .

# View suggestions
cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/compound_history.json | jq .

# View experiments
cat ~/.claude/plugins/marketplaces/psd-claude-coding-system/plugins/psd-claude-coding-system/meta/experiments.json | jq .
```

## Next Steps

1. **Start using the system** - Normal workflow commands for 1-2 weeks
2. **Run first health check** - `/meta_health` after 2-4 weeks
3. **Weekly analysis** - `/meta_analyze --since 7d` every Friday
4. **Monthly deep dive** - `/meta_compound_analyze` and `/meta_predict`
5. **Automate** - Set up `/meta_improve` cron job for hands-off improvement

## Additional Resources

- [Plugin README](../plugins/psd-claude-coding-system/README.md) - Full plugin documentation
- [CLAUDE.md](../CLAUDE.md) - System architecture and development guide
- [Workflow Commands](../README.md#workflow-commands-18-total) - All available commands

---

**Questions or Issues?**

- File issues: [GitHub Issues](https://github.com/psd401/psd-claude-coding-system/issues)
- Contact: Kris Hagel (hagelk@psd401.net)

---

*This guide is part of the PSD Claude Coding System v1.9.0*
