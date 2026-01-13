# Moiré Field Generator — Audit

## 1. Source
- File: `blog/ideas/DUMP/moire_design_plan.md`
- Goal: Generate static and animated moiré patterns using radial, angular, and multi-centre gratings with masking, phase modulation, and preset morphing.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | Params | Grating 1..N | Radial/angular sin waves | PHYS-003 |
| 2 | Gratings, combiner | Combined field | SUM/PRODUCT/MIN/MAX | MATH-010 |
| 3 | Position, centres | Multi-centre field | Offset radial fields | PHYS-004 |
| 4 | Mask type, size | Mask field | Shape SDF + smoothstep | GEO-017 |
| 5 | Field, mask | Masked field | Multiplication | MATH-011 |
| 6 | Field, threshold | Binary | Step function | IMG-010 |
| 7 | Time, speed | Animated phases | Phase modulation | ANIM-011 |
| 8 | Binary, colours | Canvas | Fragment shader | CANVAS-010 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| PHYS-003 | radialGrating | ❌ Missing | Implement |
| PHYS-004 | multiCentreField | ❌ Missing | Implement |
| MATH-010 | fieldCombiner | ❌ Missing | Implement |
| MATH-011 | fieldMultiply | ❌ Missing | Implement |
| GEO-017 | shapeMaskSDF | ❌ Missing | Implement |
| IMG-010 | thresholdField | ❌ Missing | Implement |
| ANIM-011 | phaseModulator | ❌ Missing | Implement |
| CANVAS-010 | webglRenderer | ❌ Missing | Implement |
| MATH-005 | smoothstep | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | Moiré interference mathematics | HIGH |
| RESEARCH | WebGL fragment shader for field evaluation | HIGH |
| VARIATION | Multiple grating combination modes | MEDIUM |
| VARIATION | Shape mask SDFs (circle, triangle, polygon) | MEDIUM |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Moiré pattern | reference documentation/Moiré_pattern/ | ✅ |
| Interference | reference documentation/Interference_(wave_propagation)/ | ✅ |
| Signed distance function | reference documentation/Signed_distance_function/ | ✅ |

