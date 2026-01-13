# Topographic Dot Halftone — Audit

## 1. Source
- File: `blog/ideas/DUMP/topographic_dot_halftone_design.md`
- Goal: Generate dot-based halftone patterns following geometric contours from vector shapes and iso-lines from depth/normal/luma maps with size modulation.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | SVG / image | S(x,y) scalar field | SDF / Geodesic / Laplace | IMG-007 |
| 2 | Depth, normal, luma | Weighted blend | Linear combination | MATH-009 |
| 3 | S(x,y) | Gradient ∇S | Finite differences | IMG-008 |
| 4 | ∇S | Tangent field T | Perpendicular rotation | GEO-015 |
| 5 | S, T, pitches | Lattice coords (i,j) | Contour-aligned sampling | PAT-006 |
| 6 | s_N, S, params | Radius R | Shading formula | IMG-009 |
| 7 | Lattice, R, mask | Dot coverage | Distance test | PAT-007 |
| 8 | Coverage | Canvas/PNG/SVG | Rasterisation or vector | CANVAS-007 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| IMG-007 | signedDistanceField | ❌ Missing | Implement |
| IMG-008 | gradientField | ❌ Missing | Implement |
| MATH-009 | weightedBlend | ❌ Missing | Implement |
| GEO-015 | tangentFromGradient | ❌ Missing | Implement |
| PAT-006 | contourAlignedLattice | ❌ Missing | Implement |
| PAT-007 | dotCoverageTest | ❌ Missing | Implement |
| IMG-009 | shadingRadius | ❌ Missing | Implement |
| CANVAS-007 | vectorExport | ⚠️ Inline | Extract |
| MATH-002 | clamp | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | SDF generation from vector paths (WebGL) | HIGH |
| RESEARCH | Laplace field solver for contour generation | HIGH |
| RESEARCH | Geodesic distance inside polygons | MEDIUM |
| RESEARCH | Contour-aligned dot lattice placement | HIGH |
| EXTRACTION | SVG export from canvas coordinates | MEDIUM |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Signed distance field | reference documentation/Signed_distance_function/ | ✅ |
| Laplace equation | reference documentation/Laplace's_equation/ | ✅ |
| Halftoning | reference documentation/Halftone/ | ✅ |
| Geodesic distance | reference documentation/Geodesic/ | ✅ |

