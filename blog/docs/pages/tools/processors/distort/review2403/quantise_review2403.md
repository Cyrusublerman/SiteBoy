# QUANTISE — Review 2403

- type: `quantise`
- category: COLOUR / TONE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user
- priority: HIGH

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Reduces the image to a limited colour palette (colour quantisation) | — |
| 1.2 | Visually distinct from all other COLOUR/TONE modules? | YES — unique palette-reduction operation | — |
| 1.3 | Verdict | KEEP | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Expected behaviour from name/category? | Reduce image to N colours from a chosen palette, with optional dithering | — |
| 2.2 | Actual output matches expectation? | PARTIAL — palette selection exists but is severely limited; dithering absent | ERROR |
| 2.3 | Output meaningfully different across param range? | LIMITED — only palette option available | WARN |

## Issues

```
[ERROR] [PARITY] Dithering entirely absent
Location: nodes/quantise — param set
Evidence: No dithering mode param exists. Source tool and standard quantisation workflows require dithering options.
Impact: Output is posterised/hard-edged without dithering; major visual quality gap.
Required: Add DITHER MODE dropdown with options including at minimum: NONE, FLOYD-STEINBERG, ORDERED (BAYER), ATKINSON, BLUE NOISE.
```

```
[ERROR] [PARITY] Palette selection is severely limited
Location: nodes/quantise — palette param
Evidence: Only a small set of built-in palettes available. No custom palette support.
Impact: Creative range is extremely restricted compared to source tool and user expectations.
Required: Expand built-in palette library significantly. Add support for:
  - Upload custom palette (e.g. .pal, .hex, .png strip)
  - Build palette by manually setting/picking colours
  - Sample palette from uploaded image
  - Sample palette from current canvas/source image
```

```
[ERROR] [PARITY] No palette-from-image sampling
Location: nodes/quantise — param set
Evidence: Cannot extract a palette from an image file or the current source image.
Impact: Cannot reproduce the colour-matching workflow of the source tool.
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
Location: NodePanel — +D button on all params
Evidence: Clicking +D on any param opens nothing. Global issue affecting all modules.
Impact: Per-pixel modulation inaccessible.
```

## Action Items

1. **[HIGH PRIORITY]** Add DITHER MODE dropdown: NONE, FLOYD-STEINBERG, ORDERED (BAYER 4×4), ATKINSON, BLUE NOISE.
2. **[HIGH PRIORITY]** Expand built-in palette library with a wide range of standard and artistic palettes.
3. **[HIGH PRIORITY]** Add custom palette upload (accept .pal, .hex, or .png colour strip).
4. **[HIGH PRIORITY]** Add manual palette builder — user sets N colours by picker or hex input.
5. **[HIGH PRIORITY]** Add palette sampling from uploaded image file.
6. **[HIGH PRIORITY]** Add palette sampling from current source image (auto-extract N dominant colours).
7. Fix +D driver button (global — tracked in `_global_issues.md` G1).
8. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
