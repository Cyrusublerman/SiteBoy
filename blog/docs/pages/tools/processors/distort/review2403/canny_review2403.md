# CANNY — Review 2403

- type: `canny`
- category: EDGE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies Canny edge detection — Gaussian smoothing, gradient computation, non-maximum suppression, and hysteresis thresholding to produce clean edge contours | — |
| 1.2 | Visually distinct from all other EDGE modules? | YES — Canny produces thinner, more precise contours than Sobel via hysteresis | — |
| 1.3 | Verdict | KEEP — colour ramp stage required | — |

## Current Structure

```
Detection
  Sigma
  Low Threshold
  High Threshold

Compositing
  Opacity
  Blend Mode
```

Detection stage is valid and appropriate. Output is recognisable Canny-style edge extraction. Current threshold pair is permissive — output shows dense binary result with fine internal texture clutter.

## Issues

```
[WARN] [PARITY] Output is fixed monochrome — no colour mapping stage
Location: nodes/canny — rendering stage
Evidence: Module renders edge result as a fixed greyscale image only. Detection and rendering are conflated with no user-defined colour mapping.
Impact: Module is inflexible as a pipeline component; cannot produce tinted edges, false-colour visualisation, or transparent-to-colour edge compositing.
```

## Required Addition: Two-Point Colour Ramp Stage

Insert after hysteresis thresholding. Processing order:

1. Convert source to luminance
2. Apply Gaussian smoothing (Sigma)
3. Compute gradient field
4. Non-maximum suppression
5. Hysteresis thresholding (Low / High Threshold)
6. Map edge-response to 0..1
7. Interpolate between MIN COLOUR and MAX COLOUR in chosen ramp space
8. Output mapped colour
9. Apply opacity and blend mode

### Required Params (Colour Mapping section)

| Param | Type | Notes |
|---|---|---|
| MIN COLOUR | colour picker | Colour for non-edge / zero-value regions |
| MAX COLOUR | colour picker | Colour for detected edge regions |
| RAMP SOURCE | dropdown | BINARY EDGE RESULT / EDGE STRENGTH / POST-HYSTERESIS VALUE |
| RAMP SPACE | dropdown | RGB / HSV |
| CLAMP NON-EDGES | toggle | Force non-edge regions exactly to MIN COLOUR vs retain residual values |

### Optional Additional Params

| Param | Type | Notes |
|---|---|---|
| INVERT | toggle | Fast polarity reversal for compositing/mask workflows |
| OUTPUT MODE | dropdown | BINARY EDGES / EDGE STRENGTH / SUPPRESSED GRADIENT MAGNITUDE |
| PRE-NORMALISE | toggle | Normalise threshold input for more consistent behaviour across different sources |

### Revised Module Structure

```
Detection
  Sigma
  Low Threshold
  High Threshold

Colour Mapping
  Min Colour
  Max Colour
  Ramp Source
  Ramp Space
  Clamp Non-Edges

Compositing
  Opacity
  Blend Mode
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. Add two-point colour ramp stage after hysteresis — implement MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE, CLAMP NON-EDGES params.
2. Separate detection logic from rendering logic — Canny stage produces edge-response field; mapping stage handles colour output.
3. Add optional INVERT toggle, OUTPUT MODE dropdown, PRE-NORMALISE toggle.
4. Fix +D driver button (global — tracked in `_global_issues.md` G1).
5. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
6. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
