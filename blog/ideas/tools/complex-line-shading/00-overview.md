# Complex Line Shading — Documentation Index
**Status:** SPEC | **Cluster:** halftone-stipple, plotter-paths


## Quick Reference

**Purpose:** Transform raster images into line-shaded vector artwork using space-filling algorithms.

**Output:** SVG with continuous paths, variable stroke widths modulated by source image intensity.

**Core Pipeline:**
```
Image → Edge/Region Extraction → Polygon → Space-Fill → Path → Modulate → SVG
```

---

## Document Map

| Doc | Purpose | When to Read |
|-----|---------|--------------|
| [01-design-spec](./01-design-spec.md) | UI layout, controls, interactions | Designing the interface |
| [02-theoretical-foundation](./02-theoretical-foundation.md) | Mathematical theory, academic references | Understanding the algorithms |
| [03-algorithm-library](./03-algorithm-library.md) | Formula → code translation | Implementing functions |
| [04-system-architecture](./04-system-architecture.md) | Data flow, module dependencies | Planning integration |
| [05-implementation-guide](./05-implementation-guide.md) | Building the tool, connecting UI to backend | Writing the code |

---

## Status

| Component | Status |
|-----------|--------|
| Design spec | ✓ Complete |
| Theoretical foundation | ✓ Complete |
| Algorithm library | ✓ Core complete, gaps identified |
| System architecture | ✓ Complete |
| Implementation | Pending |

---

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Fill methods | Hilbert + TSP | Balance between aesthetic control and flexibility |
| Edge detection | Canny | Multi-scale, direction-aware, industry standard |
| Path optimization | 2-opt | Good quality/speed tradeoff |
| Output format | SVG | Vector, scalable, web-native |
| Variable width | Segment-based | SVG-compatible, simpler than polygon conversion |

---

## Dependencies

**Processing Library:**
- `EdgeDetection.canny()` — boundary extraction
- `Segmentation.otsuThreshold()`, `connectedComponents()` — region isolation
- `Sampling.poissonDisk()`, `variablePoissonDisk()` — point generation
- `SpaceFilling.HilbertCurve` — curve generation
- `TSP.solveTSP()` — path optimization
- `Geometry.pointInPolygon()` — containment test

**Gaps (to implement):**
- `marchingSquares()` — contour extraction
- `connectCurves()` — curve joining
- `pathToSVG()` — output generation

---

## File Locations

```
blog/docs/guides/tools/complex-line-shading/
├── 00-overview.md          ← This file
├── 01-design-spec.md       ← UI/UX design
├── 02-theoretical-foundation.md  ← Theory
├── 03-algorithm-library.md ← Math→code
├── 04-system-architecture.md    ← Data flow
└── 05-implementation-guide.md   ← Build guide

assets/js/tools/
└── complex-line-shading.js ← Implementation (to create)

blog/ideas/reference documentation/processing/
├── edge-detection/
├── segmentation/
├── sampling/
├── space-filling/
├── tsp/
└── geometry/
```



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Complex Line Shading (brainstorm)](../complex-line-shading-brainstorm.md) — ARCHIVED


---

## Related ideas

- [Smart Halftone System](../smart-halftone-system/00-overview.md)
- [Topographic Dot Halftone](../topographic-dot-halftone/00-overview.md)
- [ASCII Art Generator](../ascii-art-generator/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Stipple Node Spec](../image-editor/Nodes.md)
- [Cloth Shrink Halftone](../cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
- [Pen Plotter](../../art/generative/pen-plotter.md)
- [Glyph Rig Deformation](../../art/generative/glyph-rig-deformation.md)
