# Unified Pattern Generator — Overview
**Status:** SPEC | **Cluster:** generative-pattern


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate mid-century geometric patterns (Googie, Atomic Age, Op-Art) from superellipse primitives |
| **Output Type** | Static Image |
| **Core Pipeline** | Grid → Superellipse → Warp → Blend → Style |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file |
| [01-design-spec.md](./01-design-spec.md) | UI parameters, controls |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Mathematical definitions |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing |
| [04-system-architecture.md](./04-system-architecture.md) | Data flow |
| [05-implementation-guide.md](./05-implementation-guide.md) | ToolBase integration |

## Status

| Component | Status |
|-----------|--------|
| Design spec | ✅ Complete |
| Algorithm library | ✅ 100% coverage |
| Implementation | ⏳ Pending |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Superellipse primitive | Unifies circles, rectangles, and rounded shapes |
| Continuous parameters | Smooth morphing between styles without mode switching |
| SDF-based blending | Enables smooth union of overlapping shapes |

## Dependencies

### Existing Shared Modules
- `Patterns.superellipse` — base shape function
- `SDF.sdfSmoothUnion` — shape blending
- `Noise.domainWarp2D` — coordinate distortion
- `Noise.simplex2D` — density/jitter fields
- `Rendering.jitteredGridSamples` — point distribution

### Tool-Local Modules
- None

## Gaps
- None — 100% coverage



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Unified Pattern Generator (initial)](../../art/generative/initial/unified-pattern-initial.md) — ARCHIVED


---

## Related ideas

- [Generative Pattern Algorithm](../generative-pattern-algorithm/00-overview.md)
- [Interference Figure Generator](../interference-figure-generator/00-overview.md)
- [Moiré Generator](../moire-generator/00-overview.md)
- [Ribbon Breeze](../ribbon-breeze/00-overview.md)
- [Tile Mosaic System](../tile-mosaic-system/00-overview.md)
- [Wallpaper Groups](../wallpaper-generator/wallpaper-groups-procedural-generation.md)
