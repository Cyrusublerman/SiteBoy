# Ribbon Breeze — Overview
**Status:** SPEC | **Cluster:** generative-pattern


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



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Ribbon Breeze (initial)](../../art/generative/initial/ribbon-breeze-initial.md) — ARCHIVED


---

## Related ideas

- [Generative Pattern Algorithm](../generative-pattern-algorithm/00-overview.md)
- [Interference Figure Generator](../interference-figure-generator/00-overview.md)
- [Moiré Generator](../moire-generator/00-overview.md)
- [Unified Pattern Generator](../unified-pattern-generator/00-overview.md)
- [Tile Mosaic System](../tile-mosaic-system/00-overview.md)
- [Wallpaper Groups](../wallpaper-generator/wallpaper-groups-procedural-generation.md)
