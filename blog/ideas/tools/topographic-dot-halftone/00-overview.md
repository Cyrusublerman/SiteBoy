# Topographic Dot Halftone — Overview
**Status:** SPEC | **Cluster:** halftone-stipple


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Contour-aligned dot halftone patterns from vector shapes and depth/normal maps |
| **Output Type** | Static Image |
| **Core Pipeline** | Field → Tangent → Lattice → Dot Radius → Render |

## Dependencies

### Existing Shared Modules
- `SDF.*` — signed distance field
- `Geodesic.fastMarchingGeodesic` — geodesic distance
- `Geodesic.solveLaplace` — Laplace field solver
- `EdgeDetection.sobel` — gradient/tangent field
- `HalftonePatterns.contourAlignedLattice` — lattice generation
- `HalftonePatterns.sizeDotsFromLuminance` — radius mapping
- `HalftonePatterns.extractNormalMap` — normal sampling
- `HalftonePatterns.extractDepthMap` — depth sampling



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Topographic Dot Halftone (legacy)](../topographic-halftone-legacy.md) — ARCHIVED


---

## Related ideas

- [Smart Halftone System](../smart-halftone-system/00-overview.md)
- [ASCII Art Generator](../ascii-art-generator/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Complex Line Shading](../complex-line-shading/00-overview.md)
- [Stipple Node Spec](../image-editor/Nodes.md)
- [Cloth Shrink Halftone](../cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
