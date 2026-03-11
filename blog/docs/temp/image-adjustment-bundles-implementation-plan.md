# Image Adjustment Bundles — Implementation Plan

**Goal:** Three modular, reusable adjustment bundles that integrate seamlessly into any tool's sidebar config.

**Architecture:** Pure functional algorithms + declarative UI components + ToolBase integration.

---

## 1. ARCHITECTURE OVERVIEW

### 1.1 Three-Layer System

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: Algorithms (Pure Functions)                        │
│ Location: assets/js/shared/algorithms/image/                │
│ - image-adjustments.js (brightness, hue, etc.)              │
│ - image-resize-advanced.js (bilinear, bicubic, Lanczos)     │
│ - image-transforms.js (rotate, flip, crop)                  │
│ - image-curves.js (NEW: curve evaluation & editing)         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: Adjustment Bundles (Stateful Classes)              │
│ Location: assets/js/shared/image-adjustments/               │
│ - MinimalAdjustmentBundle.js                                │
│ - StandardAdjustmentBundle.js                               │
│ - ProfessionalAdjustmentBundle.js                           │
│ Each extends BaseComponent, manages state, emits changes    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: ToolBase Integration (Declarative)                 │
│ Location: Tool config sidebar arrays                        │
│ ['adjustment-bundle', 'minimal']  ← Just this!              │
│ ['adjustment-bundle', 'standard', { onChange: fn }]         │
│ ['adjustment-bundle', 'professional', { options }]          │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 File Structure

```
assets/js/shared/
├── algorithms/
│   └── image/
│       ├── image-adjustments.js         (EXTEND: add 9 new functions)
│       ├── image-resize-advanced.js     (NEW: bilinear, bicubic, Lanczos)
│       ├── image-transforms.js          (NEW: rotate, flip, crop)
│       └── image-curves.js              (NEW: curve math & interpolation)
│
├── image-adjustments/                   (NEW DIRECTORY)
│   ├── index.js                         (Export all bundles)
│   ├── AdjustmentBundleBase.js          (Base class, shared logic)
│   ├── MinimalBundle.js                 (5 controls)
│   ├── StandardBundle.js                (10 controls)
│   ├── ProfessionalBundle.js            (15+ controls)
│   ├── components/
│   │   ├── CurveEditor.js               (Bezier curve editor component)
│   │   ├── LevelsControl.js             (Histogram + 3 sliders)
│   │   ├── ResizeControl.js             (Dropdown + aspect lock)
│   │   └── PresetManager.js             (Save/load presets)
│   └── presets/
│       ├── common-presets.json          (High Contrast, B&W, Vintage, etc.)
│       └── preset-schema.json           (Validation schema)
│
└── component-library.js                 (EXTEND: register new component types)
```

---

## 2. BUNDLE SPECIFICATIONS

### Bundle 1: Minimal (Quick Prep)

**Use Case:** Fast preprocessing before quantization/dithering/ASCII conversion

**Controls:**
1. Brightness (-100 to +100, step 1)
2. Contrast (0.0 to 2.0, step 0.01)
3. Gamma (0.2 to 3.0, step 0.1)
4. Saturation (0.0 to 2.0, step 0.01)
5. Hue (-180° to +180°, step 1)

**UI Layout:**
```
┌─ IMAGE ADJUSTMENTS (MINIMAL) ──────────────────┐
│ Brightness    ●────────────● -100 / +100      │
│ Contrast      ●────────────● 0.00 / 2.00      │
│ Gamma         ●────────────● 0.20 / 3.00      │
│ Saturation    ●────────────● 0.00 / 2.00      │
│ Hue Shift     ●────────────● -180° / +180°    │
│ [Reset All]                                    │
└────────────────────────────────────────────────┘
```

**Sidebar Config:**
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'minimal', null, {
        key: 'imageAdjust',
        onChange: (adjustedImageData, settings) => {
            // Process adjusted image
            state.adjustedImage = adjustedImageData;
            tool.draw();
        }
    }]
]]
```

### Bundle 2: Standard (Professional Prep)

**Use Case:** Color correction, tonal adjustment, basic transforms

**Controls:**
1. Brightness (-100 to +100)
2. Contrast (0.0 to 2.0)
3. Gamma (0.2 to 3.0)
4. Exposure (-3.0 to +3.0 EV)
5. Saturation (0.0 to 2.0)
6. Hue (-180° to +180°)
7. Levels (Black/Mid/White with histogram)
8. Resize (Preset dropdown: 2×, 4×, ½, ¼, Custom)
9. Rotate (90° CW/CCW, 180°)
10. Flip (Horizontal, Vertical)

**UI Layout:**
```
┌─ IMAGE ADJUSTMENTS (STANDARD) ─────────────────┐
│ ┌─ TONE ────────────────────────────────────┐ │
│ │ Brightness  ●───────● -100 / +100         │ │
│ │ Contrast    ●───────● 0.00 / 2.00         │ │
│ │ Gamma       ●───────● 0.20 / 3.00         │ │
│ │ Exposure    ●───────● -3.0 / +3.0 EV      │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ COLOR ───────────────────────────────────┐ │
│ │ Saturation  ●───────● 0.00 / 2.00         │ │
│ │ Hue         ●───────● -180° / +180°       │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ LEVELS ──────────────────────────────────┐ │
│ │ ┌─── Histogram ───────────────────────┐   │ │
│ │ │ ▁▂▃▅▇██████▇▅▃▂▁                   │   │ │
│ │ └──────────────────────────────────────┘   │ │
│ │ Black  ▸───────  0                        │ │
│ │ Mid    ───▸────  1.0                      │ │
│ │ White  ──────◂  255                       │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ TRANSFORM ───────────────────────────────┐ │
│ │ Resize: [2× ▼] [🔒 Lock]                  │ │
│ │ Rotate: [⟲ 90°] [⟳ 90°] [180°]           │ │
│ │ Flip:   [↔ H] [↕ V]                       │ │
│ └───────────────────────────────────────────┘ │
│ [Reset All] [Undo] [Presets ▼]                │
└────────────────────────────────────────────────┘
```

**Sidebar Config:**
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'standard', null, {
        key: 'imageAdjust',
        showHistogram: true,
        showPresets: true,
        onChange: (adjustedImageData, settings) => {
            state.adjustedImage = adjustedImageData;
            tool.draw();
        },
        onTransform: (transformedImageData, transform) => {
            // Handle resize/rotate/flip
            updateCanvasDimensions(transformedImageData);
        }
    }]
]]
```

