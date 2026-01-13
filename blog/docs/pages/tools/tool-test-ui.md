# Tool Test UI

## 1. Source Analysis

**Source file(s):** `assets/js/tools/tool-test-ui.js`
**Related docs found:** Reference implementation for ToolBase

### Purpose
Comprehensive demonstration and testing tool for all ToolBase components and patterns. Showcases every available UI component type and demonstrates Animation, Image, SVG, Graphs, and Audio modes.

### Output Type
- [x] Static image (image/SVG modes)
- [x] Animation (animation mode)
- [x] Interactive visualization (all modes)
- [x] Data/calculation result (graphs mode)
- [x] Audio (audio mode)
- [ ] Downloadable file

### Current Implementation
1. Mode selector switches between 5 demo modes
2. Animation mode: Bouncing balls with AnimationFoundation
3. Image mode: Color gradient with adjustable parameters
4. SVG mode: Star visualization with live updates
5. Graphs mode: Multi-dataset line charts
6. Audio mode: Oscillator with frequency/waveform control

---

## 2. Tool Classification

**Is this a tool?** Yes (reference/testing tool)

**Input:** Mode selection, per-mode parameters
**Processing:** Mode-specific rendering
**Output:** Demonstration of all ToolBase capabilities

**Frame-based?** Yes (animation mode)
**Looping?** Yes (animation mode)
**Duration:** Infinite (animation mode)

---

## 3. Variable Analysis

### Exposed Parameters (from source)

#### Animation Mode
| Variable | Type | Range | Purpose |
|----------|------|-------|---------|
| ballCount | number | 1-100 | Number of bouncing balls |
| speed | number | 0.1-5 | Animation speed |
| ballSize | number | 2-50 | Ball radius |
| color | color | any | Ball color |
| trails | toggle | on/off | Show motion trails |

#### Image Mode
| Variable | Type | Range | Purpose |
|----------|------|-------|---------|
| hue | number | 0-360 | Base hue |
| saturation | number | 0-100 | Color saturation |
| pattern | dropdown | gradient/circles/grid | Pattern type |

#### SVG Mode
| Variable | Type | Range | Purpose |
|----------|------|-------|---------|
| points | number | 3-20 | Star points |
| innerRadius | number | 10-100 | Inner radius |
| outerRadius | number | 20-200 | Outer radius |
| rotation | number | 0-360 | Rotation angle |

#### Graphs Mode
| Variable | Type | Range | Purpose |
|----------|------|-------|---------|
| dataset | dropdown | sin/cos/tan/random | Data source |
| pointCount | number | 10-500 | Number of points |
| showGrid | toggle | on/off | Show grid lines |

#### Audio Mode
| Variable | Type | Range | Purpose |
|----------|------|-------|---------|
| frequency | number | 20-2000 | Oscillator frequency |
| volume | number | 0-100 | Output volume |
| waveform | dropdown | sine/square/saw/triangle | Wave type |

### Recommended UI Components
All component types are demonstrated in this tool - it IS the reference.

### Missing Controls (not in source, should add)
- [x] All standard controls are present

---

## 4. Gap Analysis

### Available in our library but missing in source:
- N/A - this IS the reference

