# Tile Mosaic — Mechanisms

## Pipeline

```
params change → _buildLayout() → _buildSprites() → renderFrame()
                     ↑                 ↑
              on layout-key change  on style-key change
```

Cache keys computed from parameter subsets; only the relevant phase re-runs on a param change.

## Phase 1: Layout

**Uniform Grid** — divides 800×800 into `gridColumns × gridRows` equal cells.

**Packed Rects A** — shelf-first heuristic seeded by `randomSeed`. Candidate tiles sorted in insertion order; a new shelf opens when the current shelf has insufficient width. Tile widths/heights drawn from LCG RNG in range `[tileSize×0.6, tileSize×1.4]`.

**Packed Rects B** — same shelf heuristic with candidates sorted by descending height before packing; yields higher fill density.

Each tile record: `{ x, y, w, h, type, colourIdx }`. `type` selected by seeded RNG from the enabled `tileTypes` set; fallback to Solid when set is empty.

## Phase 2: Sprite Cache

Each unique `(type, ⌊w⌋, ⌊h⌋, colourIdx)` rendered once to `OffscreenCanvas`. Cache invalidated on palette or depth param changes.

**Tile type renderers:**

| Type | Renderer |
|---|---|
| Concentric | Arc rings at ⌊min(w,h)/16⌋ + 3 decreasing radii, alternating two palette colours |
| Wedge | 6 equal pie sectors, alternating two palette variants |
| Stripe | 5 filled bands (horizontal if w ≥ h, else vertical) |
| Solid | Single `fillRect` |
| Texture | `fillRect` + fBm noise `OffscreenCanvas` composited `multiply` |
| Micro | 10 fine bands |
| Truchet | Quarter-circle arcs; flip orientation seeded per cell by LCG |
| Hex | Filled/stroked hexagon with 3 inner subdivision lines |
| Triangle | Alternating-parity triangles filling the cell |

**Pseudo-3D lighting (PAT-008):** Two `linearGradient` overlays applied to every sprite. Shadow (`rgba(0,0,0, depthStrength×0.7)`) runs from lit face → transparent; highlight (`rgba(255,255,255, highlightIntensity×0.7)`) runs from opposite face. Extent = full tile diagonal. `globalLightAngle` (0–360°) sets light bearing.

**Per-tile texture overlay (TIL-04):** grain/crosshatch/dots drawn over the sprite at `tileTextureOpacity`.

## Phase 3: Blit

`drawImage` per tile at layout position. When `zStackEnabled`: tiles sorted by `colourIdx` descending; `ctx.shadowBlur` and `ctx.shadowColor` set per tile from `zShadowBlur`/`zShadowSpread`.

**Noise overlay (PAT-009):** fBm canvas (4-octave value noise, quintic smoothstep, base scale 128 px, 800×800) computed once per `randomSeed` change; cached. `Noise` — blended `multiply` at `textureStrength`. `Noise+Light` — noise then a directional gradient at 0.4 alpha over it.

## Animation

| Mode | Mechanism |
|---|---|
| Breathing | `breathScale = 1 + 0.1·sin(2π·speed·frame/120)`; `translate/scale/drawImage` per tile |
| Morph Layouts | Two layouts from `randomSeed` and `randomSeed+1`; `pos = lerp(posA, posB, 0.5+0.5·sin(2π·speed·frame/240))` |
| Texture Drift | `driftOffset += speed×0.3` px/frame; noise canvas translated by `driftOffset` |
| All | All three simultaneously |

## Performance

Sprite cache eliminates per-frame tile draws. At 40×40 grid (1600 tiles): `drawImage` blit only — GPU-accelerated, negligible CPU. Noise OffscreenCanvas rebuilt only on `randomSeed` change. No Tier 2 adaptive resolution (resolution change invalidates sprite dimensions). Tier 1 RAF coalesce via host.

## State Fields

`_spriteCache`, `_noiseCanvas`, `_noiseSeed`, `_layoutA`, `_layoutB`, `_lastLayoutKey`, `_lastStyleKey`, `_lastTileTexKey`, `_driftOffset`.
