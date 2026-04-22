#!/usr/bin/env python3
# /// script
# dependencies = ["reportlab"]
# ///
"""
PSD Branded PDF Generator.

Generates professional PDFs with PSD letterhead, Inter/Josefin Sans fonts,
and a Documenso-ready field manifest for signing workflows.

Two modes:
  Interactive:  uv run generate_pdf.py --spec spec.json --output /path/to/doc.pdf
  Scriptable:   uv run generate_pdf.py --json '{"title":"...","sections":[...]}' --output /path/to/doc.pdf

Output:
  1. PDF file at --output path
  2. Field manifest at {output}.fields.json
  3. Stdout: JSON with {"pdf": "...", "manifest": "..."}

Section types: heading, paragraph, field_row, checkbox_group, table,
               signature_block, spacer, divider
"""

import argparse
import json
import re
import sys
from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas as canvas_module

# Import letterhead module from same directory
sys.path.insert(0, str(Path(__file__).parent))
from letterhead import (
    apply_letterhead,
    get_content_area,
    register_fonts,
    PACIFIC,
    SEA_GLASS,
    DRIFTWOOD,
    PAGE_WIDTH,
    PAGE_HEIGHT,
)

# Layout constants
FIELD_BOX_HEIGHT = 22  # points — height of input field boxes
FIELD_LABEL_SIZE = 7.5
FIELD_GAP = 8  # gap between field rows
CHECKBOX_SIZE = 10
SIGNATURE_HEIGHT = 40  # points — height of signature box
TABLE_HEADER_BG = HexColor("#25424C")
TABLE_ALT_BG = HexColor("#F5F5F5")
LIGHT_GRAY = HexColor("#CCCCCC")
MEDIUM_GRAY = HexColor("#999999")


