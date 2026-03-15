# Tile Mosaic — Feature Parity

Legacy source: `tile-mosaic-spec.md` (mixed bundle), `tile-mosaic-audit.md` (audit only).

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Rectilinear layout / rect packing | ✓ | ✓ | PASS — GEO-016; Uniform Grid, Packed Rects A/B shelf-first |
| Offscreen sprite cache | ✓ | ✓ | PASS — OffscreenCanvas per (type, w, h, colorIdx); Map-based |
| Tile types: Concentric | ✓ | ✓ | PASS — concentric arc rings |
| Tile types: Wedge | ✓ | ✓ | PASS — 6 pie sectors |
| Tile types: Stripe | ✓ | ✓ | PASS — 5 bands, horizontal or vertical |
| Tile types: Solid | ✓ | ✓ | PASS |
| Tile types: Texture | ✓ | ✓ | PASS — fBm noise multiply blend |
| Tile types: Micro | ✓ | ✓ | PASS — 10 fine bands |
| Pseudo-3D lighting | ✓ | ✓ | PASS — PAT-008; shadow + highlight linear gradients |
| Noise texture overlay | ✓ | ✓ | PASS — PAT-009; fBm 4-octave noise; multiply composite |
| Morph Layouts animation | ✓ | ✓ | PASS — ANIM-008; lerp between two seeded layouts |
| Breathing animation | ✓ | ✓ | PASS — ANIM-009; sinusoidal tile scale |
| Texture Drift animation | ✓ | ✓ | PASS — ANIM-010; scrolling noise overlay |
| Palette system | ✓ | ✓ | PASS — 6 palettes × 8 HSL slots; per-tile variance |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| gridColumns, gridRows | ✓ | ✓ | PASS |
| tileSize | ✓ | ✓ | PASS |
| layoutMode | ✓ | ✓ | PASS |
| tileTypes | ✓ | ✓ | PASS — multi-select toggle |
| randomSeed | ✓ | ✓ | PASS |
| animationMode, animationSpeed | ✓ | ✓ | PASS |
| paletteSelection, paletteVariance | ✓ | ✓ | PASS |
| depthStrength, highlightIntensity, globalLightAngle | ✓ | ✓ | PASS |
| textureStrength, overlayMode | ✓ | ✓ | PASS |

## Summary

14 of 14 specified features implemented. All 14 parameters present. 5 presets. Canvas 800×800 (spec 900×900 not adopted; design decision documented). Animation type: infinite. GIF/WebM disabled.
