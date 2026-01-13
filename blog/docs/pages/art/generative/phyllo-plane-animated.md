# Phyllo Plane Animated

**Type:** Generative Art  
**Category:** Mathematical Animation  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/phyllo_2_plane_copy_2025_09_12_01_26_14/sketch.js`

---

## 1. Overview

Animated visualization of phyllotaxis that explores how different divergence angles affect spiral patterns. The animation continuously increments the phyllotactic angle, demonstrating the transition through various arrangements and showing why the golden angle produces optimal packing.

### Key Features
- Automatic angle animation (0.01° per frame)
- Dynamic Fibonacci-based parastichy calculation
- Distance-based line transparency
- Connection limit for clean visualization
- Modified Binet's formula for angle-derived Fibonacci

### Mathematical Innovation
Uses a modified Binet's formula to derive parastichy numbers from any angle:
```
φ = 1 / (2 - angle/360)
ψ = 1 - φ
F(n) = (φⁿ - ψⁿ) / √5
```

This shows how Fibonacci-like sequences emerge from different divergence angles.

---

## 2. User Controls

### Parameters (Configurable via constants)
| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| numPoints | number | 500 | Total points in spiral |
| canvasSize | number | 500 | Canvas dimensions |
| phyllotacticAngle | number | 137.5 | Starting divergence angle |
| n1Index | number | 7 | Fibonacci index for first parastichy |
| n2Index | number | 8 | Fibonacci index for second parastichy |
| limit | number | 45 | Max distance for line drawing |

### ToolBase Controls (Proposed)
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Point Count | slider | 100-1000 | 500 | Number of spiral points |
| Animation Speed | slider | 0.001-0.1 | 0.01 | Angle increment per frame |
| n1 Index | stepper | 1-12 | 7 | First Fibonacci index |
| n2 Index | stepper | 1-12 | 8 | Second Fibonacci index |
| Distance Limit | slider | 20-100 | 45 | Max line distance |
| Play/Pause | button | - | - | Toggle animation |

---

## 3. Functional Requirements

### Core Behavior
1. **Continuous Animation:** Auto-increment angle each frame
2. **Dynamic Parastichy:** Recalculate n1/n2 as angle changes
3. **Point Generation:** Standard phyllotactic formula
4. **Adaptive Connections:** Distance-based transparency

### Animation Logic
```javascript
// Each frame:
phyllotacticAngle += 0.01;

// Derive Fibonacci-like numbers from current angle
let [n1, n2] = deriveParastichies(phyllotacticAngle);

// Connect points at n1 and n2 intervals
connectPoints(points, n1);
connectPoints(points, n2);
```

### Line Drawing Rules
- Only draw lines where distance ≤ limit
- Transparency inversely proportional to distance
- Both n1 and n2 connection sets drawn

### Rendering
- Black points (5px ellipses)
- Variable-transparency connection lines
- White background

---

## 4. Technical Architecture

### Source Analysis
```javascript
// Modified Binet's formula
function fibonacciFromAngle(n, angle) {
  const sqrt5 = Math.sqrt(5);
  const phi = 1 / (2 - angle / 360);
  const psi = 1 - phi;
  return Math.round((Math.pow(phi, n) - Math.pow(psi, n)) / sqrt5);
}

// Connection with distance-based transparency
function connectPoints(points, n) {
  for (let i = 0; i < points.length; i++) {
    for (let j = 1; j <= n; j++) {
      let index = i + j;
      if (index < points.length) {
        let distance = sqrt(dx*dx + dy*dy);
        if (distance <= limit) {
          let transparency = map(distance, 0, limit, 255, 0);
          stroke(0, transparency);
          line(points[i].x, points[i].y, points[index].x, points[index].y);
        }
      }
    }
  }
}
```

### Dependencies
- p5.js (currently)
- AnimationFoundation.AnimationLoop (after conversion)

### Performance Notes
- 500 points × many connections = many line calculations
- Distance check provides early termination optimization
- May need frame rate limiting for smooth animation

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SPIRAL]
  └─ Points
      └─ [slider] Point Count (100-1000, default: 500)
      └─ [value] Current Angle (display only)
      └─ [value] n1 (display only)
      └─ [value] n2 (display only)
  └─ Fibonacci Indices
      └─ [stepper] n1 Index (1-12, default: 7)
      └─ [stepper] n2 Index (1-12, default: 8)

[ANIMATION]
  └─ Control
      └─ [button] Play/Pause
      └─ [button] Reset Angle
      └─ [slider] Speed (0.001-0.1, step: 0.001, default: 0.01)

[DISPLAY]
  └─ Lines
      └─ [slider] Distance Limit (20-100, default: 45)
      └─ [slider] Line Width (0.5-3, default: 1)
  └─ Colors
      └─ [color] Background (#FFFFFF)
      └─ [color] Point Color (#000000)

[EXPORT]
  └─ Download
      └─ [button] Export Current Frame
```

### Animation Implementation
```javascript
onInit: function(values) {
  const self = this;
  this.angle = 137.5;
  this.isPlaying = true;
  
  this.animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => {
      if (self.isPlaying) {
        self.angle += self.getValue('speed');
        self.draw();
      }
    }
  });
  this.animator.start();
}
```

---

## 6. Visual Design

### Layout
- Square canvas (optimal for spiral)
- Sidebar with animation controls
- Live angle display

### Animation Aesthetic
- Smooth continuous motion
- Visible transition between pattern types
- "Breathing" effect as patterns align/misalign

### Color Scheme
- Clean white background
- Black points and lines
- Transparency creates depth

---

## 7. Testing Checklist

### Functional Tests
- [ ] Animation plays smoothly at 60fps
- [ ] Play/pause toggle works
- [ ] Reset returns to starting angle
- [ ] Speed slider affects animation rate
- [ ] n1/n2 indices update derived values

### Visual Tests
- [ ] Golden angle (137.5°) shows clear spirals
- [ ] Non-golden angles show different patterns
- [ ] Distance limit affects line density correctly
- [ ] Transparency gradient visible

### Animation Tests
- [ ] No memory leak during long runs
- [ ] Frame rate maintains consistency
- [ ] Smooth angle transition (no jumps)

---

## 8. References

### Mathematical Background
- **Phyllotaxis Animation:** Demonstrating angle sensitivity
- **Binet's Formula:** F(n) = (φⁿ - ψⁿ) / √5
- **Modified Formula:** Angle-based φ derivation

### Implementation References
- Source: `reference/tools/p5.js/phyllo_2_plane_copy_2025_09_12_01_26_14/sketch.js`

### Related Tools
- [Phyllo Spiral 2D](#phyllo-spiral-2d) - Static version with full controls
- [Spin Spiral](#spin-spiral) - Different animation approach

