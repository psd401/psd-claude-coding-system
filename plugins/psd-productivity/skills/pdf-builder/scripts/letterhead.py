#!/usr/bin/env python3
# /// script
# dependencies = ["reportlab"]
# ///
"""
PSD Letterhead module for branded PDF generation.

Draws Peninsula School District letterhead on PDF pages using reportlab.
Imports brand assets (logo, colors) from the psd-brand-guidelines skill.

Usage:
    from letterhead import apply_letterhead, get_content_area, register_fonts

    register_fonts()  # call once before generating
    # ... create canvas ...
    apply_letterhead(canvas, "Document Title", page_num=1, total_pages=2)
    area = get_content_area(page_num=1)
"""

from pathlib import Path

from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Page dimensions (US Letter)
PAGE_WIDTH, PAGE_HEIGHT = letter  # 612 x 792 points

# Brand colors (from brand-config.json)
PACIFIC = HexColor("#25424C")
SEA_GLASS = HexColor("#6CA18A")
DRIFTWOOD = HexColor("#D7CDBE")
SEA_FOAM = HexColor("#EEEBE4")
SKYLIGHT = HexColor("#FFFAEC")

# Paths
SCRIPT_DIR = Path(__file__).parent
FONTS_DIR = SCRIPT_DIR / "fonts"
BRAND_ASSETS_DIR = SCRIPT_DIR / "../../psd-brand-guidelines/assets"
LOGO_PATH = BRAND_ASSETS_DIR / "psd_logo-2color-horizontal.png"

# Layout constants
MARGIN_LEFT = 0.75 * inch
MARGIN_RIGHT = 0.75 * inch
MARGIN_BOTTOM = 0.75 * inch
COLOR_BAR_HEIGHT = 4  # points

# Page 1 header
LOGO_WIDTH = 2.0 * inch
LOGO_ASPECT = 2.67  # horizontal logo aspect ratio
LOGO_HEIGHT = LOGO_WIDTH / LOGO_ASPECT
HEADER_TOP = PAGE_HEIGHT - 0.5 * inch  # top of logo

# Continuation page header
CONT_HEADER_HEIGHT = 0.5 * inch

# Footer
FOOTER_Y = 0.5 * inch
FOOTER_LINE_Y = FOOTER_Y + 10

# District info
DISTRICT_NAME = "Peninsula School District"
DISTRICT_ADDRESS = "14015 62nd Ave NW, Gig Harbor, WA 98332"
DISTRICT_PHONE = "253.530.1000"
DISTRICT_WEBSITE = "psd401.net"

# Icon settings
ICON_SIZE = 7  # points — size of the vector icons
ICON_COLOR = SEA_GLASS  # icons in brand accent color

_fonts_registered = False


def register_fonts():
    """Register Inter and Josefin Sans fonts with reportlab. Idempotent."""
    global _fonts_registered
    if _fonts_registered:
        return

    font_files = {
        "Inter": FONTS_DIR / "Inter-Regular.ttf",
        "Inter-Bold": FONTS_DIR / "Inter-Bold.ttf",
        "JosefinSans-Bold": FONTS_DIR / "JosefinSans-Bold.ttf",
    }

    for name, path in font_files.items():
        if not path.exists():
            raise FileNotFoundError(
                f"Font {path.name} not found. Run: uv run install_fonts.py"
            )
        pdfmetrics.registerFont(TTFont(name, str(path)))

    _fonts_registered = True


# --- Vector icon drawing functions ---
# Simple line-art icons drawn with canvas primitives. No font dependencies.


def _draw_building_icon(canvas, x, y, size):
    """Draw a small building/office icon."""
    s = size
    canvas.saveState()
    canvas.setStrokeColor(ICON_COLOR)
    canvas.setFillColor(ICON_COLOR)
    canvas.setLineWidth(0.6)

    # Building outline
    canvas.rect(x + s * 0.15, y, s * 0.7, s * 0.85, fill=0, stroke=1)
    # Roof line
    canvas.line(x + s * 0.1, y + s * 0.85, x + s * 0.9, y + s * 0.85)
    # Door
    canvas.rect(x + s * 0.38, y, s * 0.24, s * 0.3, fill=1, stroke=0)
    # Windows — top row
    canvas.rect(x + s * 0.25, y + s * 0.55, s * 0.15, s * 0.15, fill=1, stroke=0)
    canvas.rect(x + s * 0.6, y + s * 0.55, s * 0.15, s * 0.15, fill=1, stroke=0)

    canvas.restoreState()


def _draw_phone_icon(canvas, x, y, size):
    """Draw a small phone handset icon."""
    s = size
    canvas.saveState()
    canvas.setStrokeColor(ICON_COLOR)
    canvas.setFillColor(ICON_COLOR)
    canvas.setLineWidth(0.8)

    # Phone body — rounded rectangle shape via path
    p = canvas.beginPath()
    # Handset shape: curved top and bottom with a bar in the middle
    # Simplified: rectangle with rounded ends
    cx, cy = x + s * 0.5, y + s * 0.5
    # Earpiece (top circle)
    canvas.circle(cx - s * 0.15, cy + s * 0.25, s * 0.12, fill=1, stroke=0)
    # Mouthpiece (bottom circle)
    canvas.circle(cx + s * 0.15, cy - s * 0.25, s * 0.12, fill=1, stroke=0)
    # Handle (connecting bar)
    canvas.setLineWidth(s * 0.12)
    canvas.setLineCap(1)  # round cap
    canvas.line(cx - s * 0.15, cy + s * 0.2, cx + s * 0.15, cy - s * 0.2)

    canvas.restoreState()


