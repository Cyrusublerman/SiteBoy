# Tile Mosaic — Description

**Status: Unimplemented stub.** The live script produces only a black canvas. This description documents the intended design per the legacy specification.

## Intended Design (per spec)

Tile Mosaic generates dynamic tile-based mosaics on canvas. The generator operates in two phases:

**Phase 1 — Layout:** A macro-tile grid is computed using one of three packing modes:
- `Uniform Grid`: Regular rows×columns grid with uniform `tileSize`.
- `Packed Rects A/B`: Rectilinear bin-packing with variable tile dimensions.

Each layout cell is assigned a tile type from an enabled subset of: Concentric (disc rings), Wedge (pie sectors), Stripe (linear bands), Solid (filled rectangle), Texture (procedural noise fill), Micro (fine-detail variant).

**Phase 2 — Rendering:** Each tile is pre-rendered to an offscreen canvas sprite. Sprites are shaded using a pseudo-3D lighting model driven by `globalLightAngle`, `depthStrength`, and `highlightIntensity`. A noise texture overlay (Perlin-based) can be blended over the final composition via `textureStrength` and `overlayMode`.

**Animation modes:**
- `Static`: Single render per parameter change.
- `Morph Layouts`: Interpolates tile positions between two layouts.
- `Breathing`: Oscillates tile scale using sinusoidal pulse.
- `Texture Drift`: Scrolls UV coordinates on texture tiles.
- `All`: All modes simultaneously.

Colour is drawn from a named palette (`Warm`, `Cool`, `Mixed`, `Earth`, `Pastel`, `High-Contrast`) with variance controlled by `paletteVariance`. Random layout is seeded by `randomSeed`.

Algorithm origin: rectilinear bin packing (Bin Packing Problem literature); pseudo-3D tile shading (standard Lambert-style); tile sprite caching (offscreen canvas pattern).