### Bundle 3: Professional (Advanced Color Grading)

**Use Case:** Precise color grading, advanced tonal control, full preprocessing pipeline

**Controls:** All Standard controls plus:
11. Curves (RGB + per-channel, Bezier curve editor)
12. Vibrance (0.0 to 2.0)
13. Temperature (2000K to 10000K)
14. Tint (Magenta/Green, -100 to +100)
15. Shadows (-100 to +100)
16. Highlights (-100 to +100)
17. Advanced Resize (Method: Nearest/Bilinear/Bicubic/Lanczos)
18. Crop Tool (Interactive canvas overlay)

**UI Layout:**
```
┌─ IMAGE ADJUSTMENTS (PROFESSIONAL) ─────────────┐
│ ┌─ TONE ────────────────────────────────────┐ │
│ │ [Same as Standard]                        │ │
│ │ Shadows     ●───────● -100 / +100         │ │
│ │ Highlights  ●───────● -100 / +100         │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ COLOR ───────────────────────────────────┐ │
│ │ Saturation  ●───────● 0.00 / 2.00         │ │
│ │ Vibrance    ●───────● 0.00 / 2.00         │ │
│ │ Hue         ●───────● -180° / +180°       │ │
│ │ Temp        ●───────● 2000K / 10000K      │ │
│ │ Tint        ●───────● -100 / +100         │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ CURVES ──────────────────────────────────┐ │
│ │ Channel: [⬤ RGB ▼] [Reset] [Presets ▼]   │ │
│ │ ┌─────────────────────────────────────┐   │ │
│ │ │ Output                              │   │ │
│ │ │ 255├─────────────╱                  │   │ │
│ │ │    │           ●╱  ●                │   │ │
│ │ │    │         ╱│                     │   │ │
│ │ │    │       ╱  │                     │   │ │
│ │ │    │     ●    │                     │   │ │
│ │ │  0 └────╱─────┴───────────► Input  │   │ │
│ │ │   0                           255  │   │ │
│ │ └─────────────────────────────────────┘   │ │
│ │ • Click to add point                      │ │
│ │ • Drag to adjust                          │ │
│ │ • Right-click to delete                   │ │
│ │ • Shift+drag for fine control             │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ LEVELS ──────────────────────────────────┐ │
│ │ [Same as Standard]                        │ │
│ └───────────────────────────────────────────┘ │
│ ┌─ TRANSFORM ───────────────────────────────┐ │
│ │ Resize: [Custom ▼] [🔒 Lock]              │ │
│ │ Width:  [1920    ] Height: [1080    ]     │ │
│ │ Method: [Bicubic ▼]                       │ │
│ │ Rotate: [⟲ 90°] [⟳ 90°] [180°] [Custom°] │ │
│ │ Flip:   [↔ H] [↕ V]                       │ │
│ │ Crop:   [🔲 Select Area] [Clear]          │ │
│ └───────────────────────────────────────────┘ │
│ [Reset All] [Undo] [Redo] [Presets ▼]         │
│ [Save Preset...] [Load Preset...]             │
└────────────────────────────────────────────────┘
```

**Sidebar Config:**
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'professional', null, {
        key: 'imageAdjust',
        showHistogram: true,
        showCurves: true,
        showPresets: true,
        curveChannels: ['rgb', 'r', 'g', 'b', 'luminance'],
        undoStackSize: 20,
        onChange: (adjustedImageData, settings) => {
            state.adjustedImage = adjustedImageData;
            state.adjustmentSettings = settings;
            tool.draw();
        },
        onCurveChange: (curveData, channel) => {
            // Real-time curve preview
            updateCurvePreview(curveData, channel);
        },
        onTransform: (transformedImageData, transform) => {
            updateCanvasDimensions(transformedImageData);
        }
    }]
]]
```

---

## 3. CURVE EDITOR — DETAILED UX SPECIFICATION

### 3.1 Requirements

**Must Support:**
- Bezier curves (cubic for smooth interpolation)
- Multiple control points (2-16 points)
- Per-channel editing (RGB, R, G, B, Luminance)
- Precise numeric input alongside visual editing
- Curve presets (Linear, S-Curve, Inverse S, Film, etc.)
- Real-time preview with debouncing
- Touch-friendly (mobile support)

**UX Principles:**
1. **Immediate Feedback** — Preview updates as you drag
2. **Precise Control** — Shift+drag for 0.1px precision
3. **Easy Correction** — Right-click or double-click to remove point
4. **Visual Clarity** — Grid, histogram overlay, before/after split
5. **Keyboard Shortcuts** — Arrow keys to nudge selected point

### 3.2 Curve Editor Component Spec

```javascript
/**
 * CurveEditor — Bezier curve editor for tone mapping
 * 
 * @extends BaseComponent
 * @location assets/js/shared/image-adjustments/components/CurveEditor.js
 */
class CurveEditor extends BaseComponent {
    constructor(options) {
        super();
        this.options = {
            width: 256,              // Canvas width
            height: 256,             // Canvas height
            channels: ['rgb'],       // Active channels
            gridSize: 32,            // Grid spacing
            showHistogram: true,     // Overlay histogram
            showGrid: true,          // Show grid lines
            curveColor: '#00FF00',   // VGA green
            gridColor: '#333333',    // VGA dark gray
            histogramColor: '#FFFFFF', // VGA white
            pointRadius: 6,          // Control point size
            maxPoints: 16,           // Max control points
            snapToGrid: false,       // Snap points to grid
            ...options
        };
        
        this.state = {
            curves: {
                rgb: this.createDefaultCurve(),
                r: this.createDefaultCurve(),
                g: this.createDefaultCurve(),
                b: this.createDefaultCurve(),
                luminance: this.createDefaultCurve()
            },
            activeChannel: 'rgb',
            selectedPoint: null,
            isDragging: false,
            histogram: null
        };
    }
    
