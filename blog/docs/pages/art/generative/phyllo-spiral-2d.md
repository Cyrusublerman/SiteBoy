# Phyllo Spiral 2D

**Type:** Generative Art  
**Category:** Mathematical Visualization  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/Phyllo_Spiral_2025_09_12_01_22_59/sketch.js`

---

## 1. Overview

Interactive 2D visualization of phyllotaxis - the mathematical arrangement of leaves, seeds, and petals in plants. This tool demonstrates how the golden angle (137.5°) creates the optimal packing pattern found in sunflower heads and pinecones.

### Key Features
- Adjustable n1 and n2 parameters for parastichy visualization
- Configurable rotation angle (divergence angle)
- Spiral size and dot size controls
- Color customization for background, dots, numbers, and spiral lines
- Toggle for point numbers and dot visibility
- Real-time point count display (n1 × n2)

### Mathematical Foundation
The tool uses the classic phyllotactic formula:
- **Angle:** θ = rotation × i
- **Radius:** r = √i × (baseRadius / √totalPoints)
- **Position:** (x, y) = (r × cos(θ), r × sin(θ))

Parastichy lines connect points at intervals of n1 and n2, typically Fibonacci numbers (3, 5, 8, 13, 21, 34, 55...).

---

## 2. User Controls

### Spiral Parameters
| Control | Type | Range/Options | Default | Description |
|---------|------|---------------|---------|-------------|
| n1 | stepper | 1-∞ | 5 | First parastichy number |
| n2 | stepper | 1-∞ | 8 | Second parastichy number |
| rotation | number | 0-360 | 137.5 | Divergence angle in degrees |
| spiral size | stepper | 0-100 | 100 | Size as percentage of canvas |
| dot size | stepper | 1-∞ | 2 | Point size in pixels |

### Display Options
| Control | Type | Default | Description |
|---------|------|---------|-------------|
| numbers | checkbox | true | Show point index numbers |
| dots | checkbox | true | Show points as circles |

### Colors
| Control | Type | Default | Description |
|---------|------|---------|-------------|
| background | color | #FFFFFF | Canvas background |
| dot color | color | #000000 | Point fill color |
| number color | color | #000000 | Index text color |
| n1 color | color | #FF0000 | First spiral arm color |
| n2 color | color | #0000FF | Second spiral arm color |

---

## 3. Functional Requirements

### Core Behavior
1. **Point Generation:** Create n1 × n2 points arranged in phyllotactic pattern
2. **Parastichy Lines:** Draw connecting lines for both n1 and n2 intervals
3. **Live Update:** Redraw immediately when any parameter changes
4. **No Animation:** Static visualization (noLoop mode)

### UI Interaction
1. Input fields with +/- stepper buttons
2. Checkbox toggles for visibility options
3. Color pickers for all color parameters
4. Derived "number of points" display (calculated, not input)

### Rendering
- Points use filled circles when dots enabled
- Text labels show index when numbers enabled
- Parastichy lines drawn with appropriate stroke colors
- Canvas centers the spiral pattern

---

## 4. Technical Architecture

### Source Analysis
```javascript
// Key global variables
let n1, n2, showNumbers, showDots, dotSize, spiralSize;
let rotation, bgColor, dotColor, numColor, n1Color, n2Color;

// Fibonacci helper class for potential future use
class Fibonacci {
  constructor() { this.prev = BigInt(0); this.current = BigInt(1); }
  next() { /* ... */ }
  previous() { /* ... */ }
}

