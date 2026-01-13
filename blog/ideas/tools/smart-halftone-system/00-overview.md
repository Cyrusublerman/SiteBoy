# Smart Halftone System — Overview

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

