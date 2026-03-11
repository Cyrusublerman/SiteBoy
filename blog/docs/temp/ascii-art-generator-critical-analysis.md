# ASCII Art Generator — Critical Analysis & Improvement Proposals

## 1. Character Atlas Construction — Current Limitations

### Problem: Insufficient Spatial Resolution (Quadrants)

**Current State:** 4 quadrants (2×2 grid) per character

**Discrimination Failures:**

| Character Pair | Why 4 Quadrants Fail |
|----------------|---------------------|
| W vs M | Both have: dense bottom-left/bottom-right, lighter top-left/top-right. Quadrants cannot capture the vertical stroke difference in middle. |
| X vs % | Both have: balanced diagonal distribution across all 4 quadrants. Cannot distinguish crossing lines from separate dots+slash. |
| O vs Q | Identical quadrant distribution. Cannot detect the tail extending into bottom-right. |
| 8 vs B | Similar density distribution. Cannot capture structural difference between stacked circles vs vertical stem with bumps. |
| / vs \ | Opposite diagonal directions but quadrants average out to similar values depending on stroke thickness. |

**Root Cause:** Quadrants measure regional averages, not spatial structure. They cannot capture:
- Internal features (middle strokes, serifs, dots)
- Fine structural differences within regions
- Exact position of density within quadrant

### Proposal: Configurable Spatial Resolution

**Parameter:** `Spatial Resolution`
- Type: Dropdown or slider
- Options: 2×2 (4 tiles), 3×3 (9 tiles), 4×4 (16 tiles), 5×5 (25 tiles)
- Default: 3×3 (9 tiles)
- Trade-off: Higher resolution = better discrimination, slower matching

**Implementation Impact:**
- Atlas construction: Extract N² regional densities instead of 4
- Tile analysis: Extract same N² densities from image tiles
- Matching cost: Compare N² values instead of 4
- Performance: Linear increase in comparison operations

**Discrimination Improvement Examples:**

**W vs M (with 3×3):**
- W: Dense bottom-left, bottom-center, bottom-right; V-shape captured in center column
- M: Dense at all three bottom cells AND top-left/top-right (peaks captured)

**X vs % (with 3×3):**
- X: High density in center cell (crossing point), moderate in all 4 corners
- %: High density top-left and bottom-right only (dots), low center (gap in slash)

**Limitation:** Even 5×5 may fail on very similar characters (l vs I vs 1) — orientation and signature become more important.

---

## 2. Orientation Analysis — Current Implementation

### What It Currently Does

**Process:**
1. Calculate horizontal gradient (Gₓ) and vertical gradient (Gᵧ) at each pixel
2. Sum all gradients: Gₓ_total = Σ Gₓ, Gᵧ_total = Σ Gᵧ
3. Compute single dominant angle: θ = atan2(Gᵧ_total, Gₓ_total)
4. Store single orientation value per character

**What This Captures:**
- Overall "lean" or dominant edge direction
- "/" produces angle ≈ -45° (or 315°)
- "\" produces angle ≈ 45°
- "—" produces angle ≈ 0° (horizontal)
- "|" produces angle ≈ 90° (vertical)

**Limitation:**
- Only one dominant direction
- Characters with multiple strokes at different angles (X, K, N) get averaged
- Cannot distinguish "crossing" from "parallel" strokes

### What "Flow Orientation" Should Capture

**Flow Definition:** The directional movement or progression of visual mass.

**Examples:**

| Character | Flow Description | Desired Measurement |
|-----------|------------------|---------------------|
| / | Diagonal bottom-left → top-right | Single strong angle ≈ 45° |
| \ | Diagonal top-left → bottom-right | Single strong angle ≈ -45° |
| X | Two opposing diagonals | Bimodal: peaks at ±45° |
| + | Horizontal and vertical | Bimodal: peaks at 0° and 90° |
| = | Horizontal only | Single strong angle ≈ 0° |
| ∥ | Vertical only | Single strong angle ≈ 90° |
| N | Vertical stems + diagonal | Multimodal: 45°, 90° |
| Z | Horizontal bars + diagonal | Multimodal: 0°, -45° |