// Core drawing loop
function draw() {
  // Calculate points
  for (let i = 0; i < pointNumber; i++) {
    let angle = radians(rotation * i);
    let r = (Math.sqrt(i) * radius) / Math.sqrt(pointNumber);
    // ... draw point and number
  }
  // Draw n1 connections
  // Draw n2 connections
}
```

### Dependencies
- p5.js (currently)
- None after ToolBase conversion

### State Management
All state derived from UI controls:
- n1Input, n2Input values
- Toggle checkbox states
- Color picker values
- Input field values for size/rotation

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[IMAGE]
  └─ Canvas Size
      └─ [slider] Width (100-1200, default: 800)
      └─ [slider] Height (100-1200, default: 800)

[SPIRAL]
  └─ Parameters
      └─ [stepper] n1 (min: 1, default: 5)
      └─ [stepper] n2 (min: 1, default: 8)
      └─ [number] Rotation Angle (0-360, step: 0.5, default: 137.5)
      └─ [slider] Spiral Size % (0-100, default: 100)
      └─ [value] Total Points (computed: n1 × n2)
  └─ Display
      └─ [stepper] Dot Size (1-20, default: 2)
      └─ [toggle] Show Dots
      └─ [toggle] Show Numbers

[COLORS]
  └─ Background
      └─ [color] Background (#FFFFFF)
  └─ Points
      └─ [color] Dot Color (#000000)
      └─ [color] Number Color (#000000)
  └─ Spirals
      └─ [color] n1 Spiral (#FF0000)
      └─ [color] n2 Spiral (#0000FF)

[EXPORT]
  └─ Download
      └─ [button] Export PNG
      └─ [button] Export SVG
```

### onDraw Implementation
```javascript
onDraw: function(ctx, canvas, values) {
  const { n1, n2, rotation, spiralSize, dotSize } = values;
  const { showDots, showNumbers } = values;
  const { background, dotColor, numberColor, n1Color, n2Color } = values;
  
  // Background
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const pointNumber = n1 * n2;
  const radius = Math.min(centerX, centerY) * (spiralSize / 100);
  const points = [];
  
  // Generate and draw points
  for (let i = 0; i < pointNumber; i++) {
    const angle = (rotation * Math.PI / 180) * i;
    const r = (Math.sqrt(i) * radius) / Math.sqrt(pointNumber);
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    points.push({ x, y });
    
    if (showDots) {
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    
    if (showNumbers) {
      ctx.fillStyle = numberColor;
      ctx.font = `${dotSize * 4}px monospace`;
      ctx.fillText(String(i), x, y);
    }
  }
  
  // Draw n1 parastichy lines
  ctx.strokeStyle = n1Color;
  for (let i = 0; i < n1; i++) {
    for (let x = 1; x < Math.floor((pointNumber - i) / n1); x++) {
      const p1 = points[(x - 1) * n1 + i];
      const p2 = points[x * n1 + i];
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
  
  // Draw n2 parastichy lines (similar pattern)
}
```

---

## 6. Visual Design

### Layout
- Full canvas visualization
- Spiral centered in canvas
- Sidebar controls on left

### Color Scheme
- Default: White background with black dots
- Red (n1) and blue (n2) spiral arms for contrast
- User-customizable colors

### Typography
- Index numbers in monospace font
- Size proportional to dot size

---

## 7. Testing Checklist

### Functional Tests
- [ ] n1 and n2 steppers increment/decrement correctly
- [ ] Point count updates dynamically (n1 × n2)
- [ ] Rotation angle affects spiral tightness
- [ ] Spiral size scales pattern appropriately
- [ ] Dot toggle shows/hides points
- [ ] Number toggle shows/hides indices
- [ ] All color pickers update visualization

### Visual Tests
- [ ] Spiral centered in canvas
- [ ] Golden angle (137.5°) produces classic sunflower pattern
- [ ] Parastichy lines connect correct point intervals
- [ ] No visual artifacts at extreme values

### Export Tests
- [ ] PNG export captures full canvas
- [ ] SVG export maintains vector quality

---

## 8. References

### Mathematical Background
- **Phyllotaxis:** https://en.wikipedia.org/wiki/Phyllotaxis
- **Golden Angle:** 137.5077640500378° = 360° × (1 - 1/φ)
- **Parastichy:** Spiral lines visible in phyllotactic patterns
- **Fibonacci Connection:** Parastichy numbers often consecutive Fibonacci

### Implementation References
- Source: `reference/tools/p5.js/Phyllo_Spiral_2025_09_12_01_22_59/sketch.js`
- p5.js Documentation: https://p5js.org/reference/
- Related: Vogel's model for sunflower seeds

### Related Tools
- [Spiral Equation](#spiral-equation) - Parametric spiral variations
- [Lissajous](#lissajous) - Parametric curve visualization

