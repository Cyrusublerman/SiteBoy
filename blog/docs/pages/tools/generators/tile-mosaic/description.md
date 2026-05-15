# Tile Mosaic — Description

Tile Mosaic generates dynamic tile-based mosaics on an 800×800 canvas using a three-phase pipeline: layout computation → offscreen sprite caching → composited blit.

**Layout** produces a set of tiles `{x, y, w, h, type, paletteIndex}` via one of three packing algorithms: Uniform Grid (equal cells), Packed Rects A (shelf-first heuristic), or Packed Rects B (descending-height shelf heuristic). Layout is seeded by `randomSeed`.

**Sprite generation** renders each unique `(type, w, h, colourIdx)` tuple once to an `OffscreenCanvas` and caches it. Tile types: Concentric (arc rings), Wedge (pie sectors), Stripe (bands), Solid (fill), Texture (noise), Micro (fine bands), Truchet (quarter-circle arcs, seeded flip), Hex (hexagon with subdivisions), Triangle (alternating-parity triangles). Pseudo-3D lighting (shadow + highlight linear gradients, driven by `globalLightAngle`) is applied per sprite.

**Blit** composites sprites via `drawImage` with optional noise overlay (fBm, 4-octave value noise, cached per `randomSeed`).

**Animation modes:** Static, Breathing (sinusoidal tile scale), Morph Layouts (lerp between two seeded layouts), Texture Drift (scrolling noise UV), All (combined).

**Colour:** six named palettes or custom 8-slot `colourway`. Per-tile hue/saturation/lightness jitter via `paletteVariance`. Optional Z-stack depth sorting with canvas shadow (TIL-03). Optional per-tile texture overlay: grain, crosshatch, dots (TIL-04).
