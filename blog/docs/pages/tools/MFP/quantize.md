# Multifilament Print Tool - QUANTIZE Tab

## Purpose

Convert arbitrary source images to printable multi-color format using calibrated or theoretical palette. Reduces continuous-tone images to discrete filament combinations that can be physically printed.

## Color Quantization Algorithm

### K-Means Clustering (with calibrated palette)

When calibrated palette available from SCAN tab:

```
1. Extract unique colors from calibrated palette
2. Initialize k centroids = palette colors
3. For each pixel in source image:
     Find nearest centroid (Euclidean distance)
     Assign pixel to that cluster
4. No iteration needed (palette is fixed)
```

**Why no iteration:** Palette is predetermined from scan analysis. We're mapping to known colors, not finding optimal clusters.

### Nearest Color Mapping (fallback)

When no calibrated palette (uses theoretical colors):

```
For each pixel (r, g, b):
  minDist = ∞
  bestColor = null
  
  For each paletteColor:
    dist = √[(r - pr)² + (g - pg)² + (b - pb)²]
    if dist < minDist:
      minDist = dist
      bestColor = paletteColor
  
  outputPixel = bestColor
```

**Distance metric:** Euclidean in RGB space. Future: perceptual color space (LAB, LUV) for better human-perceived matches.

### Dithering

Optional Floyd-Steinberg error diffusion:

```
For each pixel at (x, y):
  oldPixel = image[y][x]
  newPixel = findClosestPaletteColor(oldPixel)
  image[y][x] = newPixel
  
  error = oldPixel - newPixel
  
  // Distribute error to neighbors
  image[y][x+1]   += error × 7/16  (right)
  image[y+1][x-1] += error × 3/16  (bottom-left)
  image[y+1][x]   += error × 5/16  (bottom)
  image[y+1][x+1] += error × 1/16  (bottom-right)
```

**Purpose:** 
- Reduces color banding
- Creates apparent gradients through spatial mixing
- Human eye averages dithered pixels to perceive intermediate colors

**When to use:**
- Images with gradients/smooth transitions
- Photographic content
- When palette has few colors (< 10)

**When to avoid:**
- Pixel art (wants hard edges)
- Text/line art (causes fuzziness)
- Already posterized images

### Print Width Scaling

Calculates output resolution based on physical print size:

```
printWidthMM = userInput  // e.g., 100mm
tileSize = gridData.tileSize  // e.g., 10mm
tilesPerWidth = printWidthMM / tileSize  // 10 tiles

outputWidth = tilesPerWidth  // pixels
outputHeight = (inputHeight / inputWidth) × outputWidth
```

**Important:** Each output pixel = one printed tile.

**Example:**
- Input: 1000×500px image
- Print width: 100mm
- Tile size: 10mm
- Output: 10×5px image (10 tiles wide × 5 tiles high)
- Physical: 100×50mm print

### Min Detail Filter

Removes isolated single-pixel noise:

```
For each pixel at (x, y):
  if pixel differs from all 8 neighbors:
    replace with most common neighbor color
```

**Purpose:** 
- Prevents accidental single-tile accents
- Reduces print errors from noise
- Smooths edge transitions

**Threshold control:** How many matching neighbors required to keep pixel.

## UI Controls

### Source Image

**Upload:** Select image to quantize (PNG, JPG, any format)

**Requirements:**
- Any size (will be scaled)
- RGB color space
- Higher resolution = better quality

### Print Parameters

**Print Width (mm):** Physical width of final print.

**Example calculation:**
- Print width: 80mm
- Tile size: 8mm (from grid)
- Output width: 80/8 = 10 pixels
- Each pixel becomes one 8mm tile

**Dither Strength:** 0-100% error diffusion strength
- 0%: No dithering (posterized)
- 50%: Subtle dithering (recommended)
- 100%: Full dithering (can be noisy)

**Min Detail:** Noise removal threshold
- 0: Keep all pixels (maximum detail, includes noise)
- 1-2: Remove single-pixel specks (recommended)
- 3-5: Aggressive smoothing (loses fine detail)

### Palette Status

Shows current palette source:
- **No palette:** Using theoretical colors from SOURCE
- **Calibrated palette:** Using scanned colors from SCAN tab
- **GPL imported:** Using external palette file

