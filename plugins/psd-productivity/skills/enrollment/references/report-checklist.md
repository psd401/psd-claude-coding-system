# Report Checklist — Monthly P223 Enrollment

> Complete checklist organized by role: Building Level, then District Level.
> PowerSchool navigation paths included for browser automation.

## Building Level — Count Day Checklist

### Pre-Count (Before Count Day)

- [ ] Clean up data in PowerSchool
  - [ ] All attending students enrolled and assigned to classes
  - [ ] All withdrawn students exited
  - [ ] Section Enrollment Audit: System Reports > Membership and Enrollment > Section Enrollment Audit
  - [ ] (ES) Class Roster check: System Reports > Student/Staff Listings > Class Rosters (PDF)
- [ ] Check previous month for revisions
  - [ ] Re-run previous month Enrollment Summary with previous count date
  - [ ] Compare to saved report — if different, revision needed
- [ ] Follow up on previous part-time students for FTE changes
- [ ] (HS) Verify Running Start categorization and FTE overrides
- [ ] (HS) Verify Fresh Start Track=C and Program 40

### Count Day Reports

#### Report 1: Enrollment Summary
- **Path**: Left Menu > Enrollment Summary
- **Parameters**: Date = Count Date, All Active Enrollments, Scheduling/Reporting Ethnicity
- **Output**: PDF — save to backup folder
- **Purpose**: Starting headcount by grade level

#### Report 2: Student List Export
- **Path**: Start Page > Click grade level (or All) > Lower right dropdown > Export Using Template > Students
- **Template**: "(Dist) Enrollment - Monthly Backup Student List"
- **Parameters**: "The selected ## students"
- **Output**: Excel — save to backup folder
- **Purpose**: Backup list matching enrollment summary numbers

#### Report 3: Class Attendance Audit
- **Path**: Data and Reporting > Reports > System Reports > Class Attendance Audit
- **Parameters**:
  - Begin Date and End Date: both = Count Date
  - Teachers: All Teachers (highlight blue)
  - Periods: ES = Period 1 only; MS/HS = Periods 1-6
  - Check "Include Student Number"
  - Header Month Date = Count Date
- **Output**: PDF — save to backup folder
- **Note**: Takes several minutes to run at secondary; click refresh until viewable

#### Report 4: Entry/Exit Report
- **Path**: System Reports > Custom Reports tab > Enrollment > Entry/Exit Report
- **Parameters**: Show Enrolled + Show Exited, Previous Month, uncheck Pause
- **Run twice**: Once for previous month, once for current month
- **Validation**: Previous HC + Entries - Exits = Current HC per grade
- **Output**: PDF — save to backup folder

#### Report 5: Consecutive Absence Report
- **Path**: Attendance > Consecutive Absence Report
- **Parameters**:
  - Attendance Codes: ALL CODES (hold Command + select all)
  - Begin Date: 21 school days before count date
  - End Date: Count Date
  - Consecutive Days to Scan: 20
- **Output**: PDF — save to backup folder
- **Note (MS/HS)**: Must be run in two parts at term break (report is by class)

#### Report 6: Student Schedule Report (Secondary Only)
- **Path**: Start Page > Select "All" or "Gr" > Lower right dropdown > Student Schedule Report
- **Parameters**:
  - Title: "[Month] [Year]"
  - Students per page: 3
  - Date: Count Date
  - Sort: Last Name
  - Color: No Coloring
- **Output**: Save as PDF (right-click > Print > PDF)

### Post-Count

- [ ] Run P223 Form and Audit (see p223-process.md for parameters)
- [ ] Complete Enrollment Reporting Template
  - [ ] Column 1: Headcount from Enrollment Summary
  - [ ] Column 2: FTE adjustments by grade level
  - [ ] Column 3: Reported FTE (HC - adjustment)
- [ ] List all adjusted-FTE students on bottom of report (ES/MS) or adjustment spreadsheet (HS)
- [ ] Have principal sign enrollment report
- [ ] File in building enrollment folder (retain 4 years)
- [ ] Send to District: Enrollment Summary, Consecutive Absence, Student Lists, Entry/Exit, FTE adjustment list, signed report

---

## District Level — Monthly Checklist

### Pre-Count

- [ ] Create backup folder: SY Enrollment > BACKUP > [Month] > ES, MS, HS subfolders
- [ ] Update Part Time Spreadsheet
  - [ ] Copy previous month to new tab, lock previous
  - [ ] Merge with Student Services PK/Itinerant spreadsheet
  - [ ] Run 20 consecutive days report, flag exclusions
  - [ ] Follow up on "watch attendance" students
  - [ ] Merge IAES students from Part Time to IAES coordinator spreadsheet
  - [ ] Run MS "less than full schedule" search (Schedule Search > Find Schedule Holes)
  - [ ] Pull Interdistrict Agreement list from Choice Transfer
  - [ ] Send each school their adjustment list for reconciliation

