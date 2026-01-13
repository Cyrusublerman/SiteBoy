# Spiral N-gon 3D

**Type:** Generative Art  
**Category:** 3D Mathematical Visualization  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/Spiral_Ngon_3d_2025_09_12_01_24_11/sketch.js`

---

## 1. Overview

3D visualization of a phyllotactic spiral constrained within an N-sided polygon (N-gon) boundary. This creates fascinating geometric structures where golden angle spiral patterns wrap around cone-like 3D shapes with polygonal cross-sections.

### Key Features
- Adjustable N-gon sides (triangle, square, pentagon, hexagon, etc.)
- Variable spiral point count and delta theta
- Height cutoff for cone truncation
- X/Y skew transformation
- Three selectable N-set connections with distinct colors
- Minimum angle validation for smooth curves
- Fixed camera perspective view

### Mathematical Foundation
- **N-gon Boundary:** Regular polygon defines radius at each height
- **Spiral Equation:** Points distributed using golden angle on varying radius
- **Height Mapping:** Z-coordinate linearly distributed along N-gon height
- **Valid N-sets:** Automatic detection of connection intervals that maintain minimum angle

---

## 2. User Controls

### N-gon Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| radius | number | 50-500 | 200 | Base polygon radius |
| sides | stepper | 3-24 | 12 | Number of polygon sides |
| cutoff | slider | 0-100 | 0 | Height percentage to cut from bottom |
| xSkew | slider | -1 to 1 | 0 | Horizontal skew factor |
| ySkew | slider | -1 to 1 | 0 | Vertical skew factor |

### Spiral Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| p | number | 50-1000 | 500 | Number of spiral points |
| deltaTheta | number | 100-200 | 137.5 | Divergence angle in degrees |
| minAngle | number | 45-135 | 90 | Minimum angle for valid N-sets |

### Connection Selection
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| n1 | stepper | 0-max | 3 | Index into valid N-set (red) |
| n2 | stepper | 0-max | 1 | Index into valid N-set (green) |
| n3 | stepper | 0-max | 2 | Index into valid N-set (blue) |

---

## 3. Functional Requirements

### Core Behavior
1. **N-gon Generation:** Create regular polygon with specified sides
2. **Shape Transformation:** Apply cutoff, skew, and scaling
3. **3D Translation:** Convert 2D polygon to 3D cone/pyramid
4. **Spiral Generation:** Create points following golden angle within N-gon bounds
5. **N-set Validation:** Calculate which connection intervals maintain angle constraint
6. **Line Drawing:** Connect points using three selected N-values

### Algorithm Flow
```
1. generateNgonPoints(radius, sides) → 2D polygon vertices
2. calculateCutoffHeight(points, cutoff) → truncation level
3. cutOffShape(points, cutoffHeight) → truncated polygon
4. applySkew(points, xSkew, ySkew) → transformed polygon
5. scalePoints(points, radius) → normalized polygon
6. translateShape(points) → base at y=0
7. translateTo3D(points) → 3D vertices
8. generateSpiralPoints3D(p, deltaTheta, ...) → spiral points
9. validateNSet(points, minAngle) → valid connection intervals
10. connectPoints(points, n, color) → draw lines
```

### Rendering
- WEBGL mode for 3D rendering
- Fixed camera at (0, 500, 200) looking at origin
- Three distinct colors for N-set connections
- No fill, stroke-only rendering

---

## 4. Technical Architecture

### Source Analysis
```javascript
// Global state
let radius = 200, sides = 12, cutoff = 0;
let xSkew = 0, ySkew = 0;
let p = 500, deltaTheta = 137.5, minAngle = 90;
let n1 = 3, n2 = 1, n3 = 2;

// Key data structures
let ngon2DPoints = [];  // Original polygon
let ngon3DPoints = [];  // 3D translated
let spiralPoints3D = []; // Spiral points
let validNSet = [];     // Valid connection intervals

// Core function: get radius at given height
function getNgonRadiusAtHeight(ngon3DPoints, height) {
  // Interpolate radius along polygon edges at specified z-level
}

