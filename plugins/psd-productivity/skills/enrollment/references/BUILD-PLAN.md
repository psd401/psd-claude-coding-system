# P223 Enrollment Automation — Build Plan

> Living document tracking the phased build of `/enrollment`

## Current Status: Phases 1-5 Complete

## Build Phases

### Phase 1: Reference Knowledge Base + Browser Automation Foundation — COMPLETE
- Reference docs: p223-process.md, fte-rules.md, school-config.md, report-checklist.md, cant-automate.md
- PowerSchool navigator agent for Claude-in-Chrome report automation
- Enrollment validator agent for data validation
- SKILL.md rewritten with Phase 1 commands

### Phase 2: FTE Calculator + Validation Engine — COMPLETE
- `scripts/fte_calculator.py` — FTE calculation engine (ES minutes-based, MS/HS period-based, GVA split-school)
- `scripts/enrollment_validator.py` — 9 validation checks (HC consistency, FTE calc, 20-day absence, entry/exit balance, RS cap, teacher assignment, FTE override, program compliance)
- `scripts/month_comparison.py` — Month-over-month diff with backdated exit detection
- `scripts/entry_exit_balancer.py` — Entry/Exit reconciliation per grade per school

### Phase 3: Google Workspace CLI Integration — COMPLETE
- Shared skill: `google-workspace-cli` in psd-productivity/skills/
- Based on `gws` CLI (npm @googleworkspace/cli)
- Supports multiple auth accounts via env vars or config directories
- Operations: Drive file list/upload/download, Sheets read/write/append, Gmail send, Calendar events
- Setup instructions included in skill

### Phase 4: District Reconciliation Automation — COMPLETE
- `scripts/ale_reconciler.py` — ALE FTE reconciliation:
  - Assigns FTE per section based on paired school rules
  - Verifies combined ALE + RS FTE ≤ 1.20
  - Extracts CTE ALE sections (OCT135, OPE901)
  - Generates CTE report for CTE program
  - Splits in-district vs out-of-district
- `scripts/rs_reconciler.py` — Running Start reconciliation:
  - Compares TCC RS report vs PowerSchool data
  - Identifies full-time vs part-time RS
  - Generates RSCNTRL spreadsheet data
  - Flags January SQEAF requirements
  - Detects mismatches (TCC-only, PS-only students)

### Phase 5: Validation Report + EDS Import Generation — COMPLETE
- `scripts/validation_report.py` — Comprehensive district report:
  - Aggregates all school data (HC, FTE, ALE, RS, TBIP, CTE, Open Doors)
  - Runs validation checks across all schools
  - Generates markdown validation report with human review checklist
  - Generates EDS-ready import JSON

### Phase 6: End-to-End Orchestration — SKILL.MD READY, NEEDS LIVE TESTING
- `/enrollment run [month]` — Full monthly workflow defined in SKILL.md
- `/enrollment status` — Dashboard command defined
- Requires live PowerSchool session + Google Workspace auth to test end-to-end
- Email generation for Board/Cabinet notification handled by SKILL.md orchestration

### Phase 7: Speed & Reliability Improvements — IN PROGRESS (March 2026)

**Problem**: March 2026 run completed 10/17 schools, stopped mid-run, skipped P223 entirely, daysToScan defaulted to 3.

**Root causes addressed**:
1. **Mid-run stops**: Context window pressure from 50KB+ `take_snapshot`/`wait_for` results. Fixed with context management rules — use `evaluate_script` for data extraction, `take_screenshot` with `filePath` for archival.
2. **P223 skipped**: Report order was advisory, not enforced. Fixed with strict numbered ordering and "DO NOT SKIP" language.
3. **daysToScan=3**: Field defaults vary by school context. Fixed with explicit JS override (`input[name="daysToScan"].value = '20'`) and post-run verification.
4. **Completion model**: Replaced linear step list with completion-driven loop (Ralph-Loop pattern) — defines DONE and loops until achieved.

**District-level batching (needs live validation)**:
- P223 Form and Audit can potentially run at District Office level with "Separate form per school" → one ZIP for all schools
- Enrollment Summary and Consecutive Absence may also work at district level
- If validated, eliminates ~50% of per-school work (from ~2 hours to ~45-60 minutes)
- SKILL.md updated with Phase 1 (district batch) → Phase 2 (per-school loop) → Phase 3 (post-reports) structure

**Still needs live testing**:
- [ ] Does P223 at District Office with "Separate form per school" produce individual school P223s?
- [ ] Does Enrollment Summary at District Office show per-school breakdown?
- [ ] Does Consecutive Absence at District Office run across all schools?
- [ ] Multi-tab parallelization within Phase 2 (secondary optimization)

## What's Ready to Test

| Command | Requires | Status |
|---------|----------|--------|
| `/enrollment help` | Nothing | Ready |
| `/enrollment checklist [month]` | Nothing | Ready |
| `/enrollment fte [school] [schedule]` | Nothing (uses fte_calculator.py) | Ready — tested |
| `/enrollment validate [school]` | CSV data files from PS | Ready — needs data |
| `/enrollment compare [m1] [m2]` | Enrollment summary CSVs | Ready — needs data |
| `/enrollment ale [csv]` | GVA ALE report CSV | Ready — needs data |
| `/enrollment rs [tcc] [ps]` | TCC report + PS export CSVs | Ready — needs data |
| `/enrollment report [month]` | School data JSON | Ready — needs data |
| `/enrollment reports [school] [date]` | PowerSchool + Chrome | Ready — needs live PS |
| `/enrollment run [month]` | Everything above | Ready — needs live testing |

## File Inventory

```
enrollment/
  SKILL.md                              # Main orchestrator (13 commands)
  references/
    BUILD-PLAN.md                       # This file
    p223-process.md                     # Step-by-step procedure
    fte-rules.md                        # FTE calculation rules
    school-config.md                    # School list and config
    report-checklist.md                 # Required reports checklist
    cant-automate.md                    # Human judgment items
  scripts/
    fte_calculator.py                   # Phase 2: FTE engine
    enrollment_validator.py             # Phase 2: 9 validation checks
    month_comparison.py                 # Phase 2: Month-over-month diff
    entry_exit_balancer.py              # Phase 2: Entry/Exit balance
    ale_reconciler.py                   # Phase 4: ALE FTE reconciliation
    rs_reconciler.py                    # Phase 4: Running Start reconciliation
    validation_report.py                # Phase 5: District report + EDS import

agents/ (in psd-productivity/)
  powerschool-navigator.md              # Phase 1: Browser automation
  enrollment-validator.md               # Phase 1: Validation agent

skills/ (in psd-productivity/)
  google-workspace-cli/SKILL.md         # Phase 3: Shared GWS CLI skill
```

## Unresolved Questions
- 1.1 RS FTE cap: P223 doc says 1.2 in PS, state allows 1.4 for 25-26 — which to validate against?
- 1.2 Part Time spreadsheet exact Google Drive path?
- 1.3 Internal P223 spreadsheet — Google Sheet or Excel?
- 1.4 Does 25-26 state handbook have rule changes from version provided?
- 1.5 PowerSchool API access — plugin API, ODBC, or data export?
