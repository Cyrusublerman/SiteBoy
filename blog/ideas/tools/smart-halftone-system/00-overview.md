# Smart Halftone System — Overview
**Status:** SPEC | **Cluster:** halftone-stipple


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Field-based halftoning with structure-aware linework |
| **Output Type** | Static Image |
| **Core Pipeline** | Scalar Field → Tone Quantize → Direction → Line Families → Render |

## Dependencies

### Existing Shared Modules
- `ReactionDiffusion.stepGrayScott` — RD fields
- `JFA.jfaToDistanceField` — distance transform
- `EdgeDetection.sobel` — gradient field
- `Noise.domainWarp2D` — coordinate distortion
- `Posterization.posterize` — tone quantization
- `MarchingSquares.extractContours` — iso-contours
- `HalftonePatterns.lineHalftone` — line families
- `HalftonePatterns.dyadicHalftone` — frequency scaling



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Smart Halftone Engine (legacy)](../smart-halftone-legacy.md) — ARCHIVED


---

## Related ideas

- [Topographic Dot Halftone](../topographic-dot-halftone/00-overview.md)
- [ASCII Art Generator](../ascii-art-generator/00-overview.md)
- [Stipple → Single-Line Path](../../art/generative/stipple-single-line-path.md)
- [Complex Line Shading](../complex-line-shading/00-overview.md)
- [Stipple Node Spec](../image-editor/Nodes.md)
- [Cloth Shrink Halftone](../cloth-shrink-halftone/Matt's Webcorner - Cloth.md)
