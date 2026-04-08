# Distort worker offload audit (WU-6)

**`forceWorkerPreview: true` (8):** bilateral, median, canny, cellularautomata, reactiondiffusion, wavedistortion, delaunaymesh, stipple.

**Heavy nodes without flag (consider adding):** boxblur, gaussianblur, motionblur (preview at large radius), morph dilate/erode if radius large, paintstroke, domainwarp, flowfield, advection, tileblend, lumflow batch, serpentine.

**Bilateral (WU-6b):** kernel radius capped at 10px in `blur-filters.js` (`BILATERAL_MAX_RADIUS`); `previewMax` on σ remains on node.