**Current System Weakness:**
- X and + both produce weak/ambiguous single angle (opposing forces cancel)
- Cannot detect multi-directional characters

**Improvement Needed:**
- Preserve histogram of gradient directions (this is partially what HOG does, see next section)
- Detect primary AND secondary orientations
- Measure orientation "strength" (how concentrated vs diffuse)

---

## 3. HOG Signature — Explanation

### What Is HOG?

**HOG = Histogram of Oriented Gradients**

It's a way to capture "pattern fingerprint" by describing the distribution of edge directions.

### Process Breakdown

**Step 1: Gradient Calculation**
- At each pixel, compute horizontal change (Gₓ) and vertical change (Gᵧ)
- Calculate gradient magnitude: M = √(Gₓ² + Gᵧ²)
- Calculate gradient direction: θ = atan2(Gᵧ, Gₓ)

**Step 2: Directional Binning**
- Divide full circle (0–360°) into 8 equal bins (each 45° wide):
  - Bin 0: 0°–45° (horizontal right)
  - Bin 1: 45°–90° (diagonal up-right)
  - Bin 2: 90°–135° (vertical up)
  - Bin 3: 135°–180° (diagonal up-left)
  - Bin 4: 180°–225° (horizontal left)
  - Bin 5: 225°–270° (diagonal down-left)
  - Bin 6: 270°–315° (vertical down)
  - Bin 7: 315°–360° (diagonal down-right)

**Step 3: Weighted Accumulation**
- For each pixel's gradient:
  - Determine which bin the angle falls into
  - Add the gradient magnitude to that bin
  - Strong edges contribute more, weak edges contribute less

**Step 4: Normalization**
- Divide all bins by their sum
- Result: 8 values summing to 1.0 (probability distribution)

### Example: Character "/"

**Visual Structure:**
- Strong diagonal edge from bottom-left to top-right
- Gradient direction perpendicular to edge: ≈135° and ≈315° (opposing sides of line)

**HOG Signature:**
```
Bin 0 (0°):     0.05  ← minimal horizontal
Bin 1 (45°):    0.08  ← some diagonal
Bin 2 (90°):    0.05  ← minimal vertical
Bin 3 (135°):   0.38  ← STRONG (one side of slash)
Bin 4 (180°):   0.05  ← minimal
Bin 5 (225°):   0.05  ← minimal
Bin 6 (270°):   0.06  ← minimal
Bin 7 (315°):   0.38  ← STRONG (other side of slash)
```

**Interpretation:** Two opposite bins dominate (bins 3 and 7) = single strong edge at ≈45°

### Example: Character "X"

**Visual Structure:**
- Two diagonal edges crossing at center

**HOG Signature:**
```
Bin 0 (0°):     0.05
Bin 1 (45°):    0.22  ← diagonal /
Bin 2 (90°):    0.05
Bin 3 (135°):   0.22  ← diagonal \
Bin 4 (180°):   0.06
Bin 5 (225°):   0.22  ← diagonal /
Bin 6 (270°):   0.05
Bin 7 (315°):   0.22  ← diagonal \
```

**Interpretation:** Four bins active (1, 3, 5, 7) = crossing diagonals

### HOG vs Orientation

| Feature | Orientation (Current) | HOG Signature |
|---------|----------------------|---------------|
| Output | Single angle | 8-value distribution |
| Multi-directional | No (averaged) | Yes (preserved) |
| Edge strength | Lost | Preserved (magnitude weighting) |
| Pattern complexity | Not captured | Captured (distribution spread) |
| Cost | Fast (one comparison) | Moderate (8 comparisons) |

### Why HOG Matters for ASCII

