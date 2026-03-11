# Unified Pattern — Feature Parity

Legacy source: `unified-pattern-generator-spec.md` (mixed bundle), `unified-pattern-generator-audit.md` (audit only).

**The live script is a stub. All spec features are absent.**

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Jittered grid cell distribution | ✓ | ✗ | FAIL |
| Domain warp (noise deformation) | ✓ | ✗ | FAIL |
| Superellipse SDF evaluation | ✓ | ✗ | FAIL |
| Nested shapes (scaled repetition) | ✓ | ✗ | FAIL |
| Smooth union (smooth-min) | ✓ | ✗ | FAIL |
| Palette colour mapping | ✓ | ✗ | FAIL |
| SDF pixel renderer | ✓ | ✗ | FAIL |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| gridSpacing, jitter | ✓ | ✗ | FAIL |
| warpAmplitude, warpFrequency | ✓ | ✗ | FAIL |
| occupancyThreshold | ✓ | ✗ | FAIL |
| cornerExponent | ✓ | ✗ | FAIL |
| aspectRatioMin, aspectRatioMax | ✓ | ✗ | FAIL |
| nestingLevels, nestingRatio | ✓ | ✗ | FAIL |
| blendRadius | ✓ | ✗ | FAIL |
| palettePreset, paletteVariance | ✓ | ✗ | FAIL |
| sizeMin, sizeMax | ✓ | ✗ | FAIL |
| scale | not in spec | ✓ (stub, unused) | N/A |

## Summary

0 of 7 specified features implemented. 0 of 15 spec parameters present in live.
