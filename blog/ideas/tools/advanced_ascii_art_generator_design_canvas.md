# Advanced ASCII Art Generator — Full Design Document

## 1. Purpose
Develop an ASCII rendering system that replaces naïve brightness mapping with a glyph–image matching engine based on structural, directional, and local-density features. The system must:
- Analyse the spatial weight distribution of glyphs.
- Detect shading direction, gradients, edges, and local structure in images.
- Match tiles to glyphs through multi-feature comparison.
- Provide modular architecture following site design guidelines.

## 2. High-Level Structure
Modules (strict separation):
1. **GlyphSampler** — Render glyphs → extract features.
2. **GlyphFeatureDB** — Store, compress, and query glyph features.
3. **ImagePreprocessor** — Standardise image, segment into tiles.
4. **TileFeatureExtractor** — Compute features per tile analogous to glyphs.
5. **Matcher** — Compute costs, select glyph per tile.
6. **CoherenceEngine** — Optional refinement for orientation continuity.
7. **Renderer** — Output ASCII grid.

Each module defines:
- Inputs
- Outputs
- Procedures
- Mathematical basis
- Dependencies

## 3. GlyphSampler Module
### Input
- Font file
- Character list
- Render resolution (H×W)

### Output
- Per-glyph bitmap
- Feature vector φ_g
- 4×4 signature

### Procedures
1. Render glyph → get grayscale bitmap `G(x,y)`.
2. **Density Metrics**
   - Global density: mean(G).
   - Quadrants (2×2): mean over each region.
   - Horizontal/vertical bias: differences L–R, T–B.
3. **Coarse-Grid Signature** (4×4)
   - Partition bitmap → compute mean per cell.
   - Binary threshold → b_ij.
   - Encode into 16-bit signature.
4. **Orientation Metrics**
   - Compute Sobel gradients: Gx, Gy.
   - Orientation θ = atan2(Gy,Gx).
   - Magnitude m = sqrt(Gx²+Gy²).
   - Build histogram over θ ∈ [0,π).
   - Dominant orientation vector o_g.
   - Orientation strength M_g = mean(m).

### Outputs Stored
a) density values (global + quadrants)
b) directional biases
c) 4×4 density grid
d) signature S_g
e) orientation vector o_g
f) strength M_g

g) metadata (glyph, unicode, etc.)

## 4. GlyphFeatureDB Module
### Input
- Feature data from GlyphSampler

### Output
- Compressed searchable database

### Procedures
- Group glyphs by density bins.
- Group glyphs by orientation buckets.
- Precompute lookup tables for fast candidate filtering.

## 5. ImagePreprocessor Module
### Input
- User image
- Tile size = (H×W)

### Output
- Normalised grayscale image
- Tile grid coordinates

### Procedures
1. Convert to grayscale using luminance.
2. Adjust aspect ratio to match glyph aspect.
3. Resample so width and height are multiples of tile dimensions.
4. Segment image into tiles.

## 6. TileFeatureExtractor Module
### Input
- Tile image I(x,y)

### Output
- Feature vector ψ_t

### Procedures (same as GlyphSampler):
- Compute global/quadrant densities.
- Compute 4×4 density grid + signature S_t.
- Compute Sobel gradients.
- Obtain orientation vector o_t.
- Orientation strength M_t.

## 7. Matcher Module
### Input
- Tile feature ψ_t
- Glyph DB

### Output
- Best-match glyph g*

### Matching Cost
C = α·Ctone + β·Cquad + γ·Cori + δ·Csig

Where:
- **Tone:** |D_g − D_t|
- **Quadrants:** Σ |D_g,q − D_t,q|
- **Orientation:** (1 − |o_g·o_t|)·(M_g·M_t)
- **Signature:** Hamming(S_g, S_t)/16

### Candidate Filtering
- Restrict density: |D_g − D_t| < threshold.
- If M_t low → favour non-directional glyphs.
- If M_t high → favour glyphs with strong orientation.
- Use DB’s bucket lookup to restrict.

## 8. CoherenceEngine Module
### Purpose
Prevent noisy results; enforce orientation continuity.

### Procedure
- For each tile, evaluate neighbours.
- Penalty P = λ·(1 − |o_g·o_neighbor|).
- Perform iterative refinement (fixed passes).
- Optionally lock tiles on strong edges.

## 9. Renderer Module
### Output
- ASCII grid

### Rendering Options
- Plain text
- HTML <pre> block
- ANSI colour (optional)

## 10. Parameters
- Tile size
- Character set selection
- Cost weights α β γ δ
- Thresholds: density, orientation, edge detection
- Coherence on/off
- Multi-scale tiles

## 11. Multi-Scale Variant
- Use large tiles for structure; small tiles for detail.
- Large → choose glyph family.
- Small → choose specific glyph.

## 12. Error Diffusion Option
- Apply tone error diffusion across tiles.
- Improves global brightness structure.

## 13. Direction-Aware Enhancements
- Edge tracing → assign consistent glyph families along contours.
- Vector-field guidance: align glyphs to dominant gradient flow.

## 14. Module Dependencies
- GlyphSampler → GlyphFeatureDB → Matcher
- ImagePreprocessor → TileFeatureExtractor → Matcher
- Matcher → Coherence → Renderer

## 15. Implementation Roadmap
1. Implement GlyphSampler + JSON export.
2. Build GlyphFeatureDB.
3. Implement image preprocessing.
4. Implement tile feature extraction.
5. Implement matcher with cost function.
6. Implement coherence engine.
7. Implement renderer.
8. Add GUI controls.

## 16. Page Structure (per design guide)
Sections required by site pages:
- **Description:** ASCII renderer using glyph structure matching.
- **Goals:** Fidelity, directionality, coherence.
- **Modules:** as above.
- **Mathematical Foundations:** density, gradients, signatures.
- **Glossary:** density grid, signature, orientation histogram.
- **Mermaid System Diagram:** (to be added in final page).

## 17. Summary
This design provides a modular, extensible ASCII engine with precise structural and directional matching, suitable for integration into site systems and generative pipelines.

