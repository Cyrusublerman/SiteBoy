# Multifilament Print Tool - SCAN Tab

## Purpose

Align scanned calibration grid image with reference grid data to extract actual printed colors from each tile. Creates calibrated color palettes mapping filament combinations to real-world output.

## Grid Alignment

### Auto-Calculation

On scan image upload, automatically calculates grid overlay position:

```javascript
// Physical grid dimensions (mm)
physicalWidth = gridData.width
physicalHeight = gridData.height

// Assume scan DPI or calculate from known size
assumedDPI = 150  // typical flatbed scanner

// Calculate expected pixel dimensions
expectedPixelWidth = (physicalWidth / 25.4) × assumedDPI
expectedPixelHeight = (physicalHeight / 25.4) × assumedDPI

// Scale to actual scan image size
scaleX = scanImage.width / expectedPixelWidth
scaleY = scanImage.height / expectedPixelHeight
scale = (scaleX + scaleY) / 2

// Center grid on image
offsetX = (scanImage.width - expectedPixelWidth × scale) / 2
offsetY = (scanImage.height - expectedPixelHeight × scale) / 2
```

### Manual Fine-Tuning

- **Offset X/Y:** Pixel-level position adjustment (-50 to +50px)
- **Rotation:** Angular correction (-5° to +5°)
- **Corner Dragging:** Skew/perspective correction (planned)

### Display Modes

- **Fit:** Scale to container (maintain aspect)
- **Fill:** Cover container (may crop)
- **Actual Size:** 1:1 pixel mapping

## Color Extraction

### Sampling Strategy

For each tile in grid:

```javascript
// Calculate tile boundaries in scan coordinates
tileX = col × (tileSize + gap) × scale + offsetX + marginOffset
tileY = row × (tileSize + gap) × scale + offsetY + marginOffset
tilePixelWidth = tileSize × scale
tilePixelHeight = tileSize × scale

// Apply deadzone (avoid edges where ink bleeds)
deadzone = deadzonePercent / 100
margin = tilePixelWidth × deadzone / 2

sampleX = tileX + margin
sampleY = tileY + margin
sampleWidth = tilePixelWidth × (1 - deadzone)
sampleHeight = tilePixelHeight × (1 - deadzone)

// Sample all pixels in safe zone
colors = []
for y in [sampleY, sampleY + sampleHeight):
  for x in [sampleX, sampleX + sampleWidth):
    pixel = scanImage.getPixel(x, y)
    colors.push(pixel.rgb)
```

**Deadzone purpose:** Avoids tile edges where:
- Colors bleed between tiles
- Lighting creates highlights/shadows
- Print imperfections occur

**Default 10%:** Samples center 80% of tile area.

### Statistical Analysis

Per tile:
- **Average RGB:** Mean color across all sampled pixels
- **Standard Deviation:** Color consistency (σ_r, σ_g, σ_b)
- **Variance:** Spread of values
- **Min/Max RGB:** Range of observed colors

**Interpretation:**
- Low variance: Uniform tile, reliable sample
- High variance: Print defect, edge bleed, or lighting issue

### Analysis Outputs

#### Calibrated Palette (GPL)

GIMP Palette format with extracted colors:

```
GIMP Palette
Name: Calibrated Palette
Columns: 4
#
255 200 180  Seq_0
220 180 160  Seq_1
```

**Purpose:** Import to GIMP/Krita to quantize artwork with actual printed colors.

#### Quantization Config (JSON)

Maps filament combinations to measured RGB:

```json
{
  "colorMap": [
    {
      "sequence": [1,2,1,1],
      "expected": {"r": 200, "g": 150, "b": 100},
      "actual": {"r": 195, "g": 148, "b": 98},
      "deviation": 4.36
    }
  ]
}
```

**Deviation calculation:**
```
δ = √[(r_actual - r_expected)² + (g_actual - g_expected)² + (b_actual - b_expected)²]
```

Low deviation (< 10): Good match  
Medium (10-20): Acceptable  
High (> 20): Investigate print quality

#### Comparison CSV

Side-by-side expected vs actual:

```csv
Sequence,Expected_R,Expected_G,Expected_B,Actual_R,Actual_G,Actual_B,Deviation
0,200,150,100,195,148,98,4.36
```

**Use case:** Import to spreadsheet for:
- Quality analysis
- Deviation plotting
- Statistical validation

## Interactive Analysis Viewer

Opens popup window showing extracted colors in grid layout with sorting:

**Sort Options:**
- **Grid Order:** Position in scan (as printed)
- **Sequence Order:** Generation order (SOURCE tab)
- **Brightness:** Luminance (darkest to lightest)
- **Hue:** Color wheel position (rainbow order)
- **Color Deviation:** Error magnitude (best to worst match)
- **RGB Channels:** Individual R, G, or B values