**Discrimination Power:**
- "I" vs "|" vs "1": All vertical, similar tone, but different serif patterns → different HOG
- "/" vs "⁄" vs "∕": All diagonal, but different thickness/position → different HOG
- "O" vs "0": Similar shape but "0" may have diagonal slash → different HOG
- "%" vs "÷": Both have dots and line, but different spatial arrangement → different HOG

**Current Limitation:**
HOG signature gets only 10% weight by default. Increasing this weight improves discrimination of structurally complex characters but may reduce tone accuracy.

---

## 4. Image Preparation Stage — Major Gaps

### Current State: Single Generic Workflow

**What Exists:**
- Upload image
- Scale to canvas
- Apply adjustments (gamma, contrast, saturation, brightness)
- Optional edge detect (replaces image)
- Optional invert
- Convert to ASCII

**What's Missing:**
1. Use-case driven workflows
2. Output format constraints
3. Canvas/image relationship options
4. Adjustment preview
5. Adjustment layering
6. Progressive refinement view

---

### Proposal: Use-Case Driven Workflows

**Parameter:** `Output Target`
- Type: Dropdown
- Options: `Print Poster`, `Terminal Output`, `Web Page`, `Text Document`, `Custom`

**Workflow Impacts:**

#### A. Print Poster
**Characteristics:**
- Fixed physical dimensions (A4, A3, Letter, etc.)
- High DPI requirement (300+ DPI for quality)
- Monochrome or color output
- Font must be print-safe (embedded/standard)

**Constraints Applied:**
- Canvas size locked to paper dimensions × DPI
- Character count = (width_mm / char_width_mm) × (height_mm / char_height_mm)
- Font size calculated from DPI and target readability
- Warn if character count exceeds reasonable print density

**UI Changes:**
- Add: Paper size dropdown (A4 Portrait, A4 Landscape, Letter, etc.)
- Add: DPI slider (150–600)
- Show: Estimated print dimensions
- Show: Characters per inch

---

#### B. Terminal Output
**Characteristics:**
- Fixed character grid (typically 80×24, 120×40, etc.)
- Monospace font required
- ANSI color support (16 colors, 256 colors, or truecolor)
- Line breaks must align to terminal width

**Constraints Applied:**
- Canvas width locked to terminal columns × character width
- Canvas height locked to terminal rows × character height
- Font must be monospace (filter non-monospace fonts)
- Character set limited to ASCII 32–126 (or extended ASCII)

**UI Changes:**
- Add: Terminal size presets (80×24, 120×40, custom)
- Add: Color mode (Monochrome, 16-color, 256-color)
- Disable: Non-monospace fonts
- Add: Export with ANSI codes toggle

---

#### C. Web Page
**Characteristics:**
- Responsive/flexible dimensions
- Font can be web font (Google Fonts, system fonts)
- CSS styling available
- May be monospace or proportional
- HTML output with styling

**Constraints Applied:**
- Canvas size flexible (suggestions: 400px, 600px, 800px wide)
- Character dimensions depend on font metrics
- Support both monospace and proportional fonts

**UI Changes:**
- Add: Width preset (Small 400px, Medium 600px, Large 800px, Full Width)
- Add: Font source (System, Google Fonts, Web Font URL)
- Add: CSS export options (inline styles, external stylesheet)
- Show: Preview in scrollable container

---

#### D. Text Document
**Characteristics:**
- Embedded in document (Word, PDF, Markdown)
- Fixed-width formatting required
- Limited formatting (plain text or basic HTML)
- Character width must be consistent

**Constraints Applied:**
- Monospace font required
- Output must be plain text or basic HTML
- No color (or simple color)
- Line length should fit document margins (typically 60–80 characters)

**UI Changes:**
- Add: Line length slider (40–120 characters)
- Lock: Monospace fonts only
- Add: Format export (Plain Text, Markdown code block, HTML `<pre>`)