def _draw_globe_icon(canvas, x, y, size):
    """Draw a small globe/web icon."""
    s = size
    canvas.saveState()
    canvas.setStrokeColor(ICON_COLOR)
    canvas.setLineWidth(0.6)

    cx, cy = x + s * 0.5, y + s * 0.5
    r = s * 0.42

    # Outer circle
    canvas.circle(cx, cy, r, fill=0, stroke=1)
    # Vertical ellipse (meridian)
    canvas.ellipse(cx - r * 0.4, cy - r, cx + r * 0.4, cy + r, fill=0, stroke=1)
    # Horizontal line (equator)
    canvas.line(cx - r, cy, cx + r, cy)
    # Top latitude line
    canvas.line(cx - r * 0.75, cy + r * 0.45, cx + r * 0.75, cy + r * 0.45)
    # Bottom latitude line
    canvas.line(cx - r * 0.75, cy - r * 0.45, cx + r * 0.75, cy - r * 0.45)

    canvas.restoreState()


def _draw_dept_icon(canvas, x, y, size):
    """Draw a small org/department icon (people silhouette)."""
    s = size
    canvas.saveState()
    canvas.setStrokeColor(ICON_COLOR)
    canvas.setFillColor(ICON_COLOR)
    canvas.setLineWidth(0.5)

    # Center person — head
    canvas.circle(x + s * 0.5, y + s * 0.75, s * 0.12, fill=1, stroke=0)
    # Center person — body
    canvas.setLineWidth(s * 0.1)
    canvas.setLineCap(1)
    canvas.line(x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.25)
    # Arms
    canvas.setLineWidth(s * 0.07)
    canvas.line(x + s * 0.3, y + s * 0.5, x + s * 0.7, y + s * 0.5)

    # Left person — head (smaller)
    canvas.setLineWidth(0.5)
    canvas.circle(x + s * 0.18, y + s * 0.65, s * 0.09, fill=1, stroke=0)
    # Left person — body
    canvas.setLineWidth(s * 0.07)
    canvas.setLineCap(1)
    canvas.line(x + s * 0.18, y + s * 0.53, x + s * 0.18, y + s * 0.25)

    # Right person — head (smaller)
    canvas.setLineWidth(0.5)
    canvas.circle(x + s * 0.82, y + s * 0.65, s * 0.09, fill=1, stroke=0)
    # Right person — body
    canvas.setLineWidth(s * 0.07)
    canvas.setLineCap(1)
    canvas.line(x + s * 0.82, y + s * 0.53, x + s * 0.82, y + s * 0.25)

    canvas.restoreState()


# --- End icons ---


def _draw_color_bar(canvas, y, height=COLOR_BAR_HEIGHT, color=PACIFIC):
    """Draw a thin horizontal color bar across the page."""
    canvas.setFillColor(color)
    canvas.rect(0, y, PAGE_WIDTH, height, fill=1, stroke=0)


def _draw_footer(canvas, page_num, total_pages):
    """Draw footer with Sea Glass line, page number, and district name."""
    # Sea Glass accent line
    canvas.setStrokeColor(SEA_GLASS)
    canvas.setLineWidth(1)
    canvas.line(MARGIN_LEFT, FOOTER_LINE_Y, PAGE_WIDTH - MARGIN_RIGHT, FOOTER_LINE_Y)

    # Footer text
    canvas.setFont("Inter", 7)
    canvas.setFillColor(PACIFIC)

    # Left: district name
    canvas.drawString(MARGIN_LEFT, FOOTER_Y, DISTRICT_NAME)

    # Center: website
    center_x = PAGE_WIDTH / 2
    canvas.drawCentredString(center_x, FOOTER_Y, DISTRICT_WEBSITE)

    # Right: page number
    page_text = f"Page {page_num} of {total_pages}"
    canvas.drawRightString(PAGE_WIDTH - MARGIN_RIGHT, FOOTER_Y, page_text)


