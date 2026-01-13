# Ribbon Breeze — Overview

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Procedural ribbon field with 2.5D shading and perfect looping |
| **Output Type** | Animation |
| **Core Pipeline** | Wind → Ribbon → Extrusion → Shading → Render |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file |
| [01-design-spec.md](./01-design-spec.md) | UI parameters |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Wave math, extrusion |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing |
| [04-system-architecture.md](./04-system-architecture.md) | OOP architecture |
| [05-implementation-guide.md](./05-implementation-guide.md) | Implementation |

## Dependencies

### Existing Shared Modules
- `WaveSolver.travellingWave` — wind field
- `CurveGeometry.computeNormals` — ribbon normals
- `CurveGeometry.extrudeRibbon` — 3D extrusion
- `CurveGeometry.computeCurvature` — fold detection
- `CurveGeometry.depthSortBackToFront` — painter's algorithm
- `Posterization.posterizeDither` — dithered shading
- `Animation.loopTime` — perfect loop phase
- `Animation.createLFO` — low frequency oscillators