---

### Proposal: Canvas/Image Relationship Options

**Parameter:** `Image Scaling Mode`
- Type: Dropdown with visual icons
- Options: `Fit (Letterbox)`, `Fill (Crop)`, `Stretch (Distort)`, `Canvas to Image`, `Image to Canvas`

#### Fit (Letterbox)
- Image scaled to fit entirely within canvas
- Maintains aspect ratio
- Empty space filled with background color
- No cropping

**Use Case:** Preserve entire image, accept empty space

---

#### Fill (Crop)
- Image scaled to fill entire canvas
- Maintains aspect ratio
- Crops overflow
- Focus point parameter (center, top, bottom, left, right, custom)

**Use Case:** Maximize canvas usage, accept losing edges

---

#### Stretch (Distort)
- Image scaled to exact canvas dimensions
- Ignores aspect ratio
- No cropping, no empty space
- May distort

**Use Case:** Exact dimension match required, accept distortion

---

#### Canvas to Image
- Canvas automatically resized to match image aspect ratio
- Image scaled to target character count or DPI
- No cropping, no distortion, no empty space

**Use Case:** Let image determine output proportions

**Parameters:**
- Target character width (e.g., 80, 120, 200)
- Auto-calculate height maintaining aspect ratio

---

#### Image to Canvas
- Image processed exactly to canvas dimensions
- Choose fit/fill/stretch behavior
- Canvas dimensions user-defined

**Use Case:** Fixed output dimensions required (poster, terminal)

---

### Proposal: Full Image Adjustment Suite

**Current Adjustments:** Gamma, Contrast, Saturation, Brightness

**Missing Adjustments:**

| Adjustment | Range | Purpose |
|------------|-------|---------|
| Hue Shift | -180° to +180° | Rotate color wheel |
| Temperature | -100 to +100 | Warm/cool color cast |
| Tint | -100 to +100 | Magenta/green cast |
| Exposure | -3 to +3 EV | Simulate camera exposure |
| Highlights | -100 to +100 | Recover/suppress bright areas |
| Shadows | -100 to +100 | Recover/crush dark areas |
| Whites | -100 to +100 | Adjust white point |
| Blacks | -100 to +100 | Adjust black point |
| Clarity | -100 to +100 | Local contrast (mid-tone edges) |
| Vibrance | -100 to +100 | Selective saturation (protects skin tones) |
| Sharpness | 0 to 100 | Edge enhancement |
| Noise Reduction | 0 to 100 | Blur/smooth fine detail |
| Grain | 0 to 100 | Add film grain texture |

**Adjustment Curves:**
- RGB Curves (master, red, green, blue)
- Input/output point control
- Histogram overlay

**Color Grading:**
- Split toning (shadows color, highlights color)
- Color lookup tables (LUT) import

**Geometric:**
- Rotation (-180° to +180°)
- Horizontal flip
- Vertical flip
- Crop (with aspect ratio lock options)

---

### Proposal: Edge Detection as Adjustment Layer

**Current Problem:** Edge detection replaces source image entirely

**Improvement:** Edge detection as overlay/blend mode

**Parameter:** `Edge Detection Mode`
- Type: Dropdown
- Options: `Off`, `Replace`, `Overlay (Multiply)`, `Overlay (Screen)`, `Overlay (Add)`, `Guide Only`

#### Replace (Current Behavior)
- Image becomes edge-detected version
- Tone information lost
- Pure structural conversion

---

#### Overlay (Multiply)
- Edge detection rendered as black lines on white
- Multiplied with source image
- Result: Dark edges emphasize boundaries in source
- Preserves tone + adds structure

**Use Case:** Emphasize edges while keeping photographic detail

---

#### Overlay (Screen)
- Edge detection rendered as white lines on black
- Screened with source image
- Result: Bright edges highlight boundaries

**Use Case:** Neon/glow aesthetic

