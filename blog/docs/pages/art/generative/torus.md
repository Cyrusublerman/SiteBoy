# Torus (3D Toroidal Surface Animation)

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Generative Art/torus/dist/script.js`
**Related docs found:** None

### Purpose
3D torus visualization with helical surface spirals. Renders cross-section ellipses and surface-following spiral curves that wind around the torus in opposing directions.

### Output Type
- [ ] Static image
- [x] Animation (looping)
- [ ] Interactive visualization
- [ ] Data/calculation result
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. 3D torus defined by major radius R=150 and minor radius r=150
2. Fixed camera angles (π/6 X-rotation, π/8 Y-rotation)
3. Cross-section ellipses rendered with 25% alpha
4. 9 clockwise + 9 counter-clockwise surface spirals (4 winds each)
5. Full rotation around X-axis during cycle
6. 3600 frames per cycle

---

## 2. Tool Classification

**Is this a tool?** Generative Art (animated visualization)

**Input:** Implicit (hardcoded parameters)
**Processing:** 3D→2D projection with rotation
**Output:** Animated wireframe torus

**Frame-based?** Yes
**Looping?** Yes (3600 frames)
**Duration:** Infinite loop

---

## 3. Variable Analysis

### Exposed Parameters (from source - all hardcoded)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| R | const | 150 | Major radius |
| r | const | 150 | Minor radius |
| cycleFrames | const | 3600 | Frames per rotation |
| viewAngleX | const | π/6 | Camera X angle |
| viewAngleY | const | π/8 | Camera Y angle |
| numEllipses | const | 36 | Cross-section count |
| numSpirals | const | 9 | Spirals per direction |
| winds | const | 4 | Spiral windings |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Major Radius | slider | 50-300, step 10 |
| Minor Radius | slider | 50-300, step 10 |
| View Angle X | slider | 0-π, step 0.1 |
| View Angle Y | slider | 0-π, step 0.1 |
| Spiral Count | slider | 1-20, step 1 |
| Wind Count | slider | 1-10, step 1 |
| Cycle Duration | slider | 600-7200, step 60 |

### Missing Controls (not in source, should add)
- [ ] Play/Pause
- [ ] Frame export
- [ ] Video/GIF export
- [ ] Canvas width/height
- [ ] Frame count / duration
- [ ] Loop toggle
- [ ] Playback speed
- [ ] All geometric parameters

---

## 4. Gap Analysis

### Available in our library but missing in source:
- All controls (currently hardcoded)
- Play/Pause
- Export functionality
- Adjustable parameters

### Source features requiring new components:
- 3D projection utilities (could be shared)

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| majorRadius | number | 150 | 50 | 300 | 10 | R in formulas |
| minorRadius | number | 150 | 50 | 300 | 10 | r in formulas |
| viewAngleX | number | 0.524 | 0 | 3.14 | 0.1 | radians |
| viewAngleY | number | 0.393 | 0 | 3.14 | 0.1 | radians |
| numSpirals | number | 9 | 1 | 20 | 1 | per direction |
| windCount | number | 4 | 1 | 10 | 1 | spiral windings |
| cycleFrames | number | 3600 | 600 | 7200 | 60 | animation length |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Animation | canvas | continuous | Auto |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'TORUS',
    
    sidebar: [
        ['GEOMETRY', [
            ['Torus', [
                ['slider', 'Major Radius', 50, 300, 10, { value: 150, key: 'majorRadius' }],
                ['slider', 'Minor Radius', 50, 300, 10, { value: 150, key: 'minorRadius' }],
            ]],
            ['Spirals', [
                ['slider', 'Spiral Count', 1, 20, 1, { value: 9, key: 'numSpirals' }],
                ['slider', 'Wind Count', 1, 10, 1, { value: 4, key: 'windCount' }],
            ]],
        ]],
        ['VIEW', [
            ['Camera', [
                ['slider', 'Angle X', 0, 3.14, 0.1, { value: 0.524, precision: 2, key: 'viewAngleX' }],
                ['slider', 'Angle Y', 0, 3.14, 0.1, { value: 0.393, precision: 2, key: 'viewAngleY' }],
            ]],
        ]],
        ['ANIMATION', [
            ['Playback', [
                ['slider', 'Cycle Frames', 600, 7200, 60, { value: 3600, key: 'cycleFrames' }],
                ['button', 'Play/Pause', { key: 'playPause' }],
                ['button', 'Reset', { key: 'reset' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.frame = 0;
        this.animator = new AnimationFoundation.AnimationLoop({
            onFrame: () => {
                this.frame++;
                this.draw();
            }
        });
        this.animator.start();
    },
    
    onDraw: function(ctx, canvas, values) {
        this.drawTorus(ctx, canvas, values);
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **3D Projection:** Custom `project3D(x, y, z, xRotation)` applies camera and rotation
- **Torus Parametric:** x = (R + r·cos(φ))·cos(θ), y = (R + r·cos(φ))·sin(θ), z = r·sin(φ)
- **Spiral Winding:** θ = t·winds·2π + offset; φ = t·2π (winds around minor circle)
- **Performance:** 1000 points per spiral × 18 spirals × 36 ellipses - may need optimization
- **Animation:** Must use AnimationFoundation, not raw RAF

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| project3D | 15 | 3D math | - | High |
| drawTorusSpiral | 25 | geometry | - | Medium |
| drawToroidalSurfaceSpiral | 30 | geometry | - | Medium |

**Shared Utility Candidates:**
- `Projection3D.orthographic(x, y, z, angleX, angleY)` - 3D to 2D projection
- `TorusGeometry.parametric(R, r, theta, phi)` - Torus surface point
