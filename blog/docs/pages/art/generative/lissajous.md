# Lissajous Family

**Type:** Generative Art  
**Category:** Parametric Curve Visualization  
**Status:** Requires Conversion (Vanilla JS → ToolBase)  
**Source Files:**
- `reference/QuickToolRebuildReference/Generative Art/Lassajous/harmonics/dist/script.js`
- `reference/QuickToolRebuildReference/Generative Art/Lassajous/lassajous-2/dist/script.js`
- `reference/QuickToolRebuildReference/Generative Art/Lassajous/lassajous-animation/dist/script.js`

---

## 1. Overview

Three variations of Lissajous curve visualization demonstrating the relationship between frequency ratios and visual patterns.

### Variants

**1. Harmonics**
Animates through musical interval ratios (unison→octave) with 4 view modes. Shows relationship between frequency ratios and visual patterns with time warp function that slows at harmonic ratios. 90-second pass × 8 passes = 720 second (12 min) cycle.

**2. Lissajous-2 (Interactive Editor)**
Full parametric equation editor with X/Y delta coupling. Features 27 preset landmarks, 50-state undo history, integer lock for power parameters, and live equation display.

**3. Lissajous-Animation**
Random walk through parameter space. Cycles through 30 parameters sequentially with smooth interpolation between random target values. Self-running demonstration mode.

### Mathematical Foundation
The general Lissajous equation used:
```
x(t) = A₁cos^p₁(ω₁t+φ₁) + A₂cos^p₂(ω₂t+φ₂) + M·cos^pm₁(ωm₁t+φm₁)·sin^pm₂(ωm₂t+φm₂)
y(t) = A₁sin^p₁(ω₁t+φ₁) + A₂sin^p₂(ω₂t+φ₂) + M·sin^pm₁(ωm₁t+φm₁)·cos^pm₂(ωm₂t+φm₂)
```

---

## 2. User Controls

### X Equation - Term 1
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ax1 | slider | -2 | 2 | 0.1 | 1 | X amplitude, term 1 |
| wx1 | slider | -300 | 300 | 1 | 1 | X angular frequency, term 1 |
| px1 | slider | -7 | 7 | 0.1 | 1 | X power exponent, term 1 |
| phi_x1 | slider | -6.28 | 6.28 | 0.01 | 0 | X phase offset, term 1 |

### X Equation - Term 2
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ax2 | slider | -2 | 2 | 0.1 | 0 | X amplitude, term 2 |
| wx2 | slider | -300 | 300 | 1 | 1 | X angular frequency, term 2 |
| px2 | slider | -7 | 7 | 0.1 | 1 | X power exponent, term 2 |
| phi_x2 | slider | -6.28 | 6.28 | 0.01 | 0 | X phase offset, term 2 |

### X Equation - Modulation
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Mx | slider | -2 | 2 | 0.1 | 0 | X modulation amplitude |
| wxm1 | slider | 0 | 600 | 1 | 0 | X modulation frequency 1 |
| pxm1 | slider | -7 | 7 | 0.1 | 1 | X modulation power 1 |
| phi_xm1 | slider | -6.28 | 6.28 | 0.01 | 0 | X modulation phase 1 |
| wxm2 | slider | 0 | 600 | 1 | 0 | X modulation frequency 2 |
| pxm2 | slider | -7 | 7 | 0.1 | 1 | X modulation power 2 |
| phi_xm2 | slider | -6.28 | 6.28 | 0.01 | 0 | X modulation phase 2 |

### Y Equation - Delta from X (Term 1)
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ay1_delta | slider | -4 | 4 | 0.1 | 0 | Y amplitude delta from Ax1 |
| wy1_delta | slider | -300 | 300 | 1 | 0 | Y frequency delta from wx1 |
| py1_delta | slider | -10 | 10 | 0.1 | 0 | Y power delta from px1 |
| phi_y1_delta | slider | -12.56 | 12.56 | 0.01 | 0 | Y phase delta from phi_x1 |

