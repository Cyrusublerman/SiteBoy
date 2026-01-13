# Spinning Phyllo Ball

**Type:** Generative Art  
**Category:** 3D Animation  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/spinning_phyllo_ball_2025_09_12_01_28_06/sketch.js`

---

## 1. Overview

A mesmerizing 3D animation of a rotating sphere with points distributed according to phyllotactic principles. Points are connected using Fibonacci-based intervals, creating a wireframe sphere that continuously rotates and periodically randomizes its parameters.

### Key Features
- 3D sphere with golden angle point distribution
- Fibonacci-based connection intervals
- Multi-axis rotation with perspective projection
- Auto-randomizing parameters on timer
- Variable rotation speed and direction
- Smooth perspective depth effect

### Mathematical Foundation
Spherical phyllotaxis distributes points uniformly on a sphere:
```
y = (i × offset) - 1 + (offset / 2)
r = √(1 - y²)
φ = ((i + 1) mod n) × goldenIncrement
x = cos(φ) × r
z = sin(φ) × r
```

Where goldenIncrement = π(3 - √5) (golden angle in radians)

---

## 2. User Controls

### Current Parameters (Constants)
| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| pointNum | number | 100 | Points on sphere |
| ballRadius | number | 10 | Sphere radius |
| n1, n2 | number | 5, 3 | Fibonacci indices |
| rotationSpeed | number | 15 | Seconds per rotation |
| perspectiveIntensity | number | 1 | Depth effect strength |

### ToolBase Controls (Proposed)
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Point Count | slider | 50-1000 | 100 | Points on sphere |
| Ball Radius | slider | 5-20 | 10 | Sphere radius |
| n1 Fibonacci Index | stepper | 2-13 | 5 | First connection index |
| n2 Fibonacci Index | stepper | 2-13 | 3 | Second connection index |
| Rotation Speed | slider | 5-60 | 15 | Seconds per rotation |
| Spin Axis | dropdown | X/Y/Z | Z | Primary rotation axis |
| Auto Randomize | toggle | on/off | on | Periodic parameter changes |
| Perspective | slider | 0-2 | 1 | Depth projection intensity |

---

## 3. Functional Requirements

### Core Behavior
1. **Sphere Generation:** Phyllotactic point distribution on sphere surface
2. **3D Rotation:** Multi-axis rotation with time-based animation
3. **Connection Drawing:** Fibonacci-interval point connections
4. **Perspective Projection:** 3D to 2D with depth scaling
5. **Auto Randomization:** Parameters change on timer

### Rotation System
- Primary rotation on selected axis
- Secondary tilt rotation on x-axis
- Frame-count based angle calculation
- Randomizable rotation direction

### Fibonacci Connections
```javascript
// Connect using nth Fibonacci number
let f1 = nthFibonacci(n1);  // e.g., F(5) = 5
let f2 = nthFibonacci(n2);  // e.g., F(3) = 2

// Draw lines at Fibonacci intervals
for (let i = 0; i < points.length; i++) {
  drawLine(points[i], points[(i + f1) % points.length]);
  drawLine(points[i], points[(i + f2) % points.length]);
}
```

### Auto-Randomization
Every `rotationSpeed` seconds:
- New random spin direction (0, 1, or 2)
- Possibly reversed rotation
- New random n1 value (2-13)
- New random point count (50-1000)

---

## 4. Technical Architecture

### Source Analysis
```javascript
// Point generation on sphere
function phylBallGen(pointNum, ballRadius) {
  let ball = [];
  let offset = 2 / pointNum;
  let increment = Math.PI * (3 - Math.sqrt(5));
  
  for (let i = 0; i < pointNum; i++) {
    let y = i * offset - 1 + offset / 2;
    let r = Math.sqrt(1 - Math.pow(y, 2));
    let phi = ((i + 1) % pointNum) * increment;
    
    let x = Math.cos(phi) * r * ballRadius;
    let z = Math.sin(phi) * r * ballRadius;
    y *= ballRadius;
    
    ball.push([x, y, z]);
  }
  return ball;
}