    createDefaultCurve() {
        // Linear curve: (0,0) to (255,255)
        return [
            { x: 0, y: 0, locked: true },      // Start point (locked)
            { x: 255, y: 255, locked: true }   // End point (locked)
        ];
    }
    
    // Convert control points to 256-entry LUT using cubic Bezier interpolation
    generateLUT() {
        const curve = this.state.curves[this.state.activeChannel];
        const lut = new Uint8ClampedArray(256);
        
        // Sort points by x
        const sorted = [...curve].sort((a, b) => a.x - b.x);
        
        // For each segment between control points
        for (let i = 0; i < sorted.length - 1; i++) {
            const p0 = sorted[i];
            const p1 = sorted[i + 1];
            
            // Calculate Bezier control points (Catmull-Rom tangents)
            const tangent0 = this.calculateTangent(sorted, i);
            const tangent1 = this.calculateTangent(sorted, i + 1);
            
            // Interpolate segment
            for (let x = Math.floor(p0.x); x <= Math.ceil(p1.x); x++) {
                if (x < 0 || x > 255) continue;
                const t = (x - p0.x) / (p1.x - p0.x);
                const y = this.cubicBezier(p0.y, tangent0, tangent1, p1.y, t);
                lut[x] = Math.max(0, Math.min(255, Math.round(y)));
            }
        }
        
        return lut;
    }
    
    cubicBezier(p0, t0, t1, p1, t) {
        // Cubic Bezier formula: B(t) = (1-t)³P₀ + 3(1-t)²tT₀ + 3(1-t)t²T₁ + t³P₁
        const mt = 1 - t;
        return mt*mt*mt*p0 + 3*mt*mt*t*t0 + 3*mt*t*t*t1 + t*t*t*p1;
    }
    
    calculateTangent(points, index) {
        // Catmull-Rom tangent calculation for smooth curves
        if (index === 0) return points[1].y;
        if (index === points.length - 1) return points[index - 1].y;
        
        const prev = points[index - 1];
        const curr = points[index];
        const next = points[index + 1];
        
        // Tangent = (next - prev) / 2
        return curr.y + (next.y - prev.y) * 0.5;
    }
    
    // Mouse/touch interaction handlers
    onPointerDown(event) {
        const { x, y } = this.getCanvasCoords(event);
        const point = this.findPointNear(x, y);
        
        if (point) {
            // Select existing point
            this.state.selectedPoint = point;
            this.state.isDragging = true;
        } else if (this.canAddPoint()) {
            // Add new point
            this.addPoint(x, y);
        }
        
        this.render();
        this.emitChange();
    }
    
    onPointerMove(event) {
        if (!this.state.isDragging || !this.state.selectedPoint) return;
        
        const { x, y } = this.getCanvasCoords(event);
        const point = this.state.selectedPoint;
        
        // Don't allow locked points to move
        if (point.locked) return;
        
        // Constrain to canvas bounds
        point.x = Math.max(1, Math.min(254, x));
        point.y = Math.max(0, Math.min(255, y));
        
        // Snap to grid if enabled
        if (this.options.snapToGrid) {
            point.x = Math.round(point.x / this.options.gridSize) * this.options.gridSize;
            point.y = Math.round(point.y / this.options.gridSize) * this.options.gridSize;
        }
        
        // Shift key = fine control (0.1x speed)
        if (event.shiftKey) {
            const dx = x - point.x;
            const dy = y - point.y;
            point.x += dx * 0.1;
            point.y += dy * 0.1;
        }
        
        this.render();
        this.debouncedEmitChange(); // Don't spam updates
    }
    
    onPointerUp(event) {
        this.state.isDragging = false;
        this.emitChange(); // Final update
    }
    
    onContextMenu(event) {
        event.preventDefault();
        const { x, y } = this.getCanvasCoords(event);
        const point = this.findPointNear(x, y);
        
        if (point && !point.locked) {
            // Remove point on right-click
            this.removePoint(point);
            this.render();
            this.emitChange();
        }
    }
    
    onKeyDown(event) {
        if (!this.state.selectedPoint || this.state.selectedPoint.locked) return;
        
        const point = this.state.selectedPoint;
        const step = event.shiftKey ? 1 : 5;
        
        switch (event.key) {
            case 'ArrowUp':
                point.y = Math.max(0, point.y - step);
                break;
            case 'ArrowDown':
                point.y = Math.min(255, point.y + step);
                break;
            case 'ArrowLeft':
                point.x = Math.max(1, point.x - step);
                break;
            case 'ArrowRight':
                point.x = Math.min(254, point.x + step);
                break;
            case 'Delete':
            case 'Backspace':
                this.removePoint(point);
                break;
            default:
                return;
        }
        
        event.preventDefault();
        this.render();
        this.emitChange();
    }
    
    // Rendering
    render() {
        const canvas = this.canvas;
        const ctx = canvas.getContext('2d');
        const { width, height } = this.options;
        
        // Clear
        ctx.fillStyle = '#000000'; // VGA black
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        if (this.options.showGrid) {
            this.drawGrid(ctx);
        }
        
        // Draw histogram (if available)
        if (this.options.showHistogram && this.state.histogram) {
            this.drawHistogram(ctx);
        }
        
        // Draw diagonal reference line
        ctx.strokeStyle = '#444444'; // VGA dark gray
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, 0);
        ctx.stroke();
        
        // Draw curve
        this.drawCurve(ctx);
        
