---
title: PowerSchool P223 enrollment report automation — practice run learnings
category: workflow
tags:
  - powerschool
  - p223
  - enrollment
  - browser-automation
  - chrome-devtools-mcp
  - cdp
  - mcp
severity: high
date: 2026-03-13
source: auto — /enrollment
applicable_to: project
---

## What Happened

A full practice run of the P223 monthly enrollment automation was executed using the Chrome DevTools MCP and the `powerschool-navigator` subagent. Thirteen distinct failure modes and behavioral quirks were discovered across the report submission, file download, and browser interaction layers.

## Root Cause

Chrome DevTools Protocol (CDP) browser automation has significant gaps when interacting with Brave's native OS file dialogs, Angular-rendered report pages, and MCP tool availability in subagent contexts. PowerSchool's report engine also has inconsistent submission patterns across report types.

## Solution

### Pre-flight Requirements
- Disable "Ask where to save" in `brave://settings/downloads` — `Browser.setDownloadBehavior` CDP command does NOT suppress Brave's native OS save dialog.
- Grant Accessibility permissions to `osascript` in System Preferences before automation if native dialog fallback is needed.

### File Downloads
- Student List Export always downloads as `~/Downloads/student.export.text` — `mv` to correct folder and name immediately after each school export.

### Navigation & Report Pages
- Entry/Exit report path: `/admin/reports/CRB/enrollment/EntryExitReport.html` — Angular page, auto-refreshes on month dropdown (`#m`) change. No submit button needed.
- Enrollment Summary auto-reloads when Tab is pressed after date change — no submit needed.
- `document.getElementById('btnSubmit').click()` is the most reliable submit for standard report engine forms.

### MCP Click Reliability
- UID-based MCP clicks fail frequently (UIDs regenerate between renders).
- Use `evaluate_script` with `getElementById` or `querySelector` instead — this is reliable.

### Report Queue PDF Pattern
1. Submit report
2. Navigate to `detail.html?frn=<id>`
3. `wait_for(["Result File"])`
4. Navigate to result URL
5. `bun save_pdf.js`
- Consecutive Absences result is HTML (BROWSER destination), not PDF — same save pattern applies.

### Subagent Limitation
- `powerschool-navigator` subagent cannot access Chrome DevTools MCP tools — all browser automation must run in the main session.

### Report Sequencing
- P223 Form and Audit is the PRIMARY EDS deliverable — run it first, not last.

### Date Calculations
- Consecutive Absences begin date for a March 2 count = Jan 30 (21 school days back, accounting for Presidents Day).
- Class Attendance Audit period checkboxes use pattern: `param_cbN;1` (e.g., `param_cb1;1` = Period 1).

## Prevention

- Run pre-flight checklist (Brave download setting, Accessibility permissions) before every automation session.
- Always use `evaluate_script` + DOM selectors instead of MCP UID clicks for PowerSchool interactions.
- Keep report order: P223 Form/Audit → Entry/Exit → Student List → Attendance → Consecutive Absences.
- Document the school-days-back calculation for each report month at session start.