### Y Equation - Delta from X (Term 2)
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| Ay2_delta | slider | -4 | 4 | 0.1 | 0 | Y amplitude delta from Ax2 |
| wy2_delta | slider | -300 | 300 | 1 | 0 | Y frequency delta from wx2 |
| py2_delta | slider | -10 | 10 | 0.1 | 0 | Y power delta from px2 |
| phi_y2_delta | slider | -12.56 | 12.56 | 0.01 | 0 | Y phase delta from phi_x2 |

### Y Equation - Modulation
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| My | slider | -2 | 2 | 0.1 | 0 | Y modulation amplitude |
| wym1_delta | slider | -300 | 300 | 1 | 0 | Y mod freq 1 delta from wxm1 |
| pym1 | slider | -7 | 7 | 0.1 | 1 | Y modulation power 1 |
| phi_ym1_delta | slider | -12.56 | 12.56 | 0.01 | 0 | Y mod phase 1 delta |
| wym2_delta | slider | -300 | 300 | 1 | 0 | Y mod freq 2 delta from wxm2 |
| pym2 | slider | -7 | 7 | 0.1 | 1 | Y modulation power 2 |
| phi_ym2_delta | slider | -12.56 | 12.56 | 0.01 | 0 | Y mod phase 2 delta |

### Global Controls
| Control | Type | Min | Max | Step | Default | Description |
|---------|------|-----|-----|------|---------|-------------|
| rotation | slider | 0 | 360 | 1 | 0 | Curve rotation in degrees |
| scale | slider | 20 | 300 | 5 | 120 | Display scale factor |
| pointsPerCurve | slider | 1000 | 80000 | 1000 | 20000 | Curve resolution |

### Actions
| Control | Type | Description |
|---------|------|-------------|
| Landmark | dropdown | 27 preset configurations |
| Reset Y | button | Reset all Y deltas to 0 |
| Undo | button | Revert to previous state (50 max) |
| Export | button | Download current visualization |

---

## 3. Functional Requirements

### Core Behavior
1. **Equation Evaluation:** Calculate x(t) and y(t) for t ∈ [0, 2π]
2. **Safe Power:** Handle negative bases with fractional exponents
3. **Delta Coupling:** Y parameters as offsets from X for symmetric control
4. **Rotation Transform:** Apply rotation matrix to final coordinates
5. **Analysis:** Check coupling and integer frequencies

### Equation Evaluation
```javascript
class UniversalEquation {
    evaluate(t) {
        const safePow = (base, exp) => {
            if (Math.abs(base) < 1e-9 && exp < 0) return 0;
            return Math.sign(base) * Math.pow(Math.abs(base), exp);
        };
        
        const p = this;
        const x = p.Ax1 * safePow(Math.cos(p.wx1 * t + p.phi_x1), p.px1) +
                  p.Ax2 * safePow(Math.cos(p.wx2 * t + p.phi_x2), p.px2) +
                  p.Mx * safePow(Math.cos(p.wxm1 * t + p.phi_xm1), p.pxm1) * 
                         safePow(Math.sin(p.wxm2 * t + p.phi_xm2), p.pxm2);
        
        const y = p.Ay1 * safePow(Math.sin(p.wy1 * t + p.phi_y1), p.py1) +
                  p.Ay2 * safePow(Math.sin(p.wy2 * t + p.phi_y2), p.py2) +
                  p.My * safePow(Math.sin(p.wym1 * t + p.phi_ym1), p.pym1) * 
                         safePow(Math.cos(p.wym2 * t + p.phi_ym2), p.pym2);
        
        // Apply rotation if set
        if (this.rotation !== 0) {
            const rot = this.rotation * Math.PI / 180;
            return {
                x: x * Math.cos(rot) - y * Math.sin(rot),
                y: x * Math.sin(rot) + y * Math.cos(rot)
            };
        }
        return { x, y };
    }
}
```

