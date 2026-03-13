# /// script
# requires-python = ">=3.11"
# dependencies = []
# ///

"""
Entry/Exit Balancer for PSD P223 Enrollment.

Reconciles: Previous month HC + Entries - Exits = Current month HC (per grade, per school).
Flags imbalances with specific student details.

Usage:
    uv run entry_exit_balancer.py --prev-hc '{"K":100,"1":95}' --entries '{"K":5,"1":3}' --exits '{"K":2,"1":4}' --current-hc '{"K":103,"1":94}'
    uv run entry_exit_balancer.py --prev-summary prev.csv --entry-exit-current current_ee.csv --entry-exit-previous prev_ee.csv --current-summary current.csv
"""

import argparse
import csv
import json
import sys
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional


@dataclass
class GradeBalance:
    grade: str
    previous_hc: int
    entries: int
    exits: int
    expected_hc: int
    actual_hc: int
    difference: int  # actual - expected
    balanced: bool
    entry_students: list[str] = field(default_factory=list)
    exit_students: list[str] = field(default_factory=list)


@dataclass
class BalanceReport:
    school: str
    previous_month: str
    current_month: str
    grades: list[GradeBalance] = field(default_factory=list)
    total_previous: int = 0
    total_entries: int = 0
    total_exits: int = 0
    total_expected: int = 0
    total_actual: int = 0
    all_balanced: bool = True

    def to_markdown(self) -> str:
        lines = [
            f"# Entry/Exit Balance Report — {self.school}",
            f"\n**Previous month**: {self.previous_month}",
            f"**Current month**: {self.current_month}",
            f"\n## Summary",
            f"- Previous HC: {self.total_previous}",
            f"- Entries: +{self.total_entries}",
            f"- Exits: -{self.total_exits}",
            f"- Expected: {self.total_expected}",
            f"- Actual: {self.total_actual}",
        ]

        if self.all_balanced:
            lines.append(f"\n**All grades balance correctly.**")
        else:
            imbalanced = [g for g in self.grades if not g.balanced]
            lines.append(f"\n**{len(imbalanced)} grade(s) do NOT balance.**")

        # Detail table
        lines.append("\n## Grade-Level Detail\n")
        lines.append("| Grade | Prev HC | +Entries | -Exits | =Expected | Actual | Diff | Status |")
        lines.append("|-------|---------|----------|--------|-----------|--------|------|--------|")

        for g in self.grades:
            status = "OK" if g.balanced else f"**OFF BY {g.difference:+d}**"
            lines.append(
                f"| {g.grade} | {g.previous_hc} | +{g.entries} | -{g.exits} | "
                f"{g.expected_hc} | {g.actual_hc} | {g.difference:+d} | {status} |"
            )

        # Total row
        total_diff = self.total_actual - self.total_expected
        total_status = "OK" if total_diff == 0 else f"**OFF BY {total_diff:+d}**"
        lines.append(
            f"| **Total** | **{self.total_previous}** | **+{self.total_entries}** | "
            f"**-{self.total_exits}** | **{self.total_expected}** | **{self.total_actual}** | "
            f"**{total_diff:+d}** | {total_status} |"
        )

        # Imbalance details
        imbalanced = [g for g in self.grades if not g.balanced]
        if imbalanced:
            lines.append("\n## Imbalances to Investigate\n")
            for g in imbalanced:
                lines.append(f"### Grade {g.grade} (off by {g.difference:+d})")
                lines.append(f"Expected {g.expected_hc} ({g.previous_hc} + {g.entries} - {g.exits}), "
                            f"but actual is {g.actual_hc}.\n")
                lines.append("**Possible causes**:")
                if g.difference < 0:
                    lines.append("- Student exited with backdated date not captured in Entry/Exit report")
                    lines.append("- Grade level change moved student out of this grade")
                elif g.difference > 0:
                    lines.append("- Student enrolled with backdated entry date not captured in Entry/Exit report")
                    lines.append("- Grade level change moved student into this grade")

                if g.entry_students:
                    lines.append(f"\nEntries: {', '.join(g.entry_students)}")
                if g.exit_students:
                    lines.append(f"\nExits: {', '.join(g.exit_students)}")
                lines.append("")

        return "\n".join(lines)