### Canvas View

Displays:
- **Before:** Original source image (scaled)
- **After:** Quantized result with palette colors

## Workflow

1. **Complete SOURCE tab** (generate grid with desired filaments)
2. **Optional: Complete SCAN tab** (for calibrated palette)
3. **Load Source Image** (artwork to print)
4. **Set Print Width** (physical size in mm)
5. **Enable Dithering** (if gradients present)
6. **Adjust Min Detail** (remove noise)
7. **Preview Result** (compare before/after)
8. **Export to EXPORT tab** (or download quantized image)

## Output Interpretation

### Quantized Image

Each pixel represents:
- **Color:** One filament sequence from grid
- **Position:** One tile in final print
- **Physical size:** tileSize × tileSize mm

**Example:**
- 10×10px quantized image
- 10mm tile size
- Result: 100×100mm print with 100 tiles

### Layer Separation

Quantized image can be separated into layers:
- Layer 0: All tiles using filament 1 in position 0
- Layer 1: All tiles using filament 2 in position 1
- Etc.

Used for generating per-layer STLs in EXPORT tab.

## Color Accuracy

### Using Theoretical Palette (no SCAN)

**Pros:**
- No calibration needed
- Faster workflow
- Good for testing

**Cons:**
- Colors may not match actual print
- No compensation for filament variations
- No printer-specific adjustments

**Accuracy:** ±20-30% color deviation typical

### Using Calibrated Palette (with SCAN)

**Pros:**
- Colors match actual prints
- Accounts for filament batch variation
- Printer-specific calibration
- Predictable results

**Cons:**
- Requires printing/scanning calibration grid
- One-time setup per filament set

**Accuracy:** ±5-10% color deviation typical

## Advanced Techniques

### Multi-Stage Quantization

For very limited palettes (2-3 colors):

1. First pass: Quantize to double the palette size
2. Apply dithering heavily
3. Second pass: Reduce to actual palette
4. Dithering creates color mixing illusion

### Selective Quantization

Mask regions for different treatments:
- High-detail areas: No dithering, full detail
- Gradient areas: Heavy dithering
- Background: Aggressive simplification

### Pre-Processing

Before quantization:
- **Increase contrast:** Makes colors more distinct
- **Sharpen edges:** Preserves detail in reduction
- **Adjust saturation:** Compensate for pastel appearance
- **Gamma correction:** Match visual brightness

## Troubleshooting

### Colors Look Wrong

**Cause:** Using theoretical palette without calibration.

**Solution:** 
1. Complete SCAN tab to create calibrated palette
2. OR: Accept theoretical colors as approximation
3. OR: Manually adjust image saturation/contrast to compensate

### Too Much Banding

**Cause:** No dithering on gradient images.

**Solution:**
1. Enable dithering (start at 50%)
2. Increase dither strength gradually
3. Consider adding more colors to palette (SOURCE tab)

### Image Too Noisy

**Causes:**
- Too much dithering
- Source image has noise
- Min detail threshold too low

**Solutions:**
1. Reduce dither strength (100% → 50%)
2. Increase min detail filter (0 → 2)
3. Pre-process source: blur slightly before upload

### Lost Fine Details

**Causes:**
- Print width too small (not enough tiles)
- Min detail filter too aggressive
- Palette too limited

**Solutions:**
1. Increase print width (more tiles = more detail)
2. Reduce min detail threshold
3. Add more filament colors in SOURCE tab
4. Disable dithering for crisp edges

### Output Resolution Unexpected

**Cause:** Confusion between pixels and physical size.

**Understanding:**
```
Print width: 100mm
Tile size: 10mm
Output: 10 pixels wide (NOT 100 pixels)

Each pixel = one tile = 10mm
```

**If you want more tiles:**
- Decrease tile size in SOURCE (10mm → 5mm = 2× resolution)
- Increase print width (100mm → 200mm = 2× resolution)

### Palette Not Loading

**Cause:** SCAN analysis not completed.

**Solution:**
1. Return to SCAN tab
2. Load grid and scan image
3. Click "Analyze Scan"
4. Wait for analysis completion
5. Return to QUANTIZE tab (palette auto-loaded)

---

**Next Step:** Export quantized artwork as STL files in EXPORT tab.

