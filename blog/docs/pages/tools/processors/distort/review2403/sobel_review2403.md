# SOBEL — Review 2403

- type: `sobel`
- category: EDGE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies Sobel edge detection — computes gradient magnitude to isolate edges in the image | — |
| 1.2 | Visually distinct from all other EDGE modules? | YES | — |
| 1.3 | Verdict | KEEP — colour ramp stage required | — |

## Issues

```
[WARN] [PARITY] Output is fixed monochrome — no colour mapping stage
Location: nodes/sobel — rendering stage
Evidence: Module renders edge response as a fixed greyscale image only. Detection and rendering are conflated into a single output with no user-defined colour mapping.
Impact: Module is inflexible as a pipeline component; cannot produce tinted edges, false-colour visualisation, or heat-style gradients.
```

## Required Addition: Two-Point Colour Ramp Stage

A colour ramp stage should be inserted after edge detection, normalisation, and thresholding. Processing order:

1. Convert source to luminance
2. Compute Sobel gradient
3. Compute gradient magnitude
4. Optionally normalise
5. Apply threshold
6. Map scalar to 0..1
7. Interpolate between MIN COLOUR and MAX COLOUR in chosen ramp space
8. Output mapped colour
9. Apply opacity and blend mode

### Required Params (Colour Mapping section)

| Param | Type | Notes |
|---|---|---|
| MIN COLOUR | colour picker | Colour assigned to minimum mapped value (flat/suppressed regions) |
| MAX COLOUR | colour picker | Colour assigned to maximum mapped value (strongest edges) |
| RAMP SOURCE | dropdown | RAW MAGNITUDE / NORMALISED MAGNITUDE / POST-THRESHOLD VALUE |
| RAMP SPACE | dropdown | RGB / HSV |
| CLAMP BELOW THRESHOLD | toggle | Forces values below threshold fully to MIN COLOUR vs retaining residual mapped values |

### Revised Module Structure

```
Detection
  Threshold
  Normalise Magnitude

Colour Mapping
  Min Colour
  Max Colour
  Ramp Source
  Ramp Space
  Clamp Below Threshold

Compositing
  Opacity
  Blend Mode
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. Add two-point colour ramp stage after detection — implement MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE, CLAMP BELOW THRESHOLD params.
2. Separate detection logic from rendering logic — Sobel stage produces scalar field; mapping stage handles colour output.
3. Fix +D driver button (global — tracked in `_global_issues.md` G1).
4. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
5. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