---

#### Overlay (Add)
- Edge magnitude added to source luminosity
- Result: Edges brighten, structural emphasis

**Use Case:** Boost local contrast at edges

---

#### Guide Only
- Edge detection calculated but not applied to image
- Used only in character matching (increase orientation weight)
- Source image tone preserved

**Use Case:** Structural guidance without tonal change

**Additional Edge Parameters:**
- Edge strength/intensity (0–100)
- Edge thickness (1–5 pixels)
- Edge color (for overlay modes)
- Blur edges (soften sharp lines)

---

### Proposal: Adjustment Preview System

**Current Problem:** Only see final ASCII output, cannot evaluate adjustments in isolation

**Solution 1: Adjustment Stage Preview**

**UI Addition:** Toggle button `Show Adjustment Preview`
- When enabled: Canvas shows processed image (after all adjustments, before ASCII conversion)
- When disabled: Canvas shows ASCII output
- Allows evaluating image preparation quality

---

**Solution 2: Split-View Curtain**

**UI Addition:** Draggable curtain/slider on canvas

**Layout:**
```
┌─────────────────────────────────┐
│                    │            │
│   Original/Adj     │   ASCII    │
│   Image            │   Output   │
│                    │            │
│                    │            │
└─────────────────────────────────┘
                     ↕ draggable divider
```

**Functionality:**
- Drag vertical divider left/right
- Left side: Adjusted image (or original)
- Right side: ASCII output
- Synchronized zoom/pan
- Allows direct visual comparison

**Alternative:** Horizontal split (top/bottom)

---

**Solution 3: Before/After Toggle**

**UI Addition:** Hold button or checkbox toggle
- Button down: Show adjusted image
- Button up: Show ASCII output
- Quick back-and-forth comparison

---

**Solution 4: Layer Visibility Panel**

**UI Layout:** Checkboxes for each stage
```
☑ Original Image
☑ Geometric Adjustments
☑ Color Adjustments
☑ Edge Detection Overlay
☑ ASCII Conversion
```

- Toggle each layer on/off
- See cumulative effect
- Isolate specific adjustments

**Most Useful:** Split-view curtain (Solution 2) + Layer visibility (Solution 4)

---

## 5. Typography & Font Rendering — Critical Issues

### Problem: Font Settings Applied After Mapping

**Current Flow:**
1. Build character atlas at default size
2. Analyze image
3. Match characters
4. THEN render with user's font size/settings

**Why This Breaks:**

#### Size 8 vs Size 24 — Different Visual Weights

**Size 8:**
- Stroke width: 1 pixel
- Relative stroke weight: 1/8 = 12.5% of height
- Low contrast between strokes and counters
- Horizontal strokes may disappear (sub-pixel)

**Size 24:**
- Stroke width: 3 pixels
- Relative stroke weight: 3/24 = 12.5% of height (same ratio)
- BUT: Anti-aliasing, hinting, and optical adjustments change appearance
- Serifs more pronounced
- Better distinction between similar characters

**Matching Failure Example:**

If atlas built at size 12:
- Image tile has thin 1-pixel vertical line
- Matches to "1" or "l" based on size-12 appearance
- Output rendered at size 24
- "1" now has thick strokes + serifs
- Looks wrong — should have matched "." or ":" instead

---

### Problem: Missing Typographic Controls

**Current Parameters:** Font family, font size

**Missing Parameters:**

| Parameter | Range | Impact on Character Appearance |
|-----------|-------|-------------------------------|
| Font Weight | 100–900 (or keywords) | Stroke thickness: Thin vs Bold vs Black |
| Font Style | normal, italic, oblique | Slant angle changes orientation features |
| Letter Spacing | -100% to +200% | Character density per line, affects proportional fonts |
| Line Height | 0.5 to 3.0 | Vertical spacing, affects multi-line output density |
| Word Spacing | -50% to +200% | Affects proportional fonts with spaces |
| Text Transform | none, uppercase, lowercase | Completely different character shapes |
| Font Variant | normal, small-caps | Caps have different proportions than lowercase |
| Text Decoration | none, underline, overline, line-through | Adds visual elements to character |
| Text Shadow | offset, blur, color | Changes character silhouette |

