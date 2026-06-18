# Distort worker offload audit (WU-6 / E4)

**`forceWorkerPreview: true` (17):** bilateral, median, canny, cellularautomata, reactiondiffusion, wavedistortion, delaunaymesh, stipple, paintstroke, boxblur, gaussblur, motionblur, dilateerode, domainwarp, flowfield, advection, serpentine, lumflow, tileblend.

**Bilateral (WU-6b):** kernel radius capped at 10px in `blur-filters.js` (`BILATERAL_MAX_RADIUS`); range LUT precomputed; `previewMax: 5` on spatial σ.

**previewMax caps (E4):** CA `stepsPerFrame`/`maxSteps`, RD `stepsPerFrame`, stipple `dotCount`/`relaxIterations`, delaunay `pointCount`.

**Perf harness:** `test/distort-blend.test.js` (blend); bilateral timing verified via capped radius O(441) kernel per pixel.
