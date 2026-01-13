# Spiral Equation 2

**Type:** Generative Art / Tool  
**Category:** Mathematical Visualization  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/spiral_eq_2_2025_09_12_01_23_43/sketch.js`

---

## 1. Overview

Extended version of the Spiral Equation tool featuring dual connection intervals (n1 and n2) and a phyllotactic delta theta parameter. This creates more complex visualizations showing both primary and secondary spiral arms, similar to parastichy patterns in nature.

### Key Features
- Same parametric equation: r(θ) = aθᵏ × e^(bθᵐ) + c
- Two connection intervals (n1, n2) with distinct colors
- Configurable delta theta for phyllotactic patterns
- Real-time equation display
- Fibonacci-style dual spiral visualization

### Key Differences from Spiral Equation
| Feature | Spiral Equation | Spiral Equation 2 |
|---------|----------------|-------------------|
| Connection Intervals | Single (n) | Dual (n1, n2) |
| Delta Theta | Fixed (full rotation) | Configurable |
| Line Colors | Single red | Red and blue |
| Default Values | Generic | Phyllotactic |

---

## 2. User Controls

### Spiral Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Number of Points | number | 10-500 | 169 | Points in spiral |
| n1 Connection | number | 1-50 | 8 | First interval (red) |
| n2 Connection | number | 1-50 | 13 | Second interval (blue) |
| Δθ (Delta Theta) | number | 1-360 | 137.5 | Angle between points |

### Equation Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| a | number | -10 to 10 | 1 | Amplitude |
| b | number | -1 to 1 | 0 | Exp coefficient |
| c | number | -100 to 100 | 0 | Offset |
| k | number | 0 to 3 | 1 | Polynomial power |
| m | number | 0 to 3 | 0 | Exponential power |

---

## 3. Functional Requirements

### Core Behavior
1. **Phyllotactic Points:** Use delta theta for angle spacing
2. **Dual Connections:** Draw both n1 and n2 interval lines
3. **Color Coding:** Red for n1, blue for n2
4. **Radius Calculation:** Apply general spiral equation
5. **Live Update:** Redraw on parameter change

### Generation Algorithm
```javascript
function generateSpiral(params, points, desiredRadius, deltaTheta) {
  let spiral = [];
  let maxR = 0;
  
  for (let i = 0; i < points; i++) {
    let theta = radians(deltaTheta) * i;  // Phyllotactic spacing
    let r = params.a * Math.pow(theta, params.k) * 
            Math.exp(params.b * Math.pow(theta, params.m)) + 
            params.c;
    if (!isFinite(r)) return [];
    maxR = Math.max(maxR, r);
    spiral.push({ r, theta });
  }
  
  let scale = desiredRadius / maxR;
  return spiral.map(p => ({
    x: p.r * scale * Math.cos(p.theta),
    y: p.r * scale * Math.sin(p.theta)
  }));
}
```

### Dual Connection Drawing
```javascript
function drawSpiral(spiral, n1, n2, offsetX) {
  // n1 connections (red)
  stroke(255, 0, 0);
  for (let start = 0; start < n1; start++) {
    for (let i = start; i < spiral.length - n1; i += n1) {
      line(spiral[i].x, spiral[i].y, 
           spiral[i + n1].x, spiral[i + n1].y);
    }
  }
  
  // n2 connections (blue)
  stroke(0, 0, 255);
  for (let start = 0; start < n2; start++) {
    for (let i = start; i < spiral.length - n2; i += n2) {
      line(spiral[i].x, spiral[i].y, 
           spiral[i + n2].x, spiral[i + n2].y);
    }
  }
}
```

---

## 4. Technical Architecture

### Source Analysis
```javascript
let params = { a: 1, b: 0, c: 0, k: 1, m: 0 };
let points = 169, n1 = 8, n2 = 13, deltaTheta = 137.5;

function setupGUI() {
  // Creates input fields for all parameters
  pointsInput = createLabeledInput("Number of Points:", 169, gui, updateSpiral);
  n1Input = createLabeledInput("Connection Interval (n₁):", 8, gui, updateSpiral);
  n2Input = createLabeledInput("Connection Interval (n₂):", 13, gui, updateSpiral);
  deltaThetaInput = createLabeledInput("Δθ:", 137.5, gui, updateSpiral);
  // ... equation parameters
}

