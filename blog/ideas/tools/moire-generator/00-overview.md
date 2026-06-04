# Moiré Generator — Overview
**Status:** SPEC | **Cluster:** generative-pattern


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate static and animated moiré patterns from interacting gratings |
| **Output Type** | Animation + Static Image |
| **Core Pipeline** | Gratings → Combination → Mask → Threshold → Render |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file |
| [01-design-spec.md](./01-design-spec.md) | UI parameters |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Wave interference math |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing |
| [04-system-architecture.md](./04-system-architecture.md) | Data flow |
| [05-implementation-guide.md](./05-implementation-guide.md) | Implementation |

## Status

| Component | Status |
|-----------|--------|
| Algorithm library | ✅ 100% coverage |
| Implementation | ⏳ Pending |

## Dependencies

### Existing Shared Modules
- `Patterns.radialGrating` — radial wave patterns
- `Patterns.angularGrating` — angular wave patterns
- `Patterns.combineMoire` — interference combination
- `Noise.smoothstep` — smooth transitions



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Moiré Generator (initial)](../../art/generative/initial/moire-initial.md) — ARCHIVED


---

## Related ideas

- [Generative Pattern Algorithm](../generative-pattern-algorithm/00-overview.md)
- [Interference Figure Generator](../interference-figure-generator/00-overview.md)
- [Unified Pattern Generator](../unified-pattern-generator/00-overview.md)
- [Ribbon Breeze](../ribbon-breeze/00-overview.md)
- [Tile Mosaic System](../tile-mosaic-system/00-overview.md)
- [Wallpaper Groups](../wallpaper-generator/wallpaper-groups-procedural-generation.md)
