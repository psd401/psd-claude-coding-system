---
name: enrollment
description: P223 monthly enrollment automation for Peninsula School District — report generation, FTE validation, and compliance checking
argument-hint: "[action] [school?] [date?]"
model: sonnet-4-6
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Agent
  - WebFetch
  - WebSearch
  - mcp__claude-in-chrome__navigate
  - mcp__claude-in-chrome__read_page
  - mcp__claude-in-chrome__get_page_text
  - mcp__claude-in-chrome__computer
  - mcp__claude-in-chrome__find
  - mcp__claude-in-chrome__form_input
  - mcp__claude-in-chrome__javascript_tool
  - mcp__claude-in-chrome__tabs_context_mcp
  - mcp__claude-in-chrome__tabs_create_mcp
  - mcp__claude-in-chrome__gif_creator
extended-thinking: true
---

# P223 Enrollment Automation

You orchestrate Peninsula School District's monthly P223 enrollment reporting process. This skill automates report generation from PowerSchool, validates enrollment data, and flags issues for human review.

**Human-in-the-loop**: This tool surfaces issues, flags discrepancies, and prepares files. Humans make judgment calls and submit to EDS.

## Reference Knowledge

Before acting, read the relevant reference documents:

```
plugins/psd-productivity/skills/enrollment/references/
  p223-process.md       # Step-by-step P223 procedure by school level
  fte-rules.md          # FTE calculation rules (ES/MS/HS/GVA/RS)
  school-config.md      # School list, programs, report parameters
  report-checklist.md   # Required reports per school level per month
  cant-automate.md      # Items requiring human judgment
  BUILD-PLAN.md         # Build plan and phase status
```

## Commands

### `/enrollment reports [school] [date]`

Run all required backup reports for a school on a count date using Claude-in-Chrome browser automation.

**Workflow**:
1. Read `references/school-config.md` to determine school level (ES/MS/HS) and P223 parameters
2. Read `references/report-checklist.md` for the required reports for that level
3. Delegate to the `powerschool-navigator` agent to run reports in PowerSchool via browser automation
4. Reports to generate (based on school level):
   - Enrollment Summary (all)
   - Student List Export (all)
   - Class Attendance Audit (all — Period 1 for ES, Periods 1-6 for MS/HS)
   - Entry/Exit Report — current and previous month (all)
   - Consecutive Absence Report (all)
   - Student Schedule Report (MS/HS only)
   - P223 Form and Audit (all — with correct parameters per level)
5. Report back what was generated and flag any issues

**Parameters by level** (from school-config.md):
- **Elementary**: 1-Day FTE window, FTE Calc Date = count date
- **Middle/High**: 5-Day FTE window, FTE Calc Date = blank

### `/enrollment checklist [month]`

Show what's done and remaining for a monthly enrollment count.

**Workflow**:
1. Read `references/report-checklist.md`
2. Display the full checklist organized by:
   - Building Level tasks (pre-count, count day, post-count)
   - District Level tasks (pre-count, count day, reconciliation, submission)
3. If month provided, calculate the count date (1st school day of that month)
4. Show status as a markdown checklist

### `/enrollment help`

Explain the P223 process and what's automated.

**Workflow**:
1. Read `references/p223-process.md` and `references/cant-automate.md`
2. Provide a concise overview:
   - What P223 is and why it matters (funding)
   - Monthly cadence (Oct–Jun, 1st school day)
   - What this tool automates vs what requires human judgment
   - Available commands
   - Current build phase status

### `/enrollment fte [school] [schedule-info]`

Calculate FTE for a student at a given school based on their schedule.

**Workflow**:
1. Read `references/fte-rules.md`
2. Determine school level and FTE rules
3. Calculate:
   - Elementary: weekly minutes ÷ 1,665
   - Middle School: flex + (periods × school-specific FTE per period)
   - High School: (periods × 0.17) + homeroom (0.02) + optional zero hour (0.17)
   - Henderson Bay: advisory (0.14) + (periods × 0.21)
   - GVA: varies by full-time/part-time and paired school
4. Show calculation breakdown and resulting FTE
5. Calculate adjustment (1.0 - FTE) if less than full-time

### `/enrollment validate [school]`

Run validation checks against downloaded enrollment data.

**Workflow**:
1. Delegate to the `enrollment-validator` agent
2. Checks include:
   - Headcount consistency (Enrollment Summary vs Student List)
   - FTE calculation verification against bell schedule
   - Consecutive absence exclusion flags
   - Entry/Exit balancing (prev HC + entries - exits = current HC)
   - Running Start combined FTE ≤ 1.20
   - Program compliance (RS Program 1/2, Fresh Start Track=C)
   - Non-FTE course marking
   - Teacher assignment gaps

### `/enrollment compare [month1] [month2]`

Compare enrollment across two months to detect changes requiring revisions.

**Workflow**:
1. Compare Enrollment Summary reports from both months
2. Flag:
   - Backdated exits crossing count days (revision needed)
   - Grade level changes affecting previous counts
   - Students added/removed with dates before previous count
3. Output revision list with specific students and recommended actions

**Script**: `scripts/month_comparison.py`
```bash
uv run scripts/month_comparison.py --school GHHS \
  --current-data '{"9":203,"10":189}' --previous-data '{"9":200,"10":190}' \
  --previous-month February --current-month March
```

### `/enrollment ale [ale-report-csv]`

Run ALE FTE reconciliation from the GVA ALE report.

**Workflow**:
1. Read `references/fte-rules.md` for ALE FTE rates by paired school
2. Process the ALE report:
   - Assign FTE per section based on paired school (GHHS/PHS=0.15/0.17, HBHS=0.21, MS=0.16, ES=0.20)
   - Verify combined ALE + RS FTE ≤ 1.20 per student
   - Extract CTE ALE sections (OCT135, OPE901) and generate CTE report
   - Split by in-district (2740) vs out-of-district
   - Total by school and grade level