function updateEquationDisplay() {
  equationDisplay.html(`
    Equation: r(θ) = a × θ<sup>k</sup> × e<sup>(b×θ<sup>m</sup>)</sup> + c<br>
    Current: r(θ) = ${params.a} × θ<sup>${params.k}</sup> × 
             e<sup>(${params.b}×θ<sup>${params.m}</sup>)</sup> + ${params.c}
  `);
}
```

### Dependencies
- p5.js (currently)
- None after ToolBase conversion

### Default Values (Phyllotactic)
- 169 points = 13² (Fibonacci-related)
- n1 = 8, n2 = 13 (consecutive Fibonacci)
- Δθ = 137.5° (golden angle)
- k = 1, b = 0 (Archimedean base)

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SPIRAL]
  └─ Points
      └─ [slider] Point Count (10-500, default: 169)
      └─ [number] Delta Theta (1-360, step: 0.5, default: 137.5)
  └─ Connections
      └─ [stepper] n1 Interval (1-50, default: 8)
      └─ [stepper] n2 Interval (1-50, default: 13)

[EQUATION]
  └─ Parameters
      └─ [number] a - Amplitude (default: 1)
      └─ [number] b - Exp Coeff (default: 0)
      └─ [number] c - Offset (default: 0)
      └─ [number] k - Poly Power (default: 1)
      └─ [number] m - Exp Power (default: 0)
  └─ Display
      └─ [equation] r(θ) = aθᵏe^(bθᵐ)+c

[PRESETS]
  └─ Quick Load
      └─ [button] Golden Spiral (8,13)
      └─ [button] Fibonacci (5,8)
      └─ [button] Large Fibonacci (21,34)

[COLORS]
  └─ Lines
      └─ [color] n1 Lines (#FF0000)
      └─ [color] n2 Lines (#0000FF)
  └─ Background
      └─ [color] Background (#FFFFFF)

[EXPORT]
  └─ Download
      └─ [button] Export PNG
      └─ [button] Export SVG
```

### onDraw Implementation
```javascript
onDraw: function(ctx, canvas, values) {
  const { points, deltaTheta, n1, n2, a, b, c, k, m } = values;
  const params = { a, b, c, k, m };
  
  ctx.fillStyle = values.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;
  
  const spiral = generateSpiral(params, points, radius, deltaTheta);
  
  // Draw n1 connections
  ctx.strokeStyle = values.n1Color;
  for (let start = 0; start < n1; start++) {
    ctx.beginPath();
    for (let i = start; i < spiral.length; i += n1) {
      const x = centerX + spiral[i].x;
      const y = centerY + spiral[i].y;
      if (i === start) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  
  // Draw n2 connections
  ctx.strokeStyle = values.n2Color;
  // ... similar pattern
}
```

---

## 6. Visual Design

### Layout
- Large square canvas
- Spiral centered with padding
- Equation display above controls

### Color Scheme
- White background
- Red for n1 connections
- Blue for n2 connections
- Clear visual distinction between spirals

### Phyllotactic Emphasis
- Default values produce sunflower-like pattern
- Fibonacci numbers create recognizable spirals
- Golden angle creates optimal packing

---

## 7. Testing Checklist

### Functional Tests
- [ ] Both n1 and n2 connections draw
- [ ] Delta theta affects point spacing
- [ ] All equation parameters work
- [ ] Presets load correct values
- [ ] Equation display updates

### Visual Tests
- [ ] Golden angle shows clear spirals
- [ ] Fibonacci intervals align with spiral arms
- [ ] Colors distinguish n1 and n2
- [ ] No overlapping issues

### Mathematical Tests
- [ ] 137.5° produces phyllotactic pattern
- [ ] 8,13 connections trace spiral arms
- [ ] Equation changes affect shape correctly

---

## 8. References

### Mathematical Background
- **Parastichy:** Spiral patterns in phyllotaxis
- **Fibonacci Phyllotaxis:** Plants often show F(n), F(n+1) spirals
- **Golden Angle:** 360° × (1 - 1/φ) ≈ 137.5°

### Implementation References
- Source: `reference/tools/p5.js/spiral_eq_2_2025_09_12_01_23_43/sketch.js`

### Related Tools
- [Spiral Equation](#spiral-equation) - Single interval version
- [Phyllo Spiral 2D](#phyllo-spiral-2d) - Pure phyllotaxis

