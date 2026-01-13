# Advanced ASCII Art Generator — Audit

## 1. Source
- File: `blog/ideas/DUMP/advanced_ascii_art_generator_design_canvas.md`
- Goal: ASCII rendering using glyph-image matching based on structural, directional, and local-density features rather than naïve brightness mapping.

## 2. Process Steps
| Step | Input | Output | Technique | Module ID |
|------|-------|--------|-----------|-----------|
| 1 | Font, chars, resolution | Glyph bitmaps | Canvas text render | CANVAS-011 |
| 2 | Glyph bitmap | Density metrics | Mean per quadrant | IMG-011 |
| 3 | Glyph bitmap | 4×4 signature | Coarse grid hash | IMG-012 |
| 4 | Glyph bitmap | Orientation vector | Sobel + histogram | IMG-013 |
| 5 | Image | Normalised grayscale | Luminance + aspect | IMG-014 |
| 6 | Image | Tile grid | Fixed-size slicing | IMG-015 |
| 7 | Tile | Tile features | Same as glyph | IMG-011/12/13 |
| 8 | Tile features, DB | Best glyph | Multi-cost matching | IMG-016 |
| 9 | All matches | Refined matches | Coherence pass | IMG-017 |
| 10 | Glyph grid | ASCII output | Text/HTML render | CANVAS-012 |

## 3. Module Dependencies
| Module ID | Name | Status | Action |
|-----------|------|--------|--------|
| CANVAS-011 | renderGlyphBitmap | ❌ Missing | Implement |
| IMG-011 | quadrantDensity | ❌ Missing | Implement |
| IMG-012 | coarseGridSignature | ❌ Missing | Implement |
| IMG-013 | orientationHistogram | ❌ Missing | Implement |
| IMG-014 | normalizeGrayscale | ❌ Missing | Implement |
| IMG-015 | tileSlice | ❌ Missing | Implement |
| IMG-016 | multiCostMatcher | ❌ Missing | Implement |
| IMG-017 | coherenceRefine | ❌ Missing | Implement |
| CANVAS-012 | asciiRenderer | ❌ Missing | Implement |
| MATH-002 | clamp | ⚠️ Inline | Extract |

## 4. Gaps Identified
| Gap Type | Description | Priority |
|----------|-------------|----------|
| RESEARCH | Sobel gradient for orientation detection | HIGH |
| RESEARCH | 4×4 density grid hashing | MEDIUM |
| RESEARCH | Hamming distance for signature matching | MEDIUM |
| RESEARCH | Coherence engine for orientation continuity | LOW |
| RESEARCH | Multi-feature cost function design | HIGH |

## 5. Research Sources
| Technique | Source | LaTeX Preserved |
|-----------|--------|-----------------|
| Sobel operator | reference documentation/Sobel_operator/ | ✅ |
| Hamming distance | reference documentation/Hamming_distance/ | ✅ |
| ASCII art | reference documentation/ASCII_art/ | ✅ |
| Image histogram | reference documentation/Image_histogram/ | ✅ |