def balance_grades(
    prev_hc: dict[str, int],
    entries: dict[str, int],
    exits: dict[str, int],
    current_hc: dict[str, int],
    school: str = "Unknown",
    previous_month: str = "Previous",
    current_month: str = "Current",
    entry_details: Optional[dict[str, list[str]]] = None,
    exit_details: Optional[dict[str, list[str]]] = None,
) -> BalanceReport:
    """
    Balance enrollment across two months.

    Args:
        prev_hc: Previous month headcount by grade
        entries: Number of entries by grade
        exits: Number of exits by grade
        current_hc: Current month headcount by grade
        entry_details: Optional dict of grade -> list of student IDs who entered
        exit_details: Optional dict of grade -> list of student IDs who exited
    """
    entry_details = entry_details or {}
    exit_details = exit_details or {}

    report = BalanceReport(
        school=school,
        previous_month=previous_month,
        current_month=current_month,
    )

    all_grades = sorted(
        set(list(prev_hc.keys()) + list(current_hc.keys()) +
            list(entries.keys()) + list(exits.keys())),
        key=lambda g: (int(g) if g.lstrip("-").isdigit() else 99, g)
    )

    for grade in all_grades:
        prev = prev_hc.get(grade, 0)
        entry = entries.get(grade, 0)
        exit_ = exits.get(grade, 0)
        actual = current_hc.get(grade, 0)
        expected = prev + entry - exit_
        diff = actual - expected

        gb = GradeBalance(
            grade=grade,
            previous_hc=prev,
            entries=entry,
            exits=exit_,
            expected_hc=expected,
            actual_hc=actual,
            difference=diff,
            balanced=(diff == 0),
            entry_students=entry_details.get(grade, []),
            exit_students=exit_details.get(grade, []),
        )
        report.grades.append(gb)

        if not gb.balanced:
            report.all_balanced = False

    report.total_previous = sum(prev_hc.values())
    report.total_entries = sum(entries.values())
    report.total_exits = sum(exits.values())
    report.total_expected = report.total_previous + report.total_entries - report.total_exits
    report.total_actual = sum(current_hc.values())

    return report


def parse_entry_exit_csv(
    path: str,
    grade_field: str = "Grade_Level",
    student_id_field: str = "Student_Number",
    type_field: str = "Type",  # "Entry" or "Exit"
) -> tuple[dict[str, int], dict[str, int], dict[str, list[str]], dict[str, list[str]]]:
    """
    Parse an Entry/Exit report CSV.

    Returns: (entries_by_grade, exits_by_grade, entry_student_ids, exit_student_ids)
    """
    entries: dict[str, int] = {}
    exits: dict[str, int] = {}
    entry_ids: dict[str, list[str]] = {}
    exit_ids: dict[str, list[str]] = {}

    if not Path(path).exists():
        return entries, exits, entry_ids, exit_ids

    with open(path, "r", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            grade = row.get(grade_field, "?").strip()
            sid = row.get(student_id_field, "?").strip()
            entry_type = row.get(type_field, "").strip().lower()

            if "entry" in entry_type or "enroll" in entry_type:
                entries[grade] = entries.get(grade, 0) + 1
                entry_ids.setdefault(grade, []).append(sid)
            elif "exit" in entry_type or "withdraw" in entry_type:
                exits[grade] = exits.get(grade, 0) + 1
                exit_ids.setdefault(grade, []).append(sid)

    return entries, exits, entry_ids, exit_ids


def load_summary_hc(path: str, grade_field: str = "Grade_Level") -> dict[str, int]:
    """Load enrollment summary CSV and count per grade."""
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
    parser = argparse.ArgumentParser(description="PSD Entry/Exit Balancer")
    parser.add_argument("--school", default="Unknown", help="School code")
    parser.add_argument("--previous-month", default="Previous", help="Previous month name")
    parser.add_argument("--current-month", default="Current", help="Current month name")

    # JSON input mode
    parser.add_argument("--prev-hc", help="Previous HC as JSON")
    parser.add_argument("--entries", help="Entries as JSON")
    parser.add_argument("--exits", help="Exits as JSON")
    parser.add_argument("--current-hc", help="Current HC as JSON")

    # CSV input mode
    parser.add_argument("--prev-summary", help="Previous month summary CSV")
    parser.add_argument("--current-summary", help="Current month summary CSV")
    parser.add_argument("--entry-exit-current", help="Current month entry/exit CSV")

    parser.add_argument("--output", help="Output path for report")
    parser.add_argument("--json", action="store_true", help="Output as JSON")

    args = parser.parse_args()

    # Load data
    if args.prev_hc and args.current_hc:
        prev_hc = {k: int(v) for k, v in json.loads(args.prev_hc).items()}
        current_hc = {k: int(v) for k, v in json.loads(args.current_hc).items()}
        entries_data = {k: int(v) for k, v in json.loads(args.entries or "{}").items()}
        exits_data = {k: int(v) for k, v in json.loads(args.exits or "{}").items()}
        entry_details: dict[str, list[str]] = {}
        exit_details: dict[str, list[str]] = {}
    elif args.prev_summary and args.current_summary:
        prev_hc = load_summary_hc(args.prev_summary)
        current_hc = load_summary_hc(args.current_summary)
        if args.entry_exit_current:
            entries_data, exits_data, entry_details, exit_details = parse_entry_exit_csv(
                args.entry_exit_current)
        else:
            entries_data, exits_data = {}, {}
            entry_details, exit_details = {}, {}
    else:
        print("Error: Provide JSON data (--prev-hc, --current-hc) or CSV paths (--prev-summary, --current-summary)",
              file=sys.stderr)
        sys.exit(1)

    report = balance_grades(
        prev_hc=prev_hc,
        entries=entries_data,
        exits=exits_data,
        current_hc=current_hc,
        school=args.school,
        previous_month=args.previous_month,
        current_month=args.current_month,
        entry_details=entry_details if 'entry_details' in dir() else {},
        exit_details=exit_details if 'exit_details' in dir() else {},
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
