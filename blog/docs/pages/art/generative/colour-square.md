# Colour Square

Interactive color grid exploration with animated composition.

## Overview

Creates a responsive grid of colored squares with mathematical composition rules that shift over time.

## Variants

### 1. Colour Square (Main)
Simple responsive color grid that fills the viewport with colored cells.

### 2. Colour Array
Animated composition with randomized color patterns.

## Features

### Grid Generation
- Calculates optimal grid size based on viewport
- Responsive to window resize
- Uses 24-color palette with class-based coloring

### Color Palette
```css
.b0  { background: #color0; }
.b1  { background: #color1; }
...
.b23 { background: #color23; }
```

### Composition Algorithm
```javascript
// Randomization factors
var r = Math.asin(Math.random() * 2 - 1);  // Wave pattern
var r3 = Math.round((Math.random() + Math.random()) / 2);  // Composition mode

// Per-cell calculation
var r2 = 2 * Math.random() * Math.round(0.55 * Math.random());
var c3 = r3 * coli;
var colorIndex = Math.floor(Math.abs(r2 + c3 + r * rowi)) % 24;
```

### Grid Layout

| Variable | Calculation |
|----------|-------------|
| Columns | Fixed at 25 |
| Rows | `Math.abs(aspectRatio * columns) - 1` |
| Cell size | `containerWidth / columns` |

## Animation

Regenerates every 5 seconds with new random composition:
```javascript
setInterval(makebox, 5000);
```

## Responsive Behavior

```javascript
// Viewport-based sizing
var bh = viewportHeight * 0.9;
var bw = viewportWidth * 0.9;
var aspectRatio = bh / bw;

// Dynamic cell sizing
var cellSize = Math.floor(containerWidth / columns);
```

## Color Themes

The 24-color palette (b0-b23) can be themed via CSS:
- Grayscale gradient
- Rainbow spectrum
- Earth tones
- Custom brand colors

## Use Cases

- Generative backgrounds
- Color palette exploration
- Abstract art composition
- Responsive grid patterns

## Source Reference

- Main: `reference/QuickToolRebuildReference/Generative Art/coloursquare/`
- Array: `reference/QuickToolRebuildReference/Generative Art/coloursquare/colourarray/`