// 3D to 2D projection with perspective
function project(p, scalingFactor) {
  let x = p[0] * scalingFactor;
  let y = p[1] * scalingFactor;
  let z = p[2] * scalingFactor;
  
  let zp = 500 * perspectiveIntensity;
  let xp = x * (zp / (zp - z));
  let yp = y * (zp / (zp - z));
  
  return [xp, yp];
}
```

### Dependencies
- p5.js (currently)
- AnimationFoundation.AnimationLoop (after conversion)

### State Management
- Point array regenerated when count changes
- Rotation angles computed from frameCount
- Timer tracks randomization intervals

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SPHERE]
  └─ Geometry
      └─ [slider] Point Count (50-1000, default: 100)
      └─ [slider] Radius (5-20, default: 10)
  └─ Connections
      └─ [stepper] n1 Index (2-13, default: 5)
      └─ [stepper] n2 Index (2-13, default: 3)
      └─ [value] F(n1) = (computed)
      └─ [value] F(n2) = (computed)

[ANIMATION]
  └─ Rotation
      └─ [slider] Speed (5-60, default: 15)
      └─ [dropdown] Spin Axis (X, Y, Z, default: Z)
      └─ [slider] Tilt Angle (-90 to 90, default: -50)
  └─ Control
      └─ [button] Play/Pause
      └─ [toggle] Auto Randomize

[DISPLAY]
  └─ Projection
      └─ [slider] Perspective (0-2, default: 1)
      └─ [slider] Scale (5-30, default: 15)
  └─ Style
      └─ [slider] Line Width (0.5-3, default: 1.5)
      └─ [slider] Line Opacity (0-100, default: 40)
  └─ Colors
      └─ [color] Background (#C8C8C8)
      └─ [color] Line Color (#FFFFFF)

[EXPORT]
  └─ Download
      └─ [button] Export Current Frame
```

### Animation Implementation
```javascript
onInit: function(values) {
  const self = this;
  this.frameCount = 0;
  this.lastRandomize = 0;
  
  this.animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => {
      self.frameCount++;
      // Check randomize timer
      if (values.autoRandomize && 
          self.frameCount % (values.rotationSpeed * 60) === 0) {
        self.randomizeParams();
      }
      self.draw();
    }
  });
  this.animator.start();
}
```

---

## 6. Visual Design

### Layout
- Full canvas 3D visualization
- Sphere centered in view
- Dark sphere silhouette behind wireframe

### Color Scheme
- Gray background for contrast
- White/light lines for wireframe
- Dark sphere fill for depth

### Animation Aesthetic
- Smooth continuous rotation
- Hypnotic repeating motion
- Surprise parameter changes

---

## 7. Testing Checklist

### Functional Tests
- [ ] Sphere generates correct point distribution
- [ ] Rotation smooth on all three axes
- [ ] Fibonacci connections drawn correctly
- [ ] Auto-randomize triggers on schedule
- [ ] Manual controls override auto settings

### Visual Tests
- [ ] Perspective creates depth effect
- [ ] Wireframe visible against background
- [ ] No flickering or z-fighting
- [ ] Sphere remains centered during rotation

### Performance Tests
- [ ] 60fps maintained at 100 points
- [ ] 1000 points still responsive
- [ ] Memory stable over long runs

---

## 8. References

### Mathematical Background
- **Spherical Fibonacci Lattice:** Uniform point distribution on sphere
- **Golden Angle:** π(3 - √5) ≈ 2.399963 radians
- **Perspective Projection:** zp / (zp - z) scaling

### Implementation References
- Source: `reference/tools/p5.js/spinning_phyllo_ball_2025_09_12_01_28_06/sketch.js`
- Fibonacci Sphere: https://stackoverflow.com/questions/9600801

### Related Tools
- [Phyllo Spiral 2D](#phyllo-spiral-2d) - 2D phyllotaxis
- [Spiral N-gon 3D](#spiral-ngon-3d) - 3D within polygon
- [Torus](#torus) - 3D torus animation