class PDFBuilder:
    """Builds a branded PSD PDF from a document spec."""

    def __init__(self, output_path: str):
        self.output_path = output_path
        self.fields = []  # Documenso field manifest entries
        self.current_page = 1
        self.total_pages = 1  # will be calculated
        self.title = None

        register_fonts()

    def _points_to_documenso(self, x, y, w, h):
        """Convert reportlab points to Documenso percentage coordinates.

        reportlab: origin bottom-left, y increases upward
        Documenso: origin top-left, y increases downward, 0-100 percentages
        """
        return {
            "positionX": round((x / PAGE_WIDTH) * 100, 2),
            "positionY": round(((PAGE_HEIGHT - y - h) / PAGE_HEIGHT) * 100, 2),
            "width": round((w / PAGE_WIDTH) * 100, 2),
            "height": round((h / PAGE_HEIGHT) * 100, 2),
        }

    def _add_field(self, name, field_type, x, y, w, h, page, **kwargs):
        """Register a field for the Documenso manifest."""
        coords = self._points_to_documenso(x, y, w, h)
        # Map field types to Documenso outer/inner types
        type_map = {
            "SIGNATURE": ("SIGNATURE", "signature"),
            "DATE": ("DATE", "date"),
            "TEXT": ("TEXT", "text"),
            "NAME": ("NAME", "name"),
            "EMAIL": ("EMAIL", "email"),
            "CHECKBOX": ("CHECKBOX", "checkbox"),
            "INITIALS": ("INITIALS", "initials"),
            "NUMBER": ("TEXT", "number"),
            "DROPDOWN": ("DROPDOWN", "dropdown"),
            "MULTILINE_TEXT": ("TEXT", "text"),
        }
        outer_type, inner_type = type_map.get(field_type, ("TEXT", "text"))

        field_meta = {
            "type": inner_type,
            "label": kwargs.get("label", name),
            "required": kwargs.get("required", True),
        }
        if "placeholder" in kwargs:
            field_meta["placeholder"] = kwargs["placeholder"]
        if "options" in kwargs:
            field_meta["options"] = kwargs["options"]

        self.fields.append({
            "name": name,
            "type": outer_type,
            "fieldMeta": field_meta,
            "page": page,
            **coords,
        })

    def _draw_heading(self, c, area, y, section):
        """Draw a heading. Returns new y position."""
        level = section.get("level", 1)
        sizes = {1: 18, 2: 14, 3: 11}
        size = sizes.get(level, 14)

        font = "JosefinSans-Bold" if level <= 2 else "Inter-Bold"
        c.setFont(font, size)
        c.setFillColor(PACIFIC)
        y -= size + 4
        c.drawString(area["x"], y, section["text"])
        return y - 6

    def _draw_paragraph(self, c, area, y, section):
        """Draw wrapped paragraph text. Returns new y position."""
        c.setFont("Inter", section.get("fontSize", 10))
        c.setFillColor(PACIFIC)

        text = section["text"]
        max_width = area["width"]
        line_height = section.get("lineHeight", 14)

        # Simple word-wrap
        words = text.split()
        lines = []
        current_line = ""
        for word in words:
            test = f"{current_line} {word}".strip()
            if c.stringWidth(test, "Inter", section.get("fontSize", 10)) <= max_width:
                current_line = test
            else:
                if current_line:
                    lines.append(current_line)
                current_line = word
        if current_line:
            lines.append(current_line)

        for line in lines:
            y -= line_height
            if y < area["bottom"]:
                return y  # signal page break needed
            c.drawString(area["x"], y, line)

        return y - 8

    def _draw_field_row(self, c, area, y, section):
        """Draw a row of labeled input boxes. Returns new y position.

        Options:
          showLabels: bool (default True) — render labels above fields
          rowGap: int (default FIELD_GAP) — vertical gap after the row
          gap: int (default FIELD_GAP) — horizontal gap between fields
        """
        fields = section.get("fields", [])
        if not fields:
            return y

        show_labels = section.get("showLabels", True)
        h_gap = section.get("gap", FIELD_GAP)
        row_gap = section.get("rowGap", FIELD_GAP)

        total_gap = h_gap * (len(fields) - 1)
        total_width = area["width"] - total_gap
        x = area["x"]

        # Calculate field widths
        field_widths = []
        for f in fields:
            w = f.get("width", 1.0 / len(fields))
            field_widths.append(w * total_width)

        # Use per-field height if specified, otherwise default
        # For the row layout, use the tallest field's height
        row_height = max(f.get("height", FIELD_BOX_HEIGHT) for f in fields)

        # Move down: label height (if shown) + box height + padding
        label_reserve = (FIELD_LABEL_SIZE + 4) if show_labels else 0
        y -= (label_reserve + row_height + 2)

        # y is now at the bottom of the field box
        box_y = y
        for i, (field, fw) in enumerate(zip(fields, field_widths)):
            fh = field.get("height", FIELD_BOX_HEIGHT)

            # Label above the box (optional)
            if show_labels:
                c.setFont("Inter", FIELD_LABEL_SIZE)
                c.setFillColor(PACIFIC)
                c.drawString(x, box_y + fh + 3, field.get("label", ""))

            # Draw input box
            c.setStrokeColor(LIGHT_GRAY)
            c.setLineWidth(0.75)
            c.rect(x, box_y, fw, fh, fill=0, stroke=1)

            # Pre-filled value (if any)
            value = field.get("value", "")
            if value:
                c.setFont("Inter", 9)
                c.setFillColor(PACIFIC)
                c.drawString(x + 4, box_y + fh - 14, str(value))

            # Register field in manifest
            field_type = field.get("type", "TEXT")
            field_name = self._slugify(field.get("label", f"field_{i}"))
            self._add_field(
                field_name, field_type, x, box_y, fw, fh,
                self.current_page,
                label=field.get("label", ""),
                required=field.get("required", True),
                placeholder=field.get("placeholder", ""),
            )

            x += fw + h_gap

        return box_y - row_gap

    def _draw_checkbox_group(self, c, area, y, section):
        """Draw a vertical list of checkboxes. Returns new y position."""
        items = section.get("items", [])
        label = section.get("label", "")

        if label:
            y -= 14
            c.setFont("Inter-Bold", 10)
            c.setFillColor(PACIFIC)
            c.drawString(area["x"], y, label)
            y -= 4

        for i, item in enumerate(items):
            y -= 18
            x = area["x"]

            # Checkbox box
            c.setStrokeColor(LIGHT_GRAY)
            c.setLineWidth(0.75)
            c.rect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, fill=0, stroke=1)

            # Pre-checked?
            if item.get("checked", False):
                c.setStrokeColor(PACIFIC)
                c.setLineWidth(1.5)
                c.line(x + 2, y + 5, x + 4, y + 2)
                c.line(x + 4, y + 2, x + 8, y + 8)

            # Label
            c.setFont("Inter", 10)
            c.setFillColor(PACIFIC)
            c.drawString(x + CHECKBOX_SIZE + 6, y + 2, item.get("label", ""))

            # Register field
            field_name = self._slugify(item.get("label", f"checkbox_{i}"))
            self._add_field(
                field_name, "CHECKBOX", x, y, CHECKBOX_SIZE, CHECKBOX_SIZE,
                self.current_page,
                label=item.get("label", ""),
                required=item.get("required", False),
            )

        return y - FIELD_GAP

    def _draw_table(self, c, area, y, section):
        """Draw a simple data table. Returns new y position."""
        headers = section.get("headers", [])
        rows = section.get("rows", [])
        col_count = len(headers) if headers else (len(rows[0]) if rows else 0)
        if col_count == 0:
            return y

        # Support custom column widths as fractions (e.g., [0.1, 0.1, 0.1, 0.35, 0.35])
        # Falls back to equal widths if not specified
        col_widths_spec = section.get("col_widths", None)
        if col_widths_spec and len(col_widths_spec) == col_count:
            col_widths = [w * area["width"] for w in col_widths_spec]
        else:
            col_widths = [area["width"] / col_count] * col_count

        row_height = section.get("row_height", 18)
        x_start = area["x"]

        # Compute column x positions
        col_x = [x_start]
        for w in col_widths[:-1]:
            col_x.append(col_x[-1] + w)

        # Headers
        if headers:
            y -= row_height
            c.setFillColor(TABLE_HEADER_BG)
            c.rect(x_start, y, area["width"], row_height, fill=1, stroke=0)
            c.setFont("Inter-Bold", 8)
            c.setFillColor(HexColor("#FFFFFF"))
            for i, header in enumerate(headers):
                c.drawString(col_x[i] + 4, y + 5, str(header))

        # Rows
        c.setFont("Inter", 9)
        for r_idx, row in enumerate(rows):
            y -= row_height
            if y < area["bottom"]:
                return y
            # Alternating background
            if r_idx % 2 == 1:
                c.setFillColor(TABLE_ALT_BG)
                c.rect(x_start, y, area["width"], row_height, fill=1, stroke=0)
            # Cell borders — draw individual cell borders for custom widths
            c.setStrokeColor(LIGHT_GRAY)
            c.setLineWidth(0.5)
            for i in range(col_count):
                c.rect(col_x[i], y, col_widths[i], row_height, fill=0, stroke=1)
            # Cell text
            c.setFillColor(PACIFIC)
            for i, cell in enumerate(row):
                c.drawString(col_x[i] + 4, y + 5, str(cell))

        return y - FIELD_GAP

    def _draw_signature_block(self, c, area, y, section):
        """Draw signature block at bottom of content area. Returns new y position."""
        signers = section.get("signers", [])
        if not signers:
            return y

        # Calculate layout
        signer_count = len(signers)
        gap = 24
        total_gap = gap * (signer_count - 1)
        signer_width = (area["width"] - total_gap) / signer_count

        # Position signature block — either at current y or at the bottom of content area
        anchor = section.get("anchor", "flow")
        if anchor == "bottom":
            # Pin to bottom of content area
            block_height = SIGNATURE_HEIGHT + 30  # sig + date + labels
            y = area["bottom"] + block_height
        else:
            y -= 12  # padding above signature block

        sig_y = y - SIGNATURE_HEIGHT
        x = area["x"]

        for i, signer in enumerate(signers):
            role = signer.get("role", f"Signer {i+1}")
            signer_fields = signer.get("fields", ["SIGNATURE", "DATE"])

            # Role label above
            c.setFont("Inter-Bold", 8)
            c.setFillColor(PACIFIC)
            c.drawString(x, sig_y + SIGNATURE_HEIGHT + 4, role)

            field_y = sig_y
            for field_type in signer_fields:
                if field_type == "SIGNATURE":
                    # Signature line
                    c.setStrokeColor(PACIFIC)
                    c.setLineWidth(0.75)
                    line_y = field_y + 2
                    c.line(x, line_y, x + signer_width, line_y)
                    # "Signature" label below line
                    c.setFont("Inter", 7)
                    c.setFillColor(MEDIUM_GRAY)
                    c.drawString(x, field_y - 8, "Signature")

                    self._add_field(
                        self._slugify(f"{role}_signature"),
                        "SIGNATURE", x, field_y, signer_width, SIGNATURE_HEIGHT,
                        self.current_page, label=f"{role} Signature",
                    )
                    field_y -= SIGNATURE_HEIGHT + 8

                elif field_type == "DATE":
                    # Date line
                    date_width = min(signer_width * 0.5, 120)
                    c.setStrokeColor(PACIFIC)
                    c.setLineWidth(0.75)
                    line_y = field_y + 2
                    c.line(x, line_y, x + date_width, line_y)
                    c.setFont("Inter", 7)
                    c.setFillColor(MEDIUM_GRAY)
                    c.drawString(x, field_y - 8, "Date")

                    self._add_field(
                        self._slugify(f"{role}_date"),
                        "DATE", x, field_y, date_width, 18,
                        self.current_page, label=f"{role} Date",
                    )
                    field_y -= 26

                elif field_type == "INITIALS":
                    init_size = 30
                    c.setStrokeColor(LIGHT_GRAY)
                    c.setLineWidth(0.75)
                    c.rect(x, field_y, init_size, init_size, fill=0, stroke=1)
                    c.setFont("Inter", 7)
                    c.setFillColor(MEDIUM_GRAY)
                    c.drawString(x, field_y - 8, "Initials")

                    self._add_field(
                        self._slugify(f"{role}_initials"),
                        "INITIALS", x, field_y, init_size, init_size,
                        self.current_page, label=f"{role} Initials",
                    )
                    field_y -= init_size + 8

                elif field_type in ("TEXT", "NAME", "EMAIL"):
                    # Text input line
                    c.setStrokeColor(PACIFIC)
                    c.setLineWidth(0.75)
                    line_y = field_y + 2
                    c.line(x, line_y, x + signer_width, line_y)
                    label = field_type.replace("_", " ").title()
                    c.setFont("Inter", 7)
                    c.setFillColor(MEDIUM_GRAY)
                    c.drawString(x, field_y - 8, label)

                    self._add_field(
                        self._slugify(f"{role}_{field_type}"),
                        field_type, x, field_y, signer_width, 18,
                        self.current_page, label=f"{role} {label}",
                    )
                    field_y -= 26

            x += signer_width + gap

        return sig_y - 40

    def _draw_spacer(self, c, area, y, section):
        """Add vertical space. Returns new y position."""
        height = section.get("height", 20)
        return y - height

    def _draw_divider(self, c, area, y, section):
        """Draw a horizontal divider line. Returns new y position."""
        y -= 8
        color = HexColor(section.get("color", "#CCCCCC"))
        c.setStrokeColor(color)
        c.setLineWidth(section.get("weight", 0.75))
        c.line(area["x"], y, area["x"] + area["width"], y)
        return y - 8

    def _estimate_section_height(self, section):
        """Estimate the height a section will consume (in points).

        Used for pre-flight page break checks so content never overflows
        into the footer.
        """
        st = section.get("type", "paragraph")
        if st == "heading":
            level = section.get("level", 1)
            sizes = {1: 18, 2: 14, 3: 11}
            return sizes.get(level, 14) + 10
        elif st == "paragraph":
            text = section.get("text", "")
            # ~80 chars per line at 10pt Inter on 468pt width
            lines = max(1, len(text) // 75 + 1)
            return lines * section.get("lineHeight", 14) + 12
        elif st == "field_row":
            fields = section.get("fields", [])
            row_h = max((f.get("height", FIELD_BOX_HEIGHT) for f in fields), default=FIELD_BOX_HEIGHT)
            return FIELD_LABEL_SIZE + row_h + 6 + FIELD_GAP
        elif st == "checkbox_group":
            items = section.get("items", [])
            label_h = 18 if section.get("label") else 0
            return label_h + 18 * len(items) + FIELD_GAP
        elif st == "table":
            rows = section.get("rows", [])
            header_h = 18 if section.get("headers") else 0
            return header_h + 18 * len(rows) + FIELD_GAP
        elif st == "signature_block":
            signers = section.get("signers", [])
            max_fields = max((len(s.get("fields", [])) for s in signers), default=2)
            return 16 + SIGNATURE_HEIGHT + (max_fields - 1) * 34 + 40
        elif st == "spacer":
            return section.get("height", 20)
        elif st == "divider":
            return 16
        return 20

    def _slugify(self, text):
        """Convert text to a valid field name slug."""
        slug = re.sub(r"[^a-zA-Z0-9]+", "_", text.lower()).strip("_")
        return slug or "field"

    def _substitute_data(self, text, data):
        """Replace {{variable}} placeholders with data values."""
        if not data:
            return text
        for key, value in data.items():
            text = text.replace(f"{{{{{key}}}}}", str(value))
        return text

    def build(self, spec):
        """Build the PDF from a document spec dict."""
        self.title = spec.get("title", "Document")
        self.department = spec.get("department", None)
        sections = spec.get("sections", [])
        data = spec.get("data", {})

        # Substitute data in text sections
        for section in sections:
            if "text" in section:
                section["text"] = self._substitute_data(section["text"], data)
            if "items" in section:
                for item in section["items"]:
                    if "label" in item:
                        item["label"] = self._substitute_data(item["label"], data)
            if "fields" in section and section.get("type") != "signature_block":
                for field in section["fields"]:
                    if "value" in field:
                        field["value"] = self._substitute_data(str(field["value"]), data)

        # Estimate page count (rough: ~600pt usable per page)
        content_per_page = get_content_area(1)["height"]
        estimated_height = 0
        for section in sections:
            st = section.get("type", "paragraph")
            if st == "heading":
                estimated_height += 30
            elif st == "paragraph":
                estimated_height += 20 * (1 + len(section.get("text", "")) // 80)
            elif st == "field_row":
                estimated_height += FIELD_BOX_HEIGHT + 20
            elif st == "checkbox_group":
                estimated_height += 18 * len(section.get("items", []))
            elif st == "table":
                estimated_height += 18 * (1 + len(section.get("rows", [])))
            elif st == "signature_block":
                estimated_height += 80
            elif st == "spacer":
                estimated_height += section.get("height", 20)
            elif st == "divider":
                estimated_height += 20

        self.total_pages = max(1, int(estimated_height / content_per_page) + 1)

        # Create canvas
        c = canvas_module.Canvas(self.output_path, pagesize=letter)
        self.current_page = 1
        area = get_content_area(self.current_page)
        y = area["top"]

        # Apply letterhead to first page
        apply_letterhead(c, self.title, self.current_page, self.total_pages, department=self.department)

        # Section dispatch
        draw_map = {
            "heading": self._draw_heading,
            "paragraph": self._draw_paragraph,
            "field_row": self._draw_field_row,
            "checkbox_group": self._draw_checkbox_group,
            "table": self._draw_table,
            "signature_block": self._draw_signature_block,
            "spacer": self._draw_spacer,
            "divider": self._draw_divider,
        }

        for section in sections:
            section_type = section.get("type", "paragraph")
            draw_fn = draw_map.get(section_type)
            if draw_fn is None:
                print(f"Warning: unknown section type '{section_type}', skipping",
                      file=sys.stderr)
                continue

            # Pre-flight check: will this section fit on the current page?
            estimated_h = self._estimate_section_height(section)
            if y - estimated_h < area["bottom"]:
                # Not enough room — page break BEFORE drawing
                c.showPage()
                self.current_page += 1
                apply_letterhead(c, self.title, self.current_page, self.total_pages, department=self.department)
                area = get_content_area(self.current_page)
                y = area["top"]

            new_y = draw_fn(c, area, y, section)

            # Safety net: if section still overflowed (e.g., very long paragraph),
            # page break and re-draw
            if new_y < area["bottom"]:
                c.showPage()
                self.current_page += 1
                apply_letterhead(c, self.title, self.current_page, self.total_pages, department=self.department)
                area = get_content_area(self.current_page)
                y = area["top"]
                new_y = draw_fn(c, area, y, section)

            y = new_y

        c.save()

        # Fix total_pages if we ended up with a different count
        if self.current_page != self.total_pages:
            self.total_pages = self.current_page
            # Re-generate with correct page count
            self.fields = []
            self.current_page = 1
            c = canvas_module.Canvas(self.output_path, pagesize=letter)
            area = get_content_area(1)
            y = area["top"]
            apply_letterhead(c, self.title, 1, self.total_pages, department=self.department)
            for section in sections:
                section_type = section.get("type", "paragraph")
                draw_fn = draw_map.get(section_type)
                if draw_fn is None:
                    continue
                # Pre-flight check
                estimated_h = self._estimate_section_height(section)
                if y - estimated_h < area["bottom"]:
                    c.showPage()
                    self.current_page += 1
                    apply_letterhead(c, self.title, self.current_page, self.total_pages, department=self.department)
                    area = get_content_area(self.current_page)
                    y = area["top"]
                new_y = draw_fn(c, area, y, section)
                if new_y < area["bottom"]:
                    c.showPage()
                    self.current_page += 1
                    apply_letterhead(c, self.title, self.current_page, self.total_pages, department=self.department)
                    area = get_content_area(self.current_page)
                    y = area["top"]
                    new_y = draw_fn(c, area, y, section)
                y = new_y
            c.save()

    def write_manifest(self):
        """Write the Documenso field manifest JSON."""
        manifest_path = self.output_path + ".fields.json"
        manifest = {
            "pdf_path": self.output_path,
            "page_size": {
                "width": PAGE_WIDTH,
                "height": PAGE_HEIGHT,
                "unit": "points",
            },
            "pages": self.total_pages,
            "fields": self.fields,
        }
        Path(manifest_path).write_text(json.dumps(manifest, indent=2))
        return manifest_path


def load_template(template_name: str, data: dict = None) -> dict:
    """Load a built-in document template by name."""
    templates = {
        "permission-slip": {
            "title": data.get("title", "Permission Slip") if data else "Permission Slip",
            "sections": [
                {"type": "heading", "text": data.get("title", "Permission Slip") if data else "Permission Slip", "level": 1},
                {"type": "paragraph", "text": data.get("body", "I hereby give permission for {{student_name}} to participate in {{event}} on {{date}}. I understand that the school will provide supervision and transportation as described.") if data else "I hereby give permission for my child to participate in the activity described below."},
                {"type": "spacer", "height": 12},
                {"type": "field_row", "fields": [
                    {"label": "Student Name", "type": "TEXT", "width": 0.5, "value": data.get("student_name", "") if data else ""},
                    {"label": "Grade", "type": "TEXT", "width": 0.2, "value": data.get("grade", "") if data else ""},
                    {"label": "School", "type": "TEXT", "width": 0.3, "value": data.get("school", "") if data else ""},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Event/Activity", "type": "TEXT", "width": 0.5, "value": data.get("event", "") if data else ""},
                    {"label": "Date", "type": "DATE", "width": 0.25},
                    {"label": "Time", "type": "TEXT", "width": 0.25},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Emergency Contact Name", "type": "TEXT", "width": 0.5},
                    {"label": "Emergency Phone", "type": "TEXT", "width": 0.5},
                ]},
                {"type": "divider"},
                {"type": "checkbox_group", "items": [
                    {"label": "I give permission for my child to participate in this activity"},
                    {"label": "I give permission for emergency medical treatment if needed"},
                ]},
                {"type": "spacer", "height": 20},
                {"type": "signature_block", "signers": [
                    {"role": "Parent/Guardian", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "employment-agreement": {
            "title": "Employment Agreement",
            "sections": [
                {"type": "heading", "text": "Employment Agreement", "level": 1},
                {"type": "paragraph", "text": "This Employment Agreement is entered into between Peninsula School District ('District') and the employee named below."},
                {"type": "spacer", "height": 8},
                {"type": "field_row", "fields": [
                    {"label": "Employee Name", "type": "NAME", "width": 0.5, "value": data.get("employee_name", "") if data else ""},
                    {"label": "Position", "type": "TEXT", "width": 0.5, "value": data.get("position", "") if data else ""},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Start Date", "type": "DATE", "width": 0.33},
                    {"label": "Department", "type": "TEXT", "width": 0.33, "value": data.get("department", "") if data else ""},
                    {"label": "Location", "type": "TEXT", "width": 0.34, "value": data.get("location", "") if data else ""},
                ]},
                {"type": "divider"},
                {"type": "paragraph", "text": data.get("terms", "The terms and conditions of employment are as set forth herein and in any applicable collective bargaining agreement, board policy, and applicable law.") if data else "The terms and conditions of employment are as set forth herein."},
                {"type": "spacer", "height": 30},
                {"type": "signature_block", "signers": [
                    {"role": "Employee", "fields": ["SIGNATURE", "DATE"]},
                    {"role": "HR Director", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "policy-acknowledgment": {
            "title": data.get("title", "Policy Acknowledgment") if data else "Policy Acknowledgment",
            "sections": [
                {"type": "heading", "text": data.get("title", "Policy Acknowledgment") if data else "Policy Acknowledgment", "level": 1},
                {"type": "paragraph", "text": data.get("body", "I acknowledge that I have received, read, and understand the policy described below.") if data else "I acknowledge that I have received, read, and understand the policy described below."},
                {"type": "spacer", "height": 8},
                {"type": "field_row", "fields": [
                    {"label": "Employee Name", "type": "NAME", "width": 0.5},
                    {"label": "Department", "type": "TEXT", "width": 0.5},
                ]},
                {"type": "divider"},
                {"type": "checkbox_group", "items": [
                    {"label": "I have received a copy of this policy"},
                    {"label": "I have read and understand the policy"},
                    {"label": "I agree to comply with the requirements of this policy"},
                ]},
                {"type": "spacer", "height": 20},
                {"type": "signature_block", "signers": [
                    {"role": "Employee", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "board-resolution": {
            "title": "Board Resolution",
            "sections": [
                {"type": "heading", "text": "Board Resolution", "level": 1},
                {"type": "paragraph", "text": data.get("body", "WHEREAS, the Board of Directors of Peninsula School District finds it necessary to take action as described below;") if data else "WHEREAS, the Board of Directors of Peninsula School District finds it necessary to take action as described below;"},
                {"type": "spacer", "height": 8},
                {"type": "field_row", "fields": [
                    {"label": "Resolution Number", "type": "TEXT", "width": 0.3, "value": data.get("resolution_number", "") if data else ""},
                    {"label": "Date", "type": "DATE", "width": 0.3},
                    {"label": "Subject", "type": "TEXT", "width": 0.4, "value": data.get("subject", "") if data else ""},
                ]},
                {"type": "divider"},
                {"type": "paragraph", "text": data.get("resolution_text", "NOW, THEREFORE, BE IT RESOLVED that the Board of Directors hereby approves the action described above.") if data else "NOW, THEREFORE, BE IT RESOLVED that the Board of Directors hereby approves the action described above."},
                {"type": "spacer", "height": 30},
                {"type": "signature_block", "signers": [
                    {"role": "Board Chair", "fields": ["SIGNATURE", "DATE"]},
                    {"role": "Board Secretary", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "leave-request": {
            "title": "Leave Request",
            "sections": [
                {"type": "heading", "text": "Leave Request Form", "level": 1},
                {"type": "field_row", "fields": [
                    {"label": "Employee Name", "type": "NAME", "width": 0.4},
                    {"label": "Position", "type": "TEXT", "width": 0.3},
                    {"label": "Department", "type": "TEXT", "width": 0.3},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Leave Start Date", "type": "DATE", "width": 0.33},
                    {"label": "Leave End Date", "type": "DATE", "width": 0.33},
                    {"label": "Total Days Requested", "type": "NUMBER", "width": 0.34},
                ]},
                {"type": "checkbox_group", "label": "Type of Leave", "items": [
                    {"label": "Personal Leave"},
                    {"label": "Sick Leave"},
                    {"label": "Family Medical Leave (FMLA)"},
                    {"label": "Bereavement"},
                    {"label": "Other (specify in comments)"},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Comments/Reason", "type": "TEXT", "width": 1.0},
                ]},
                {"type": "divider"},
                {"type": "signature_block", "signers": [
                    {"role": "Employee", "fields": ["SIGNATURE", "DATE"]},
                    {"role": "Supervisor", "fields": ["SIGNATURE", "DATE"]},
                    {"role": "HR", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "contractor-agreement": {
            "title": "Contractor Agreement",
            "sections": [
                {"type": "heading", "text": "Independent Contractor Agreement", "level": 1},
                {"type": "paragraph", "text": "This Agreement is made between Peninsula School District ('District') and the contractor identified below."},
                {"type": "spacer", "height": 8},
                {"type": "field_row", "fields": [
                    {"label": "Contractor Name", "type": "NAME", "width": 0.5},
                    {"label": "Company/Organization", "type": "TEXT", "width": 0.5},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Contract Start Date", "type": "DATE", "width": 0.33},
                    {"label": "Contract End Date", "type": "DATE", "width": 0.33},
                    {"label": "Contract Amount", "type": "TEXT", "width": 0.34},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Scope of Work", "type": "TEXT", "width": 1.0},
                ]},
                {"type": "divider"},
                {"type": "paragraph", "text": data.get("terms", "The contractor agrees to perform the services described above in accordance with all applicable laws and District policies.") if data else "The contractor agrees to perform the services described above in accordance with all applicable laws and District policies."},
                {"type": "spacer", "height": 30},
                {"type": "signature_block", "signers": [
                    {"role": "Contractor", "fields": ["SIGNATURE", "DATE"]},
                    {"role": "District Representative", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "field-trip-waiver": {
            "title": data.get("title", "Field Trip Waiver") if data else "Field Trip Waiver",
            "sections": [
                {"type": "heading", "text": data.get("title", "Field Trip Waiver & Permission") if data else "Field Trip Waiver & Permission", "level": 1},
                {"type": "paragraph", "text": data.get("body", "I give my consent for my child to participate in the field trip described below and release Peninsula School District from liability for injuries arising from participation, except in cases of negligence.") if data else "I give my consent for my child to participate in the field trip described below."},
                {"type": "spacer", "height": 8},
                {"type": "field_row", "fields": [
                    {"label": "Student Name", "type": "TEXT", "width": 0.5, "value": data.get("student_name", "") if data else ""},
                    {"label": "Grade", "type": "TEXT", "width": 0.2},
                    {"label": "Teacher", "type": "TEXT", "width": 0.3},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Destination", "type": "TEXT", "width": 0.5, "value": data.get("destination", "") if data else ""},
                    {"label": "Trip Date", "type": "DATE", "width": 0.25},
                    {"label": "Return Date", "type": "DATE", "width": 0.25},
                ]},
                {"type": "divider"},
                {"type": "heading", "text": "Emergency Information", "level": 3},
                {"type": "field_row", "fields": [
                    {"label": "Emergency Contact", "type": "TEXT", "width": 0.5},
                    {"label": "Phone", "type": "TEXT", "width": 0.25},
                    {"label": "Relationship", "type": "TEXT", "width": 0.25},
                ]},
                {"type": "field_row", "fields": [
                    {"label": "Allergies/Medical Conditions", "type": "TEXT", "width": 0.5},
                    {"label": "Medications", "type": "TEXT", "width": 0.5},
                ]},
                {"type": "checkbox_group", "items": [
                    {"label": "I authorize emergency medical treatment if needed"},
                    {"label": "My child may ride school-provided transportation"},
                ]},
                {"type": "spacer", "height": 14},
                {"type": "signature_block", "signers": [
                    {"role": "Parent/Guardian", "fields": ["SIGNATURE", "DATE"]},
                ]},
            ],
        },
        "generic-form": {
            "title": data.get("title", "Form") if data else "Form",
            "sections": [
                {"type": "heading", "text": data.get("title", "Form") if data else "Form", "level": 1},
                {"type": "paragraph", "text": data.get("body", "") if data else ""},
            ],
        },
    }

    template = templates.get(template_name)
    if template is None:
        available = ", ".join(sorted(templates.keys()))
        print(f"Unknown template: '{template_name}'. Available: {available}", file=sys.stderr)
        sys.exit(1)

    return template


def main():
    parser = argparse.ArgumentParser(description="PSD Branded PDF Generator")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--spec", help="Path to JSON spec file")
    group.add_argument("--json", help="Inline JSON spec string")
    group.add_argument("--template", help="Built-in template name")
    parser.add_argument("--output", "-o", required=True, help="Output PDF path")
    parser.add_argument("--data", help="JSON string with template data variables")
    args = parser.parse_args()

    # Load spec
    if args.spec:
        spec = json.loads(Path(args.spec).read_text())
    elif args.json:
        spec = json.loads(args.json)
    elif args.template:
        data = json.loads(args.data) if args.data else {}
        spec = load_template(args.template, data)
        spec["data"] = data  # ensure data is available for {{variable}} substitution
    else:
        print("Error: provide --spec, --json, or --template", file=sys.stderr)
        sys.exit(1)

    # If spec has a "template" key, load the template and merge
    if "template" in spec and "sections" not in spec:
        data = spec.get("data", {})
        template_spec = load_template(spec["template"], data)
        spec = {**template_spec, **{k: v for k, v in spec.items() if k not in ("template",)}}
        if "title" not in spec:
            spec["title"] = template_spec.get("title", "Document")

    # Build PDF
    builder = PDFBuilder(args.output)
    builder.build(spec)
    manifest_path = builder.write_manifest()

    # Output result
    result = {
        "pdf": args.output,
        "manifest": manifest_path,
        "pages": builder.total_pages,
        "fields": len(builder.fields),
    }
    print(json.dumps(result))


if __name__ == "__main__":
    main()
