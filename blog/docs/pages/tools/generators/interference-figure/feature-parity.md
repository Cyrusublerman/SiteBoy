# Interference Figure — Feature Parity

Legacy source: `interference-figure-spec.md` (mixed bundle), `interference-figure-audit.md` (audit only).

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Normalised coordinate grid | ✓ | ✓ | PASS |
| Polar transform with rotation/scale | ✓ | ✓ | PASS |
| OPD basis fields (10 components) | ✓ | ✓ | PASS |
| Fractal noise perturbation | ✓ | ✓ | PASS |
| Phase retardation per wavelength | ✓ | ✓ | PASS |
| Interference intensity sin² formula | ✓ | ✓ | PASS |
| Polarisation factor | ✓ | ✗ | FAIL — partially specified in legacy spec; excluded to avoid undocumented behaviour |
| Spectral to XYZ → RGB | ✓ | ✓ | PASS |
| Tone mapping (exposure, gamma) | ✓ | ✓ | PASS |

## Parameters

26 parameters implemented across Pattern, Fields, Angular, Transform, Multi-Axis, Colour, and Noise groups. Additional parameters beyond spec: `multiAxisCount`, `axisRadius`, `axisAngleSpread`, `noiseWeight`, `noiseScale`, `noiseOctaves`, `saturationBoost`. Stub `sources` parameter removed.

## Presets

6 named presets implemented: Rings, Spiral, Biaxial, Grid, Petal, Organic.

## Summary

8 of 9 specified algorithmic features implemented. Polarisation factor explicitly excluded. 26+ parameters present. Worker offload via `computePixels` active. Canvas 420×420 per spec.
