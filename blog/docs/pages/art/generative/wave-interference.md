# Wave Interference 2

**Type:** Generative Art / Tool  
**Category:** Spatial Pattern Visualization  
**Status:** Requires Conversion (Vanilla JS → ToolBase)  
**Source:** `reference/QuickToolRebuildReference/Generative Art/wave-interferance-2/dist/script.js`

---

## 1. Overview

Real-time spatial wave equation visualizer with GPU acceleration. Renders binary (black/white) interference patterns from composable radial (R), horizontal (X), and vertical (Y) wave functions. Features preset landmarks, animation system, and checkpoint sequencing.

### Key Features
- Three independent equation components: R(r), X(x), Y(y)
- Each component has 2 wave terms + 1 modulation term
- Configurable amplitude, frequency, power, phase, offset, wave type
- Blend modes: sum or multiply of R + X + Y
- WebGL rendering for performance (CPU fallback)
- Checkpoint system for saving/loading states
- Phase animation with per-parameter speed/direction
- Sequence animation interpolates between checkpoints
- 13 preset landmarks for interesting patterns

### Mathematical Foundation
Each axis component follows the pattern:
```
R(r) = A₁·wave^p₁(f₁·2π·r + φ₁) + O₁ + A₂·wave^p₂(f₂·2π·r + φ₂) + O₂ + M·sin^pm₁·cos^pm₂
X(x) = (same pattern with x)
Y(y) = (same pattern with y)

Final: value = R(r) ⊕ X(x) ⊕ Y(y) > 0 ? white : black
```
Where ⊕ is either sum (+) or multiply (×)

---

## 2. User Controls

### R(r) Radial Component - Term 1
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ar1 | slider | -2 | 2 | 0.1 | 1 | R amplitude, term 1 |
| fr1 | slider | 0 | 50 | 0.5 | 20 | R frequency, term 1 |
| pr1 | slider | -7 | 7 | 0.1 | 1 | R power, term 1 |
| phi_r1 | slider | -6.28 | 6.28 | 0.01 | 0 | R phase, term 1 |
| Or1 | slider | -2 | 2 | 0.1 | 0 | R offset, term 1 |
| wave_r1 | toggle | sin | cos | - | sin | R wave function, term 1 |

### R(r) Radial Component - Term 2
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ar2 | slider | -2 | 2 | 0.1 | 0 | R amplitude, term 2 |
| fr2 | slider | 0 | 50 | 0.5 | 1 | R frequency, term 2 |
| pr2 | slider | -7 | 7 | 0.1 | 1 | R power, term 2 |
| phi_r2 | slider | -6.28 | 6.28 | 0.01 | 0 | R phase, term 2 |
| Or2 | slider | -2 | 2 | 0.1 | 0 | R offset, term 2 |
| wave_r2 | toggle | sin | cos | - | sin | R wave function, term 2 |

### R(r) Radial Component - Modulation
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Mr | slider | -2 | 2 | 0.1 | 0 | R modulation amplitude |
| frm1 | slider | 0 | 50 | 0.5 | 1 | R mod frequency 1 |
| prm1 | slider | -7 | 7 | 0.1 | 1 | R mod power 1 |
| phi_rm1 | slider | -6.28 | 6.28 | 0.01 | 0 | R mod phase 1 |
| frm2 | slider | 0 | 50 | 0.5 | 1 | R mod frequency 2 |
| prm2 | slider | -7 | 7 | 0.1 | 1 | R mod power 2 |
| phi_rm2 | slider | -6.28 | 6.28 | 0.01 | 0 | R mod phase 2 |

### X(x) Horizontal Component - Term 1
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ax1 | slider | -2 | 2 | 0.1 | 0 | X amplitude, term 1 |
| fx1 | slider | 0 | 50 | 0.5 | 1 | X frequency, term 1 |
| px1 | slider | -7 | 7 | 0.1 | 1 | X power, term 1 |
| phi_x1 | slider | -6.28 | 6.28 | 0.01 | 0 | X phase, term 1 |
| Ox1 | slider | -2 | 2 | 0.1 | 0 | X offset, term 1 |
| wave_x1 | toggle | sin | cos | - | sin | X wave function, term 1 |