### Source features requiring new components:
- N/A - demonstrates all available components

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| mode | dropdown | Animation | - | - | - | 5 options |
| (per-mode params) | various | various | - | - | - | Mode-specific |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Canvas | canvas | per-mode | Auto on input |
| Audio | audio | oscillator | Play button |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'TOOL TEST',
    
    sidebar: [
        ['MODE', [
            ['Select', [
                ['dropdown', 'Mode', ['Animation', 'Image', 'SVG', 'Graphs', 'Audio'], { key: 'mode' }],
            ]],
        ]],
        ['ANIMATION', [
            ['Balls', [
                ['slider', 'Count', 1, 100, 1, { value: 10, key: 'ballCount' }],
                ['slider', 'Speed', 0.1, 5, 0.1, { value: 1, key: 'speed' }],
                ['slider', 'Size', 2, 50, 1, { value: 10, key: 'ballSize' }],
                ['color', 'Color', { value: '#ffffff', key: 'color' }],
                ['toggle', 'Trails', ['Enabled'], { key: 'trails' }],
            ]],
            ['Playback', [
                ['button', 'Play/Pause', { key: 'playPause' }],
                ['button', 'Reset', { key: 'reset' }],
            ]],
        ]],
        ['IMAGE', [
            ['Colors', [
                ['slider', 'Hue', 0, 360, 1, { value: 180, key: 'hue' }],
                ['slider', 'Saturation', 0, 100, 1, { value: 50, key: 'saturation' }],
                ['dropdown', 'Pattern', ['gradient', 'circles', 'grid'], { key: 'pattern' }],
            ]],
        ]],
        ['SVG', [
            ['Star', [
                ['slider', 'Points', 3, 20, 1, { value: 5, key: 'points' }],
                ['slider', 'Inner Radius', 10, 100, 1, { value: 50, key: 'innerRadius' }],
                ['slider', 'Outer Radius', 20, 200, 1, { value: 100, key: 'outerRadius' }],
                ['slider', 'Rotation', 0, 360, 1, { value: 0, key: 'rotation' }],
            ]],
        ]],
        ['GRAPHS', [
            ['Data', [
                ['dropdown', 'Dataset', ['sin', 'cos', 'tan', 'random'], { key: 'dataset' }],
                ['slider', 'Points', 10, 500, 10, { value: 100, key: 'pointCount' }],
                ['toggle', 'Grid', ['Enabled'], { key: 'showGrid', selectedValues: ['Enabled'] }],
            ]],
        ]],
        ['AUDIO', [
            ['Oscillator', [
                ['slider', 'Frequency', 20, 2000, 1, { value: 440, key: 'frequency' }],
                ['slider', 'Volume', 0, 100, 1, { value: 50, key: 'volume' }],
                ['dropdown', 'Waveform', ['sine', 'square', 'sawtooth', 'triangle'], { key: 'waveform' }],
            ]],
            ['Playback', [
                ['button', 'Play', { key: 'playAudio' }],
                ['button', 'Stop', { key: 'stopAudio' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.mode = 'Animation';
        this.balls = [];
        this.animator = null;
        this.audioCtx = null;
    },
    
    onUpdate: function(key, value, allValues) {
        if (key === 'mode') {
            this.switchMode(value);
        }
        this.draw();
    },
    
    onDraw: function(ctx, canvas, values) {
        switch(this.mode) {
            case 'Animation': this.drawAnimation(ctx, canvas, values); break;
            case 'Image': this.drawImage(ctx, canvas, values); break;
            case 'SVG': this.drawSVG(ctx, canvas, values); break;
            case 'Graphs': this.drawGraphs(ctx, canvas, values); break;
            case 'Audio': this.drawAudioVisualization(ctx, canvas, values); break;
        }
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        if (this.audioCtx) this.audioCtx.close();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **AnimationFoundation:** Uses `AnimationLoop` for animation mode, not raw RAF
- **Audio:** Uses Web Audio API with proper cleanup in destroy()
- **Mode Switching:** Must stop animators and audio when switching modes
- **Reference Implementation:** This is THE reference for ToolBase patterns
- **Status:** Already in ToolBase format

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| Ball physics | 30 | animation | circles | High |
| Star SVG generation | 20 | geometry | polygon-calculator | High |
| Line chart drawing | 40 | chart | font-dimension-finder | High |
| Audio oscillator setup | 25 | audio | cymatics | High |
| Waveform visualization | 20 | audio | cymatics | High |

**Shared Utility Candidates:**
- `AudioHelper.createOscillator(ctx, freq, type)` - Web Audio setup
- `ChartHelper.drawLineChart(ctx, data, options)` - Generic line chart
- `GeometryHelper.starPath(cx, cy, points, inner, outer)` - Star polygon

