# Tile Mosaic — Performance

## Complexity (live v1.1.0)

| Phase | Algorithm | Complexity |
|---|---|---|
| Layout generation | Shelf packing / uniform grid | O(N_tiles) |
| Sprite generation | OffscreenCanvas per unique key | O(N_unique × w × h) — one-time per cache-key change |
| Blit | `drawImage` × N_tiles | O(N_tiles), GPU-accelerated |
| Noise OffscreenCanvas build | fBm 4-octave value noise | O(W × H) ≈ 640K ops at 800×800 — once per `randomSeed` change |
| Morph animation | lerp × N_tiles | O(N_tiles) per frame |
| Breathing animation | sin × N_tiles | O(N_tiles) per frame |

## Sprite Cache

Each unique `(type, ⌊w⌋, ⌊h⌋, colourIdx)` renders once to `OffscreenCanvas`. Cache invalidated on palette, depth, or tile-texture param changes. Layout rebuild on grid/layout/seed/type param changes. Both are separate invalidation paths.

At 40×40 grid (max), 1600 tiles; unique sprite keys in practice much fewer due to repeated sizes. Blit cost at 1600 tiles is negligible.

## Dominant Cost at Extreme Parameters

| Configuration | Dominant cost |
|---|---|
| `gridColumns = gridRows = 40` | 1600 blit calls/frame — GPU blit, negligible |
| `animationMode = Morph Layouts` | 1600 lerp ops/frame — trivial |
| `overlayMode = Noise+Light` | O(800×800) noise blit + directional gradient blit — both cached `drawImage` |
| `tileTypes` includes `Texture` | fBm per sprite — amortised by sprite cache |
| `zStackEnabled = true` | Additional `ctx.shadow*` state changes per tile — modest CPU overhead |

## Compute Tier

Tier 1 RAF coalesce via host (always active). No Tier 2 adaptive resolution — resolution change invalidates sprite dimensions, causing double cache rebuild. No Tier 3 worker offload — blit path is already GPU-accelerated; cache rebuild is DOM-dependent (requires `OffscreenCanvas`).