### Delta Parameter Resolution
```javascript
function getFinalParams() {
    const p = paramState;
    return {
        // X parameters (direct)
        Ax1: p.Ax1, wx1: p.wx1, px1: p.px1, phi_x1: p.phi_x1,
        Ax2: p.Ax2, wx2: p.wx2, px2: p.px2, phi_x2: p.phi_x2,
        Mx: p.Mx, wxm1: p.wxm1, pxm1: p.pxm1, phi_xm1: p.phi_xm1,
        wxm2: p.wxm2, pxm2: p.pxm2, phi_xm2: p.phi_xm2,
        
        // Y parameters (X + delta)
        Ay1: p.Ax1 + p.Ay1_delta,
        wy1: p.wx1 + p.wy1_delta,
        py1: p.px1 + p.py1_delta,
        phi_y1: p.phi_x1 + p.phi_y1_delta,
        
        Ay2: p.Ax2 + p.Ay2_delta,
        wy2: p.wx2 + p.wy2_delta,
        py2: p.px2 + p.py2_delta,
        phi_y2: p.phi_x2 + p.phi_y2_delta,
        
        My: p.My,
        wym1: p.wxm1 + p.wym1_delta,
        pym1: p.pym1,
        phi_ym1: p.phi_xm1 + p.phi_ym1_delta,
        wym2: p.wxm2 + p.wym2_delta,
        pym2: p.pym2,
        phi_ym2: p.phi_xm2 + p.phi_ym2_delta,
        
        rotation: p.rotation
    };
}
```

### Analysis Functions
```javascript
// Check if X and Y share common frequencies (creates closed curves)
static checkCoupling(params) {
    const xFreqs = [], yFreqs = [];
    if (Math.abs(params.Ax1) > 0.01) xFreqs.push(params.wx1);
    if (Math.abs(params.Ax2) > 0.01) xFreqs.push(params.wx2);
    if (Math.abs(params.Mx) > 0.01) {
        xFreqs.push(params.wxm1);
        xFreqs.push(params.wxm2);
    }
    if (Math.abs(params.Ay1) > 0.01) yFreqs.push(params.wy1);
    if (Math.abs(params.Ay2) > 0.01) yFreqs.push(params.wy2);
    if (Math.abs(params.My) > 0.01) {
        yFreqs.push(params.wym1);
        yFreqs.push(params.wym2);
    }
    
    const shared = xFreqs.filter(xf => 
        yFreqs.some(yf => Math.abs(xf - yf) < 0.5)
    );
    return { valid: shared.length > 0 };
}

// Check if all frequencies are integers (produces closed curves)
static checkIntegerFrequencies(params) {
    const freqs = [
        params.wx1, params.wx2, params.wy1, params.wy2,
        params.wxm1, params.wxm2, params.wym1, params.wym2
    ].filter(f => f !== undefined);
    
    return freqs.every(f => Math.abs(f - Math.round(f)) < 0.01);
}
```

---

## 4. Technical Architecture

### Dependencies
- Canvas 2D rendering
- AnimationFoundation.AnimationLoop (for animation variants)

### State Management
```javascript
// Parameter state object
let paramState = {
    // X Term 1
    Ax1: 1, wx1: 1, px1: 1, phi_x1: 0,
    // X Term 2
    Ax2: 0, wx2: 1, px2: 1, phi_x2: 0,
    // X Modulation
    Mx: 0, wxm1: 0, pxm1: 1, phi_xm1: 0,
    wxm2: 0, pxm2: 1, phi_xm2: 0,
    // Y Deltas Term 1
    Ay1_delta: 0, wy1_delta: 0, py1_delta: 0, phi_y1_delta: 0,
    // Y Deltas Term 2
    Ay2_delta: 0, wy2_delta: 0, py2_delta: 0, phi_y2_delta: 0,
    // Y Modulation
    My: 0, wym1_delta: 0, pym1: 1, phi_ym1_delta: 0,
    wym2_delta: 0, pym2: 1, phi_ym2_delta: 0,
    // Global
    rotation: 0, scale: 120
};

// History stack for undo
let historyStack = [];  // Max 50 states
```

