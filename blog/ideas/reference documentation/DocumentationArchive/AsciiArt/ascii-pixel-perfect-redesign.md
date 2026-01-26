# ASCII Art Generator — Pixel-Perfect Redesign

## Problem Statement

Current implementation treats ASCII as approximation. Need pixel-accurate text rendering where:
1. Output pixel dimensions = Input pixel dimensions
2. Each character maps to exact pixel area
3. Character color + shape combine to represent image
4. Density controls (line-height, kerning) adjust coverage
5. Only monospace fonts (consistent character grid)

## Core Principles

### 1. Character as Pixel Grid
```
Character 'A' at 8×16px:
[0 0 0 1 1 0 0 0]   ← Each char is a grid
[0 0 1 0 0 1 0 0]   ← of varying densities
[0 1 0 0 0 0 1 0]   ← not uniform shade
[1 1 1 1 1 1 1 1]
...
```

### 2. Pixel Conservation
```
Input:  640×480 = 307,200 pixels
Output: 80 chars × 30 lines × (8px × 16px) = 307,200 pixels
```

### 3. Color + Shape Matching
```
Match = shape_similarity(char, tile) + color_distance(charColor, tileColor)
```

## Required Changes

### Phase 1: Font System Overhaul

**1.1 Restrict to Monospace**
```javascript
const MONOSPACE_FONTS = {
    'Courier New': { charWidth: 8, charHeight: 16, lineHeight: 1.0 },
    'Consolas': { charWidth: 8, charHeight: 16, lineHeight: 1.0 },
    'Monaco': { charWidth: 8, charHeight: 16, lineHeight: 1.0 },
    'Atkinson Hyperlegible Mono': { charWidth: 8, charHeight: 16, lineHeight: 1.0 }
};
```

**1.2 Measure Exact Character Dimensions**
```javascript
function measureCharacterBox(font, fontSize) {
    // Render character, measure actual pixel bounds
    // Return { width, height, baseline }
}
```

**1.3 Density Controls**
- Line-height slider: 0.8 → 1.2 (CSS line-height)
- Letter-spacing slider: -2px → +2px (CSS letter-spacing)
- Controls text density = controls pixel coverage

### Phase 2: Canvas Architecture

**2.1 Two-Canvas System**

```javascript
// Canvas 1: Image Processing (hidden)
processCanvas = {
    width: sourceImage.width,
    height: sourceImage.height,
    purpose: 'Extract tile data at native resolution'
};

// Canvas 2: Text Rendering (visible)
outputCanvas = {
    width: cols × charWidth,
    height: rows × charHeight,
    purpose: 'Render colored ASCII'
};
```

**2.2 Exact Tile Mapping**
```javascript
// Calculate grid from character dimensions
const charMetrics = measureCharacterBox(font, fontSize);
const cols = Math.floor(imageWidth / charMetrics.width);
const rows = Math.floor(imageHeight / charMetrics.height);

// Each tile maps to exactly one character's pixel area
const tileWidth = charMetrics.width;
const tileHeight = charMetrics.height;
```

### Phase 3: Color Integration

**3.1 Extend Glyph Atlas**
```javascript
glyphAtlas.push({
    char: char,
    density: density,
    quadrants: quadrants,
    orientation: orientation,
    signature: signature,
    pixelData: data  // NEW: Store actual pixel array
});
```

**3.2 Color Matching Function**
```javascript
function findBestMatchWithColor(tile, weights) {
    for (glyph of glyphAtlas) {
        // Shape matching (existing)
        shapeCost = calculateShapeCost(glyph, tile);
        
        // NEW: Find best color for this glyph
        bestColor = findOptimalColor(glyph.pixelData, tile.pixelData);
        colorError = calculateColorError(glyph, tile, bestColor);
        
        totalCost = weights.shape * shapeCost + weights.color * colorError;
    }
}
```

**3.3 Color Calculation**
```javascript
function findOptimalColor(glyphPixels, tilePixels) {
    // For each RGB channel, find color that minimizes error
    // Given: glyph has density map [0-1] per pixel
    //        tile has RGB values per pixel
    // Find: RGB color such that (color × glyphDensity) ≈ tileRGB
    
    let sumR = 0, sumG = 0, sumB = 0, sumDensity = 0;
    
    for (i = 0; i < pixels; i++) {
        sumR += tilePixels[i].r * glyphPixels[i].density;
        sumG += tilePixels[i].g * glyphPixels[i].density;
        sumB += tilePixels[i].b * glyphPixels[i].density;
        sumDensity += glyphPixels[i].density * glyphPixels[i].density;
    }
    
    return {
        r: sumR / sumDensity,
        g: sumG / sumDensity,
        b: sumB / sumDensity
    };
}
```

### Phase 4: Rendering System

**4.1 Colored Text Rendering**
```javascript
function drawColoredAscii(ctx, asciiGrid) {
    for (row = 0; row < rows; row++) {
        for (col = 0; col < cols; col++) {
            const cell = asciiGrid[row][col];
            
            // Set color per character
            ctx.fillStyle = `rgb(${cell.color.r}, ${cell.color.g}, ${cell.color.b})`;
            
            // Position exactly
            const x = col * charWidth;
            const y = row * charHeight + baseline;
            
            ctx.fillText(cell.char, x, y);
        }
    }
}
```

**4.2 ASCII Data Structure**
```javascript
// OLD: string
asciiResult = "ABC\nDEF\nGHI"

// NEW: structured grid
asciiGrid = [
    [
        { char: 'A', color: {r:120, g:130, b:140}, cost: 0.23 },
        { char: 'B', color: {r:100, g:110, b:120}, cost: 0.18 },
        { char: 'C', color: {r:90, g:95, b:100}, cost: 0.31 }
    ],
    // ... more rows
];
```