        // Draw control points
        this.drawControlPoints(ctx);
    }
    
    drawGrid(ctx) {
        const { width, height, gridSize, gridColor } = this.options;
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        
        for (let x = 0; x <= width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        for (let y = 0; y <= height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    drawHistogram(ctx) {
        const { width, height, histogramColor } = this.options;
        const histogram = this.state.histogram;
        const max = Math.max(...histogram);
        
        ctx.fillStyle = histogramColor;
        ctx.globalAlpha = 0.3;
        
        for (let x = 0; x < 256; x++) {
            const h = (histogram[x] / max) * (height * 0.5);
            ctx.fillRect(x, height - h, 1, h);
        }
        
        ctx.globalAlpha = 1.0;
    }
    
    drawCurve(ctx) {
        const { width, height, curveColor } = this.options;
        const curve = this.state.curves[this.state.activeChannel];
        const sorted = [...curve].sort((a, b) => a.x - b.x);
        
        ctx.strokeStyle = curveColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // Draw smooth Bezier curve through all points
        for (let i = 0; i < sorted.length - 1; i++) {
            const p0 = sorted[i];
            const p1 = sorted[i + 1];
            const t0 = this.calculateTangent(sorted, i);
            const t1 = this.calculateTangent(sorted, i + 1);
            
            const px0 = (p0.x / 255) * width;
            const py0 = height - (p0.y / 255) * height;
            
            if (i === 0) {
                ctx.moveTo(px0, py0);
            }
            
            // Draw cubic Bezier segment
            for (let step = 0; step <= 20; step++) {
                const t = step / 20;
                const y = this.cubicBezier(p0.y, t0, t1, p1.y, t);
                const x = p0.x + (p1.x - p0.x) * t;
                const px = (x / 255) * width;
                const py = height - (y / 255) * height;
                ctx.lineTo(px, py);
            }
        }
        
        ctx.stroke();
    }
    
    drawControlPoints(ctx) {
        const { width, height, pointRadius } = this.options;
        const curve = this.state.curves[this.state.activeChannel];
        
        curve.forEach(point => {
            const px = (point.x / 255) * width;
            const py = height - (point.y / 255) * height;
            
            // Draw point
            ctx.fillStyle = point === this.state.selectedPoint ? '#FFFF00' : '#FFFFFF'; // Yellow if selected
            ctx.beginPath();
            ctx.arc(px, py, pointRadius, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw outline
            ctx.strokeStyle = point.locked ? '#FF0000' : '#000000'; // Red if locked
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw coordinates
            if (point === this.state.selectedPoint) {
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '10px "Atkinson Hyperlegible", monospace';
                ctx.fillText(`(${Math.round(point.x)}, ${Math.round(point.y)})`, px + 10, py - 10);
            }
        });
    }
    
    // Curve presets
    loadPreset(presetName) {
        const presets = {
            linear: [
                { x: 0, y: 0, locked: true },
                { x: 255, y: 255, locked: true }
            ],
            sCurve: [
                { x: 0, y: 0, locked: true },
                { x: 64, y: 48, locked: false },
                { x: 191, y: 207, locked: false },
                { x: 255, y: 255, locked: true }
            ],
            inverseSCurve: [
                { x: 0, y: 0, locked: true },
                { x: 64, y: 80, locked: false },
                { x: 191, y: 175, locked: false },
                { x: 255, y: 255, locked: true }
            ],
            highContrast: [
                { x: 0, y: 0, locked: true },
                { x: 96, y: 32, locked: false },
                { x: 159, y: 223, locked: false },
                { x: 255, y: 255, locked: true }
            ],
            lowContrast: [
                { x: 0, y: 48, locked: true },
                { x: 127, y: 127, locked: false },
                { x: 255, y: 207, locked: true }
            ],
            negative: [
                { x: 0, y: 255, locked: true },
                { x: 255, y: 0, locked: true }
            ]
        };
        
        if (presets[presetName]) {
            this.state.curves[this.state.activeChannel] = presets[presetName];
            this.render();
            this.emitChange();
        }
    }
    
    // Event emission
    emitChange() {
        const lut = this.generateLUT();
        this.emit('change', {
            channel: this.state.activeChannel,
            lut: lut,
            controlPoints: this.state.curves[this.state.activeChannel]
        });
    }
    
    debouncedEmitChange = debounce(() => this.emitChange(), 100);
}
```

### 3.3 Curve Editor Visual Design

**Canvas Specifications:**
- Size: 256×256px (1:1 mapping to value range)
- Background: VGA black (#000000)
- Grid: 8×8 grid, VGA dark gray (#333333)
- Diagonal ref line: VGA mid gray (#444444)
- Histogram: VGA white (#FFFFFF) at 30% opacity
- Curve line: VGA green (#00FF00), 2px width
- Control points: VGA white (#FFFFFF), 6px radius
- Selected point: VGA yellow (#FFFF00)
- Locked point outline: VGA red (#FF0000)

**Interaction Indicators:**
```
┌─────────────────────────────────────────────────┐
│ Channel: [⬤ RGB ▼]  [Linear ▼]  [Reset]       │
├─────────────────────────────────────────────────┤
│ ┌───────────────────────────────────────────┐   │
│ │ Output                                    │   │
│ │ 255├────────────╱─────────────────────┐   │   │
│ │    │          ●╱                       │   │   │
│ │    │         ╱│                        │   │   │
│ │    │       ●  │    ▁▃▅▇██▇▅▃▁ ←histogram│   │
│ │    │     ╱    │                        │   │   │
│ │    │   ●      │                        │   │   │
│ │  0 └─╱────────┴────────────────► Input │   │   │
│ │   0                              255   │   │   │
│ └───────────────────────────────────────────┘   │
│ Selected: (127, 140)                            │
│ • Click to add point  • Drag to move            │
│ • Right-click to delete  • Shift = fine control │
│ • Arrow keys to nudge  • Delete to remove       │
└─────────────────────────────────────────────────┘
```

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Core Algorithms (Week 1)

**Files to create/modify:**

1. `assets/js/shared/algorithms/image/image-adjustments.js`
   - ✅ Add `applyBrightness(imageData, brightness)`
   - ✅ Add `applyExposure(imageData, exposure)`
   - ✅ Add `applyHueRotation(imageData, hue)`
   - ✅ Add `applyVibrance(imageData, vibrance)`
   - ✅ Add `applyTemperature(imageData, temperature)`
   - ✅ Add `applyTint(imageData, tint)`
   - ✅ Add `invertImage(imageData)`
   - ✅ Add `applyShadowsHighlights(imageData, shadows, highlights)`
   - ✅ Update `applyAllAdjustments()` with new pipeline order

2. `assets/js/shared/algorithms/image/image-curves.js` (NEW)
   - ✅ `applyCurveLUT(imageData, lut, channel)`
   - ✅ `applyLevels(imageData, {black, mid, white})`
   - ✅ `generateCurveLUT(controlPoints)` using Bezier interpolation
   - ✅ `catmullRomTangent(points, index)`
   - ✅ `cubicBezier(p0, t0, t1, p1, t)`

3. `assets/js/shared/algorithms/image/image-resize-advanced.js` (NEW)
   - ✅ `bilinearResize(imageData, targetW, targetH)`
   - ✅ `bicubicResize(imageData, targetW, targetH)`
   - ✅ `lanczosResize(imageData, targetW, targetH, a=3)`
   - ✅ `proportionalResize(imageData, {scale, width, height, method, lockAspect})`

4. `assets/js/shared/algorithms/image/image-transforms.js` (NEW)
   - ✅ `rotate90(imageData, times)`
   - ✅ `rotateArbitrary(imageData, degrees, fillColor)`
   - ✅ `flipHorizontal(imageData)`
   - ✅ `flipVertical(imageData)`
   - ✅ `crop(imageData, x, y, w, h)`

**Testing:** Unit tests for each function with reference images

### Phase 2: Curve Editor Component (Week 2)

**Files to create:**

1. `assets/js/shared/image-adjustments/components/CurveEditor.js`
   - Full implementation as spec'd above
   - Touch support (pointer events)
   - Keyboard navigation
   - Preset system

2. `assets/js/shared/image-adjustments/components/LevelsControl.js`
   - Histogram display
   - Triple slider (black/mid/white)
   - Real-time preview

3. `assets/js/shared/image-adjustments/components/ResizeControl.js`
   - Dropdown with presets
   - Custom width/height inputs
   - Aspect ratio lock toggle
   - Method dropdown

**Testing:** Interactive visual testing, touch device testing

### Phase 3: Bundle Base Class (Week 3)

**Files to create:**

1. `assets/js/shared/image-adjustments/AdjustmentBundleBase.js`
   ```javascript
   class AdjustmentBundleBase extends BaseComponent {
       constructor(options) {
           super();
           this.options = options;
           this.state = {
               originalImage: null,
               adjustedImage: null,
               settings: this.getDefaultSettings(),
               undoStack: [],
               redoStack: []
           };
           this.components = [];
       }
       
       setImage(imageData) {
           this.state.originalImage = imageData;
           this.applyAdjustments();
       }
       
       applyAdjustments() {
           // Apply all adjustments in correct order
           let result = this.state.originalImage;
           
           // Pipeline order (critical for quality):
           // 1. Levels → 2. Exposure → 3. Brightness → 
           // 4. Contrast → 5. Gamma → 6. Temperature → 
           // 7. Tint → 8. Hue → 9. Saturation → 
           // 10. Vibrance → 11. Shadows/Highlights → 12. Curves
           
           const s = this.state.settings;
           
           if (s.levels) result = applyLevels(result, s.levels);
           if (s.exposure !== 0) result = applyExposure(result, s.exposure);
           if (s.brightness !== 0) result = applyBrightness(result, s.brightness);
           if (s.contrast !== 1) result = applyContrast(result, s.contrast);
           if (s.gamma !== 1) result = applyGamma(result, s.gamma);
           if (s.temperature !== 0) result = applyTemperature(result, s.temperature);
           if (s.tint !== 0) result = applyTint(result, s.tint);
           if (s.hue !== 0) result = applyHueRotation(result, s.hue);
           if (s.saturation !== 1) result = applySaturation(result, s.saturation);
           if (s.vibrance !== 1) result = applyVibrance(result, s.vibrance);
           if (s.shadows !== 0 || s.highlights !== 0) {
               result = applyShadowsHighlights(result, s.shadows, s.highlights);
           }
           if (s.curveLUT) result = applyCurveLUT(result, s.curveLUT, s.curveChannel);
           
           this.state.adjustedImage = result;
           this.emit('change', result, s);
       }
       
       updateSetting(key, value) {
           // Save to undo stack
           this.pushUndo();
           
           // Update setting
           this.state.settings[key] = value;
           
           // Reapply (debounced for sliders)
           this.debouncedApply();
       }
       
       reset() {
           this.pushUndo();
           this.state.settings = this.getDefaultSettings();
           this.applyAdjustments();
       }
       
       undo() {
           if (this.state.undoStack.length === 0) return;
           this.state.redoStack.push(this.state.settings);
           this.state.settings = this.state.undoStack.pop();
           this.applyAdjustments();
       }
       
       redo() {
           if (this.state.redoStack.length === 0) return;
           this.state.undoStack.push(this.state.settings);
           this.state.settings = this.state.redoStack.pop();
           this.applyAdjustments();
       }
       
       loadPreset(preset) {
           this.pushUndo();
           Object.assign(this.state.settings, preset);
           this.applyAdjustments();
       }
       
       savePreset() {
           return { ...this.state.settings };
       }
       
       destroy() {
           this.components.forEach(c => c.destroy());
           super.destroy();
       }
   }
   ```

### Phase 4: Three Bundle Classes (Week 4)

**Files to create:**

1. `assets/js/shared/image-adjustments/MinimalBundle.js`
   ```javascript
   class MinimalBundle extends AdjustmentBundleBase {
       getDefaultSettings() {
           return {
               brightness: 0,
               contrast: 1.0,
               gamma: 1.0,
               saturation: 1.0,
               hue: 0
           };
       }
       
       render() {
           // Create 5 sliders
           // Wire onChange handlers
           // Return DOM structure
       }
   }
   ```

2. `assets/js/shared/image-adjustments/StandardBundle.js`
   ```javascript
   class StandardBundle extends AdjustmentBundleBase {
       getDefaultSettings() {
           return {
               ...MinimalBundle.getDefaultSettings(),
               exposure: 0,
               levels: { black: 0, mid: 1.0, white: 255 },
               resize: null,
               rotate: 0,
               flip: { h: false, v: false }
           };
       }
       
       render() {
           // Create collapsible sections: Tone, Color, Levels, Transform
           // Include LevelsControl component
           // Include ResizeControl component
           // Wire all handlers
       }
   }
   ```

3. `assets/js/shared/image-adjustments/ProfessionalBundle.js`
   ```javascript
   class ProfessionalBundle extends AdjustmentBundleBase {
       getDefaultSettings() {
           return {
               ...StandardBundle.getDefaultSettings(),
               vibrance: 1.0,
               temperature: 0,
               tint: 0,
               shadows: 0,
               highlights: 0,
               curveLUT: null,
               curveChannel: 'rgb',
               curvePoints: {
                   rgb: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
                   r: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
                   g: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
                   b: [{ x: 0, y: 0 }, { x: 255, y: 255 }],
                   luminance: [{ x: 0, y: 0 }, { x: 255, y: 255 }]
               },
               resizeMethod: 'bicubic',
               cropArea: null
           };
       }
       
       render() {
           // All Standard sections plus:
           // - Curves section with CurveEditor
           // - Advanced color controls
           // - Advanced transform controls
       }
   }
   ```

### Phase 5: ToolBase Integration (Week 5)

**Files to modify:**

1. `assets/js/shared/component-library.js`
   - Register new component type: `'adjustment-bundle'`
   - Map to bundle classes based on second parameter

2. `assets/js/tools/core/tool-base.js`
   - Add handler for `'adjustment-bundle'` type
   - Pass through options correctly
   - Wire onChange callbacks

**Integration code:**
```javascript
// In component-library.js
const COMPONENT_CONSTRUCTORS = {
    // ... existing types ...
    'adjustment-bundle': (type, label, range, options) => {
        const bundleType = label; // 'minimal', 'standard', 'professional'
        const BundleClass = {
            'minimal': MinimalBundle,
            'standard': StandardBundle,
            'professional': ProfessionalBundle
        }[bundleType];
        
        return new BundleClass({
            ...options,
            onChange: (adjustedImage, settings) => {
                if (options.onChange) {
                    options.onChange(adjustedImage, settings);
                }
            }
        });
    }
};
```

### Phase 6: Refactor Existing Tools (Week 6)

**Files to modify:**

1. `assets/js/tools/processors/ascii-art-generator.js`
   - Replace custom adjustment sliders with `['adjustment-bundle', 'minimal']`
   - Remove `applyImageAdjustments()` custom function
   - Remove brightness custom implementation
   - Wire to new bundle's onChange

2. `assets/js/tools/processors/colour-quantizer-toolbase.js`
   - Replace adjustment sliders with `['adjustment-bundle', 'standard']`
   - Add levels control
   - Remove duplicate code

3. `assets/js/tools/fabrication/multifilament-print-tool.js`
   - Add optional `['adjustment-bundle', 'minimal']`
   - Wire to quantization pipeline

**Testing:** Verify no regressions, all tools work as before

### Phase 7: Documentation & Presets (Week 7)

**Files to create:**

1. `assets/js/shared/image-adjustments/presets/common-presets.json`
   ```json
   {
       "High Contrast B&W": {
           "saturation": 0,
           "contrast": 1.5,
           "gamma": 1.2
       },
       "Warm Vintage": {
           "temperature": 7000,
           "saturation": 0.8,
           "gamma": 0.9,
           "contrast": 0.85
       },
       "Cool Modern": {
           "temperature": 3000,
           "saturation": 1.2,
           "vibrance": 1.3,
           "contrast": 1.1
       },
       "Film Look": {
           "curveLUT": [...],
           "saturation": 0.9,
           "temperature": 6500
       },
       "High Key": {
           "exposure": 1.5,
           "shadows": 50,
           "contrast": 0.7
       },
       "Low Key": {
           "exposure": -0.5,
           "highlights": -50,
           "contrast": 1.3
       }
   }
   ```

2. `blog/docs/components/adjustment-bundles.md`
   - Complete API documentation
   - Usage examples for each bundle
   - Integration guide
   - Preset creation guide
   - Troubleshooting

3. `blog/docs/algorithms/image-adjustments.md`
   - Mathematical formulas for each adjustment
   - Order of operations explanation
   - Quality considerations
   - Performance notes

---

## 5. SIDEBAR INTEGRATION EXAMPLES

### Example 1: ASCII Art Generator (Minimal)

```javascript
export const TOOL_CONFIG = {
    title: 'ASCII ART GENERATOR',
    sidebar: [
        ['INPUT', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
            ]],
            ['adjustment-bundle', 'minimal', null, {
                key: 'imageAdjust',
                onChange: (adjustedImage, settings) => {
                    state.processedImage = adjustedImage;
                    processImage(this);
                }
            }],
        ]],
        // ... rest of config
    ]
};
```

### Example 2: Colour Quantizer (Standard)

```javascript
export const TOOL_CONFIG = {
    title: 'COLOUR QUANTIZER',
    sidebar: [
        ['IMAGE', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
            ]],
            ['adjustment-bundle', 'standard', null, {
                key: 'imageAdjust',
                showHistogram: true,
                showPresets: true,
                onChange: (adjustedImage, settings) => {
                    state.previewImage = adjustedImage;
                    tool.draw();
                },
                onTransform: (transformedImage, transform) => {
                    if (transform.type === 'resize') {
                        updateCanvasDimensions(transformedImage);
                    }
                }
            }],
        ]],
        // ... rest of config
    ]
};
```

### Example 3: New "Image Processor" Tool (Professional)

```javascript
export const TOOL_CONFIG = {
    title: 'IMAGE PROCESSOR',
    sidebar: [
        ['INPUT', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
            ]],
            ['adjustment-bundle', 'professional', null, {
                key: 'imageAdjust',
                showHistogram: true,
                showCurves: true,
                showPresets: true,
                curveChannels: ['rgb', 'r', 'g', 'b', 'luminance'],
                undoStackSize: 20,
                enableCrop: true,
                onChange: (adjustedImage, settings) => {
                    state.currentImage = adjustedImage;
                    state.settings = settings;
                    tool.draw();
                },
                onCurveChange: (curveData, channel) => {
                    // Real-time curve preview (debounced)
                    updateCurvePreview(curveData, channel);
                },
                onTransform: (transformedImage, transform) => {
                    handleTransform(transformedImage, transform);
                }
            }],
        ]],
        ['PROCESS', [
            // Additional processing options
        ]],
        ['EXPORT', [
            ['button', 'Export PNG', null, { key: 'exportPng' }],
            ['button', 'Export Settings', null, { key: 'exportSettings' }],
        ]]
    ]
};
```

---

## 6. PERFORMANCE OPTIMIZATION

### 6.1 Strategies

1. **Debouncing**
   - Slider updates: 100ms debounce
   - Curve dragging: 50ms debounce
   - Final update on pointer up (no debounce)

2. **Web Workers**
   - Offload heavy processing (resize, curves) to worker thread
   - Show low-res preview during processing
   - Display full-res result when complete

3. **Progressive Rendering**
   - For images >2048px, downsample for preview
   - Apply adjustments at low res first
   - Compute full res in background

4. **Caching**
   - Cache intermediate results (e.g., after levels, before curves)
   - Only recompute affected pipeline stages
   - Invalidate cache on relevant setting change

5. **Canvas Reuse**
   - Reuse ImageData buffers
   - Don't create new Uint8ClampedArray unless necessary
   - Use typed array views when possible

### 6.2 Implementation

```javascript
class AdjustmentBundleBase extends BaseComponent {
    constructor(options) {
        super();
        this.options = {
            useWorker: true,              // Use Web Worker for heavy ops
            lowResThreshold: 2048,        // Switch to low-res preview above this
            debounceMs: 100,              // Debounce delay for sliders
            cacheIntermediates: true,     // Cache pipeline stages
            ...options
        };
        
        this.worker = this.options.useWorker ? this.createWorker() : null;
        this.cache = new Map();
    }
    