### Preset Landmarks (27 total)
| Name | Key Parameters |
|------|----------------|
| Complex Interference: 300hz | wxm2: 75, wym2: 300 |
| Asymmetric Flow: 3:5 | wx1: 3, wx2: 5 |
| Interference Pattern: 260hz | wxm1: 260 |
| Interference Pattern: 200hz | wxm2: 200, wym2: 200 |
| Woven Bloom: 120hz | wxm2: 120, wym2: 120 |
| Modulated Ring: 60hz | wx1: 60, wy1: 60 |
| Fine Web: 80hz | wxm2: 80, wy2: 80 |
| Quintic Static: 500hz | wx2: 500, px2: 5, py2: 3 |
| Quintic Filament: 250hz | wx2: 250, px2: 5, py2: 3 |
| Spiroform: 3:5 | wx1: 3, wx2: 5, wy1: 3 |
| Involute Rosette: 1:3 | wx2: 3, wy2: 3, Ay2: -1 |
| Involute Rosette: 1:5 | wx2: 5, wy2: 5, Ay2: -1 |
| Cubic Spiro: 1:7 | wx2: 7, px2: 3, py2: 3 |
| Asymmetric Flow: 1:5:7 | wx2: 5, wy2: 7 |
| Asymmetric Flow: 3:5:6 | wx1: 3, wx2: 5, wy2: 6 |
| Cubic Star: 1:2 | wx2: 2, px2: 3, py2: 3 |
| Rosette: 1:5 | wx2: 5, wy2: 5, Ax2: -1 |
| Rosette: 1:3 | wx2: 3, wy2: 3, Ax2: -1 |
| Offset Loop: 1:2:3 | wx2: 2, wy2: 3 |
| Dense Rosette: 1:10 | wx2: 10, wy2: 10 |
| Cubic Weave: 100hz | wx2: 100, px1: 3, py1: 3 |
| Warped Field: 100hz | wxm1: 100, wy2: 100 |
| Asymmetric Weave: 200hz | wx2: 100, wy2: 200 |
| Woven Web: 80hz | wxm2: 80, wy2: 80 |
| Cubic Static: 550hz | wx2: 550, px2: 3, py2: 3 |
| Cubic Filament: 180hz | wx2: 180, px2: 3, py2: 3 |
| Woven Bloom: 120hz (alt) | wxm2: 120, My: -1 |

---

## 5. ToolBase Sidebar Structure

### Tab 1: PARAMETERS (with sub-tabs)

#### Sub-Tab: GLOBAL
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Presets** | Landmark | dropdown | 27 presets | — | `landmark` |
| | Reset Y Deltas | button | — | — | `resetY` |
| **Transform** | Scale | slider | 20–300 | 120 | `scale` |
| | Rotation | slider | 0–360 | 0 | `rotation` |
| | Points | slider | 1000–80000 | 20000 | `points` |
| **Analysis** | Coupling | value | computed | — | `couplingStatus` |
| | Integer Freq | value | computed | — | `integerStatus` |