def _draw_page1_header(canvas, title=None, department=None):
    """Draw full letterhead header on page 1."""
    # Top color bar
    _draw_color_bar(canvas, PAGE_HEIGHT - COLOR_BAR_HEIGHT)

    # Logo — left side
    logo_path = LOGO_PATH.resolve()
    logo_x = MARGIN_LEFT
    logo_y = HEADER_TOP - LOGO_HEIGHT
    if logo_path.exists():
        canvas.drawImage(
            str(logo_path),
            logo_x, logo_y,
            width=LOGO_WIDTH, height=LOGO_HEIGHT,
            preserveAspectRatio=True,
            mask="auto",
        )

    # Contact info — right-aligned to page margin
    # Each line: [icon] [text], right-aligned
    text_right = PAGE_WIDTH - MARGIN_RIGHT
    icon_text_gap = 10  # space between icon and text
    font_size = 7.5

    # Calculate contact lines (3 or 4 depending on department)
    lines = [
        (DISTRICT_ADDRESS, _draw_building_icon),
        (DISTRICT_PHONE, _draw_phone_icon),
        (DISTRICT_WEBSITE, _draw_globe_icon),
    ]
    if department:
        lines.append((department, _draw_dept_icon))

    line_spacing = 11
    total_block_height = (len(lines) - 1) * line_spacing
    logo_center_y = logo_y + (LOGO_HEIGHT / 2)
    block_top_y = logo_center_y + (total_block_height / 2)

    canvas.setFont("Inter", font_size)
    canvas.setFillColor(PACIFIC)

    for i, (text, icon_fn) in enumerate(lines):
        text_y = block_top_y - (i * line_spacing)
        # Draw text right-aligned
        canvas.drawRightString(text_right, text_y, text)
        # Draw icon to the left of the text
        text_width = canvas.stringWidth(text, "Inter", font_size)
        icon_x = text_right - text_width - icon_text_gap - ICON_SIZE
        icon_y = text_y - 1  # slight vertical offset to center icon with text
        icon_fn(canvas, icon_x, icon_y, ICON_SIZE)

    # Thin Sea Glass accent line below logo/contact block
    line_y = logo_y - 8
    canvas.setStrokeColor(SEA_GLASS)
    canvas.setLineWidth(0.75)
    canvas.line(MARGIN_LEFT, line_y, PAGE_WIDTH - MARGIN_RIGHT, line_y)


def _draw_continuation_header(canvas, title=None):
    """Draw reduced header on pages 2+."""
    # Thin color bar at top
    _draw_color_bar(canvas, PAGE_HEIGHT - COLOR_BAR_HEIGHT)

    # Right-aligned district name + document title
    y = PAGE_HEIGHT - 0.4 * inch
    canvas.setFont("Inter", 7.5)
    canvas.setFillColor(PACIFIC)

    if title:
        header_text = f"{DISTRICT_NAME}  |  {title}"
    else:
        header_text = DISTRICT_NAME
    canvas.drawRightString(PAGE_WIDTH - MARGIN_RIGHT, y, header_text)

    # Thin accent line
    line_y = y - 6
    canvas.setStrokeColor(SEA_GLASS)
    canvas.setLineWidth(0.75)
    canvas.line(MARGIN_LEFT, line_y, PAGE_WIDTH - MARGIN_RIGHT, line_y)


def apply_letterhead(canvas, title=None, page_num=1, total_pages=1, department=None):
    """
    Apply PSD letterhead to the current canvas page.

    Args:
        canvas: reportlab Canvas object
        title: Document title (shown on continuation pages)
        page_num: Current page number (1-based)
        total_pages: Total number of pages
        department: Optional department name (e.g., "Technology Department")
    """
    register_fonts()

    if page_num == 1:
        _draw_page1_header(canvas, title, department)
    else:
        _draw_continuation_header(canvas, title)

    _draw_footer(canvas, page_num, total_pages)


def get_content_area(page_num=1):
    """
    Get the usable content area for a page.

    Returns:
        dict with x, y (bottom-left of content area), width, height in points
    """
    x = MARGIN_LEFT
    width = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT

    if page_num == 1:
        # Below logo + accent line + padding
        logo_y = HEADER_TOP - LOGO_HEIGHT
        top = logo_y - 22  # below accent line + padding
        bottom = FOOTER_LINE_Y + 16
    else:
        # Below continuation header
        top = PAGE_HEIGHT - 0.55 * inch
        bottom = FOOTER_LINE_Y + 16

    return {
        "x": x,
        "y": bottom,
        "width": width,
        "height": top - bottom,
        "top": top,
        "bottom": bottom,
    }


# CLI: generate a sample letterhead page for preview
if __name__ == "__main__":
    import sys
    from reportlab.pdfgen import canvas as canvas_module

    output = sys.argv[1] if len(sys.argv) > 1 else "/tmp/psd-letterhead-sample.pdf"
    c = canvas_module.Canvas(output, pagesize=letter)

    register_fonts()

    # Page 1 — with department
    apply_letterhead(c, title="Sample Document", page_num=1, total_pages=2,
                     department="Technology Department")
    area = get_content_area(1)
    c.setFont("JosefinSans-Bold", 18)
    c.setFillColor(PACIFIC)
    c.drawString(area["x"], area["top"] - 24, "Sample Document Title")
    c.setFont("Inter", 10)
    c.drawString(area["x"], area["top"] - 44, "This is sample body text using Inter Regular at 10pt.")
    c.showPage()

    # Page 2
    apply_letterhead(c, title="Sample Document", page_num=2, total_pages=2)
    area = get_content_area(2)
    c.setFont("Inter", 10)
    c.setFillColor(PACIFIC)
    c.drawString(area["x"], area["top"] - 16, "Continuation page content starts here.")
    c.showPage()

    c.save()
    print(f"Sample letterhead saved to: {output}")
