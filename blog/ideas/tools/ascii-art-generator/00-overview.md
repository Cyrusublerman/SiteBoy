# ASCII Art Generator — Overview

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