### X(x) Horizontal Component - Term 2
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ax2 | slider | -2 | 2 | 0.1 | 0 | X amplitude, term 2 |
| fx2 | slider | 0 | 50 | 0.5 | 1 | X frequency, term 2 |
| px2 | slider | -7 | 7 | 0.1 | 1 | X power, term 2 |
| phi_x2 | slider | -6.28 | 6.28 | 0.01 | 0 | X phase, term 2 |
| Ox2 | slider | -2 | 2 | 0.1 | 0 | X offset, term 2 |
| wave_x2 | toggle | sin | cos | - | sin | X wave function, term 2 |

### X(x) Horizontal Component - Modulation
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Mx | slider | -2 | 2 | 0.1 | 0 | X modulation amplitude |
| fxm1 | slider | 0 | 50 | 0.5 | 1 | X mod frequency 1 |
| pxm1 | slider | -7 | 7 | 0.1 | 1 | X mod power 1 |
| phi_xm1 | slider | -6.28 | 6.28 | 0.01 | 0 | X mod phase 1 |
| fxm2 | slider | 0 | 50 | 0.5 | 1 | X mod frequency 2 |
| pxm2 | slider | -7 | 7 | 0.1 | 1 | X mod power 2 |
| phi_xm2 | slider | -6.28 | 6.28 | 0.01 | 0 | X mod phase 2 |

### Y(y) Vertical Component - Term 1
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ay1 | slider | -2 | 2 | 0.1 | 0 | Y amplitude, term 1 |
| fy1 | slider | 0 | 50 | 0.5 | 1 | Y frequency, term 1 |
| py1 | slider | -7 | 7 | 0.1 | 1 | Y power, term 1 |
| phi_y1 | slider | -6.28 | 6.28 | 0.01 | 0 | Y phase, term 1 |
| Oy1 | slider | -2 | 2 | 0.1 | 0 | Y offset, term 1 |
| wave_y1 | toggle | sin | cos | - | sin | Y wave function, term 1 |

### Y(y) Vertical Component - Term 2
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ay2 | slider | -2 | 2 | 0.1 | 0 | Y amplitude, term 2 |
| fy2 | slider | 0 | 50 | 0.5 | 1 | Y frequency, term 2 |
| py2 | slider | -7 | 7 | 0.1 | 1 | Y power, term 2 |
| phi_y2 | slider | -6.28 | 6.28 | 0.01 | 0 | Y phase, term 2 |
| Oy2 | slider | -2 | 2 | 0.1 | 0 | Y offset, term 2 |
| wave_y2 | toggle | sin | cos | - | sin | Y wave function, term 2 |

### Y(y) Vertical Component - Modulation
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| My | slider | -2 | 2 | 0.1 | 0 | Y modulation amplitude |
| fym1 | slider | 0 | 50 | 0.5 | 1 | Y mod frequency 1 |
| pym1 | slider | -7 | 7 | 0.1 | 1 | Y mod power 1 |
| phi_ym1 | slider | -6.28 | 6.28 | 0.01 | 0 | Y mod phase 1 |
| fym2 | slider | 0 | 50 | 0.5 | 1 | Y mod frequency 2 |
| pym2 | slider | -7 | 7 | 0.1 | 1 | Y mod power 2 |
| phi_ym2 | slider | -6.28 | 6.28 | 0.01 | 0 | Y mod phase 2 |

### Global Controls
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| scale | slider | 50 | 500 | 10 | 300 | Zoom level |
| rotation | slider | 0 | 360 | 1 | 0 | Canvas rotation degrees |
| blendMode | toggle | sum | multiply | - | sum | How R, X, Y combine |

### Actions
| Control | Type | Description |
|---------|------|-------------|
| Landmark | dropdown | 13 preset configurations |
| Save Checkpoint | button | Save current state |
| Start Animation | button | Begin sequence playback |
| Loop | toggle | Enable sequence looping |
| Export SVG | button | Download vector pattern |

---

## 3. Functional Requirements

### Core Behavior
1. **Equation Evaluation:** Calculate R(r), X(x), Y(y) for each pixel
2. **Blending:** Combine axes via sum or multiply
3. **Thresholding:** Binary output (black/white) based on sign
4. **GPU Rendering:** WebGL fragment shader for performance
5. **CPU Fallback:** ImageData rendering when WebGL unavailable