### Count Day

- [ ] Send Enrollment Count Day email reminders
- [ ] Run district-level backup: All schools > Export to (Dist) Enrollment-Monthly Withdraw List

#### Elementary (run under each school)
- [ ] Class Roster (verify teacher matches home_room)
- [ ] Section Enrollment Audit
- [ ] Enrollment Summary for count date
- [ ] Student List export + pivot table for K-5 class sizes
- [ ] Entry/Exit for current and previous months

#### Middle/High Schools
- [ ] Enrollment Summary for count date + student list export
- [ ] Entry/Exit for current and previous months
- [ ] Student Schedule as of count day

#### CTP
- [ ] Update CTP running list (EA drive > CTP folder)
- [ ] Search Track=B > Export template "(Student Services) P223H"
- [ ] Reconcile with CTP teachers
- [ ] Enter HC, adjustments, FTE on internal P223 (PAP tab)

### K-3 Class Size
- [ ] Update K5 CLASS SIZE spreadsheet from pivot tables
- [ ] Email to CFO and ES Asst Super EA
- [ ] Enter K-3 data into EDS > "K-3 Class Size" application
- [ ] Print backup, file in K5 Class Size Binder

### Open Doors (Fresh Start)
- [ ] Receive enrollment report from Fresh Start Retention Specialist
- [ ] Split HC, Non-Voc and Voc FTE by grade level
- [ ] Save to Shared Enrollment Google > Fresh Start
- [ ] Update "A Fresh Start Running List"
- [ ] Compare Fresh Start list vs PowerSchool (PAP > Track A export)
- [ ] Enter on internal P223 under PAP tab

### ALE FTE Reconciliation
- [ ] Copy/paste school data to working tabs
- [ ] Note HC and FTE for comparison
- [ ] Highlight GVA students (yellow), non-instructional sections (pink), RS students (separate color)
- [ ] Verify 1 HC per student, correct FTE
- [ ] Apply split-school FTE rules (see fte-rules.md)
- [ ] Verify RS + ALE combined FTE ≤ 1.20
- [ ] Extract CTE ALE sections (OCT135, OPE901)
- [ ] Send CTE ALE FTE report to CTE program
- [ ] Enter ALE into EDS application
- [ ] Enter ALE into internal P223 and internal ALE spreadsheet

### Running Start Reconciliation
- [ ] Compare TCC RS report against HS adjustment lists
- [ ] Verify combined district + RS FTE ≤ 1.20
- [ ] Check full-time GVA students against RS FTE
- [ ] January: complete SQEAF for semester-change students
- [ ] Update RSCNTRL spreadsheet (Academic/Vocational FTE by school, HC by grade)
- [ ] Back out full-time RS from headcount on internal P223

### Reconciling School Reports
- [ ] ES/MS: Compare Enrollment Summary to previous month backup (backdated exit check)
- [ ] Compare building adjustment lists to Part Time spreadsheet
- [ ] Verify HC matches Enrollment Summary (minus demo students)
- [ ] Verify adjustment math: HC - adjusted FTE = reported FTE

### TBIP
- [ ] Receive EL report from Student Services
- [ ] Enter EL numbers into internal P223 by school

### CTE
- [ ] Receive CTE report from CTE program
- [ ] Verify ALE FTE matches what was sent
- [ ] Enter CTE into internal P223 for secondary schools

### Enter into Internal P223
- [ ] Building HC and FTE (CTP on PAP tab)
- [ ] ALE HC and FTE by school
- [ ] Running Start: total HC, full-time HC, Non-Voc FTE, Voc FTE
- [ ] TBIP by K-5 / 7-12 / exited
- [ ] CTE FTE by 9-12 / 7-8
- [ ] Open Doors (PAP tab)
- [ ] Verify district totals match sum of school tabs

### Submit to EDS
- [ ] Enter monthly enrollment from school tabs
- [ ] Verify EDS district totals match internal P223
- [ ] Enter any revisions to previous months

### Post-Submission
- [ ] File hard copies of enrollment reports
- [ ] Update internal spreadsheets:
  - [ ] SY ANNAVG
  - [ ] SY CNTRL
  - [ ] One Pager
  - [ ] SY Enrollment Summary (ESC Budget)
  - [ ] Ready_Building History (Enrollment Projections)
- [ ] Email Board/Cabinet: count submitted + summary numbers
- [ ] Email Sodexo: CNTRL sheet (Food Services tab)
