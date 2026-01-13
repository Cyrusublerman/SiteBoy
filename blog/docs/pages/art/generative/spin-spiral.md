# Spin Spiral

**Type:** Generative Art  
**Category:** Animated Visualization  
**Status:** Requires Conversion (p5.js → ToolBase)  
**Source:** `reference/tools/p5.js/SpinSpiral_2025_09_12_01_27_53/sketch.js`

---

## 1. Overview

A hypnotic animated spiral that creates colorful trailing patterns through continuous rotation. Unlike static spirals, this animation varies the rotation per point, creating a dynamic, ever-evolving visual effect with rainbow-like color transitions.

### Key Features
- Dynamic per-point rotation angle
- Trigonometric color generation
- Variable stroke weight based on position
- Motion blur effect through alpha channel
- Full-window responsive canvas

### Visual Effect
The animation creates a sense of continuous motion where:
- Points rotate at different rates
- Colors shift based on angle relationships
- Trailing effect produces organic flowing forms
- Result resembles cosmic or biological structures

---

## 2. User Controls

### Current Parameters (Constants)
| Parameter | Type | Value | Description |
|-----------|------|-------|-------------|
| pN | number | windowWidth/3 | Number of points |
| thet | number | 5 | Base rotation angle |
| Animation | - | 60fps | Frame rate |

### ToolBase Controls (Proposed)
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Point Count | slider | 50-500 | 200 | Number of spiral points |
| Base Angle | slider | 0-360 | 5 | Initial rotation offset |
| Animation Speed | slider | 0.01-0.5 | 0.1 | Angle increment per frame |
| Trail Length | slider | 1-50 | 5 | Alpha for motion blur (lower = longer) |
| Play/Pause | button | - | - | Toggle animation |

---

## 3. Functional Requirements

### Core Behavior
1. **Spiral Generation:** Points distributed from center outward
2. **Per-Point Rotation:** Each point rotated by (baseAngle × index)
3. **Color Generation:** Trigonometric functions create rainbow effect
4. **Motion Blur:** Semi-transparent background creates trails
5. **Continuous Loop:** Base angle increments each frame

### Spiral Formula
```javascript
for (let p = 0; p <= pN; p++) {
  let r = ((height + width) / (2 * pN)) * p;  // Radius increases linearly
  let rot = thet * p;                          // Rotation multiplied by index
  let pX = r * cos(rot) + width / 2;
  let pY = r * sin(rot) + height / 2;
  
  // Color from trig functions of angle relationships
  fill(abs(thet-p), sin(thet/p)*255, tan(p/thet)*255);
  point(pX, pY);
}

// Motion blur - semi-transparent black overlay
background(0, 5);

// Increment angle
thet += 0.1;
```

### Color Algorithm
- **Red:** `abs(theta - pointIndex)`
- **Green:** `sin(theta / pointIndex) * 255`
- **Blue:** `tan(pointIndex / theta) * 255`

Creates unpredictable but smooth color transitions.

---

## 4. Technical Architecture

### Source Analysis
```javascript
function setup() {
  createCanvas(windowWidth, windowHeight);
  frameRate(60);
  pN = windowWidth / 3;
  background(0);
}

function draw() {
  // Wrap angle at 360
  if (thet == 360) {
    thet = 0;
  }
  
  for (let p = 0; p <= pN; p++) {
    let r = ((height + width) / (2 * pN)) * p;
    let rot = thet * p;
    let pX = r * cos(rot) + width / 2;
    let pY = r * sin(rot) + height / 2;
    
    // Trigonometric color generation
    fill(abs(thet-p), sin(thet/p)*255, tan(p/thet)*255);
    strokeWeight(sin(p) * 3);
    stroke((abs(p-thet), sin(p/thet)*255, tan(thet/p)*255));
    point(pX, pY);
  }
  
  // Motion blur
  background(0, 5);
  thet += 0.1;
}
```

### Dependencies
- p5.js (currently)
- AnimationFoundation.AnimationLoop (after conversion)

### Performance Notes
- Many points per frame (200-500)
- Simple math operations (fast)
- Alpha blending for trails (moderate cost)

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[SPIRAL]
  └─ Geometry
      └─ [slider] Point Count (50-500, default: 200)
      └─ [value] Current Angle (display)

[ANIMATION]
  └─ Control
      └─ [button] Play/Pause
      └─ [button] Reset
      └─ [slider] Speed (0.01-0.5, default: 0.1)
  └─ Trail
      └─ [slider] Trail Alpha (1-50, default: 5)

[COLORS]
  └─ Mode
      └─ [dropdown] Color Mode (Trig/Rainbow/Mono)
      └─ [color] Background (#000000)

[EXPORT]
  └─ Download
      └─ [button] Export Current Frame
```

### Animation Implementation
```javascript
onInit: function(values) {
  const self = this;
  this.theta = values.baseAngle;
  
  // Clear to black initially
  const ctx = this.getContext();
  const canvas = this.getCanvas();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  this.animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: () => {
      self.drawFrame();
    }
  });
  this.animator.start();
},

drawFrame: function() {
  const ctx = this.getContext();
  const canvas = this.getCanvas();
  const values = this.getValues();
  
  const pN = values.pointCount;
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  
  for (let p = 0; p <= pN; p++) {
    const r = ((canvas.height + canvas.width) / (2 * pN)) * p;
    const rot = this.theta * p;
    const pX = r * Math.cos(rot) + centerX;
    const pY = r * Math.sin(rot) + centerY;
    
    // Trig color generation
    const red = Math.abs(this.theta - p) % 256;
    const green = Math.abs(Math.sin(this.theta / p) * 255);
    const blue = Math.abs(Math.tan(p / this.theta) * 255) % 256;
    
    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
    ctx.beginPath();
    ctx.arc(pX, pY, Math.abs(Math.sin(p)) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Motion blur
  ctx.fillStyle = `rgba(0, 0, 0, ${values.trailAlpha / 255})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  this.theta += values.speed;
  if (this.theta >= 360) this.theta = 0;
}
```

---

## 6. Visual Design

### Layout
- Full canvas animation
- Minimal sidebar
- Black background

### Color Scheme
- Black background essential for effect
- Rainbow colors from trig functions
- Trails create gradient effects

### Animation Aesthetic
- Organic, flowing motion
- Psychedelic color shifts
- Hypnotic repetitive patterns

---

## 7. Testing Checklist

### Functional Tests
- [ ] Animation plays at target fps
- [ ] Play/pause works correctly
- [ ] Reset clears canvas and angle
- [ ] Speed slider affects animation rate
- [ ] Trail alpha changes blur intensity

### Visual Tests
- [ ] Spiral remains centered
- [ ] Colors vary smoothly
- [ ] Trail effect visible
- [ ] No artifacts at angle wrap (360→0)

### Performance Tests
- [ ] 60fps maintained
- [ ] No memory growth
- [ ] Responsive window resize

---

## 8. References

### Mathematical Background
- **Archimedean Spiral:** r = a + bθ variant
- **Per-Point Rotation:** Creates spiral arm effect
- **Trigonometric Colors:** Smooth cycling through spectrum

### Implementation References
- Source: `reference/tools/p5.js/SpinSpiral_2025_09_12_01_27_53/sketch.js`

### Related Tools
- [Phyllo Plane Animated](#phyllo-plane-animated) - Different animation style
- [Circles](#circles) - Circular animation patterns

