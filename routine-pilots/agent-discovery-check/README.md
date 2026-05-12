# Pilot — agent-discovery-check

Validates whether the planned automation architecture (Pattern 1 from the design discussion) works on Claude Code routines.

## What this tests

| ID | Hypothesis |
|----|------------|
| H1 | Project subagents in `.claude/agents/*.md` of a cloned repo are auto-discovered at session start inside a routine. |
| H2 | Agents placed into `.claude/agents/` by the routine's environment setup script (before session start) are auto-discovered. |
| H3 | The environment setup script re-runs on every routine fire (vs. running once and caching filesystem state). |

If H1 + H2 both pass → Pattern 1 is viable and the four routines can be built on it. If H1 passes but H2 fails → we'd need to commit agents directly into each target repo (you rejected this), so we stop. If H1 fails → routines don't honor project subagents, and we'd need to inline agent prompts (you rejected this too) — so we also stop.

## Files

- `pilot-setup-placed.md` — the agent that the setup script will copy into `.claude/agents/`. NOT committed at `.claude/agents/` itself.
- `setup-script.sh` — the environment setup script content (paste into routine env config).
- `routine-prompt.md` — the routine instructions (paste into routine prompt).
- `../../.claude/agents/pilot-direct-commit.md` — the agent committed directly into `.claude/agents/` for the H1 test.

## How to run the pilot

### 1. Confirm the test agent is committed

```bash
ls -la .claude/agents/pilot-direct-commit.md
```

Should exist. If not, this pilot is incomplete.

### 2. Push the branch to GitHub

The routine will clone whatever's on `main` (or whichever branch you push). Commit these pilot files to a branch and push, then either merge to main or point the routine at the branch.

### 3. Install the Claude GitHub App on psd-claude-plugins

Go to <https://github.com/apps/claude> → Install → org `psd401` → Only `psd-claude-plugins` (for now).

### 4. Create the routine

Go to <https://claude.ai/code/routines> → **New routine**.

- **Name**: `pilot-agent-discovery-check`
- **Prompt**: paste the entire contents of `routine-prompt.md`
- **Repositories**: select `psd401/psd-claude-plugins`
- **Environment**:
  - Use the Default environment, OR create a new one called `pilot-env`
  - Open the environment's settings → **Setup script** → paste the entire contents of `setup-script.sh`
  - Network access: **Trusted** is fine (default)
- **Trigger**: skip recurring schedule for now — we'll use `Run now` manually
- Click **Create**

### 5. Fire the routine

Click **Run now** on the routine detail page. Wait for the run to complete (a few minutes).

Repeat **Run now** two more times (3 total fires) — this is what tests H3 (caching).

### 6. Read results

Each fire creates one new GitHub issue in `psd-claude-plugins` with label `routine-pilot`. Three fires → three issues. Look at each issue's:

- H1 result — should be PASS in all three if discovery works
- H2 result — should be PASS in all three if Pattern 1 is viable
- Marker log contents — total line count across all 3 issues tells us about caching:
  - 1 line total (same timestamp in all 3 issues) → script ran once, cached for life of environment
  - 3 lines total (different timestamps) → script re-runs every fire
  - 3 lines but identical content across issues → ambiguous, inspect timestamps

### 7. Decide

- **H1 PASS + H2 PASS**: Pattern 1 confirmed. Proceed to design the four real routines.
- **H1 PASS + H2 FAIL**: setup-script materialization doesn't work; the only fallback options were rejected — stop and rethink.
- **H1 FAIL**: routines don't pick up project subagents; rejected fallbacks remain rejected — stop and rethink.

### 8. Cleanup

After the decision is made:

```bash
rm -f .claude/agents/pilot-direct-commit.md .claude/setup-marker.log
rm -rf routine-pilots/agent-discovery-check
gh issue list --repo psd401/psd-claude-plugins --label routine-pilot --state open --json number --jq '.[].number' | xargs -I{} gh issue close {} --repo psd401/psd-claude-plugins
```

And delete the `pilot-agent-discovery-check` routine from <https://claude.ai/code/routines>.