#### Sub-Tab: X-AXIS
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Term 1** | Amplitude (Ax1) | slider | -2 to 2 | 1 | `Ax1` |
| | Frequency (wx1) | slider | -300 to 300 | 1 | `wx1` |
| | Power (px1) | slider | -7 to 7 | 1 | `px1` |
| | Phase (φx1) | slider | -2π to 2π | 0 | `phi_x1` |
| **Term 2** | Amplitude (Ax2) | slider | -2 to 2 | 0 | `Ax2` |
| | Frequency (wx2) | slider | -300 to 300 | 1 | `wx2` |
| | Power (px2) | slider | -7 to 7 | 1 | `px2` |
| | Phase (φx2) | slider | -2π to 2π | 0 | `phi_x2` |
| **Modulation** | Amplitude (Mx) | slider | -2 to 2 | 0 | `Mx` |
| | Freq 1 (wxm1) | slider | 0–600 | 0 | `wxm1` |
| | Power 1 (pxm1) | slider | -7 to 7 | 1 | `pxm1` |
| | Phase 1 (φxm1) | slider | -2π to 2π | 0 | `phi_xm1` |
| | Freq 2 (wxm2) | slider | 0–600 | 0 | `wxm2` |
| | Power 2 (pxm2) | slider | -7 to 7 | 1 | `pxm2` |
| | Phase 2 (φxm2) | slider | -2π to 2π | 0 | `phi_xm2` |

#### Sub-Tab: Y-DELTA (offsets from X)
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Term 1 Δ** | ΔAmplitude | slider | -4 to 4 | 0 | `Ay1_delta` |
| | ΔFrequency | slider | -300 to 300 | 0 | `wy1_delta` |
| | ΔPower | slider | -10 to 10 | 0 | `py1_delta` |
| | ΔPhase | slider | -4π to 4π | 0 | `phi_y1_delta` |
| **Term 2 Δ** | ΔAmplitude | slider | -4 to 4 | 0 | `Ay2_delta` |
| | ΔFrequency | slider | -300 to 300 | 0 | `wy2_delta` |
| | ΔPower | slider | -10 to 10 | 0 | `py2_delta` |
| | ΔPhase | slider | -4π to 4π | 0 | `phi_y2_delta` |
| **Modulation** | Amplitude (My) | slider | -2 to 2 | 0 | `My` |
| | ΔFreq 1 | slider | -300 to 300 | 0 | `wym1_delta` |
| | Power 1 (pym1) | slider | -7 to 7 | 1 | `pym1` |
| | ΔPhase 1 | slider | -4π to 4π | 0 | `phi_ym1_delta` |
| | ΔFreq 2 | slider | -300 to 300 | 0 | `wym2_delta` |
| | Power 2 (pym2) | slider | -7 to 7 | 1 | `pym2` |
| | ΔPhase 2 | slider | -4π to 4π | 0 | `phi_ym2_delta` |

---

### Tab 2: ANIMATION (with sub-tabs)

#### Sub-Tab: PLAYBACK
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Controls** | Play/Pause | button | — | — | `playPause` |
| | Stop & Reset | button | — | — | `stopReset` |
| | Speed | slider | 0.1–5 | 1 | `globalSpeed` |
| **φx1 Anim** | Enable | toggle | [On] | off | `anim_phi_x1` |
| | Loop Frames | slider | 1–600 | 60 | `loop_phi_x1` |
| **φx2 Anim** | Enable | toggle | [On] | off | `anim_phi_x2` |
| | Loop Frames | slider | 1–600 | 60 | `loop_phi_x2` |
| **φy1Δ Anim** | Enable | toggle | [On] | off | `anim_phi_y1` |
| | Loop Frames | slider | 1–600 | 60 | `loop_phi_y1` |
| **φy2Δ Anim** | Enable | toggle | [On] | off | `anim_phi_y2` |
| | Loop Frames | slider | 1–600 | 60 | `loop_phi_y2` |
| **Trail** | Motion Blur | slider | 0–0.99 | 0 | `motionBlur` |

#### Sub-Tab: SEQUENCE
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Checkpoints** | Save Current | button | — | — | `saveCheckpoint` |
| | Count | value | — | "0" | `checkpointCount` |
| | Clear All | button | — | — | `clearCheckpoints` |
| **Playback** | Enable Sequence | toggle | [On] | off | `enableSequence` |
| | Loop | toggle | [On] | on | `loopSequence` |
| | Transition | slider | 1–300 | 60 | `transitionFrames` |
| | Play Sequence | button | — | — | `playSequence` |
| **History** | Undo | button | — | — | `undo` |
| | Stack | value | — | "0/50" | `historyCount` |