### Equation Evaluation
```javascript
class SpatialEquation {
    evaluate(r, x, y) {
        const safePow = (base, exp) => {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            return Math.sign(base) * Math.pow(Math.abs(base), exp);
        };
        
        const wave = (type, val) => type === 'sin' ? Math.sin(val) : Math.cos(val);
        
        // R component (radial distance from center)
        const R = this.Ar1 * safePow(wave(this.wave_r1, this.fr1 * 2 * Math.PI * r + this.phi_r1), this.pr1) + this.Or1 +
                  this.Ar2 * safePow(wave(this.wave_r2, this.fr2 * 2 * Math.PI * r + this.phi_r2), this.pr2) + this.Or2 +
                  this.Mr * safePow(Math.sin(this.frm1 * 2 * Math.PI * r + this.phi_rm1), this.prm1) *
                           safePow(Math.cos(this.frm2 * 2 * Math.PI * r + this.phi_rm2), this.prm2);
        
        // X component (horizontal position)
        const X = this.Ax1 * safePow(wave(this.wave_x1, this.fx1 * 2 * Math.PI * x + this.phi_x1), this.px1) + this.Ox1 +
                  this.Ax2 * safePow(wave(this.wave_x2, this.fx2 * 2 * Math.PI * x + this.phi_x2), this.px2) + this.Ox2 +
                  this.Mx * safePow(Math.sin(this.fxm1 * 2 * Math.PI * x + this.phi_xm1), this.pxm1) *
                           safePow(Math.cos(this.fxm2 * 2 * Math.PI * x + this.phi_xm2), this.pxm2);
        
        // Y component (vertical position)
        const Y = this.Ay1 * safePow(wave(this.wave_y1, this.fy1 * 2 * Math.PI * y + this.phi_y1), this.py1) + this.Oy1 +
                  this.Ay2 * safePow(wave(this.wave_y2, this.fy2 * 2 * Math.PI * y + this.phi_y2), this.py2) + this.Oy2 +
                  this.My * safePow(Math.sin(this.fym1 * 2 * Math.PI * y + this.phi_ym1), this.pym1) *
                           safePow(Math.cos(this.fym2 * 2 * Math.PI * y + this.phi_ym2), this.pym2);
        
        // Blend
        if (this.blendMode === 'multiply') {
            return R * X * Y;
        }
        return R + X + Y;
    }
}
```

### Rendering
```javascript
function cpuRender(ctx, canvas, values) {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const equation = new SpatialEquation(values);
    const scale = values.scale;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    for (let py = 0; py < canvas.height; py++) {
        for (let px = 0; px < canvas.width; px++) {
            const x = (px - cx) / scale;
            const y = (py - cy) / scale;
            const r = Math.sqrt(x * x + y * y);
            
            const value = equation.evaluate(r, x, y);
            const color = value > 0 ? 255 : 0;
            
            const i = (py * canvas.width + px) * 4;
            imageData.data[i] = color;
            imageData.data[i + 1] = color;
            imageData.data[i + 2] = color;
            imageData.data[i + 3] = 255;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
}
```

---

## 4. Technical Architecture

### Dependencies
- Canvas 2D (CPU fallback)
- WebGL (GPU acceleration)
- AnimationFoundation.AnimationLoop (for animation)

### State Management
```javascript
let state = {
    // R Term 1
    Ar1: 1, fr1: 20, pr1: 1, phi_r1: 0, Or1: 0, wave_r1: 'sin',
    // R Term 2
    Ar2: 0, fr2: 1, pr2: 1, phi_r2: 0, Or2: 0, wave_r2: 'sin',
    // R Modulation
    Mr: 0, frm1: 1, prm1: 1, phi_rm1: 0, frm2: 1, prm2: 1, phi_rm2: 0,
    
    // X Term 1
    Ax1: 0, fx1: 1, px1: 1, phi_x1: 0, Ox1: 0, wave_x1: 'sin',
    // X Term 2
    Ax2: 0, fx2: 1, px2: 1, phi_x2: 0, Ox2: 0, wave_x2: 'sin',
    // X Modulation
    Mx: 0, fxm1: 1, pxm1: 1, phi_xm1: 0, fxm2: 1, pxm2: 1, phi_xm2: 0,
    
    // Y Term 1
    Ay1: 0, fy1: 1, py1: 1, phi_y1: 0, Oy1: 0, wave_y1: 'sin',
    // Y Term 2
    Ay2: 0, fy2: 1, py2: 1, phi_y2: 0, Oy2: 0, wave_y2: 'sin',
    // Y Modulation
    My: 0, fym1: 1, pym1: 1, phi_ym1: 0, fym2: 1, pym2: 1, phi_ym2: 0,
    
    // Global
    scale: 300, rotation: 0, blendMode: 'sum'
};

// Checkpoint system
let checkpoints = [];
let animationState = { playing: false, currentIndex: 0 };
```