    createWorker() {
        // Create worker from inline script
        const workerCode = `
            importScripts('algorithms/image/index.js');
            
            self.onmessage = function(e) {
                const { type, data } = e.data;
                
                if (type === 'applyAdjustments') {
                    const result = applyAllAdjustments(data.imageData, data.settings);
                    self.postMessage({ type: 'result', data: result }, [result.data.buffer]);
                }
            };
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        return new Worker(URL.createObjectURL(blob));
    }
    
    async applyAdjustmentsAsync() {
        if (!this.worker) {
            return this.applyAdjustments();
        }
        
        // Check if we should use low-res preview
        const { width, height } = this.state.originalImage;
        const shouldDownsample = Math.max(width, height) > this.options.lowResThreshold;
        
        if (shouldDownsample) {
            // Show low-res preview immediately
            const lowRes = this.downsampleForPreview(this.state.originalImage);
            const previewResult = await this.processInWorker(lowRes);
            this.emit('preview', previewResult);
            
            // Process full-res in background
            const fullResult = await this.processInWorker(this.state.originalImage);
            this.state.adjustedImage = fullResult;
            this.emit('change', fullResult, this.state.settings);
        } else {
            // Process normally
            const result = await this.processInWorker(this.state.originalImage);
            this.state.adjustedImage = result;
            this.emit('change', result, this.state.settings);
        }
    }
    
    processInWorker(imageData) {
        return new Promise((resolve, reject) => {
            const handler = (e) => {
                if (e.data.type === 'result') {
                    this.worker.removeEventListener('message', handler);
                    resolve(e.data.data);
                }
            };
            
            this.worker.addEventListener('message', handler);
            this.worker.postMessage({
                type: 'applyAdjustments',
                data: {
                    imageData: imageData,
                    settings: this.state.settings
                }
            }, [imageData.data.buffer]);
        });
    }
    
    downsampleForPreview(imageData) {
        // Downsample to max 1024px for preview
        const scale = Math.min(1, 1024 / Math.max(imageData.width, imageData.height));
        if (scale >= 1) return imageData;
        
        return nearestNeighborResize(imageData, scale);
    }
}
```

---

## 7. TESTING PLAN

### 7.1 Unit Tests

**Algorithms:**
```javascript
describe('Image Adjustments', () => {
    test('applyBrightness(+50) increases all pixels', () => {
        const input = createTestImage(100, 100, [128, 128, 128]);
        const output = applyBrightness(input, 50);
        expect(output.data[0]).toBe(178);
    });
    
    test('applyBrightness clamps to [0, 255]', () => {
        const input = createTestImage(100, 100, [250, 250, 250]);
        const output = applyBrightness(input, 50);
        expect(output.data[0]).toBe(255);
    });
    
    test('applyHueRotation(180°) inverts colors correctly', () => {
        const input = createTestImage(100, 100, [255, 0, 0]); // Red
        const output = applyHueRotation(input, 180);
        expect(output.data[0]).toBeCloseTo(0);   // R → 0
        expect(output.data[1]).toBeCloseTo(255); // G → 255
        expect(output.data[2]).toBeCloseTo(255); // B → 255
    });
    
    test('applyExposure(+1) doubles brightness', () => {
        const input = createTestImage(100, 100, [64, 64, 64]);
        const output = applyExposure(input, 1.0);
        expect(output.data[0]).toBe(128);
    });
    
    test('proportionalResize(2×) doubles dimensions', () => {
        const input = createTestImage(100, 100);
        const output = proportionalResize(input, { scale: 2, method: 'nearest' });
        expect(output.width).toBe(200);
        expect(output.height).toBe(200);
    });
});
```

### 7.2 Integration Tests

**Bundles:**
```javascript
describe('MinimalBundle', () => {
    test('renders 5 sliders', () => {
        const bundle = new MinimalBundle({});
        const dom = bundle.render();
        expect(dom.querySelectorAll('input[type="range"]').length).toBe(5);
    });
    
    test('onChange fires with adjusted ImageData', (done) => {
        const testImage = createTestImage(100, 100);
        const bundle = new MinimalBundle({
            onChange: (adjusted, settings) => {
                expect(adjusted instanceof ImageData).toBe(true);
                expect(settings.brightness).toBe(50);
                done();
            }
        });
        bundle.setImage(testImage);
        bundle.updateSetting('brightness', 50);
    });
    
    test('reset restores defaults', () => {
        const bundle = new MinimalBundle({});
        bundle.updateSetting('brightness', 50);
        bundle.reset();
        expect(bundle.state.settings.brightness).toBe(0);
    });
    
    test('undo reverts to previous state', () => {
        const bundle = new MinimalBundle({});
        bundle.updateSetting('brightness', 50);
        bundle.updateSetting('brightness', 100);
        bundle.undo();
        expect(bundle.state.settings.brightness).toBe(50);
    });
});
```

### 7.3 Visual Regression Tests

```javascript
describe('Visual Regression', () => {
    test('brightness +50 matches reference', async () => {
        const input = await loadImage('test/fixtures/test-image.png');
        const output = applyBrightness(input, 50);
        const reference = await loadImage('test/references/brightness-50.png');
        expect(compareImages(output, reference)).toBeLessThan(0.01); // < 1% diff
    });
    
    test('S-curve matches Photoshop output', async () => {
        const input = await loadImage('test/fixtures/test-image.png');
        const curve = loadCurvePreset('sCurve');
        const lut = generateCurveLUT(curve);
        const output = applyCurveLUT(input, lut, 'rgb');
        const reference = await loadImage('test/references/s-curve-photoshop.png');
        expect(compareImages(output, reference)).toBeLessThan(0.02); // < 2% diff
    });
});
```

---

## 8. SUCCESS CRITERIA

### 8.1 Functional Requirements

- ✅ All three bundles render correctly in tool sidebar
- ✅ Real-time preview with <100ms perceived lag
- ✅ Works on images up to 4096×4096 without freezing
- ✅ Undo/redo works for 20 steps
- ✅ Presets save/load correctly
- ✅ Curves editor supports 2-16 control points
- ✅ Touch devices fully supported
- ✅ Keyboard navigation works
- ✅ Integrates in <10 lines of config code

### 8.2 Code Quality Requirements

- ✅ Zero inline styles (all VGA CSS variables)
- ✅ Zero manual DOM outside BaseComponent
- ✅ 100% test coverage for algorithms
- ✅ Complete JSDoc with @source citations
- ✅ No console warnings/errors
- ✅ Passes linter with zero violations

### 8.3 Performance Requirements

- ✅ Slider adjustment: <16ms (60 FPS)
- ✅ Curve drag: <33ms (30 FPS)
- ✅ Full adjustment pipeline: <500ms for 2048×2048
- ✅ Resize operations: <1000ms for 2048×2048
- ✅ Memory usage: <50MB per bundle instance

### 8.4 UX Requirements

- ✅ All sliders show current value
- ✅ Reset button works per-section and globally
- ✅ Curves show control point coordinates
- ✅ Histogram updates in real-time
- ✅ Before/after comparison available
- ✅ Presets applied in <100ms
- ✅ Mobile: all controls at least 44×44px touch target

---

## 9. DEPLOYMENT CHECKLIST

- [ ] Phase 1: Core algorithms implemented & tested
- [ ] Phase 2: Curve editor fully functional
- [ ] Phase 3: Base class complete
- [ ] Phase 4: All three bundles working
- [ ] Phase 5: ToolBase integration complete
- [ ] Phase 6: ASCII & Colour Quantizer refactored
- [ ] Phase 7: Documentation complete
- [ ] Visual regression tests passing
- [ ] Performance benchmarks met
- [ ] Browser testing (Chrome, Firefox, Safari, Edge)
- [ ] Mobile testing (iOS Safari, Android Chrome)
- [ ] Code review passed
- [ ] Presets library complete
- [ ] Example tools updated
- [ ] Blog documentation published

---

## 10. FUTURE ENHANCEMENTS

**Post-MVP Features:**

1. **Advanced Curve Editor:**
   - Freehand drawing mode
   - Import/export curve files (.acv, .amp)
   - Per-channel split view
   - Curve diff comparison

2. **Histogram Analysis:**
   - RGB split histogram
   - Clipping warnings (highlights/shadows)
   - Dynamic range meter
   - Histogram matching

3. **Batch Processing:**
   - Apply settings to multiple images
   - Queue system
   - Progress tracking
   - Export as ZIP

4. **AI Enhancements:**
   - Auto-levels (intelligent histogram stretch)
   - Auto-white balance
   - Content-aware adjustments

5. **Advanced Presets:**
   - User-contributed preset library
   - Preset tagging/search
   - Preset thumbnails
   - Preset categories (Portrait, Landscape, B&W, Vintage, etc.)

---

## APPENDIX: CURVE EDITOR KEYBOARD SHORTCUTS

| Shortcut | Action |
|----------|--------|
| Click | Add control point or select existing |
| Drag | Move selected point |
| Shift + Drag | Fine control (0.1x speed) |
| Right-Click | Delete point |
| Delete / Backspace | Delete selected point |
| Arrow Keys | Nudge selected point (5px) |
| Shift + Arrow | Nudge selected point (1px) |
| Ctrl/Cmd + Z | Undo |
| Ctrl/Cmd + Shift + Z | Redo |
| Ctrl/Cmd + R | Reset curve |
| Tab | Select next point |
| Shift + Tab | Select previous point |
| Space | Toggle before/after preview |
| Escape | Deselect point |
| Ctrl/Cmd + D | Duplicate curve to all channels |
| 1-5 | Switch channel (1=RGB, 2=R, 3=G, 4=B, 5=Luma) |

