# Document Layout Patterns

## Page Structure

All documents follow this layout on US Letter (8.5" × 11"):

### Page 1
```
┌─────────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Pacific color bar   │
│ [PSD Logo]                              │
│ 14015 62nd Ave NW... | 253.530.1000...  │
│ ─────────────── Sea Glass accent line   │
│                                         │
│   ← Content area (0.75" margins) →      │
│   Heading (Josefin Sans Bold)           │
│   Body text (Inter Regular 10pt)        │
│   Field rows, checkboxes, tables...     │
│   Signature block                       │
│                                         │
│ ─────────────── Sea Glass footer line   │
│ Peninsula School District  psd401.net  Page │
└─────────────────────────────────────────┘
```

### Pages 2+
```
┌─────────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬ Pacific color bar   │
│     Peninsula School District | Title → │
│ ─────────────── Sea Glass accent line   │
│                                         │
│   ← Content area (more vertical space)  │
│                                         │
│ ─────────────── Sea Glass footer line   │
│ Peninsula School District  psd401.net  Page │
└─────────────────────────────────────────┘
```

## Content Area Dimensions

| Page | Top starts | Bottom ends | Width | Height |
|------|-----------|-------------|-------|--------|
| 1 | ~1.7" from top | ~0.85" from bottom | 6" (468pt) | ~7.45" (~536pt) |
| 2+ | ~0.55" from top | ~0.85" from bottom | 6" (468pt) | ~8.6" (~619pt) |

## Template Layout Patterns

### Single Signer (permission-slip, policy-acknowledgment)
```
[Heading]
[Body paragraph]
[Field rows — 2-3 rows of inputs]
[Divider]
[Checkboxes]
[Signature block — full width]
  ________________________________
  Signature                  Date
```

### Dual Signer (employment-agreement, contractor-agreement, board-resolution)
```
[Heading]
[Body paragraph]
[Field rows]
[Divider]
[Terms paragraph]
[Signature block — side by side]
  Signer 1          Signer 2
  ____________      ____________
  Signature         Signature
  ______            ______
  Date              Date
```

### Triple Signer (leave-request)
```
[Heading]
[Field rows]
[Checkbox group]
[Comments field]
[Divider]
[Signature block — three columns]
  Employee      Supervisor     HR
  ________      ________      ________
  Signature     Signature     Signature
  ____          ____          ____
  Date          Date          Date
```

## Field Sizing

| Element | Height | Notes |
|---------|--------|-------|
| Input box | 22pt | Clean, readable with 9pt text inside |
| Checkbox | 10pt × 10pt | Square, with 6pt gap to label |
| Signature area | 40pt | Enough space for natural signatures |
| Date line | 18pt | Shorter than signature |
| Initials box | 30pt × 30pt | Square |
| Label text | 7.5pt | Inter Regular, above field |
| Gap between field rows | 8pt | Consistent vertical rhythm |

## Signature Block Field Types

Available field types in `signature_block.signers[].fields[]`:

| Field | Visual | Documenso Type |
|-------|--------|---------------|
| `SIGNATURE` | Full-width line with "Signature" label | SIGNATURE |
| `DATE` | Half-width line with "Date" label | DATE |
| `INITIALS` | 30×30 box with "Initials" label | INITIALS |
| `TEXT` | Full-width line with "Text" label | TEXT |
| `NAME` | Full-width line with "Name" label | NAME |
| `EMAIL` | Full-width line with "Email" label | EMAIL |
