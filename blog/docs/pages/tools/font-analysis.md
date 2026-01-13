# Font Analysis Tool

Multi-font comparison with detailed metrics visualization.

## Overview

Compare up to 3 fonts simultaneously with:
- Sample text rendering
- Letter metrics analysis
- Character set display
- Comparative ratios

## Features

### 3-Column Comparison
Each column displays:
1. **Font selector** - Choose from Google Fonts library
2. **Individual size** - Per-font size adjustment
3. **Sample text** - Rendered with current settings
4. **Letter analysis** - Canvas-rendered metrics
5. **Character set** - All glyphs in the font

### Metrics Visualization

For a selected letter, displays:
- **Baseline** (green) - Text alignment reference
- **Ascent** (red) - Maximum upward extent
- **Descent** (blue) - Maximum downward extent
- **Cap Height** (magenta) - Height of capital letters
- **x-Height** (yellow) - Height of lowercase x
- **Advance width** - Total character width including spacing
- **Bounding box** - Actual glyph boundaries

### Comparison Ratios

Calculates relative metrics between fonts:
```
Cap Height: 42.3px (103.2%)
x-Height: 28.1px (98.5%)
Advance: 25.6px (105.1%)
Character Ratio: 1 Font1 = 0.952 Font2
```

## Global Controls

| Control | Description |
|---------|-------------|
| Sample Text | Text displayed in all columns |
| Letter | Single character for metrics analysis |

## Font Measurement

### Canvas TextMetrics API
```javascript
const ctx = canvas.getContext('2d');
ctx.font = `${fontSize}px "${fontFamily}"`;

const metrics = ctx.measureText(letter);

return {
    ascent: metrics.fontBoundingBoxAscent,
    descent: metrics.fontBoundingBoxDescent,
    xHeight: ctx.measureText('x').actualBoundingBoxAscent,
    capitalHeight: ctx.measureText('H').actualBoundingBoxAscent,
    advance: metrics.width,
    width: metrics.actualBoundingBoxRight - metrics.actualBoundingBoxLeft
};
```

### Metric Lines Drawing
```javascript
function drawMetricLine(ctx, y, label, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
    
    ctx.fillStyle = color;
    ctx.fillText(label, canvasWidth - 5, y - 5);
}
```

## Character Categories

| Category | Characters | Color |
|----------|------------|-------|
| Uppercase | A-Z | Yellow |
| Lowercase | a-z | Cyan |
| Numbers | 0-9 | Green |
| Symbols | !@#$... | Magenta |

## Google Fonts Integration

### Popular Fonts
- Space Mono
- Roboto Mono
- JetBrains Mono
- Fira Code
- Source Code Pro
- IBM Plex Mono
- Roboto
- Open Sans
- Lato
- Montserrat

### Dynamic Loading
```javascript
await fontLoader.loadFont(fontFamily);
```

## Use Cases

1. **Typography Selection** - Compare fonts for readability
2. **Cross-Platform Consistency** - Check metrics across fonts
3. **Accessibility** - Verify x-height ratios
4. **Design Systems** - Establish font scales
5. **Web Performance** - Choose similar fallback fonts

## Source Reference

Combined from:
- `reference/QuickToolRebuildReference/Tools/Font/font-dimension-finder/`
- `reference/QuickToolRebuildReference/Tools/Font/font-size-comparison-tool/`
- `reference/QuickToolRebuildReference/Tools/Font/font-comparison-tool/`

