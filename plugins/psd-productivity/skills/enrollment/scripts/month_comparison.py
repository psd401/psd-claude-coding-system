# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Month-over-Month Enrollment Comparison for PSD P223.

Compares enrollment summaries across months to detect:
- Backdated exits crossing count days (revision needed)
- Grade level changes affecting previous counts
- Headcount trends

Usage:
    uv run month_comparison.py --current current_summary.csv --previous previous_summary.csv --json
    uv run month_comparison.py --current-data '{"K":100,"1":95}' --previous-data '{"K":98,"1":96}' --json
"""

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field, asdict
from datetime import date
from pathlib import Path
from typing import Optional


@dataclass
class GradeChange:
    grade: str
    previous_hc: int
    current_hc: int
    difference: int
    percent_change: float
    needs_revision: bool = False
    revision_reason: str = ""


@dataclass
class BackdatedExit:
    student_id: str
    student_name: str
    grade: str
    school: str
    exit_date: str
    count_date_crossed: str
    reason: str


@dataclass
class ComparisonReport:
    school: str
    previous_month: str
    current_month: str
    previous_count_date: str
    current_count_date: str
    grade_changes: list[GradeChange] = field(default_factory=list)
    backdated_exits: list[BackdatedExit] = field(default_factory=list)
    total_previous_hc: int = 0
    total_current_hc: int = 0
    total_difference: int = 0
    revisions_needed: int = 0

    def to_markdown(self) -> str:
        lines = [
            f"# Month-over-Month Comparison — {self.school}",
            f"\n**Previous**: {self.previous_month} (count date: {self.previous_count_date})",
            f"**Current**: {self.current_month} (count date: {self.current_count_date})",
            f"\n## Headcount Summary",
            f"- Previous total: {self.total_previous_hc}",
            f"- Current total: {self.total_current_hc}",
            f"- Net change: {self.total_difference:+d}",
        ]

        if self.revisions_needed > 0:
            lines.append(f"\n## Revisions Needed: {self.revisions_needed}\n")
        else:
            lines.append(f"\n## No Revisions Needed\n")

        # Grade-level detail
        lines.append("## Grade-Level Changes\n")
        lines.append("| Grade | Previous | Current | Change | % | Revision? |")
        lines.append("|-------|----------|---------|--------|---|-----------|")
        for gc in self.grade_changes:
            rev = "**YES**" if gc.needs_revision else "No"
            pct = f"{gc.percent_change:+.1f}%" if gc.previous_hc > 0 else "N/A"
            lines.append(
                f"| {gc.grade} | {gc.previous_hc} | {gc.current_hc} | "
                f"{gc.difference:+d} | {pct} | {rev} |"
            )

        # Backdated exits
        if self.backdated_exits:
            lines.append(f"\n## Backdated Exits Crossing Count Days\n")
            lines.append("| Student | Grade | Exit Date | Count Date Crossed | Reason |")
            lines.append("|---------|-------|-----------|--------------------|--------|")
            for be in self.backdated_exits:
                lines.append(
                    f"| {be.student_id} | {be.grade} | {be.exit_date} | "
                    f"{be.count_date_crossed} | {be.reason} |"
                )

        # Revision details
        revisions = [gc for gc in self.grade_changes if gc.needs_revision]
        if revisions:
            lines.append(f"\n## Revision Details\n")
            for gc in revisions:
                lines.append(f"- **Grade {gc.grade}**: {gc.revision_reason}")

        return "\n".join(lines)


def compare_enrollment_summaries(
    previous_hc: dict[str, int],
    current_hc: dict[str, int],
    school: str = "Unknown",
    previous_month: str = "",
    current_month: str = "",
    previous_count_date: str = "",
    current_count_date: str = "",
) -> ComparisonReport:
    """Compare two months of enrollment summary data."""
    report = ComparisonReport(
        school=school,
        previous_month=previous_month,
        current_month=current_month,
        previous_count_date=previous_count_date,
        current_count_date=current_count_date,
    )

    all_grades = sorted(set(list(previous_hc.keys()) + list(current_hc.keys())),
                        key=lambda g: (int(g) if g.lstrip("-").isdigit() else 99, g))

    for grade in all_grades:
        prev = previous_hc.get(grade, 0)
        curr = current_hc.get(grade, 0)
        diff = curr - prev
        pct = (diff / prev * 100) if prev > 0 else 0

        gc = GradeChange(
            grade=grade,
            previous_hc=prev,
            current_hc=curr,
            difference=diff,
            percent_change=round(pct, 1),
        )
        report.grade_changes.append(gc)

    report.total_previous_hc = sum(previous_hc.values())
    report.total_current_hc = sum(current_hc.values())
    report.total_difference = report.total_current_hc - report.total_previous_hc

    return report


def detect_backdated_exits(
    previous_student_list: list[dict],
    current_student_list: list[dict],
    previous_count_date: str,
    student_id_field: str = "Student_Number",
    grade_field: str = "Grade_Level",
    exit_date_field: str = "ExitDate",
) -> list[BackdatedExit]:
    """
    Detect students present in previous month but absent in current month
    with an exit date before the previous count date (backdated exit = revision needed).
    """
    prev_ids = {s[student_id_field] for s in previous_student_list if student_id_field in s}
    curr_ids = {s[student_id_field] for s in current_student_list if student_id_field in s}

    # Students who disappeared
    missing = prev_ids - curr_ids
    backdated = []

    # Build lookup for previous list
    prev_lookup = {s[student_id_field]: s for s in previous_student_list if student_id_field in s}

    for sid in missing:
        student = prev_lookup.get(sid, {})
        exit_date = student.get(exit_date_field, "")

        # If exit date is before the previous count date, it's a backdated exit
        if exit_date and previous_count_date:
            try:
                # Try MM/DD/YYYY format
                for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y"):
                    try:
                        exit_dt = date.fromisoformat(exit_date) if "-" in exit_date else None
                        if exit_dt is None:
                            from datetime import datetime as dt
                            exit_dt = dt.strptime(exit_date, fmt).date()
                        break
                    except (ValueError, TypeError):
                        continue
                else:
                    continue

                for fmt in ("%m/%d/%Y", "%Y-%m-%d", "%m/%d/%y"):
                    try:
                        count_dt = date.fromisoformat(previous_count_date) if "-" in previous_count_date else None
                        if count_dt is None:
                            from datetime import datetime as dt
                            count_dt = dt.strptime(previous_count_date, fmt).date()
                        break
                    except (ValueError, TypeError):
                        continue
                else:
                    continue

                if exit_dt < count_dt:
                    backdated.append(BackdatedExit(
                        student_id=sid,
                        student_name=student.get("LastFirst", student.get("Name", "Unknown")),
                        grade=student.get(grade_field, "?"),
                        school=student.get("SchoolName", ""),
                        exit_date=exit_date,
                        count_date_crossed=previous_count_date,
                        reason=f"Exit date {exit_date} is before count date {previous_count_date}",
                    ))
            except Exception:
                continue

    return backdated


def load_csv_headcount(path: str, grade_field: str = "Grade_Level") -> dict[str, int]:
    """Load a CSV and count students per grade."""
    if not Path(path).exists():
        return {}
    counts: dict[str, int] = {}
    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            grade = row.get(grade_field, "?").strip()
            counts[grade] = counts.get(grade, 0) + 1
    return counts


def main():
    parser = argparse.ArgumentParser(description="PSD Month-over-Month Enrollment Comparison")
    parser.add_argument("--school", default="Unknown", help="School code")
    parser.add_argument("--current", help="Path to current month student list CSV")
    parser.add_argument("--previous", help="Path to previous month student list CSV")
    parser.add_argument("--current-data", help="Current month HC as JSON (e.g., '{\"K\":100,\"1\":95}')")
    parser.add_argument("--previous-data", help="Previous month HC as JSON")
    parser.add_argument("--current-month", default="Current", help="Current month name")
    parser.add_argument("--previous-month", default="Previous", help="Previous month name")
    parser.add_argument("--current-count-date", default="", help="Current count date")
    parser.add_argument("--previous-count-date", default="", help="Previous count date")
    parser.add_argument("--output", help="Output path for comparison report")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    # Load data
    if args.current_data and args.previous_data:
        current_hc = json.loads(args.current_data)
        previous_hc = json.loads(args.previous_data)
        current_hc = {k: int(v) for k, v in current_hc.items()}
        previous_hc = {k: int(v) for k, v in previous_hc.items()}
    elif args.current and args.previous:
        current_hc = load_csv_headcount(args.current)
        previous_hc = load_csv_headcount(args.previous)
    else:
        print("Error: Provide either --current/--previous CSV paths or --current-data/--previous-data JSON",
              file=sys.stderr)
        sys.exit(1)

    report = compare_enrollment_summaries(
        previous_hc=previous_hc,
        current_hc=current_hc,
        school=args.school,
        previous_month=args.previous_month,
        current_month=args.current_month,
        previous_count_date=args.previous_count_date,
        current_count_date=args.current_count_date,
    )

    if args.json:
        print(json.dumps(asdict(report), indent=2))
    else:
        output = report.to_markdown()
        if args.output:
            Path(args.output).write_text(output)
            print(f"Report written to {args.output}")
        else:
            print(output)


if __name__ == "__main__":
    main()
