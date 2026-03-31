# LAPLACIAN — Review 2403

- type: `laplacian`
- category: EDGE
- isVector: false
- verdict: KEEP
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a Laplacian second-derivative operator to detect edges — produces a broad derivative response sensitive to local intensity variation and noise | — |
| 1.2 | Visually distinct from all other EDGE modules? | YES — second-derivative response is distinct from first-derivative (Sobel) and hysteresis (Canny) | — |
| 1.3 | Verdict | KEEP — colour ramp stage and expanded detection controls required | — |

## Current Structure

```
Detection
  Mode (4-CONN, 8-CONN)
  Normalize

Compositing
  Opacity
  Blend Mode
```

MODE is meaningful and correct — retain as-is:
- 4-CONN: axial neighbourhood only (horizontal + vertical)
- 8-CONN: full surrounding neighbourhood (denser, more isotropic)

NORMALIZE label is ambiguous — unclear whether it normalises signed response, absolute magnitude, before/after clipping, or after absolute value. Different choices produce different outputs and must be explicitly defined.

## Issues

```
[WARN] [STANDARDS] NORMALIZE param is ambiguous — behaviour is undefined
Location: nodes/laplacian — Normalize param
Evidence: Label does not specify whether signed response, absolute magnitude, pre-clip, or post-abs normalisation is applied.
Impact: Unpredictable output; user cannot control or understand what normalisation does.
Required: Replace or annotate with explicit OUTPUT MODE and RAMP SOURCE to make normalisation behaviour explicit.
```

```
[WARN] [PARITY] Output is fixed monochrome — no colour mapping stage
Location: nodes/laplacian — rendering stage
Evidence: Module renders Laplacian response as a fixed greyscale image only.
Impact: Module is inflexible; cannot produce tinted edge output or false-colour derivative visualisation.
```

## Required Addition: Two-Point Colour Ramp Stage

Insert after response generation and normalisation. Processing order:

1. Convert source to luminance
2. Optional PRE BLUR (noise suppression before derivative)
3. Compute Laplacian using selected MODE (4-CONN / 8-CONN)
4. Apply OUTPUT MODE interpretation
5. Apply GAIN scaling
6. Apply optional THRESHOLD
7. Optionally NORMALIZE
8. Map scalar to 0..1
9. Interpolate between MIN COLOUR and MAX COLOUR in chosen RAMP SPACE
10. Output mapped colour
11. Apply opacity and blend mode

### Required Params

**Detection section additions:**

| Param | Type | Notes |
|---|---|---|
| PRE BLUR | slider | Gaussian smoothing before Laplacian — suppresses noise, stabilises response |
| OUTPUT MODE | dropdown | SIGNED / ABSOLUTE / POSITIVE ONLY / NEGATIVE ONLY / ZERO-CROSSING |
| GAIN | slider | Scales response before normalisation/mapping — separates sensitivity from display |
| THRESHOLD | slider | Suppresses weak texture clutter; isolates stronger structure |

**Colour Mapping section (new):**

| Param | Type | Notes |
|---|---|---|
| MIN COLOUR | colour picker | Colour for minimum mapped value |
| MAX COLOUR | colour picker | Colour for maximum mapped value |
| RAMP SOURCE | dropdown | SIGNED RESPONSE / ABSOLUTE RESPONSE / NORMALISED RESPONSE |
| RAMP SPACE | dropdown | RGB / HSV |
| CLAMP ZERO | toggle | Force near-zero values to MIN COLOUR vs retain faint structure |

### Revised Module Structure

```
Detection
  Mode (4-CONN, 8-CONN)
  Pre Blur
  Output Mode
  Normalize
  Gain
  Threshold

Colour Mapping
  Min Colour
  Max Colour
  Ramp Source
  Ramp Space
  Clamp Zero

Compositing
  Opacity
  Blend Mode
```

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. Clarify NORMALIZE behaviour — replace with explicit OUTPUT MODE + RAMP SOURCE params.
2. Add PRE BLUR, OUTPUT MODE, GAIN, THRESHOLD to Detection section.
3. Add two-point colour ramp stage: MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE, CLAMP ZERO.
4. Implement using shared ColourRampControl component where available (global — tracked in `_global_issues.md` G11).
5. Fix +D driver button (global — tracked in `_global_issues.md` G1).
6. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
7. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
