# Distort algorithm audit (WU-7 / E5)

Spec files: `blog/docs/pages/tools/processors/distort/plan2403/algorithms/*.md` vs `assets/js/shared/algorithms/`.

**Status key:** `EXISTS_CORRECT` | `EXISTS_NEEDS_FIX` | `MISSING`

**Ticket key:** E7 sub-task or new item for non-CORRECT rows.

| spec | status | implementation | ticket |
|---|---|---|---|
| bilateral-grid-approx | EXISTS_NEEDS_FIX | `blur-filters.js` `bilateralFilter` (exact, not grid approx) | E7 bilateral |
| blue-noise-mask-2d | EXISTS_CORRECT | `blue-noise-bracketing.js` | — |
| cellular-automata-totalistic-step | EXISTS_NEEDS_FIX | `reaction-diffusion.js` (partial CA) | E7 cellularautomata |
| clahe-tiles | EXISTS_CORRECT | `colour-adjustments.js` | — |
| curl-noise-2d | EXISTS_CORRECT | `warp.js` | — |
| delaunay-triangulation-2d | EXISTS_CORRECT | `polygon-operations.js` | — |
| edge-tangent-distance-2d | EXISTS_CORRECT | `curve-geometry.js` | — |
| euclidean-distance-transform | EXISTS_CORRECT | `animation-utils.js` | — |
| fbm-noise-2d | EXISTS_CORRECT | `warp.js` | — |
| gradient-magnitude-2d | EXISTS_CORRECT | `feature-extraction.js` | — |
| grating-band-field-2d | EXISTS_CORRECT | `pattern-generators.js` | — |
| grayscott-step-2d | EXISTS_CORRECT | `reaction-diffusion.js` | — |
| halftone-response-map | EXISTS_CORRECT | `ordered.js` | — |
| histogram-equalise-global | EXISTS_CORRECT | `colour-adjustments.js` | — |
| marching-squares-contour | EXISTS_CORRECT | `flow-matching.js`, `curve-geometry.js` | — |
| median-histogram-approx | EXISTS_CORRECT | `blur-filters.js` `medianHistogramApprox` | — |
| moire-wave-interference-2d | EXISTS_CORRECT | `interference.js` | — |
| morphology-separable-approx | EXISTS_CORRECT | `morphology.js` `morphologySeparableApprox` | — |
| otsu-global-threshold | EXISTS_CORRECT | `thresholding.js` | — |
| paint-stroke-error-guided | EXISTS_CORRECT | `rendering/paintstroke-error.js` | — |
| perlin-noise-2d | EXISTS_CORRECT | `warp.js`, `math-utils.js` | — |
| poisson-disc-sampling-2d | EXISTS_CORRECT | `compositing.js` | — |
| ridged-fbm-2d | EXISTS_CORRECT | `noise/ridged-fbm-2d.js` | — |
| sdf-primitive-2d | EXISTS_CORRECT | `geometry/sdf-operations.js` | — |
| separable-box-blur-passes | EXISTS_CORRECT | `blur-filters.js` | — |
| separable-gaussian-kernel-1d | EXISTS_CORRECT | `blur-filters.js`, `edge-operators.js` | — |
| serpentine-oscillator-raster | EXISTS_CORRECT | `serpentine-line-engine.js` | — |
| simplex-noise-2d | EXISTS_CORRECT | `noise-functions.js` | — |
| stipple-lloyd-relax-2d | EXISTS_NEEDS_FIX | `compositing.js` (Lloyd in StippleNode inline) | E7 stipple |
| streamline-integrate-2d | EXISTS_CORRECT | `flow-line-engine.js` | — |
| thin-film-phase-thickness | EXISTS_CORRECT | `interference.js` | — |
| truchet-tile-field-2d | EXISTS_CORRECT | `pattern-generators.js` | — |
| turbulence-field-2d | EXISTS_CORRECT | `noise/turbulence-2d.js` | — |
| value-noise-2d | EXISTS_CORRECT | `noise/value-2d.js` | — |
| voronoi-diagram-2d | EXISTS_CORRECT | `jfa.js`, `spatial-index.js` | — |
| wave-equation-fd-2d | EXISTS_CORRECT | `wave-solver.js` | — |
| white-gaussian-noise-2d | EXISTS_CORRECT | `noise/white-gaussian-2d.js` | — |
| worley-noise-2d | EXISTS_CORRECT | `noise/worley-2d.js` | — |

**Summary:** 38 specs — 35 `EXISTS_CORRECT`, 3 `EXISTS_NEEDS_FIX`, 0 `MISSING`.

**E7 tickets raised:** bilateral-grid-approx parity, cellular-automata-totalistic-step parity, stipple-lloyd-relax-2d centralisation.