**Purpose:** Visual inspection of color distribution, identify outliers, verify scan quality.

## UI Controls

### Grid Reference

**Import Options:**
1. **Import Project ZIP:** Load previously exported project
2. **Import Grid CSV:** Load sequence definitions only
3. **Use Last Generated Grid:** Auto-load from SOURCE tab

**Re-sort Grid:** Apply different sort method to loaded grid.

**View Reference Grid:** Open grid visualization in new window.

### Scan Image

**Upload:** Select scanned image (PNG, JPG, etc.)

**Display Mode:**
- Fit: Scale to fit container
- Fill: Cover container (crop edges)
- Actual Size: 1:1 pixels

**Requirements:**
- Flatbed scan preferred (camera acceptable)
- 150+ DPI recommended
- Even lighting (no window light)
- Neutral background

### Grid Overlay

**Auto-calculated on upload** based on:
- Physical grid dimensions (from grid-layout.json)
- Assumed scan DPI (150)
- Image dimensions

**Manual Adjustments:**
- Offset X/Y: Fine positioning
- Rotation: Correct scan angle
- Deadzone: Sample area percentage

**Options:**
- Flip/Mirror: Correct scan orientation
- Show Sample Zones: Visualize sampled regions
- Show Expected Colors: Overlay theoretical colors

**Reset Alignment:** Return to auto-calculated position.

### Deadzone Percentage

Controls sample area within each tile:

```
0%: Sample entire tile (risky - includes edges)
10%: Sample center 80% (default - safe)
20%: Sample center 60% (very conservative)
50%: Sample center dot only (extreme - may miss variation)
```

**Recommendation:** Start at 10%, increase if edge bleed visible.

## Scan Quality Assessment

### Good Scan Indicators
- Low average deviation (< 10 RGB)
- Consistent variance across tiles
- Clear tile boundaries in overlay
- No visible lighting gradients

### Poor Scan Indicators
- High deviation (> 20 RGB)
- Inconsistent variance (some tiles clean, others noisy)
- Misaligned overlay despite adjustment
- Visible shadows or highlights

### Improving Scan Quality

**Lighting:**
- Use scanner (not camera)
- If camera: overcast daylight or studio lights
- Avoid direct sunlight, window light
- No shadows across grid

**Alignment:**
- Place grid parallel to scanner edges
- Center on scan bed
- Use marks/guides for repeatability

**Settings:**
- 150+ DPI minimum
- 300 DPI preferred for large grids
- sRGB color space
- No automatic color correction
- No sharpening/enhancement filters

## Workflow

1. **Load Grid Reference** (from SOURCE tab or import)
2. **Upload Scan Image** (flatbed scan, 150+ DPI)
3. **Verify Auto-Alignment** (grid overlay matches tiles)
4. **Fine-Tune if Needed** (offset X/Y, rotation)
5. **Analyze Scan** (extract colors from all tiles)
6. **View Analysis** (visual grid, check quality)
7. **Export Palette** (GPL for image editor)
8. **Export Quant Config** (JSON for QUANTIZE tab)

## Troubleshooting

### Grid Overlay Doesn't Match

**Causes:**
- Incorrect physical dimensions in grid-layout.json
- Non-standard scan DPI
- Grid not centered in scan
- Rotation/skew from scan process

**Solutions:**
1. Click "Reset Alignment" to recalculate
2. Adjust offset X/Y in small increments (±5px)
3. Use rotation control for slight angles
4. Verify grid-layout.json matches printed grid
5. Check scan DPI (300 DPI needs different calculation)

### High Color Deviation

**Causes:**
- Wrong filaments loaded during print
- Temperature variations
- Lighting during scan
- Color space mismatch

**Solutions:**
1. Re-print with verified filaments
2. Calibrate printer temperature
3. Re-scan in consistent lighting
4. Use scanner instead of camera
5. Check color space (sRGB)

### Sample Zones Miss Tile Centers

**Causes:**
- Large deadzone percentage
- Misaligned grid overlay
- Very small tile size

**Solutions:**
1. Reduce deadzone (20% → 10%)
2. Fine-tune grid alignment
3. Check tile size in grid-layout.json
4. Enable "Show Sample Zones" to visualize

### Analysis Shows "No Grid Data"

**Cause:** Grid reference not loaded.

**Solutions:**
1. Click "Use Last Generated Grid" (if just generated in SOURCE)
2. Import project ZIP
3. Import grid CSV
4. Return to SOURCE tab and generate grid first

---

**Next Step:** Use calibrated palette in QUANTIZE tab to process artwork.

