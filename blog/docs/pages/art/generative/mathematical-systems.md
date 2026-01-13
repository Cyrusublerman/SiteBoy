# Mathematical & Functional Systems Reference

This document catalogs all mathematical functions, algorithms, and systems used across the generative art tools. Use this to identify shared code opportunities and ensure consistency.

---

## 1. Core Math Utilities

### safePow(base, exp)
**Used in:** wave-interference, lissajous, harmonics, torus
**Purpose:** Safe power function handling negative bases with fractional exponents

```javascript
function safePow(base, exp) {
    if (Math.abs(base) < 1e-9 && exp < 0) return 0;
    if (Math.abs(exp - 1) < 1e-9) return base;
    if (Math.abs(exp) < 1e-9) return 1;
    var sign = base >= 0 ? 1 : -1;
    var result = sign * Math.pow(Math.abs(base), exp);
    if (!isFinite(result) || isNaN(result)) return 0;
    return result;
}
```

**Status:** Should be in `shared/utils/math.js`

---

### clamp(value, min, max)
**Used in:** All tools with sliders
**Purpose:** Constrain value to range

```javascript
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
```

**Status:** Should be in `shared/utils/math.js`

---

### lerp(a, b, t)
**Used in:** Animation interpolation, color blending
**Purpose:** Linear interpolation

```javascript
function lerp(a, b, t) {
    return a + (b - a) * t;
}
```

**Status:** Should be in `shared/utils/math.js`

---

### map(value, inMin, inMax, outMin, outMax)
**Used in:** Coordinate transforms, value scaling
**Purpose:** Map value from one range to another

```javascript
function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}
```

**Status:** Should be in `shared/utils/math.js`

---

## 2. Easing Functions

### Cubic Easing
**Used in:** squares, wave-interference
**Purpose:** Smooth acceleration/deceleration

```javascript
const easeIn = t => t * t * t;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeInOut = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
```

### Smoothstep
**Used in:** wave-interference checkpoint interpolation
**Purpose:** Smooth S-curve interpolation

```javascript
function smoothstep(t) {
    return t * t * (3 - 2 * t);
}
```

**Status:** Should be in `shared/utils/easing.js`

---

## 3. Wave Functions

### Standard Wave Evaluation
**Used in:** wave-interference, lissajous, harmonics
**Purpose:** Evaluate wave equations

```javascript
function wave(type, val) {
    return type === 'cos' ? Math.cos(val) : Math.sin(val);
}
```

### Parametric Equation Pattern
**Used in:** lissajous, harmonics, wave-interference
**Structure:**
```
Term = A × wave^p(ω × 2π × t + φ) + O
```

Where:
- `A` = Amplitude (-2 to 2)
- `ω` = Frequency (angular)
- `p` = Power (for superellipse effects)
- `φ` = Phase offset
- `O` = DC offset

---

## 4. Coordinate Systems

### Cartesian to Polar
**Used in:** wave-interference, circles, torus
```javascript
const r = Math.sqrt(x * x + y * y);
const theta = Math.atan2(y, x);
```

### Polar to Cartesian
**Used in:** circles, spirals
```javascript
const x = r * Math.cos(theta);
const y = r * Math.sin(theta);
```

### Normalized Coordinates
**Used in:** All canvas tools
```javascript
const nx = x / width;    // 0 to 1
const ny = y / height;   // 0 to 1
const cx = 0.5;          // Center
const dist = Math.sqrt((nx-cx)*(nx-cx) + (ny-cy)*(ny-cy));
```

---

## 5. Spiral Generation

### Rectangular Spiral Path
**Used in:** squares
**Purpose:** Generate spiral traversal order for grid

```javascript
function generateSpiral(GRID) {
    const path = [];
    let left = 0, right = GRID - 1, top = 0, bottom = GRID - 1;
    
    while (left <= right && top <= bottom) {
        for (let col = left; col <= right; col++) path.push([col, top]);
        top++;
        for (let row = top; row <= bottom; row++) path.push([right, row]);
        right--;
        if (top <= bottom) {
            for (let col = right; col >= left; col--) path.push([col, bottom]);
            bottom--;
        }
        if (left <= right) {
            for (let row = bottom; row >= top; row--) path.push([left, row]);
            left++;
        }
    }
    return path;
}
```

### Archimedean Spiral
**Used in:** spirals, phyllo
```javascript
const r = a + b * theta;
const x = r * Math.cos(theta);
const y = r * Math.sin(theta);
```

---

## 6. Hash Functions

### Spatial Hash
**Used in:** squares (randomFlicker)
**Purpose:** Deterministic pseudo-random per cell

```javascript
function hash(x, y) {
    let h = x * 374761393 + y * 668265263;
    h = (h ^ (h >>> 13)) * 1274126177;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
```

---

## 7. Envelope Functions

### Fade In/Out Envelope
**Used in:** squares effects
**Purpose:** Smooth effect boundaries

