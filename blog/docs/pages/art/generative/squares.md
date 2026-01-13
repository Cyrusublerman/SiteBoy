# Squares (Optical Illusion Grid)

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Generative Art/squares/dist/script.js`
**Related docs found:** None

### Purpose
Black and white optical illusion animation with dynamic tile grid. Transitions between geometric patterns (checkerboard, stripes, café wall) with morphing effects (rotation waves, compression, radial pulses).

### Output Type
- [ ] Static image
- [x] Animation (looping)
- [x] Interactive visualization (play/pause, keyboard controls)
- [ ] Data/calculation result
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. 50×50 grid of tiles (2500 tiles)
2. 7 base patterns: allBlack, allWhite, checkerboard, horizontalStripes, verticalStripes, cafeWall, diagonalStripes
3. 5 transition types: radialWave, linearSweep, verticalSweep, spiralUnwind, randomFlicker
4. 6 effect types: none, rotationWave, compressionWave, cafeWallShift, radialPulse, spiralRotation, shapeMorph
5. 240-second timeline with pattern/transition/effect sequences
6. Keyboard controls: Space (play/pause), R (restart), H (hide info)

---

## 2. Tool Classification

**Is this a tool?** Generative Art (choreographed animation)

**Input:** Playback controls
**Processing:** Pattern→transition→effect pipeline
**Output:** Animated optical illusion

**Frame-based?** Yes (16ms timestep)
**Looping?** Yes (240 seconds)
**Duration:** 4 minutes loop

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| GRID | const | 50 | Grid size (50×50) |
| time | number | 0-240 | Current animation time |
| isPaused | boolean | true/false | Play state |
| infoVisible | boolean | true/false | Show overlay info |

### Timeline Segments
| Time | Type | Content | Duration |
|------|------|---------|----------|
| 0-2 | pattern | allBlack | 2s |
| 2-8 | transition | radialWave → checkerboard | 6s |
| 8-28 | pattern | checkerboard + rotationWave | 20s |
| 28-33 | transition | linearSweep → horizontalStripes | 5s |
| (continues for 240 seconds) | | | |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Grid Size | slider | 10-100, step 5 |
| Time | slider | 0-240, step 0.1 (scrubber) |
| Play/Pause | button | toggle |
| Restart | button | reset |
| Show Info | toggle | on/off |
| Speed | slider | 0.5-2, step 0.1 |

### Missing Controls (not in source, should add)
- [ ] Timeline scrubber
- [ ] Speed control
- [ ] Grid size adjustment
- [ ] Export frame/GIF
- [ ] Pattern/effect selection (override timeline)

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Timeline scrubber
- Speed control
- Export functionality
- Parameter overrides

### Source features requiring new components:
- Complex timeline system (could be shared)
- Easing function library

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| gridSize | number | 50 | 10 | 100 | 5 | Performance impact |
| time | number | 0 | 0 | 240 | 0.016 | Animation time |
| speed | number | 1 | 0.5 | 2 | 0.1 | Playback speed |
| isPaused | boolean | false | - | - | - | Play state |
| showInfo | boolean | true | - | - | - | Info overlay |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Animation | canvas | continuous | Auto |
| Phase Info | text | overlay | Auto |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'OPTICAL SQUARES',
    
    sidebar: [
        ['CONTROLS', [
            ['Playback', [
                ['button', 'Play/Pause', { key: 'playPause' }],
                ['button', 'Restart', { key: 'restart' }],
                ['slider', 'Speed', 0.5, 2, 0.1, { value: 1, key: 'speed' }],
            ]],
            ['Display', [
                ['toggle', 'Show Info', ['Enabled'], { key: 'showInfo', selectedValues: ['Enabled'] }],
            ]],
        ]],
        ['PARAMETERS', [
            ['Grid', [
                ['slider', 'Grid Size', 10, 100, 5, { value: 50, key: 'gridSize' }],
            ]],
            ['Timeline', [
                ['slider', 'Time', 0, 240, 0.1, { value: 0, key: 'time' }],
                ['value', 'Phase', { key: 'currentPhase' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.time = 0;
        this.spiralPath = this.generateSpiral(values.gridSize);
        this.animator = new AnimationFoundation.AnimationLoop({
            onFrame: () => {
                if (!this.isPaused) {
                    this.time += 0.016 * values.speed;
                    if (this.time >= 240) this.time = 0;
                }
                this.draw();
            }
        });
        this.animator.start();
    },
    
    onUpdate: function(key, value, allValues) {
        if (key === 'gridSize') {
            this.spiralPath = this.generateSpiral(value);
        }
        if (key === 'time') {
            this.time = value;
        }
    },
    
    onDraw: function(ctx, canvas, values) {
        this.drawGrid(ctx, canvas, values);
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **Performance:** 2500 tiles with per-tile transforms. Grid 50+ may impact framerate.
- **Spiral Path:** Pre-computed for spiralUnwind transition. Regenerate on grid resize.
- **Easing Functions:** Uses cubic easeIn/easeOut/easeInOut for smooth animations
- **Envelope Function:** Smooth fade in/out for effects to avoid jarring transitions
- **Flip Animation:** Tiles scale to 0 then back up while changing color
- **Animation Loop:** Must use AnimationFoundation, not raw RAF

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| easeIn/easeOut/easeInOut | 3 each | math | - | High |
| hash | 5 | math | - | Medium |
| generateSpiral | 20 | geometry | - | Medium |
| envelope | 5 | animation | - | High |
| getFlipState | 25 | animation | - | Medium |
| patterns object | 15 | patterns | - | Medium |
| transitions object | 30 | animation | - | Medium |
| effects object | 80 | animation | - | Medium |
| drawCard | 30 | canvas | - | Low |

**Shared Utility Candidates:**
- `Easing.cubicIn(t)`, `.cubicOut(t)`, `.cubicInOut(t)` - Standard easing functions
- `TimelineController.getCurrentState(time, timeline)` - Timeline interpolation
- `GridPatterns.checkerboard(col, row)` - Pattern generators

