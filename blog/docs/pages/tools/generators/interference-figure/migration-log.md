# Interference Figure — Migration Log

## Pack Updated

Date: 2026-04-23  
Source analysed: `assets/js/tools/generators/scripts/other/interference-figure.gen.js` v1.0.0

## Current State

Generator is implemented and live.

Implemented:
- 10 OPD basis fields
- 8 pattern families with `patternMorph`
- CIE 1931 spectral integration (31 samples)
- Physical + Stylised colour modes
- fractal noise perturbation
- multi-axis field augmentation
- worker compute path via `computePixels`
- static export contract (`animation.type: none`, `png: true`)

## 2026-04-28 additions (IFG-01 – IFG-04)

- **IFG-01 Resize debounce:** Resize debounce + stale-token guard added; rapid resize events no longer trigger multiple concurrent worker dispatches.
- **IFG-02 Worker path:** Worker compute path verified via X-011 cross-cutting audit; `computePixels` contract confirmed correct.
- **IFG-03 Stylised styles:** `stylisedStyle` Select param added — 4 rendering styles (film-layer / crystal / soap-bubble / metallic); each modifies colour tone-mapping applied to the raw CIE XYZ output.
- **IFG-04 Animation block:** `animation` block added to SCRIPT_CONFIG — `rotation`, `patternMorph`, `spiralRate` animatable params with sequencer support.

## 2026-04-29 additions (IFG-05)

- **IFG-05 Seam controls:** `seamAngle` (−180°→+180°) and `seamBlend` (0–1) params in `Transform` group. `theta = atan2(v,u) − seamAngleRad` shifts the branch-cut seam to a user-specified position. When `seamBlend > 0`, pixels within `seamBlend × 0.3π` of the new seam interpolate between nominal and wrap-around `theta` values, smoothing the spiral OPD discontinuity. Applied consistently in both main-thread and worker `computePixels` paths.

## Residuals

- Polarisation factor intentionally excluded (legacy formula incomplete)
- SVG export unsupported (pixel renderer)