// Core function: generate spiral within N-gon
function generateSpiralPoints3D(p, deltaTheta, ...) {
  for (let i = 0; i < p; i++) {
    let theta = deltaTheta * i;
    let z = maxZ - ((maxZ - minZ) * (i / (p - 1)));
    let ngonRadius = getNgonRadiusAtHeight(ngon3DPoints, z);
    let x = ngonRadius * cos(theta);
    let y = ngonRadius * sin(theta);
    points.push([x, y, z]);
  }
}
```

### Dependencies
- p5.js with WEBGL (currently)
- None after ToolBase conversion (Canvas2D with 3D projection)

### Complexity Notes
- Requires 3D to 2D projection in Canvas2D
- N-set validation is computationally expensive
- May need performance optimization for high point counts

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SHAPE]
  └─ N-gon
      └─ [stepper] Sides (3-24, default: 12)
      └─ [slider] Radius (50-500, default: 200)
      └─ [slider] Cutoff % (0-100, default: 0)
  └─ Transform
      └─ [slider] X Skew (-1 to 1, step: 0.1, default: 0)
      └─ [slider] Y Skew (-1 to 1, step: 0.1, default: 0)

[SPIRAL]
  └─ Parameters
      └─ [number] Points (50-1000, default: 500)
      └─ [number] Delta Theta (100-200, step: 0.5, default: 137.5)
      └─ [number] Min Angle (45-135, default: 90)
  └─ Connections
      └─ [stepper] n1 Index (default: 3)
      └─ [stepper] n2 Index (default: 1)
      └─ [stepper] n3 Index (default: 2)
      └─ [value] Valid N-sets (computed)

[COLORS]
  └─ Lines
      └─ [color] n1 Color (#FF0000)
      └─ [color] n2 Color (#00FF00)
      └─ [color] n3 Color (#0000FF)
  └─ Background
      └─ [color] Background (#DDDDDD)

[EXPORT]
  └─ Download
      └─ [button] Export PNG
```

### 3D Projection for Canvas2D
```javascript
// Simple orthographic projection
function project3D(x, y, z, canvas) {
  const scale = 0.5;
  const offsetX = canvas.width / 2;
  const offsetY = canvas.height / 2;
  return {
    x: offsetX + x * scale,
    y: offsetY - z * scale + y * 0.3 * scale
  };
}
```

### onDraw Implementation Notes
- Implement custom 3D projection function
- Pre-compute valid N-sets on parameter change
- Cache projected points for line drawing
- Use ctx.beginPath() batching for performance

---

## 6. Visual Design

### Layout
- Full canvas 3D visualization
- Sidebar controls on left
- Perspective view showing spiral structure

### Color Scheme
- Light gray background for visibility
- RGB color coding for three N-set connections
- No fill, stroke-only for clarity

### 3D Presentation
- Slight perspective effect
- Spiral visible as helix wrapped around N-gon cone
- Connection lines create mesh-like appearance

---

## 7. Testing Checklist

### Functional Tests
- [ ] N-gon sides change polygon shape correctly
- [ ] Cutoff truncates cone appropriately
- [ ] Skew transforms shape as expected
- [ ] Spiral points follow golden angle
- [ ] Valid N-sets computed correctly
- [ ] Connection indices clamp to valid range

### Visual Tests
- [ ] 3D projection maintains correct proportions
- [ ] Three colors clearly distinguishable
- [ ] No z-fighting or line overlap issues
- [ ] Performance acceptable at 500+ points

### Edge Cases
- [ ] Triangle (3 sides) renders correctly
- [ ] High side count (24) remains stable
- [ ] 100% cutoff handles gracefully
- [ ] Extreme skew values work

---

## 8. References

### Mathematical Background
- **Phyllotaxis in 3D:** Extension of Vogel's model to 3D surfaces
- **N-gon Geometry:** Regular polygon construction
- **Golden Angle:** 137.5077640500378°

### Implementation References
- Source: `reference/tools/p5.js/Spiral_Ngon_3d_2025_09_12_01_24_11/sketch.js`
- Additional files: `ngon.js`, `spiral.js`, `s3.js`
- p5.js WEBGL Mode: https://p5js.org/reference/#/p5/WEBGL

### Related Tools
- [Phyllo Spiral 2D](#phyllo-spiral-2d) - 2D version
- [Spinning Phyllo Ball](#spinning-phyllo-ball) - Spherical version
- [Spiral N-gon 3D Animated](#spiral-ngon-3d-animated) - Animated variant
