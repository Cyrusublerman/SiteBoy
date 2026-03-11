# Tile Mosaic — Feature Parity

Legacy source: `tile-mosaic-spec.md` (mixed bundle), `tile-mosaic-audit.md` (audit only).

**The live script is a stub. All spec features are absent.**

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Rectilinear layout / rect packing | ✓ | ✗ | FAIL |
| Offscreen sprite cache | ✓ | ✗ | FAIL |
| Tile types: Concentric | ✓ | ✗ | FAIL |
| Tile types: Wedge | ✓ | ✗ | FAIL |
| Tile types: Stripe | ✓ | ✗ | FAIL |
| Tile types: Solid | ✓ | ✗ | FAIL |
| Tile types: Texture | ✓ | ✗ | FAIL |
| Tile types: Micro | ✓ | ✗ | FAIL |
| Pseudo-3D lighting | ✓ | ✗ | FAIL |
| Noise texture overlay | ✓ | ✗ | FAIL |
| Morph Layouts animation | ✓ | ✗ | FAIL |
| Breathing animation | ✓ | ✗ | FAIL |
| Texture Drift animation | ✓ | ✗ | FAIL |
| Palette system | ✓ | ✗ | FAIL |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| gridColumns, gridRows | ✓ | ✗ | FAIL |
| tileSize | ✓ | ✓ (stub, unused) | PARTIAL |
| layoutMode | ✓ | ✗ | FAIL |
| tileTypes | ✓ | ✗ | FAIL |
| randomSeed | ✓ | ✗ | FAIL |
| animationMode, animationSpeed | ✓ | ✗ | FAIL |
| paletteSelection, paletteVariance | ✓ | ✗ | FAIL |
| depthStrength, highlightIntensity, globalLightAngle | ✓ | ✗ | FAIL |
| textureStrength, overlayMode | ✓ | ✗ | FAIL |

## Summary

0 of 14 specified features are implemented. 1 of 14 parameters present in live (as an unused stub).
