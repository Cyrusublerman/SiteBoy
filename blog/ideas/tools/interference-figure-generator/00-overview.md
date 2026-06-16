# Interference Figure Generator — Overview
**Status:** SPEC | **Cluster:** generative-pattern


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate crystal-like conoscopic interference patterns |
| **Output Type** | Static Image |
| **Core Pipeline** | OPD Field → Spectral Interference → RGB Conversion |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file |
| [01-design-spec.md](./01-design-spec.md) | UI parameters |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Optical physics |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing |
| [04-system-architecture.md](./04-system-architecture.md) | Data flow |
| [05-implementation-guide.md](./05-implementation-guide.md) | Implementation |

## Dependencies

### Existing Shared Modules
- `Optics.opticalPathLength` — OPD calculation
- `Optics.thinFilmReflectance` — interference intensity
- `Optics.wavelengthToRGB` — spectral conversion
- `Optics.uniaxialConoscopy` — conoscopic patterns
- `Optics.crossedPolarIntensity` — polarization effects
- `Noise.fbm2D` — organic perturbations

### Tool-Local Modules
- `angularHarmonicsRenderer` — domain-specific visualization



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Interference Figure Generator (initial)](../../art/generative/initial/interference-figure-generator-initial.md) — ARCHIVED


---

## Related ideas

- [Generative Pattern Algorithm](../generative-pattern-algorithm/00-overview.md)
- [Moiré Generator](../moire-generator/00-overview.md)
- [Unified Pattern Generator](../unified-pattern-generator/00-overview.md)
- [Ribbon Breeze](../ribbon-breeze/00-overview.md)
- [Tile Mosaic System](../tile-mosaic-system/00-overview.md)
- [Wallpaper Groups](../wallpaper-generator/wallpaper-groups-procedural-generation.md)
