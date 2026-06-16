# Tile Mosaic System — Overview
**Status:** SPEC | **Cluster:** generative-pattern


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate dynamic tile-based mosaics with layout morphing |
| **Output Type** | Static Image + Animation |
| **Core Pipeline** | Grid → Tile Grammar → Sprite Cache → Shading → Render |

## Dependencies

### Existing Shared Modules
- `BinPacking.maxRectsPack` — layout packing
- `Rendering.createSpriteCache` — tile caching
- `Rendering.calculate3DShading` — pseudo-depth
- `Rendering.renderRimHighlight` — edge highlights
- `Animation.morphLayout` — layout transitions
- `Noise.simplex2D` — procedural texture



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Tile Mosaic Full Spec](../../art/generative/tile-mosaic/tile-mosaic-full-spec.md) — ARCHIVED
- [Tile Mosaic Page Design](../../art/generative/tile-mosaic/tile-mosaic-page-design.md) — ARCHIVED


---

## Related ideas

- [Generative Pattern Algorithm](../generative-pattern-algorithm/00-overview.md)
- [Interference Figure Generator](../interference-figure-generator/00-overview.md)
- [Moiré Generator](../moire-generator/00-overview.md)
- [Unified Pattern Generator](../unified-pattern-generator/00-overview.md)
- [Ribbon Breeze](../ribbon-breeze/00-overview.md)
- [Wallpaper Groups](../wallpaper-generator/wallpaper-groups-procedural-generation.md)
