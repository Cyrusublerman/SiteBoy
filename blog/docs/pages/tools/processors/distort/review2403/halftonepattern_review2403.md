# HALFTONE PATTERN — Review 2403

- type: `halftonepattern`
- category: PATTERN
- isVector: false
- verdict: KEEP — structural upgrade required; long-term framework foundation
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates a dot halftone pattern — circular dots placed on a rotated grid, sized by image luminance | — |
| 1.2 | Visually distinct from all other PATTERN modules? | YES — luminance-driven dot-size halftone is distinct from Truchet, Grating, and Moiré | — |
| 1.3 | Verdict | KEEP — structural upgrade required; long-term framework foundation | — |

## Current Implementation

Valid base: SPACING, ANGLE, MIN DOT SIZE, MAX DOT SIZE, BG LEVEL, DOT LEVEL. Dot size mapped from luminance on a regular rotated grid. Correct starting point.

## Issues

```
[WARN] [PARITY] Module is a single hardcoded dot pattern — architecture does not accommodate future pattern types
Location: nodes/halftonepattern — architecture
Evidence: Pattern type, grid type, response source, and response curve are all implicit and hardcoded. Adding future pattern primitives requires structural changes.
Impact: Future halftone variants (line, square, ellipse, stochastic, CMYK rosette) cannot be added without rewriting the module.
```

```
[WARN] [PARITY] Response source is hardcoded to luminance — no control over what image value drives dot size
Location: nodes/halftonepattern — response mapping
Evidence: No RESPONSE SOURCE param exposed. Cannot drive dot size from hue, saturation, gradient magnitude, distance to edge, etc.
Impact: Module cannot respond to non-luminance image properties.
```

```
[WARN] [PARITY] Response curve is hardcoded — no control over mapping shape
Location: nodes/halftonepattern — response mapping
Evidence: No RESPONSE CURVE param. Linear luminance → size mapping only.
Impact: Cannot achieve stepped, exponential, threshold, or smoothstep dot-size response.
```

## Required Structural Upgrade

### Core Abstraction (Three-Part Framework)

The module must be restructured around three linked concepts — even if only DOT is implemented initially:

```
1. Sample Field    — where pattern instances are placed
2. Pattern Primitive — what is placed at each sample position
3. Response Mapping  — how image values affect primitive behaviour
```

This architecture allows future pattern types to be added as options without rewriting core logic. See `_global_issues.md` G17.

### Immediate Required Additions

| Param | Notes |
|---|---|
| PATTERN TYPE | Dropdown — DOT (only option initially; architecture must accommodate: LINE, SQUARE, ELLIPSE, DIAMOND, CROSS, SHAPE FILL, STOCHASTIC, CMYK ROSETTE) |
| GRID TYPE | Dropdown — SQUARE (current), HEXAGONAL, STAGGERED |
| RESPONSE SOURCE | Dropdown — LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / ALPHA / GRADIENT MAGNITUDE / DISTANCE TO EDGE |
| RESPONSE CURVE | Dropdown — LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLD / STEPPED |
| INVERT | Toggle — swap dark/light dot behaviour |
| SOFT CLAMP | Toggle — ease min/max size limits vs hard clip |

### Future Pattern Types (not immediate — research required)

Dot Halftone, Line Halftone, Ellipse Halftone, Square Halftone, Diamond Halftone, Cross Halftone, Hatch Halftone, Shape Fill Halftone (custom motif scaled by image value), Stochastic Halftone (density-based), CMYK Rosette (multi-angle offset layers), Pattern Cell Halftone (internal geometry changes with image value).

### Future Driver-Capable Params (not immediate)

SPACING, ANGLE, MIN SIZE, MAX SIZE, PATTERN OPACITY, PATTERN COLOUR, PRIMITIVE ROTATION, PRIMITIVE ASPECT RATIO

### Future Image-Responsive Possibilities (not immediate)

Size mapping (current), density mapping, rotation mapping from gradient angle, shape mapping from value range, aspect ratio mapping, local grid distortion from image structure, multi-channel mapping.

### Future Image-Modification Possibilities (not immediate)

Halftone as mask, pattern-driven local blur/sharpen, distance-to-nearest-primitive controls displacement/colour grading.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY]** Restructure module around three-part abstraction: sample field / pattern primitive / response mapping (G17).
2. Add PATTERN TYPE dropdown (DOT only initially — architecture must accommodate future types).
3. Add GRID TYPE dropdown (SQUARE / HEXAGONAL / STAGGERED).
4. Add RESPONSE SOURCE dropdown (LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / ALPHA / GRADIENT MAGNITUDE / DISTANCE TO EDGE).
5. Add RESPONSE CURVE dropdown (LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLD / STEPPED).
6. Add INVERT toggle and SOFT CLAMP toggle.
7. Defer full pattern collection definition until desired halftone family is researched and selected.
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Add unit labels to all numeric params (global — tracked in `_global_issues.md` G16).
12. Use shared components for overlapping features (global — tracked in `_global_issues.md` G11).
