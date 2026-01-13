# Ribbon Breeze — Audit

## 1. Source
- File: `blog/ideas/DUMP/ribbon_breeze_design_doc.md`
- Goal: Build procedural ribbon field driven by shared wind field with 2.5D illusion, multiple shading modes, and perfect looping animation.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | Time, params | Wind phases | Loop-safe travelling wave | MATH-008 |
| 2 | Row index, wind | Front polyline | Sinusoidal sampling | GEO-008 |
| 3 | Polyline | Tangents, normals | Finite differences | GEO-009 |
| 4 | Front line, normals, thickness | Back polyline | Normal offset extrusion | GEO-010 |
| 5 | Front polyline | Fold indices | Curvature sign change | GEO-011 |
| 6 | Polylines, folds | Segments array | Monotonic slicing | GEO-012 |
| 7 | Segments | Sorted segments | Depth key sorting | GEO-013 |
| 8 | Segment, mode | Fill colours | Gradient/flat/pattern/dither | PAT-005 |
| 9 | Folds, back polyline | Riser lines | Vertical connectors | GEO-014 |
| 10 | Segments, risers | Canvas | Painter's algorithm | CANVAS-006 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| MATH-003 | lerp | ⚠️ Inline | Extract |
| MATH-004 | wrap | ⚠️ Inline | Extract |
| MATH-008 | loopSafePhase | ❌ Missing | Implement |
| GEO-008 | sinusoidalPolyline | ❌ Missing | Implement |
| GEO-009 | polylineNormals | ❌ Missing | Implement |
| GEO-010 | offsetPolyline | ❌ Missing | Implement |
| GEO-011 | detectCurvatureFolds | ❌ Missing | Implement |
| GEO-012 | splitAtFolds | ❌ Missing | Implement |
| GEO-013 | depthSortSegments | ❌ Missing | Implement |
| GEO-014 | generateRisers | ❌ Missing | Implement |
| PAT-005 | gradientShading | ❌ Missing | Implement |
| CANVAS-006 | painterSort | ❌ Missing | Implement |
| ANIM-001 | AnimationLoop | ✅ Implemented | Use |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | Polyline normal calculation via finite differences | HIGH |
| RESEARCH | Extrusion along normals for 2.5D effect | HIGH |
| RESEARCH | Curvature sign detection for fold boundaries | MEDIUM |
| VARIATION | Gradient shading with customisable exponent | MEDIUM |
| RESEARCH | Loop-safe LFO/phase generation | HIGH |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Travelling wave | reference documentation/Wave_equation/ | ✅ |
| Normal vectors | reference documentation/Normal_(geometry)/ | ✅ |
| Parametric curves | reference documentation/Parametric_equation/ | ✅ |