### Phase 5: UI Updates

**5.1 New Controls**
```javascript
['Font Metrics', [
    ['dropdown', 'Font', Object.keys(MONOSPACE_FONTS), { key: 'font' }],
    ['slider', 'Font Size', 8, 24, 1, { key: 'fontSize', value: 12 }],
    ['slider', 'Line Height', 0.8, 1.2, 0.01, { key: 'lineHeight', value: 1.0 }],
    ['slider', 'Letter Spacing', -2, 2, 0.1, { key: 'letterSpacing', value: 0 }]
]],

['Matching Weights', [
    ['slider', 'Shape Weight', 0, 1, 0.01, { key: 'shapeWeight', value: 0.6 }],
    ['slider', 'Color Weight', 0, 1, 0.01, { key: 'colorWeight', value: 0.4 }]
]],

['Display', [
    ['toggle', 'Show Grid', { key: 'showGrid' }],
    ['toggle', 'Show Colors', { key: 'showColors' }],
    ['dropdown', 'Export Format', ['Plain Text', 'HTML Colored', 'ANSI', 'Image'], { key: 'exportFormat' }]
]]
```

**5.2 Remove Obsolete Controls**
- ~~Tile Width/Height~~ (calculated from font metrics)
- ~~Text Color/Background~~ (per-character colors now)
- ~~Density Threshold~~ (replaced by density controls)

### Phase 6: Export Formats

**6.1 HTML Colored Export**
```html
<pre style="line-height: 1.0; letter-spacing: 0;">
<span style="color: rgb(120,130,140);">A</span><span style="color: rgb(100,110,120);">B</span>
</pre>
```

**6.2 ANSI Export**
```
\033[38;2;120;130;140mA\033[38;2;100;110;120mB
```

**6.3 Image Export**
```javascript
// Render canvas to image
canvas.toBlob(blob => {
    // Download as PNG
});
```

## Implementation Checklist

### Week 1: Font System
- [ ] Remove non-monospace fonts
- [ ] Implement character measurement system
- [ ] Add line-height/letter-spacing controls
- [ ] Verify exact pixel dimensions

### Week 2: Canvas Architecture
- [ ] Implement two-canvas system
- [ ] Calculate tiles from character metrics
- [ ] Ensure 1:1 pixel mapping
- [ ] Test with various image sizes

### Week 3: Color Integration
- [ ] Extend glyph atlas with pixel data
- [ ] Implement optimal color calculation
- [ ] Add color cost to matching function
- [ ] Test color accuracy

### Week 4: Rendering & Export
- [ ] Implement colored text rendering
- [ ] Convert ASCII string to grid structure
- [ ] Add HTML colored export
- [ ] Add ANSI export
- [ ] Add image export

### Week 5: Polish
- [ ] Update UI controls
- [ ] Remove obsolete features
- [ ] Add grid overlay option
- [ ] Performance optimization
- [ ] Debug logging

## Mathematical Formulas

### Optimal Color Calculation
Given glyph density map **g** and tile RGB values **t**, find color **c** that minimizes:

```
E = Σ((c · g[i]) - t[i])²
```

Solution (least squares):
```
c = (Σ g[i]² · t[i]) / (Σ g[i]²)
```

Per channel:
```
c.r = (Σ g[i] · t[i].r) / (Σ g[i]²)
c.g = (Σ g[i] · t[i].g) / (Σ g[i]²)
c.b = (Σ g[i] · t[i].b) / (Σ g[i]²)
```

### Cost Function Update
```
Cost = α×shapeCost + β×colorCost

shapeCost = toneCost + quadrantCost + orientCost + sigCost
colorCost = √((cr-tr)² + (cg-tg)² + (cb-tb)²) / √(255²×3)
```

## Performance Considerations

### Current (Monochrome)
- Glyph atlas: ~10 chars × 128 pixels = 1,280 ops
- Matching: 50×30 tiles × 10 glyphs = 15,000 comparisons

### Proposed (Colored)
- Glyph atlas: ~70 chars × 128 pixels = 8,960 ops (once)
- Matching: 50×30 tiles × 70 glyphs × (shape + color) = ~100,000 comparisons
- Color calculation: 1,500 tiles × 128 pixels = 192,000 ops

**Optimization:**
- Pre-compute glyph atlas (done once)
- Cache color calculations
- Use WebWorkers for processing
- Progressive rendering (show results as computed)

## Architecture Compliance

### Using Proper System
- ✅ Still extends ToolBase
- ✅ No new DOM manipulation patterns
- ✅ Canvas is controlled via ToolBase
- ✅ No manual RAF (static processing)

### Color Handling
- ⚠️ Using computed RGB values (not VGA palette)
- This is acceptable because:
  - Tool processes images (arbitrary input colors)
  - Output is colored text representation
  - Not site UI (different constraint domain)

## Open Questions

1. **Character set size vs performance** — More chars = better matching but slower?
2. **WebWorker integration** — Worth complexity for large images?
3. **Progressive rendering** — Show partial results during processing?
4. **Grid alignment** — Sub-pixel rendering or snap to pixels?
5. **Font fallbacks** — What if requested font unavailable?

## Success Criteria

- [ ] Output dimensions = Input dimensions (pixel count preserved)
- [ ] Each character maps to exact pixel area
- [ ] Color + shape matching produces high-quality output
- [ ] Density controls allow fine-tuning
- [ ] Only monospace fonts selectable
- [ ] Export maintains color information
- [ ] Performance acceptable for 640×480 images

