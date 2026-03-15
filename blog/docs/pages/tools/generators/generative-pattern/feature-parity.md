# Generative Pattern — Feature Parity

Legacy source: `generative-pattern-algorithm-spec.md` (mixed bundle), `generative-pattern-algorithm-audit.md` (audit only).

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Hybrid point distribution | ✓ | ✓ | PASS — GEO-023; jittered grid with noise weight field |
| Proximity graph construction | ✓ | ✓ | PASS — GEO-024; axisBias, arcQuantisation, maxDegree |
| Gray-Scott reaction-diffusion solver | ✓ | ✓ | PASS — PHYS-005; graph Laplacian; v-field modulates SDF weights |
| Distance transform (JFA) | ✓ | ✗ | PARTIAL — brute-force 80×80 rasterised SDF with bbox culling; JFA not implemented |
| Truchet tile rendering | ✓ | ✓ | PASS — PAT-010; marching-squares corner classification; 400 tiles |
| Blob/inflated-union rendering | ✓ | ✓ | PASS — PAT-011; threshold-based inflated union on warped SDF |
| Nested contours rendering | ✓ | ✓ | PASS — PAT-012; marching squares at multiple iso-levels |
| Global contours rendering | ✓ | ✓ | PASS — PAT-012 global variant; iso-levels spaced across full SDF range |
| Flow field animation | ✓ | ✓ | PASS — ANIM-012; hash-noise UV warp, warped SDF cache per frame |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| density | ✓ | ✓ | PASS |
| gridStrength | ✓ | ✓ | PASS |
| clusterScale | ✓ | ✓ | PASS |
| jitter | ✓ | ✓ | PASS |
| connectionRadius | ✓ | ✓ | PASS |
| maxDegree | ✓ | ✓ | PASS |
| axisBias | ✓ | ✓ | PASS |
| arcQuantisation | ✓ | ✓ | PASS |
| Du, Dv, feedRate, killRate | ✓ | ✓ | PASS |
| iterations | ✓ | ✓ | PASS |
| renderMode | ✓ | ✓ | PASS |
| weightScale, tileWindowSize, boundaryCost | ✓ | ✓ | PASS |
| flowSpeed, noiseFrequency | ✓ | ✓ | PASS |
| complexity | not in spec | ✗ | N/A — removed (was stub, unused) |

## Summary

8 of 9 specified features implemented. Distance transform is brute-force SDF (not JFA). All 17 spec parameters present. 4 presets. Animation type: infinite (non-loopable warp). GIF/WebM disabled.