### WebGL Shader (Fragment)
```glsl
precision mediump float;
uniform vec2 u_resolution;
uniform float u_scale;
// ... 57 uniform parameters for equation

float safePow(float base, float exp) {
    if (abs(base) < 0.000001 && exp < 0.0) return 0.0;
    return sign(base) * pow(abs(base), exp);
}

void main() {
    vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_scale;
    float r = length(uv);
    float x = uv.x;
    float y = uv.y;
    
    // Calculate R, X, Y components
    float R = u_Ar1 * safePow(sin(u_fr1 * 6.28318 * r + u_phi_r1), u_pr1) + u_Or1;
    // ... full equation
    
    float value = u_blendMode < 0.5 ? R + X + Y : R * X * Y;
    float color = value > 0.0 ? 1.0 : 0.0;
    
    gl_FragColor = vec4(vec3(color), 1.0);
}
```

---

## 5. ToolBase Conversion Plan

### Sidebar Structure
```
[R(r)]
  └─ Term 1
      └─ [slider] Ar₁ (-2 to 2, step: 0.1, default: 1, key: Ar1)
      └─ [slider] fr₁ (0 to 50, step: 0.5, default: 20, key: fr1)
      └─ [slider] pr₁ (-7 to 7, step: 0.1, default: 1, key: pr1)
      └─ [slider] φr₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_r1)
      └─ [slider] Or₁ (-2 to 2, step: 0.1, default: 0, key: Or1)
      └─ [toggle] wave₁ (sin/cos, key: wave_r1)
  └─ Term 2
      └─ [slider] Ar₂ (-2 to 2, step: 0.1, default: 0, key: Ar2)
      └─ [slider] fr₂ (0 to 50, step: 0.5, default: 1, key: fr2)
      └─ [slider] pr₂ (-7 to 7, step: 0.1, default: 1, key: pr2)
      └─ [slider] φr₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_r2)
      └─ [slider] Or₂ (-2 to 2, step: 0.1, default: 0, key: Or2)
      └─ [toggle] wave₂ (sin/cos, key: wave_r2)
  └─ Modulation
      └─ [slider] Mr (-2 to 2, step: 0.1, default: 0, key: Mr)
      └─ [slider] frm₁ (0 to 50, step: 0.5, default: 1, key: frm1)
      └─ [slider] prm₁ (-7 to 7, step: 0.1, default: 1, key: prm1)
      └─ [slider] φrm₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_rm1)
      └─ [slider] frm₂ (0 to 50, step: 0.5, default: 1, key: frm2)
      └─ [slider] prm₂ (-7 to 7, step: 0.1, default: 1, key: prm2)
      └─ [slider] φrm₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_rm2)

[X(x)]
  └─ Term 1
      └─ [slider] Ax₁ (-2 to 2, step: 0.1, default: 0, key: Ax1)
      └─ [slider] fx₁ (0 to 50, step: 0.5, default: 1, key: fx1)
      └─ [slider] px₁ (-7 to 7, step: 0.1, default: 1, key: px1)
      └─ [slider] φx₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_x1)
      └─ [slider] Ox₁ (-2 to 2, step: 0.1, default: 0, key: Ox1)
      └─ [toggle] wave₁ (sin/cos, key: wave_x1)
  └─ Term 2
      └─ [slider] Ax₂ (-2 to 2, step: 0.1, default: 0, key: Ax2)
      └─ [slider] fx₂ (0 to 50, step: 0.5, default: 1, key: fx2)
      └─ [slider] px₂ (-7 to 7, step: 0.1, default: 1, key: px2)
      └─ [slider] φx₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_x2)
      └─ [slider] Ox₂ (-2 to 2, step: 0.1, default: 0, key: Ox2)
      └─ [toggle] wave₂ (sin/cos, key: wave_x2)
  └─ Modulation
      └─ [slider] Mx (-2 to 2, step: 0.1, default: 0, key: Mx)
      └─ [slider] fxm₁ (0 to 50, step: 0.5, default: 1, key: fxm1)
      └─ [slider] pxm₁ (-7 to 7, step: 0.1, default: 1, key: pxm1)
      └─ [slider] φxm₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_xm1)
      └─ [slider] fxm₂ (0 to 50, step: 0.5, default: 1, key: fxm2)
      └─ [slider] pxm₂ (-7 to 7, step: 0.1, default: 1, key: pxm2)
      └─ [slider] φxm₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_xm2)

[Y(y)]
  └─ Term 1
      └─ [slider] Ay₁ (-2 to 2, step: 0.1, default: 0, key: Ay1)
      └─ [slider] fy₁ (0 to 50, step: 0.5, default: 1, key: fy1)
      └─ [slider] py₁ (-7 to 7, step: 0.1, default: 1, key: py1)
      └─ [slider] φy₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_y1)
      └─ [slider] Oy₁ (-2 to 2, step: 0.1, default: 0, key: Oy1)
      └─ [toggle] wave₁ (sin/cos, key: wave_y1)
  └─ Term 2
      └─ [slider] Ay₂ (-2 to 2, step: 0.1, default: 0, key: Ay2)
      └─ [slider] fy₂ (0 to 50, step: 0.5, default: 1, key: fy2)
      └─ [slider] py₂ (-7 to 7, step: 0.1, default: 1, key: py2)
      └─ [slider] φy₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_y2)
      └─ [slider] Oy₂ (-2 to 2, step: 0.1, default: 0, key: Oy2)
      └─ [toggle] wave₂ (sin/cos, key: wave_y2)
  └─ Modulation
      └─ [slider] My (-2 to 2, step: 0.1, default: 0, key: My)
      └─ [slider] fym₁ (0 to 50, step: 0.5, default: 1, key: fym1)
      └─ [slider] pym₁ (-7 to 7, step: 0.1, default: 1, key: pym1)
      └─ [slider] φym₁ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_ym1)
      └─ [slider] fym₂ (0 to 50, step: 0.5, default: 1, key: fym2)
      └─ [slider] pym₂ (-7 to 7, step: 0.1, default: 1, key: pym2)
      └─ [slider] φym₂ (-6.28 to 6.28, step: 0.01, default: 0, key: phi_ym2)

[GLOBAL]
  └─ View
      └─ [slider] Scale (50 to 500, step: 10, default: 300, key: scale)
      └─ [slider] Rotation (0 to 360, step: 1, default: 0, key: rotation)
      └─ [toggle] Blend (sum/multiply, key: blendMode)
  └─ Presets
      └─ [dropdown] Landmark (13 presets, key: landmark)

[ANIMATION]
  └─ Checkpoints
      └─ [button] Save Checkpoint (key: saveCheckpoint)
      └─ [button] Clear Checkpoints (key: clearCheckpoints)
      └─ [value] Checkpoints: 0 (display)
  └─ Playback
      └─ [button] Play Sequence (key: playSequence)
      └─ [button] Stop (key: stopSequence)
      └─ [toggle] Loop (key: sequenceLoop)

[EXPORT]
  └─ Download
      └─ [button] Export PNG (key: exportPng)
      └─ [button] Export SVG (key: exportSvg)
```