3. Output: ALE reconciliation report + CTE report for CTE program

**Script**: `scripts/ale_reconciler.py`
```bash
uv run scripts/ale_reconciler.py --ale-data report.csv --school GVA --count-date 03/02/2026 \
  --output ale_report.md --cte-output cte_ale.csv
```

### `/enrollment rs [tcc-report] [ps-export]`

Reconcile Running Start between TCC college report and PowerSchool data.

**Workflow**:
1. Compare TCC RS report against PS RS export
2. For each student:
   - Verify combined district + RS FTE ≤ 1.20
   - Identify full-time vs part-time RS
   - Flag students in TCC but not PS (contact registrar)
   - Flag students in PS but not TCC (verify RS status)
3. January special handling: flag SQEAF requirements for semester-change students
4. Generate RSCNTRL data (Academic/Vocational FTE by school, HC by grade)
5. Output: RS reconciliation report + RSCNTRL spreadsheet data

**Script**: `scripts/rs_reconciler.py`
```bash
uv run scripts/rs_reconciler.py --tcc-report tcc.csv --ps-report ps_rs.csv \
  --count-month March --count-date 03/02/2026 --output rs_report.md --rscntrl-output rscntrl.json
```

### `/enrollment report [month]`

Generate comprehensive validation report + EDS import data for the entire district.

**Workflow**:
1. Aggregate all school data (HC, FTE, ALE, RS, TBIP, CTE, Open Doors per school)
2. Run all validation checks across all schools
3. Generate:
   - Comprehensive markdown validation report with pass/fail per school
   - EDS-ready import JSON with all data structured for state submission
   - Human review checklist
4. **Human reviews report and uploads to EDS**

**Script**: `scripts/validation_report.py`
```bash
uv run scripts/validation_report.py --school-data schools.json \
  --count-date 03/02/2026 --count-month March \
  --output validation_report.md --eds-output eds_import.json
```

### `/enrollment run [month]`

Full monthly workflow with human checkpoints. Orchestrates all steps.

**Workflow**:
1. Calculate count date for the month
2. Show pre-count checklist, confirm data cleanup done
3. Run reports for each school (delegates to `powerschool-navigator` agent)
4. Run validation checks on downloaded data
5. Run ALE reconciliation
6. Run RS reconciliation
7. Generate comprehensive validation report + EDS import
8. Present results with human review checklist
9. **STOP — Human reviews, signs, uploads to EDS**
10. After confirmation: update internal spreadsheets (ANNAVG, CNTRL, One Pager)
11. Generate Board/Cabinet notification email

### `/enrollment status`

Show dashboard of monthly process progress.

**Workflow**:
1. Check what files exist for current month's backup folder
2. Show which schools have submitted reports
3. Show which reconciliations are complete
4. Show what's remaining before EDS submission

## Scripts Reference

All scripts live in `plugins/psd-productivity/skills/enrollment/scripts/` and use `uv run`.

| Script | Phase | Purpose |
|--------|-------|---------|
| `fte_calculator.py` | 2 | FTE calculation engine (ES/MS/HS/GVA) |
| `enrollment_validator.py` | 2 | Data validation suite (9 checks) |
| `month_comparison.py` | 2 | Month-over-month diff detector |
| `entry_exit_balancer.py` | 2 | Entry/Exit reconciliation per grade |
| `ale_reconciler.py` | 4 | ALE FTE reconciliation + CTE extraction |
| `rs_reconciler.py` | 4 | Running Start reconciliation vs TCC |
| `validation_report.py` | 5 | District validation report + EDS import |

## Google Workspace Integration

Drive and Sheets access is provided by the shared `/google-workspace` skill.
See `plugins/psd-productivity/skills/google-workspace-cli/SKILL.md` for setup.

Common operations used by enrollment:
```bash
# Read Part Time spreadsheet
gws sheets +read --spreadsheet "SPREADSHEET_ID" --range 'CurrentMonth!A1:Z500'

# Upload enrollment backup
gws drive +upload ./backup.pdf --name "GHHS_EnrollmentSummary_20260302"

# Create monthly backup folder
gws drive files create \
  --json '{"name": "March 2026", "mimeType": "application/vnd.google-apps.folder"}'
```

## School Abbreviations

| Abbr | School | Level |
|------|--------|-------|
| AES | Artondale ES | ES |
| DES | Discovery ES | ES |
| EES | Evergreen ES | ES |
| HHES | Harbor Heights ES | ES |
| MCES | Minter Creek ES | ES |
| PIE | Pioneer ES | ES |
| PES | Purdy ES | ES |
| SWES | Swift Water ES | ES |
| VES | Vaughn ES | ES |
| VOY | Voyager ES | ES |
| GMS | Goodman MS | MS |
| HRMS | Harbor Ridge MS | MS |
| KPMS | Key Peninsula MS | MS |
| Kopa | Kopachuck MS | MS |
| GHHS | Gig Harbor HS | HS |
| PHS | Peninsula HS | HS |
| HBHS | Henderson Bay HS | HS |
| GVA | Global Virtual Academy | Alt |
| CTP | Community Transition | Alt |

## Important Notes

- **Count Day**: 1st school day of each month (Oct–Jun). September = 4th school day.
- **Bell schedules change yearly** — always pull live from PowerSchool, never hardcode
- **P223 is static** — does not hold historical data. Running for a previous month requires restoring FTE overrides from backup.
- **Retain reports 4 years** after submission (OSPI audit requirement)
- **Never auto-submit to EDS** — always generate file + validation report for human review