**Critical for Atlas Construction:**
- Weight dramatically changes stroke thickness → different density/quadrant values
- Italic changes orientation → different gradient directions
- Letter-spacing changes character bounding box → different tile dimensions

---

### Proposal: Typography-First Workflow

**New Flow:**
1. User configures ALL typographic settings FIRST
2. Measure character metrics with final settings applied
3. Build atlas with actual render appearance
4. Analyze image based on final character dimensions
5. Match using actual visual features
6. Render output (settings already applied)

**UI Reorganization:**

**Tab: FONT** (Must be configured first)
- Block: Font Selection
  - Font family
  - Font source (System, Google, Web Font)
- Block: Typography
  - Font size
  - Font weight
  - Font style (normal/italic)
  - Letter spacing
  - Line height
- Block: Metrics (Read-only display)
  - Character width (measured)
  - Character height (measured)
  - Baseline offset
  - Is monospace (detected)

**Workflow Lock:**
- After font settings configured, button: `Build Character Atlas`
- Atlas construction time shown (may take seconds for large character sets)
- While atlas building: Disable font changes
- To change font: Must rebuild atlas (warn user)

**Performance Consideration:**
- Atlas construction: ~100ms for 70 characters
- Acceptable delay for accuracy guarantee

---

## 6. Non-Monospace Font Handling — Fundamental Architecture Issue

### Problem: Grid-Based Layout Assumption

**Current Architecture:**
```
Image divided into uniform grid:
Tile (0,0) at x=0,    y=0,    width=tw, height=th → character 'A'
Tile (1,0) at x=tw,   y=0,    width=tw, height=th → character 'B'  
Tile (2,0) at x=2*tw, y=0,    width=tw, height=th → character 'C'
...
```

**Assumption:** Every character occupies identical rectangular space (monospace)

**Breaks for Proportional Fonts:**
- 'W' width: 14 pixels
- 'l' width: 4 pixels  
- 'i' width: 3 pixels

**Consequence:**
- Cannot pre-calculate grid positions
- Tile boundaries don't align to character boundaries
- Image analysis becomes character-dependent

---

### Proposal: Sequential Character Placement (Proportional Mode)

**New Architecture:**

**Mode 1: Monospace (Current)**
- Uniform grid
- All characters same width
- Fast parallel tile analysis

**Mode 2: Proportional (New)**
- Sequential left-to-right placement
- Character width determined AFTER character selection
- Next character position = previous position + previous character advance width

**Algorithm:**

```
x = 0, y = 0
line_height = font_metrics.height
max_width = canvas.width

for each row:
    x = 0
    while x < max_width:
        // Analyze image region at current position
        // Region width = AVERAGE character width (or max width from atlas)
        tile = extract_tile(image, x, y, avg_char_width, line_height)
        
        // Find best matching character
        best_char = find_best_match(tile)
        
        // Get actual width of selected character
        char_width = atlas[best_char].advance_width
        
        // Place character
        render_character(best_char, x, y)
        
        // Advance position by actual character width
        x += char_width
    
    y += line_height
```

**Challenges:**

1. **Tile Width Uncertainty**
   - Don't know tile width until character selected
   - Solution: Use average character width for analysis, accept slight mismatch

2. **Character Selection Affects Layout**
   - Wide characters (W, M) compress more image data
   - Narrow characters (i, l) analyze smaller image regions
   - Solution: Iterative refinement — rescan with actual widths

3. **Performance Cost**
   - Cannot parallelize (each character depends on previous)
   - Sequential processing: ~10× slower
   - Solution: Monospace mode remains default, proportional opt-in