---

## 6. Visual Design

### Layout
- Large square canvas
- Four-tab sidebar (R, X, Y, Global/Animation)
- Binary black/white output

### Color Scheme
- Pure black (#000000) and white (#FFFFFF)
- No grayscale or color gradients

### Performance
- WebGL shader: 100x faster than CPU
- Target 60fps for animation
- Debounce parameter changes for high point counts

---

## 7. Testing Checklist

### Functional Tests
- [ ] All 57 equation parameters work correctly
- [ ] sin/cos toggle affects wave shape
- [ ] Scale zoom works
- [ ] Rotation transforms pattern
- [ ] Sum blend mode adds R+X+Y
- [ ] Multiply blend mode multiplies R×X×Y
- [ ] All 13 landmarks load correctly
- [ ] Checkpoint save/load works
- [ ] Sequence animation interpolates smoothly

### Visual Tests
- [ ] Binary output (only black and white)
- [ ] Pattern centered in canvas
- [ ] No artifacts at extreme frequencies
- [ ] Smooth gradients in wave transitions

### Performance Tests
- [ ] WebGL renders at 60fps
- [ ] CPU fallback functional
- [ ] No memory leaks in animation

### Export Tests
- [ ] PNG captures full resolution
- [ ] SVG maintains vector quality

---

## 8. References

### Mathematical Background
- **Wave Interference:** Superposition of wave functions
- **Spatial Equations:** Position-dependent wave evaluation
- **Binary Thresholding:** Sign-based output

### Implementation References
- Source: `reference/QuickToolRebuildReference/Generative Art/wave-interferance-2/dist/script.js`

### Related Tools
- [Lissajous](#lissajous) - Parametric curve visualization
- [Cymatics](#cymatics) - Sound-based wave patterns
