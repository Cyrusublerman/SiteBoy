# Distort algorithm audit (WU-7)

Spec files: `blog/docs/pages/tools/processors/distort/plan2403/algorithms/*.md` vs `assets/js/shared/algorithms/`. Heuristic `rg`-style match — **`EXISTS_NEEDS_FIX`** = something found; verify against spec manually. **`MISSING`** = no confident match.

|spec|status|note|
|---|---|---|
|bilateral-grid-approx|EXISTS_NEEDS_FIX|blur-filters.js bilateralFilter (not grid approx)|
|blue-noise-mask-2d|EXISTS_NEEDS_FIX|blue-noise-bracketing.js|
|cellular-automata-totalistic-step|EXISTS_NEEDS_FIX|reaction-diffusion.js|
|clahe-tiles|EXISTS_NEEDS_FIX|colour-adjustments.js,index.js|
|curl-noise-2d|EXISTS_NEEDS_FIX|warp.js,index.js|
|delaunay-triangulation-2d|EXISTS_NEEDS_FIX|polygon-operations.js,stl-generation.js|
|edge-tangent-distance-2d|EXISTS_NEEDS_FIX|curve-geometry.js,index.js|
|euclidean-distance-transform|EXISTS_NEEDS_FIX|animation-utils.js,index.js|
|fbm-noise-2d|EXISTS_NEEDS_FIX|warp.js,index.js|
|gradient-magnitude-2d|EXISTS_NEEDS_FIX|feature-extraction.js,index.js|
|grating-band-field-2d|EXISTS_NEEDS_FIX|index.js,pattern-generators.js|
|grayscott-step-2d|EXISTS_NEEDS_FIX|index.js,reaction-diffusion.js|
|halftone-response-map|EXISTS_NEEDS_FIX|ordered.js,index.js|
|histogram-equalise-global|EXISTS_NEEDS_FIX|colour-adjustments.js|
|marching-squares-contour|EXISTS_NEEDS_FIX|flow-matching.js,curve-geometry.js|
|median-histogram-approx|EXISTS_NEEDS_FIX|likely median in blur-filters|
|moire-wave-interference-2d|EXISTS_NEEDS_FIX|index.js,interference.js|
|morphology-separable-approx|EXISTS_NEEDS_FIX|coordinate-transforms.js,math-utils.js|
|otsu-global-threshold|EXISTS_NEEDS_FIX|index.js,thresholding.js|
|paint-stroke-error-guided|MISSING|no match|
|perlin-noise-2d|EXISTS_NEEDS_FIX|math-utils.js,warp.js|
|poisson-disc-sampling-2d|EXISTS_NEEDS_FIX|compositing.js,index.js|
|ridged-fbm-2d|MISSING|no match|
|sdf-primitive-2d|EXISTS_NEEDS_FIX|geometry/sdf-operations.js (verify vs spec)|
|separable-box-blur-passes|EXISTS_NEEDS_FIX|matrix.js,blur-filters.js|
|separable-gaussian-kernel-1d|EXISTS_NEEDS_FIX|matrix.js,edge-operators.js|
|serpentine-oscillator-raster|EXISTS_NEEDS_FIX|index.js,serpentine-line-engine.js|
|simplex-noise-2d|EXISTS_NEEDS_FIX|index.js,noise-functions.js|
|stipple-lloyd-relax-2d|EXISTS_NEEDS_FIX|compositing.js,index.js|
|streamline-integrate-2d|EXISTS_NEEDS_FIX|index.js,flow-line-engine.js|
|thin-film-phase-thickness|EXISTS_NEEDS_FIX|index.js,interference.js|
|truchet-tile-field-2d|EXISTS_NEEDS_FIX|index.js,pattern-generators.js|
|turbulence-field-2d|MISSING|no match|
|value-noise-2d|MISSING|no match|
|voronoi-diagram-2d|EXISTS_NEEDS_FIX|jfa.js,spatial-index.js|
|wave-equation-fd-2d|EXISTS_NEEDS_FIX|wave-solver.js|
|white-gaussian-noise-2d|MISSING|no match|
|worley-noise-2d|MISSING|no match|
