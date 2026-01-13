# Spiral N-gon 3D Animated

**Type:** Generative Art  
**Category:** 3D Animation  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/Spiral_Ngon_3d_copy_2025_09_12_01_24_38/sketch.js`

---

## 1. Overview

Animated version of the Spiral N-gon 3D visualization featuring an orbiting camera and continuously evolving spiral structure. The delta theta increments each frame, creating a mesmerizing effect where the spiral pattern transforms while the camera circles around it.

### Key Features
- All features of static Spiral N-gon 3D
- Orbiting camera animation
- Continuously incrementing delta theta
- Auto-updating spiral pattern
- Dark background for contrast

### Key Differences from Static Version
| Feature | Static Version | Animated Version |
|---------|----------------|------------------|
| Camera | Fixed position | Orbiting |
| Delta Theta | User-controlled | Auto-incrementing |
| Background | Light gray | Black |
| Loop | noLoop() | Continuous |
| Min Angle | 90° | 80° |

---

## 2. User Controls

### Current Parameters (Constants)
| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| radius | number | 300 | N-gon base radius |
| sides | number | 8 | Polygon sides |
| cutoff | number | 0 | Height cutoff % |
| p | number | 100 | Spiral points |
| deltaTheta | number | 137.5 | Starting angle |
| orbitRadius | number | 1000 | Camera orbit |
| n1, n2, n3 | number | 0, 1, 2 | N-set indices |

### ToolBase Controls (Proposed)
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Polygon Sides | stepper | 3-16 | 8 | N-gon sides |
| Polygon Radius | slider | 100-500 | 300 | Base radius |
| Spiral Points | slider | 50-500 | 100 | Points in spiral |
| Delta Theta Speed | slider | 0.01-1 | 0.1 | Angle increment/frame |
| Camera Speed | slider | 0.001-0.05 | 0.01 | Orbit speed |
| Camera Radius | slider | 500-2000 | 1000 | Orbit distance |
| Play/Pause | button | - | - | Toggle animation |

---

## 3. Functional Requirements

### Core Behavior
1. **Continuous Rendering:** Loop mode (no noLoop)
2. **Camera Orbit:** Camera position updates each frame
3. **Spiral Evolution:** Delta theta increments continuously
4. **Pattern Regeneration:** Spiral recomputed every frame
5. **N-set Validation:** Automatically find valid connections

### Animation Loop
```javascript
function draw() {
  background(0);
  
  // Update camera position for orbiting
  let angle = frameCount * 0.01;
  let camX = orbitRadius * cos(angle);
  let camY = orbitRadius * sin(angle);
  camera(camX, camY, 200, 0, 0, 200, 0, 0, -1);
  
  // Update spiral
  updateAndRedraw();
  
  // Increment delta theta
  deltaTheta += 0.1;
}
```

### Camera System
- Orbit in XY plane around origin
- Fixed Z height (200 units)
- Look-at point at (0, 0, 200)
- Up vector is -Z (0, 0, -1)

---

## 4. Technical Architecture

### Source Analysis
```javascript
let orbitRadius = 1000;
let deltaTheta = 137.5;
let minAngle = 80;  // Lower than static version

function setup() {
  createCanvas(800, 900, WEBGL);
  angleMode(RADIANS);
  ngon2DPoints = generateNgonPoints(radius, sides);
  updateAndRedraw();
}