#### Sub-Tab: EXPORT
| Block | Control | Type | Range | Default | Key |
|-------|---------|------|-------|---------|-----|
| **Animation** | FPS | slider | 1–120 | 60 | `exportFps` |
| | Frames | slider | 1–3600 | 300 | `exportFrames` |
| | Format | dropdown | ZIP/WebM/GIF | ZIP | `exportFormat` |
| | Export | button | — | — | `exportAnimation` |
| **Image** | PNG | button | — | — | `exportPng` |
| | SVG | button | — | — | `exportSvg` |
| | Clipboard | button | — | — | `copyClipboard` |

---

### Tab 3: CANVAS (auto-injected by ToolBase)

Standard canvas controls injected when `canvas.showControls = true`

### onDraw Implementation
```javascript
onDraw: function(ctx, canvas, values) {
    const { scale, pointsPerCurve, bgColor, strokeColor } = values;
    
    // Background
    ctx.fillStyle = bgColor || '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Build final parameters with delta resolution
    const params = this.resolveDeltaParams(values);
    const equation = new UniversalEquation(params);
    
    // Draw curve
    ctx.strokeStyle = strokeColor || '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    let started = false;
    for (let i = 0; i <= pointsPerCurve; i++) {
        const t = (i / pointsPerCurve) * 2 * Math.PI;
        const { x, y } = equation.evaluate(t);
        
        if (!isFinite(x) || !isFinite(y)) {
            started = false;
            continue;
        }
        
        const screenX = canvas.width / 2 + x * scale;
        const screenY = canvas.height / 2 - y * scale;
        
        if (!started) {
            ctx.moveTo(screenX, screenY);
            started = true;
        } else {
            ctx.lineTo(screenX, screenY);
        }
    }
    ctx.stroke();
}
```

---

## 6. Visual Design

### Layout
- Large square canvas (800×800 default)
- Multi-tab sidebar for parameter groups
- Live equation display
- Analysis indicators

### Color Scheme
- Black background for contrast
- White curve stroke
- Green/red indicators for analysis

### Typography
- Mathematical notation for equation display
- Subscript/superscript for parameters
- Phase displayed as π multiples

---

## 7. Testing Checklist

### Functional Tests
- [ ] All 38 parameter sliders work correctly
- [ ] Delta parameters correctly offset from X values
- [ ] Integer lock toggles work for power parameters
- [ ] All 27 landmarks load correctly
- [ ] Undo maintains up to 50 states
- [ ] Reset Y clears all delta values
- [ ] Rotation transforms curve correctly
- [ ] Scale resizes visualization
- [ ] Point count affects curve resolution

### Visual Tests
- [ ] Closed curves when frequencies are integers
- [ ] Smooth curves at high point counts
- [ ] No artifacts at extreme parameter values
- [ ] Equation display updates correctly

### Analysis Tests
- [ ] Coupling check detects shared frequencies
- [ ] Integer frequency check accurate
- [ ] Status indicators update live

### Export Tests
- [ ] PNG export captures full visualization
- [ ] SVG export maintains vector quality

---

## 8. References

### Mathematical Background
- **Lissajous Curves:** https://en.wikipedia.org/wiki/Lissajous_curve
- **Parametric Equations:** x = A·sin(at+δ), y = B·sin(bt)
- **Musical Intervals:** Frequency ratios from just intonation
- **Safe Power Function:** Handles negative bases with fractional exponents

### Implementation References
- Source: `reference/QuickToolRebuildReference/Generative Art/Lassajous/`
- Three variants: harmonics, lissajous-2, lissajous-animation

### Related Tools
- [Cymatics](#cymatics) - Wave interference patterns
- [Wave Interference](#wave-interference) - Similar parametric visualization
