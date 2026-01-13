# Topographic Dot Halftone — Overview

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