function draw() {
  background(0);  // Black background
  
  // Orbiting camera
  let angle = frameCount * 0.01;
  let camX = orbitRadius * cos(angle);
  let camY = orbitRadius * sin(angle);
  camera(camX, camY, 200, 0, 0, 200, 0, 0, -1);
  
  updateAndRedraw();
  deltaTheta += 0.1;  // Continuous evolution
}
```

### Performance Considerations
- Full spiral recalculation every frame
- N-set validation is expensive
- Lower point count (100 vs 500) for performance
- Reduced minimum angle (80°) for more valid N-sets

### Dependencies
- p5.js with WEBGL (currently)
- AnimationFoundation.AnimationLoop (after conversion)

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SHAPE]
  └─ N-gon
      └─ [stepper] Sides (3-16, default: 8)
      └─ [slider] Radius (100-500, default: 300)
      └─ [slider] Cutoff % (0-100, default: 0)
  └─ Transform
      └─ [slider] X Skew (-1 to 1, default: 0)
      └─ [slider] Y Skew (-1 to 1, default: 0)

[SPIRAL]
  └─ Parameters
      └─ [slider] Points (50-500, default: 100)
      └─ [slider] Min Angle (60-120, default: 80)
      └─ [value] Current Delta Theta (display)
  └─ Connections
      └─ [stepper] n1 Index (default: 0)
      └─ [stepper] n2 Index (default: 1)
      └─ [stepper] n3 Index (default: 2)

[ANIMATION]
  └─ Spiral
      └─ [slider] Delta Speed (0.01-1, default: 0.1)
  └─ Camera
      └─ [slider] Orbit Speed (0.001-0.05, default: 0.01)
      └─ [slider] Orbit Radius (500-2000, default: 1000)
  └─ Control
      └─ [button] Play/Pause
      └─ [button] Reset

[COLORS]
  └─ Lines
      └─ [color] n1 (#FF0000)
      └─ [color] n2 (#00FF00)
      └─ [color] n3 (#0000FF)
  └─ Background
      └─ [color] Background (#000000)

[EXPORT]
  └─ Download
      └─ [button] Export Current Frame
```

### Animation Implementation
```javascript
onInit: function(values) {
  const self = this;
  this.frameCount = 0;
  this.deltaTheta = 137.5;
  
  this.animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => {
      self.frameCount++;
      self.deltaTheta += self.getValue('deltaSpeed');
      self.draw();
    }
  });
  this.animator.start();
}
```

### 3D Projection
```javascript
function projectWithOrbit(point, frameCount, orbitRadius) {
  const cameraAngle = frameCount * 0.01;
  const camX = orbitRadius * Math.cos(cameraAngle);
  const camY = orbitRadius * Math.sin(cameraAngle);
  
  // Transform point relative to camera
  const dx = point.x - camX;
  const dy = point.y - camY;
  const dz = point.z - 200;
  
  // Apply rotation based on camera angle
  const rotX = dx * Math.cos(-cameraAngle) - dy * Math.sin(-cameraAngle);
  const rotY = dx * Math.sin(-cameraAngle) + dy * Math.cos(-cameraAngle);
  
  // Perspective projection
  const scale = 500 / (500 + rotY);
  return {
    x: rotX * scale,
    y: dz * scale
  };
}
```

---

## 6. Visual Design

### Layout
- Full canvas 3D visualization
- Dark/black background
- Sidebar with animation controls

### Color Scheme
- Black background for drama
- RGB lines (red, green, blue)
- High contrast for visibility

### Animation Aesthetic
- Smooth camera orbit
- Continuously morphing spiral
- Hypnotic repeating motion

---

## 7. Testing Checklist

### Functional Tests
- [ ] Camera orbits smoothly
- [ ] Delta theta increments correctly
- [ ] Spiral regenerates each frame
- [ ] N-set validation works dynamically
- [ ] Play/pause functions correctly

### Visual Tests
- [ ] 3D perspective maintained during orbit
- [ ] Spiral visible against dark background
- [ ] No visual glitches at reset points
- [ ] Smooth animation at 60fps

### Performance Tests
- [ ] Frame rate consistent
- [ ] No memory accumulation
- [ ] Responsive to parameter changes

---

## 8. References

### Mathematical Background
- **Orbiting Camera:** Circular path in 3D space
- **Dynamic Phyllotaxis:** Time-varying divergence angle
- **N-set Evolution:** Valid connections change with theta

### Implementation References
- Source: `reference/tools/p5.js/Spiral_Ngon_3d_copy_2025_09_12_01_24_38/sketch.js`

### Related Tools
- [Spiral N-gon 3D](#spiral-ngon-3d) - Static version
- [Spinning Phyllo Ball](#spinning-phyllo-ball) - Spherical rotation

