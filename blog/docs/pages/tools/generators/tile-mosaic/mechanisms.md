# Tile Mosaic — Mechanisms

**Status: Unimplemented stub.** The live `draw` function fills the canvas black. This file documents intended mechanisms from the legacy spec and audit.

## Live Script State

| Item | Value |
|---|---|
| `draw` function | Fills canvas black, returns |
| Parameters | 1 slider: `tileSize` (10–100) — unused |
| Animation | Not declared |
| State | None |

## Intended Algorithm (per spec and audit)

### Phase 1: Layout (GEO-016 — rectPacker)

```
tiles = rectPacker(gridColumns, gridRows, layoutMode, randomSeed)
```

Each tile: `{ x, y, w, h, type, paletteIndex }`.

### Phase 2: Sprite Generation (CANVAS-008 — offscreenSprite)

For each unique `(type, w, h, paletteIndex)` tuple:
1. Create offscreen canvas of `(w, h)`.
2. Draw tile type:
   - Concentric: concentric arc rings at decreasing radii.
   - Wedge: pie-sector arcs.
   - Stripe: evenly-spaced horizontal/vertical lines.
   - Solid: `fillRect`.
   - Texture: Perlin noise fill.
   - Micro: scaled-down version of another type.
3. Apply pseudo-lighting (PAT-008): add highlight region toward `globalLightAngle`, shadow region away from it, scaled by `depthStrength`.
4. Cache sprite by key.

### Phase 3: Blit (CANVAS-009 — spriteBlit)

Draw each sprite at its layout position via `drawImage`. Apply noise overlay (PAT-009) if `overlayMode ≠ None`.

### Animation

| Mode | Module | Mechanism |
|---|---|---|
| Morph Layouts | ANIM-008 (rectMorph) | `lerp(posA, posB, t)` driven by `animationSpeed` |
| Breathing | ANIM-009 (breathingPulse) | `scale = 1 + amplitude·sin(2π·f·t)` per tile |
| Texture Drift | ANIM-010 (textureDrift) | UV offset += `flowSpeed · dt` |

## Function Inventory (intended)

| Function | Module | Status |
|---|---|---|
| `rectPacker` | GEO-016 | Not implemented |
| `offscreenSprite` | CANVAS-008 | Not implemented |
| `pseudoLighting` | PAT-008 | Not implemented |
| `noiseTexture` | PAT-009 | Not implemented |
| `rectMorph` | ANIM-008 | Not implemented |
| `breathingPulse` | ANIM-009 | Not implemented |
| `textureDrift` | ANIM-010 | Not implemented |
| `spriteBlit` | CANVAS-009 | Not implemented |
| `lerp` | MATH-003 | Inline (not extracted) |
| `easing` | MATH-005 | Inline (not extracted) |
| `AnimationLoop` | ANIM-001 | Implemented in AnimationFoundation |
