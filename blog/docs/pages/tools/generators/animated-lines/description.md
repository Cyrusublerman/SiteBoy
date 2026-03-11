# Animated Lines — Description

Animated Lines is a P5.js animation that morphs `lineCount` horizontal white lines through intermediate arc shapes into nested polygon rings, cycling through every regular polygon from triangle to an `maxSides`-gon, then collapsing back to lines. Each full loop adds exactly 180° of cumulative rotation.

## Visual Cycle

1. **Hold lines** — static parallel horizontal lines (duration: `holdLines` ms).
2. **Morph to triangle** — lines bend into arcs, then close into triangle rings (duration: `morphTime` ms).
3. **Step through polygons** — triangle → square → pentagon → … → `maxSides`-gon, pausing `holdPoly` ms at each polygon.
4. **Hold at n-gon** — extended pause at the maximum polygon (`holdPoly × 3` ms).
5. **Morph back to lines** — polygon rings unfurl into arcs then flatten to lines (duration: `morphTime` ms).

## Rotation Accumulation

Each polygon step rotates the entire figure by `internalAngle(n+1) × scaleFactor` where `scaleFactor = π / Σ internalAngle(n)` summed from n=4 to `maxSides`. This ensures the sum of all rotation steps = exactly π (180°). Each loop adds π to the accumulated rotation — so odd loops rotate an additional half turn relative to even loops.

## Shape Geometry

Each of the `lineCount` shapes is represented as an array of `resolution` points:
- **Lines**: evenly-spaced horizontal points spanning `2 × outerRadius` wide.
- **Arcs**: lines bent downward by a sine-shaped sag during the lines→polygon transition.
- **Polygons**: nested concentric regular n-gons, outermost radius adjusted to equal area of the bounding square `(2r)²`, each ring spaced `polySpacing` apart.

The morph blends: `lines → (arcBlend) → arcs → (polyBlend) → polygons`.

## Canvas

600×500 px. Non-square canvas; shapes are centred by computing the point-set centroid each frame. Background dark grey (`20`), stroke white (`255`), no fill.
