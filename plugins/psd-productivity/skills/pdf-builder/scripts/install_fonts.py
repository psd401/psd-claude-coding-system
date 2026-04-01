#!/usr/bin/env python3
# /// script
# dependencies = ["requests"]
# ///
"""
Download and install Inter + Josefin Sans static fonts for PDF generation.

Fonts are stored in scripts/fonts/ and used by reportlab.
Idempotent — skips fonts that already exist.

Usage:
    uv run install_fonts.py
"""

import sys
from pathlib import Path

import requests

FONTS_DIR = Path(__file__).parent / "fonts"

# Static TTF URLs from Google Fonts CDN (gstatic.com)
# Retrieved via: curl 'https://fonts.googleapis.com/css2?family=...' -H 'User-Agent: Mozilla/4.0'
FONTS = {
    "Inter-Regular.ttf": "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZg.ttf",
    "Inter-Bold.ttf": "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZg.ttf",
    "JosefinSans-Bold.ttf": "https://fonts.gstatic.com/s/josefinsans/v34/Qw3PZQNVED7rKGKxtqIqX5E-AVSJrOCfjY46_N_XXME.ttf",
}


def main():
    FONTS_DIR.mkdir(parents=True, exist_ok=True)

    print("Installing fonts for pdf-builder...")
    failed = []

    for filename, url in FONTS.items():
        target = FONTS_DIR / filename
        if target.exists() and target.stat().st_size > 0:
            print(f"  {filename}: already exists ({target.stat().st_size} bytes)")
            continue

        print(f"  {filename}: downloading...")
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            target.write_bytes(resp.content)
            print(f"  {filename}: installed ({len(resp.content)} bytes)")
        except Exception as e:
            print(f"  {filename}: FAILED - {e}", file=sys.stderr)
            failed.append(filename)

    if failed:
        print(f"\nFailed to download: {', '.join(failed)}", file=sys.stderr)
        sys.exit(1)

    print("\nFont installation complete.")
    print(f"Location: {FONTS_DIR}")
    installed = sorted(f for f in FONTS_DIR.iterdir() if f.suffix == ".ttf")
    for f in installed:
        print(f"  {f.name} ({f.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