4. **Kerning**
   - Character pairs may have adjusted spacing (AV, To, etc.)
   - Solution: Apply kerning tables if available

---

### Alternative: Fixed-Width Tiles with Variable Characters

**Compromise Approach:**

- Maintain uniform tile grid (fast analysis)
- Allow proportional fonts for rendering
- Characters centered or aligned within tiles
- Accept slight visual misalignment for speed

**Trade-off:**
- Faster than full proportional mode
- Some character width mismatch acceptable
- Better than current (at least characters render proportionally)

---

## 7. Flow Direction Semantics — Character vs Image

### Current Confusion

**"Orientation" can mean two different things:**

#### Character Flow (Stroke Direction)
"Which direction does the mark move?"

Examples:
- "/" flows bottom-left to top-right (or vice versa)
- "—" flows horizontally
- "|" flows vertically
- "C" flows in arc from top to bottom

**Measured by:** Gradient direction (perpendicular to edge)

---

#### Image Flow (Gradient Direction)  
"Which direction does brightness change?"

Examples:
- Vertical gradient (dark top, light bottom): flows downward
- Horizontal gradient (dark left, light right): flows rightward
- Radial gradient: flows outward from center

**Two Interpretations:**

**A. Gradient Perpendicular to Flow**
- Dark-to-light gradient flowing downward
- Use horizontal stroke characters (—, =) perpendicular to gradient
- Creates "hatching" effect

**B. Gradient Parallel to Flow**
- Dark-to-light gradient flowing downward
- Use vertical stroke characters (|, ¦) parallel to gradient
- Creates "extrusion" effect

---

### Proposal: Explicit Flow Matching Mode

**Parameter:** `Orientation Matching`
- Type: Dropdown
- Options: `Character Stroke`, `Gradient Parallel`, `Gradient Perpendicular`, `Ignore`

#### Character Stroke (Current)
- Match character stroke direction to image edge direction
- Edge at 45° → prefer "/" or "\"
- Edge at 90° → prefer "|" or "!"

**Use Case:** Line art, structural matching

---

#### Gradient Parallel
- Match character stroke direction to gradient direction
- Downward gradient → prefer "|" (flows with gradient)
- Rightward gradient → prefer "—" (flows with gradient)

**Use Case:** Extrusion effects, directional shading

---

#### Gradient Perpendicular
- Match character stroke perpendicular to gradient direction  
- Downward gradient → prefer "—" (perpendicular to gradient)
- Rightward gradient → prefer "|" (perpendicular to gradient)

**Use Case:** Hatching, contour lines, cross-hatching

---

#### Ignore
- Disable orientation matching
- Rely only on tone, quadrants, signature

**Use Case:** When orientation creates visual artifacts

---

## 8. Coherence Smoothing — Validity Concerns

### Current Implementation

**Process:**
1. For each character position
2. Count character frequencies in 8 neighbors
3. If neighbors strongly prefer different character, consider replacing
4. Weighted by coherence strength
5. Repeat for multiple passes

**Stated Goal:** Reduce visual "noise" by encouraging spatial consistency

---

### Problems

#### 1. Destroys Local Accuracy
- Image has fine detail (texture, noise, dither)
- Coherence smooths it away
- Result: Blurry ASCII representation

**Example:** Portrait with skin texture
- Accurate conversion: Mix of . , ' - characters creating texture
- After coherence: Mostly single character, flat appearance

---

#### 2. Arbitrary Neighborhood Definition
- Why 8 neighbors (3×3)?
- Why not 4 neighbors (cardinal only)?
- Why not 24 neighbors (5×5)?
- No theoretical justification

---

#### 3. Strength Parameter Lacks Meaning
- What does "0.5 strength" mean physically?
- How much accuracy loss per pass?
- No objective way to tune

---

