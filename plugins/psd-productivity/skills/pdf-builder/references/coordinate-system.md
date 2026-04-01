# Coordinate System: reportlab → Documenso

## Two Coordinate Systems

| System | Origin | Y Direction | Units | Page Size |
|--------|--------|-------------|-------|-----------|
| **reportlab** (PDF) | Bottom-left | Up | Points (1/72 inch) | 612 × 792 (US Letter) |
| **Documenso** (signing) | Top-left | Down | Percentages (0-100) | Relative to page |

## Conversion Formulas

```python
# reportlab points → Documenso percentages
positionX = (x_points / 612) * 100
positionY = ((792 - y_points - height_points) / 792) * 100  # flip Y axis
width     = (w_points / 612) * 100
height    = (h_points / 792) * 100
```

## Why the Y-Axis Flip

- **reportlab**: `y=0` is the **bottom** of the page, `y=792` is the top
- **Documenso**: `positionY=0` is the **top** of the page, `positionY=100` is the bottom
- The conversion subtracts from 792 (page height) and accounts for the element's own height

## Examples

| Element | reportlab (x, y, w, h) | Documenso (posX, posY, w, h) |
|---------|----------------------|----------------------------|
| Signature at bottom-right | (336, 80, 244, 40) | (54.9%, 84.8%, 39.9%, 5.1%) |
| Checkbox at top-left | (54, 650, 10, 10) | (8.8%, 16.7%, 1.6%, 1.3%) |
| Full-width text field | (54, 500, 504, 22) | (8.8%, 34.1%, 82.4%, 2.8%) |

## Automatic Conversion

`generate_pdf.py` handles this automatically — the `.fields.json` manifest always outputs Documenso-ready percentages. No manual conversion needed.
