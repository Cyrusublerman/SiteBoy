# ASCII Art Generator — Overview
**Status:** SPEC | **Cluster:** halftone-stipple


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Structure-aware ASCII rendering with glyph–image feature matching |
| **Output Type** | Static Image (Text) |
| **Core Pipeline** | Image → Tiles → Features → Match → Coherence → Render |

## Dependencies

### Existing Shared Modules
- `EdgeDetection.sobel` — gradient detection
- `ImageAnalysis.computeOrientationHistogram` — orientation analysis
- `ImageAnalysis.analyzeGlyph` — glyph feature extraction
- `ImageAnalysis.matchGlyph` — multi-cost matching
- `ImageAnalysis.hammingDistance` — signature comparison
- `ImageAnalysis.coherenceSmoothing` — spatial coherence
- `Posterization.posterizeDither` — error diffusion
- `HalftonePatterns.extractLuminance` — luminance conversion



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Advanced ASCII Art Generator (legacy)](../ascii-art-legacy.md) — ARCHIVED


---

## Related ideas

- [Smart Halftone System](../smart-halftone-system/00-overview.md)
- [Topographic Dot Halftone](../topographic-dot-halftone/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Complex Line Shading](../complex-line-shading/00-overview.md)
- [Stipple Node Spec](../image-editor/Nodes.md)
- [Cloth Shrink Halftone](../cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
