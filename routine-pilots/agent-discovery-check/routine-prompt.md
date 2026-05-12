You are running a controlled pilot test for the PSD automation architecture. Your job is to verify three hypotheses about Claude Code routines and report results as a GitHub issue. Do not modify code, create branches, or open pull requests — the only artifact you produce is one GitHub issue.

## Hypotheses under test

- **H1**: Project-level subagents in `.claude/agents/*.md` of a cloned repo are auto-discovered at session start in a routine.
- **H2**: Agents placed in `.claude/agents/` by the environment setup script (before session start) are auto-discovered.
- **H3**: The environment setup script re-runs on every routine fire (vs. running once and caching the filesystem state).

The cloned repo for this routine is `psd401/psd-claude-plugins`. Two test agents are involved:

- `pilot-direct-commit` — committed at `.claude/agents/pilot-direct-commit.md` in the cloned repo (project scope). Replies with `DIRECT_COMMIT_AGENT_REACHED`.
- `pilot-setup-placed` — written into `~/.claude/agents/pilot-setup-placed.md` by the environment setup script (user scope). Replies with `SETUP_PLACED_AGENT_REACHED`.

## Steps

### Step 1 — Inventory

Run these and capture output verbatim:

```bash
pwd
echo "--- project-scope agents (cloned repo) ---"
ls -la .claude/agents/ 2>&1 || echo "directory missing"
echo "--- user-scope agents ---"
ls -la ~/.claude/agents/ 2>&1 || echo "user-scope directory missing"
echo "--- setup marker log ---"
cat ~/.claude/setup-marker.log 2>&1 || echo "marker log missing"
echo "--- where is psd-claude-plugins cloned? ---"
find / -maxdepth 5 -name "psd-claude-plugins" -type d 2>/dev/null | head -5
```

### Step 2 — Direct-commit test (H1)

Invoke the Task tool with `subagent_type: "pilot-direct-commit"` and prompt `"Run your instructions."`. Record:

- If the call resolves and the subagent returns `DIRECT_COMMIT_AGENT_REACHED` → **H1 = PASS**
- If the call errors with an unknown subagent type or returns anything else → **H1 = FAIL** (record exact error)

### Step 3 — Setup-placed test (H2)

Invoke the Task tool with `subagent_type: "pilot-setup-placed"` and prompt `"Run your instructions."`. Record:

- If the call resolves and the subagent returns `SETUP_PLACED_AGENT_REACHED` → **H2 = PASS**
- Otherwise → **H2 = FAIL** (record exact error)

### Step 4 — Caching analysis (H3)

Look at the marker log contents from Step 1. Count distinct timestamp lines. The user will fire this routine at least three times, so check the run history context. For this single run, just report the current line count and contents — H3 is evaluated across runs by the human.

### Step 5 — Report

Create one GitHub issue using `gh issue create --repo psd401/psd-claude-plugins`:

- **Title**: `Routine pilot result: <UTC timestamp> — H1=<PASS/FAIL> H2=<PASS/FAIL>`
- **Labels**: `routine-pilot`
- **Body** (markdown):

```
## Pilot run

- Run UTC: <timestamp>
- Routine session URL: <leave blank — the human will fill in>

## Step 1 — Inventory

### `ls -la .claude/agents/`
<paste output>

### `cat .claude/setup-marker.log`
<paste output>

## Step 2 — Direct-commit test (H1)

- Result: **PASS** or **FAIL**
- Subagent response: <verbatim>
- Error (if FAIL): <verbatim>

## Step 3 — Setup-placed test (H2)

- Result: **PASS** or **FAIL**
- Subagent response: <verbatim>
- Error (if FAIL): <verbatim>

## Step 4 — Caching probe (H3, single-run snapshot)

- Marker log line count this run: <N>
- Across runs: human reviews issue history.

## Verdict

- H1 (project agents discovered): PASS / FAIL
- H2 (setup-script-placed agents discovered): PASS / FAIL
- Pattern 1 viability: VALIDATED (both pass) / PARTIAL (H1 only) / FAILED (neither)
```

After the issue is created, print the issue URL as your final line of output.
