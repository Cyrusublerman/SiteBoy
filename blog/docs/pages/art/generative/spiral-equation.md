# Spiral Equation

**Type:** Generative Art / Tool  
**Category:** Mathematical Visualization  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/Spiral_equation_2025_09_12_01_23_20/sketch.js`

---

## 1. Overview

Interactive parametric spiral generator that allows exploration of the general spiral equation. Users can modify equation parameters to create logarithmic, Archimedean, Fermat, and hybrid spirals, with visual connection lines highlighting the spiral structure.

### Key Features
- Configurable spiral equation: r(θ) = aθᵏ × e^(bθᵐ) + c
- Adjustable point count and radius
- Single connection interval (n) for line drawing
- Live equation display with current values
- Real-time parameter updates

### Mathematical Foundation
The general spiral equation combines polynomial and exponential terms:
```
r(θ) = a × θᵏ × e^(b × θᵐ) + c
```

Where:
- **a:** Amplitude scaling
- **k:** Polynomial exponent (θᵏ)
- **b:** Exponential coefficient
- **m:** Exponential power
- **c:** Radial offset

Special cases:
- k=1, b=0: Archimedean spiral
- k=0.5, b=0: Fermat spiral
- k=0, b>0: Logarithmic spiral

---

## 2. User Controls

### Spiral Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Number of Points | number | 10-1000 | 100 | Points in spiral |
| Maximum Radius | number | 50-500 | 300 | Scaling radius |
| Connection Interval (n) | number | 1-50 | 1 | Line connection step |

### Equation Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| a | number | -10 to 10 | 1 | Amplitude |
| b | number | -1 to 1 | 0.1 | Exp coefficient |
| c | number | -100 to 100 | 0 | Offset |
| k | number | 0 to 3 | 1 | Polynomial power |
| m | number | 0 to 3 | 1 | Exponential power |

---

## 3. Functional Requirements

### Core Behavior
1. **Point Generation:** Calculate spiral points using parametric equation
2. **Radius Normalization:** Scale to fit maximum radius
3. **Line Drawing:** Connect every nth point
4. **Equation Display:** Show current equation with values
5. **Live Update:** Redraw on any parameter change

### Generation Algorithm
```javascript
function generateSpiral(params, points, desiredRadius) {
  let spiral = [];
  let maxR = 0;
  let thetaMax = TWO_PI * 5;  // 5 complete turns
  
  for (let i = 0; i < points; i++) {
    let theta = i / points * thetaMax;
    let r = (params.a * Math.pow(theta, params.k)) * 
            Math.exp(params.b * Math.pow(theta, params.m)) + 
            params.c;
    maxR = Math.max(maxR, r);
    spiral.push({ r, theta });
  }
  
  let scale = desiredRadius / maxR;
  return spiral.map(p => ({
    x: (p.r * scale) * Math.cos(p.theta) + centerX,
    y: (p.r * scale) * Math.sin(p.theta) + centerY
  }));
}
```

### Rendering
- Black stroke for spiral outline
- Red stroke for connection lines
- Spiral drawn as continuous curve
- Connection lines drawn separately

---

## 4. Technical Architecture

### Source Analysis
```javascript
let params = { a: 1, b: 0.1, c: 0, k: 1, m: 1 };

function setup() {
  createCanvas(800, 800);
  setupGUI();
  updateSpiral();
}

function drawSpiral(spiral, n) {
  // Draw continuous spiral
  stroke(0);
  noFill();
  beginShape();
  spiral.forEach(p => vertex(p.x, p.y));
  endShape();
  
  // Draw connection lines at interval n
  stroke(255, 0, 0);
  for (let i = 0; i < n; i++) {
    beginShape();
    for (let j = i; j < spiral.length; j += n) {
      vertex(spiral[j].x, spiral[j].y);
    }
    endShape();
  }
}
```

### Dependencies
- p5.js (currently)
- None after ToolBase conversion

### Edge Cases
- Handle non-finite radius values
- Prevent division by zero in scaling
- Clamp parameters to valid ranges

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SPIRAL]
  └─ Points
      └─ [slider] Point Count (10-1000, default: 100)
      └─ [slider] Max Radius (50-500, default: 300)
  └─ Connection
      └─ [stepper] Interval n (1-50, default: 1)

[EQUATION]
  └─ Parameters
      └─ [number] a - Amplitude (-10 to 10, default: 1)
      └─ [number] b - Exp Coeff (-1 to 1, step: 0.01, default: 0.1)
      └─ [number] c - Offset (-100 to 100, default: 0)
      └─ [number] k - Poly Power (0 to 3, step: 0.1, default: 1)
      └─ [number] m - Exp Power (0 to 3, step: 0.1, default: 1)
  └─ Display
      └─ [equation] r(θ) = a×θᵏ×e^(b×θᵐ)+c

[PRESETS]
  └─ Quick Load
      └─ [dropdown] Type (Archimedean, Fermat, Logarithmic, Custom)
      └─ [button] Apply Preset

[COLORS]
  └─ Lines
      └─ [color] Spiral (#000000)
      └─ [color] Connections (#FF0000)
  └─ Background
      └─ [color] Background (#FFFFFF)

[EXPORT]
  └─ Download
      └─ [button] Export PNG
      └─ [button] Export SVG
```

### Preset Configurations
```javascript
const PRESETS = {
  'Archimedean': { a: 1, b: 0, c: 0, k: 1, m: 0 },
  'Fermat':      { a: 1, b: 0, c: 0, k: 0.5, m: 0 },
  'Logarithmic': { a: 0.5, b: 0.2, c: 0, k: 0, m: 1 },
  'Hyperbolic':  { a: 10, b: 0, c: 0, k: -1, m: 0 }
};
```

---

## 6. Visual Design

### Layout
- Large canvas for spiral visualization
- Sidebar with equation parameters
- Equation display shows live formula

### Color Scheme
- White background for clarity
- Black spiral outline
- Red connection lines for visibility

### Typography
- Equation rendered with subscripts/superscripts
- Monospace font for parameter values

---

## 7. Testing Checklist

### Functional Tests
- [ ] All parameter inputs update spiral
- [ ] Point count changes density
- [ ] Connection interval draws correct lines
- [ ] Presets load correctly
- [ ] Equation display updates

### Mathematical Tests
- [ ] Archimedean preset produces linear growth
- [ ] Fermat preset shows square root growth
- [ ] Logarithmic preset shows exponential growth
- [ ] Edge cases handled (b=0, k=0, etc.)

### Visual Tests
- [ ] Spiral centered in canvas
- [ ] Scaling keeps spiral in bounds
- [ ] Connection lines visible and correct
- [ ] No rendering artifacts

---

## 8. References

### Mathematical Background
- **Archimedean Spiral:** r = a + bθ
- **Logarithmic Spiral:** r = ae^(bθ)
- **Fermat Spiral:** r = a√θ
- **General Form:** r(θ) = aθᵏe^(bθᵐ) + c

### Implementation References
- Source: `reference/tools/p5.js/Spiral_equation_2025_09_12_01_23_20/sketch.js`

### Related Tools
- [Spiral Equation 2](#spiral-equation-2) - Dual interval version
- [Phyllo Spiral 2D](#phyllo-spiral-2d) - Phyllotaxis spirals