#### 4. Contradicts Cost Function
- Cost function optimized per tile independently
- Coherence overrides optimization
- Why optimize if you're going to override?

---

### When Coherence Might Help

**Valid Use Case:** Noisy/degraded source images
- Heavy compression artifacts
- Sensor noise in photos
- Dithered/posterized images

**Why:** Reduces spurious character changes from noise rather than signal

---

### Alternative Approaches

#### A. Pre-filter Source Image
- Apply bilateral filter (edge-preserving blur)
- Reduce noise before character matching
- Preserves edges while smoothing noise
- More control than post-process coherence

---

#### B. Cost Function Regularization
- Add neighbor similarity term to cost function during matching
- Character cost = feature_cost + λ × neighbor_difference
- Single-pass, globally consistent
- Theoretically grounded

---

#### C. Perceptual Grouping
- Detect regions of similar content
- Apply consistent character choices within regions
- Preserve region boundaries
- Respects image structure

---

#### D. User-Guided Coherence
- Allow user to mark regions for smoothing
- Leave detailed areas alone
- Selective coherence where wanted

---

### Recommendation

**Action:** Disable coherence by default

**Research Needed:**
1. Compare coherence vs pre-filtering (A/B test with sample images)
2. Measure accuracy loss (SSIM or perceptual metric)
3. Determine if any parameters make coherence beneficial
4. Consider replacement with method B (cost regularization)

**Timeline:** Revisit after core improvements implemented

---

## Priority Implementation Order

### Phase 1: Foundation (Critical for Everything Else)
1. **Typography-first workflow** — lock ALL font settings before atlas construction
   - Font family, size, weight, style, letter-spacing, line-height
   - Measure metrics with final settings applied
   - Explicit "Build Atlas" action required
2. **Configurable spatial resolution** — expose 2×2, 3×3, 4×4, 5×5 options (no simplification)
3. **Use-case driven workflows** — Terminal, Web, Print, Document modes with appropriate constraints
4. **Disable coherence** — remove from UI entirely, mark code as deprecated

### Phase 2: Image Preparation (High Value, Moderate Effort)
5. **Canvas/image relationship modes** — Fit, Fill, Stretch, Canvas-to-Image, Image-to-Canvas
6. **Expanded adjustment suite** — Highlights, Shadows, Clarity, Vibrance, Sharpness, Curves
7. **Edge detection overlay modes** — Multiply, Screen, Add, Guide-only (not replacement)
8. **Adjustment preview system** — draggable split-view curtain (adjusted image | ASCII output)

### Phase 3: Advanced Features (High Effort, High Value)
9. **Proportional font support** — sequential placement algorithm (accept 10× performance cost)
   - Analyze average-width tiles
   - Place characters sequentially with actual advance widths
   - Handle kerning if available
10. **Flow matching modes** — Character Stroke, Gradient Parallel, **Gradient Perpendicular (default)**, Ignore
    - Perpendicular creates topographic/contour line aesthetic
11. **Adjustment curves** — RGB curves with input/output control, histogram overlay

### Phase 4: Polish & Expansion
12. **Performance optimization** — web workers for parallel tile analysis (where possible)
13. **Export format expansion** — SVG (vector text), LaTeX, ANSI with truecolor
14. **LUT support** — color grading via lookup table import

---

## Design Decisions

1. **Spatial Resolution:** Expose full options (2×2, 3×3, 4×4, 5×5) — no simplification. Users need granular control.

2. **Output Modes:** Print/Terminal/Web/Document targets sufficient for initial implementation.

3. **Proportional Fonts:** Implement sequential placement algorithm. Performance cost acceptable for accuracy.

4. **Flow Matching:** Default to **Gradient Perpendicular** — creates topographic/contour line aesthetic.

5. **Coherence:** **Disabled entirely** — remove from UI, keep code dormant for potential research.

6. **Split-View:** Implementation detail — both vertical and horizontal valid, choose based on canvas aspect ratio.

