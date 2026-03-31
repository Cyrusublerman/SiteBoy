# DOG — Review 2403

- type: `dog`
- category: EDGE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Difference of Gaussians — subtracts two Gaussian-blurred versions of the image to produce a scale-band response, isolating structure within a spatial frequency band defined by Sigma 1 and Sigma 2 | — |
| 1.2 | Visually distinct from all other EDGE modules? | YES — scale-space band-pass response is distinct from Sobel, Canny, and Laplacian | — |
| 1.3 | Verdict | KEEP — colour ramp stage and expanded detection controls required | — |

## Current Structure

```
Detection
  Sigma 1
  Sigma 2
  Threshold

Compositing
  Opacity
  Blend Mode
```

SIGMA 1, SIGMA 2, and THRESHOLD are all appropriate and should be retained. Output is restrained — major contours and medium-scale forms visible, low-level variation suppressed. Consistent with correct DoG behaviour.

## Issues

```
[WARN] [PARITY] Output is fixed monochrome — no colour mapping stage
Location: nodes/dog — rendering stage
Evidence: Module renders DoG response as fixed greyscale only. Detection and rendering conflated.
Impact: Inflexible as pipeline component; cannot produce tinted edges, false-colour scale-band visualisation, or signed positive/negative structure display.
```

```
[NOTE] [STANDARDS] No enforcement of Sigma 2 > Sigma 1 — invalid param combinations possible
Location: nodes/dog — Sigma 1 / Sigma 2 params
Evidence: If Sigma 1 ≥ Sigma 2, the DoG response becomes inverted or collapses. No pre-scale lock or ordering constraint is present.
Impact: User can accidentally set meaningless param combinations without feedback.
```

## Required Addition: Two-Point Colour Ramp Stage

Insert after DoG response generation and thresholding. Processing order:

1. Convert source to luminance
2. Apply Gaussian blur with SIGMA 1
3. Apply Gaussian blur with SIGMA 2
4. Subtract blurred images → DoG response
5. Apply OUTPUT MODE interpretation (signed / absolute / positive only / negative only)
6. Apply GAIN scaling
7. Apply THRESHOLD
8. Optionally NORMALIZE
9. Map scalar to 0..1
10. Interpolate between MIN COLOUR and MAX COLOUR in chosen RAMP SPACE
11. Output mapped colour
12. Apply opacity and blend mode

### Required Params

**Detection section additions:**

| Param | Type | Notes |
|---|---|---|
| OUTPUT MODE | dropdown | SIGNED / ABSOLUTE / POSITIVE ONLY / NEGATIVE ONLY |
| NORMALIZE | toggle | Scale response into predictable display range before mapping |
| GAIN | slider | Scales response before threshold/mapping — separates intensity from threshold placement |
| INVERT | toggle | Polarity reversal for compositing/mask workflows |

**Colour Mapping section (new):**

| Param | Type | Notes |
|---|---|---|
| MIN COLOUR | colour picker | Colour for minimum mapped value |
| MAX COLOUR | colour picker | Colour for maximum mapped value |
| RAMP SOURCE | dropdown | SIGNED RESPONSE / ABSOLUTE RESPONSE / THRESHOLDED RESPONSE / NORMALISED RESPONSE |
| RAMP SPACE | dropdown | RGB / HSV |
| CLAMP BELOW THRESHOLD | toggle | Force sub-threshold values to MIN COLOUR vs retain residual structure |

### Revised Module Structure

```
Detection
  Sigma 1
  Sigma 2         ← enforce Sigma 2 > Sigma 1
  Threshold
  Normalize
  Output Mode
  Gain
  Invert

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

1. Add two-point colour ramp stage: MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE, CLAMP BELOW THRESHOLD.
2. Add OUTPUT MODE, NORMALIZE, GAIN, INVERT to Detection section.
3. Enforce Sigma 2 > Sigma 1 — clamp or swap with UI feedback if violated.
4. Implement using shared ColourRampControl component where available (global — tracked in `_global_issues.md` G11).
5. Fix +D driver button (global — tracked in `_global_issues.md` G1).
6. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
7. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
