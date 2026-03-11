# ASCII Art Generator — Image-to-Text Conversion Process

## Overview

The ASCII Art Generator converts images into text by matching small rectangular regions of the image to characters that visually resemble those regions. The system uses four simultaneous feature-matching strategies weighted by user preference.

---

## Process Pipeline

### Phase 1: Character Atlas Construction

**Purpose:** Pre-render every available character and extract visual features.

**Steps:**

1. **Character Selection**
   - User chooses character set (Basic: 10 chars; Extended: 70 chars; Blocks; Custom)
   - System loads selected characters into memory

2. **Font Metrics Measurement**
   - Measure exact pixel dimensions of chosen font at chosen size
   - Record character width, height, baseline position
   - These dimensions become "tile size" for image processing

3. **Character Rendering**
   - For each character in set:
     - Render character as white-on-black bitmap at measured dimensions
     - Extract pixel data into analysis buffer

4. **Feature Extraction Per Character**
   
   Four parallel feature analyses:
   
   **A. Tone (Overall Brightness)**
   - Calculate average luminosity across all pixels
   - Result: Single density value 0–1
   
   **B. Quadrant Distribution**
   - Divide character into 4 equal regions (top-left, top-right, bottom-left, bottom-right)
   - Calculate average luminosity per quadrant
   - Result: 4 density values showing spatial brightness distribution
   
   **C. Orientation (Directional Edges)**
   - Calculate horizontal and vertical gradients at each pixel
   - Compute dominant edge direction via arctangent of gradient vector
   - Result: Single angle indicating primary stroke direction
   
   **D. HOG Signature (Pattern Fingerprint)**
   - For each pixel, compute gradient magnitude and direction
   - Bin gradient angles into 8 directional buckets (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
   - Weight each bucket by gradient magnitude
   - Normalize to create distribution histogram
   - Result: 8-value signature representing pattern complexity
   
5. **Atlas Storage**
   - Store character with all extracted features in lookup table
   - Atlas now contains complete "visual profile" for each character

---

### Phase 2: Image Preparation

**Purpose:** Transform source image to match output dimensions and apply artistic adjustments.

**Steps:**

1. **Dimension Calculation**
   - Divide canvas size by character tile dimensions
   - Calculate grid: columns = canvas_width ÷ tile_width, rows = canvas_height ÷ tile_height
   - Result: Exact grid dimensions (e.g., 80 columns × 60 rows)

2. **Image Scaling**
   - Scale/crop source image to fit grid dimensions exactly
   - Output dimensions = grid_cols × tile_width, grid_rows × tile_height
   - Maintains aspect ratio within canvas constraints

3. **Image Adjustments** (Optional)
   - Apply gamma correction (tonal curve adjustment)
   - Apply contrast adjustment (spread histogram)
   - Apply saturation adjustment (color intensity)
   - Apply brightness multiplier
   - Convert to grayscale luminance values

4. **Edge Detection** (Optional)
   - Convert to grayscale if not already
   - Apply Sobel operator (detects intensity changes)
   - Produces edge-emphasized version showing structure

5. **Invert** (Optional)
   - Flip brightness values (dark becomes light, light becomes dark)
   - Useful for light-on-dark output

---

### Phase 3: Tile Analysis

**Purpose:** Extract same visual features from each image region that were extracted from characters.

**Steps:**

1. **Grid Iteration**
   - For each row in grid:
     - For each column in row:
       - Define tile boundary: x = col × tile_width, y = row × tile_height

2. **Feature Extraction Per Tile** (Identical to character analysis)
   
   **A. Tone**
   - Average luminosity across tile pixels
   
   **B. Quadrant Distribution**
   - Divide tile into 4 regions
   - Average luminosity per quadrant
   
   **C. Orientation**
   - Calculate gradients across tile
   - Compute dominant edge direction
   
   **D. HOG Signature**
   - Build 8-bin histogram of gradient directions weighted by magnitude
   - Normalize distribution

3. **Tile Profile Storage**
   - Store extracted features for matching phase

---

### Phase 4: Character Matching

**Purpose:** Find character whose visual features best match each tile's features.

**Steps:**

1. **Cost Function Calculation**
   
   For each tile, compare against every character in atlas:
   
   **A. Tone Cost**
   - Absolute difference between tile density and character density
   - Range: 0–1 (0 = perfect match)
   
   **B. Quadrant Cost**
   - Sum of absolute differences across 4 quadrants
   - Average the sum
   - Range: 0–1
   
   **C. Orientation Cost**
   - Angular difference between tile and character edge directions
   - Wrapped to [0, π] to handle angle wrapping
   - Normalized to 0–1
   
   **D. Signature Cost**
   - Sum of absolute differences across 8 HOG bins
   - Average the sum
   - Range: 0–1

2. **Weighted Total Cost**
   - Combine four costs using user-defined weights:
   - Total = (α × tone_cost) + (β × quadrant_cost) + (γ × orientation_cost) + (δ × signature_cost)
   - Default weights: α=0.4, β=0.2, γ=0.3, δ=0.1
   - Lower total cost = better visual match

3. **Best Match Selection**
   - Select character with minimum total cost for this tile
   - Store character in grid position

4. **Grid Population**
   - Repeat for all tiles
   - Result: 2D character grid matching image dimensions

---

### Phase 5: Coherence Smoothing (Optional)

**Purpose:** Reduce visual "noise" by encouraging neighboring tiles to use similar characters.

**Steps:**

1. **Neighborhood Analysis**
   - For each character in grid:
     - Examine 8 surrounding neighbors (up, down, left, right, diagonals)
     - Count frequency of each character type in neighborhood

2. **Character Voting**
   - If neighbors strongly prefer a different character:
     - Calculate weighted preference based on neighbor agreement
     - Consider replacing current character with neighbor consensus
   - Strength parameter controls influence (0 = no change, 1 = full conformity)

3. **Iterative Refinement**
   - Apply multiple passes (default: 2)
   - Each pass propagates coherence further from high-confidence regions
   - Balances local accuracy with global smoothness

---

### Phase 6: Output Rendering

**Purpose:** Convert character grid to visible output formats.

**Steps:**

1. **Canvas Rendering**
   - Clear canvas with background color (black/white/transparent)
   - For each character in grid:
     - Calculate pixel position: x = col × tile_width, y = row × tile_height
     - Render character at position using selected font and size
     - Apply text color (default: white on black)

2. **Text Export** (Optional)
   - Concatenate grid rows with newline characters
   - Result: Plain text string maintaining spatial layout

3. **HTML Export** (Optional)
   - Wrap text in `<pre>` tag preserving whitespace
   - Apply CSS for font family, size, colors
   - Result: Web-ready formatted output

4. **ANSI Export** (Optional)
   - Insert ANSI color codes for terminal display
   - Preserve character positioning

5. **Image Export** (Optional)
   - Capture canvas as PNG/JPEG
   - Result: Rasterized image of text rendering

---

## Key Design Principles

### Pixel-Perfect Mapping
Output pixel count = Input pixel count. Each character occupies exact measured dimensions, ensuring no resolution loss or unexpected scaling.

### Multi-Feature Robustness
Four independent feature comparisons compensate for each other's weaknesses:
- **Tone** handles overall brightness but ignores structure
- **Quadrants** capture spatial distribution but miss fine detail
- **Orientation** detects stroke direction but ignores density
- **HOG Signature** captures pattern complexity but less sensitive to position

### User Control
Adjustable weights allow bias toward:
- Accurate tone reproduction (photography)
- Structural accuracy (line art, diagrams)
- Directional coherence (hatching, textures)
- Pattern matching (complex shapes)

### Iterative Refinement
Coherence smoothing trades local accuracy for global consistency, reducing "visual noise" where beneficial while preserving strong features.

---

## Performance Characteristics

**Atlas Construction:** O(n) where n = character set size (one-time per font/size change)

**Image Preparation:** O(w × h) where w×h = scaled image dimensions

**Tile Analysis:** O(cols × rows × tile_pixels)

**Character Matching:** O(cols × rows × n) — dominant cost (grid size × character set size)

**Coherence:** O(cols × rows × passes × 8) — 8 neighbors per tile

**Total Complexity:** O(cols × rows × n) — matching dominates

**Typical Processing:**
- 80×60 grid with 70-character set = 336,000 comparisons
- Modern hardware: <100ms for full conversion