```javascript
function envelope(localT, duration) {
    const fadeTime = Math.min(1, duration * 0.1);
    if (localT < fadeTime) return easeInOut(localT / fadeTime);
    if (localT > duration - fadeTime) return easeInOut((duration - localT) / fadeTime);
    return 1;
}
```

---

## 8. Color Systems

### Grayscale from Value
**Used in:** wave-interference, squares
```javascript
const gray = value > 0 ? 255 : 0;  // Binary threshold
// OR
const gray = Math.floor(brightness * 255);  // Continuous
```

### VGA Color Palette
**Required for all tools** - Use CSS variables only:
- `var(--vga-black)` through `var(--vga-white)`
- `var(--c-bg)`, `var(--c-text)`, `var(--c-border)`, `var(--c-accent)`

---

## 9. Animation Timing

### Frame-Based Time
**Used in:** All animated tools
```javascript
time += 1/60;  // 60 FPS assumption
// OR
time += deltaTime;  // Actual frame delta
```

### Cycle/Loop Handling
**Used in:** squares, wave-interference
```javascript
const cycleDuration = 240;  // seconds
const cycleTime = time % cycleDuration;
const cycleProgress = cycleTime / cycleDuration;
```

### Phase Calculation
```javascript
const phase = (localT / duration) * cycles * Math.PI * 2;
```

---

## 10. Interpolation Systems

### Parameter Interpolation
**Used in:** wave-interference checkpoints
```javascript
function interpolateParams(paramsA, paramsB, t) {
    const result = {};
    Object.keys(paramsA).forEach(key => {
        const a = paramsA[key];
        const b = paramsB[key];
        // Handle strings (wave type, blend mode)
        if (typeof a === 'string') {
            result[key] = t < 0.5 ? a : b;
        } else {
            result[key] = a + (b - a) * t;
        }
    });
    return result;
}
```

---

## 11. Grid Patterns

### Checkerboard
```javascript
const isWhite = (col + row) % 2 === 0;
```

### Stripes
```javascript
const isWhite = row % 2 === 0;  // Horizontal
const isWhite = col % 2 === 0;  // Vertical
```

### Café Wall Illusion
```javascript
const offset = row % 2 === 0 ? 0 : 0.5;
const isWhite = Math.floor(col + offset) % 2 === 0;
```

### Diagonal Stripes
```javascript
const isWhite = (col + row) % 4 < 2;
```

---

## 12. WebGL Patterns

### Shader Setup Pattern
**Used in:** wave-interference, cymatics
```javascript
// Vertex shader
attribute vec2 a_position;
varying vec2 v_coord;
void main() {
    v_coord = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
}

// Fragment shader
precision highp float;
varying vec2 v_coord;
uniform vec2 u_resolution;
// ... uniforms for parameters
void main() {
    vec2 coord = v_coord * u_resolution * 0.5 / u_scale;
    // ... equation evaluation
    gl_FragColor = vec4(vec3(color), 1.0);
}
```

### Uniform Setting Pattern
```javascript
gl.uniform1f(gl.getUniformLocation(program, 'u_param'), value);
gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), w, h);
```

---

## 13. Export Patterns

### Canvas to PNG
```javascript
const a = document.createElement('a');
a.href = canvas.toDataURL('image/png');
a.download = 'export-' + Date.now() + '.png';
a.click();
```

### Canvas to SVG (raster approximation)
```javascript
// Sample pixels and generate path data
const paths = [];
for (let y = 0; y < h; y += resolution) {
    for (let x = 0; x < w; x += resolution) {
        if (isBlack(x, y)) {
            paths.push(`M${x},${y} h${res} v${res} h-${res}Z`);
        }
    }
}
const svg = `<svg><path d="${paths.join(' ')}" fill="black"/></svg>`;
```

---

## Overlap Analysis

| Function | wave-int | lissajous | harmonics | squares | torus | circles |
|----------|:--------:|:---------:|:---------:|:-------:|:-----:|:-------:|
| safePow | ✓ | ✓ | ✓ | - | ✓ | - |
| lerp | ✓ | - | - | - | - | - |
| easeInOut | - | - | - | ✓ | - | - |
| smoothstep | ✓ | - | - | - | - | - |
| envelope | - | - | - | ✓ | - | - |
| hash | - | - | - | ✓ | - | - |
| spiralPath | - | - | - | ✓ | - | - |
| polar↔cart | ✓ | - | - | - | ✓ | ✓ |
| wave() | ✓ | ✓ | ✓ | - | - | - |
| WebGL | ✓ | - | - | - | - | - |

**Recommendation:** Extract to `shared/utils/`:
1. `math.js` - safePow, clamp, lerp, map
2. `easing.js` - easeIn, easeOut, easeInOut, smoothstep, envelope
3. `geometry.js` - polar/cartesian conversion, spiralPath
4. `wave.js` - wave function, parametric evaluation

