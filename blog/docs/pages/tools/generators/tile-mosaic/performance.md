# Tile Mosaic — Performance

**Status: Unimplemented stub.** This file analyses expected performance of the intended algorithm.

## Expected Complexity (when implemented)

| Phase | Algorithm | Complexity |
|---|---|---|
| Layout generation | Rect packing | O(N_tiles) to O(N_tiles²) depending on packing algorithm |
| Sprite generation | Offscreen canvas | O(N_unique_tiles × w × h) — one-time per parameter change |
| Blit | `drawImage` × N_tiles | O(N_tiles) |
| Noise overlay | Pixel-level | O(W × H) |
| Morph animation | lerp × N_tiles | O(N_tiles) per frame |
| Breathing animation | sin × N_tiles | O(N_tiles) per frame |

## Sprite Caching Strategy

Sprite pre-rendering to offscreen canvases is the correct performance strategy for tile-based generators. Each unique `(type, size, palette)` tile is rendered once; subsequent frames blit from cache. With `gridColumns = 80` and `gridRows = 80` (maximum), 6400 tiles could be needed, but unique type/size combinations will be far fewer.

Cache invalidation is required when: `tileSize`, `paletteSelection`, `paletteVariance`, `depthStrength`, `highlightIntensity`, `globalLightAngle`, or `tileTypes` change.

## Dominant Cost at Extreme Parameters

| Configuration | Dominant Cost |
|---|---|
| gridColumns = 80, gridRows = 80 | 6400 blit calls/frame — fast (GPU blit) |
| Morph Layouts at high speed | 6400 lerp/frame — trivial |
| overlayMode = Noise+Light | O(W × H) pixel iteration — ~800K ops at 900×900 |
| Texture tile with Perlin noise | Perlin at sprite size — sprite caching amortises this |

## Worker Feasibility

**Medium.** Sprite generation is CPU-heavy and DOM-dependent (requires offscreen canvas). Worker execution via OffscreenCanvas API is feasible but requires host support. Noise overlay could be computed in a Worker with ImageData transfer.
