# Circles (Rolling Circles Animation)

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Generative Art/circles/dist/script.js`
**Related docs found:** None

### Purpose
Concentric rolling circles animation. Creates hypnotic spirograph-like patterns through hierarchical circle transforms. Each circle orbits within its parent, producing complex recursive motion.

### Output Type
- [ ] Static image
- [x] Animation (looping)
- [ ] Interactive visualization
- [ ] Data/calculation result
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. 100 nested circles with decreasing radii
2. Each circle orbits within parent
3. Rolling motion accumulates rotations
4. 3 rendering modes: lines (outlines), bw (alternating fill), gradient (alpha overlay)
5. 3600 frames per full cycle
6. Uses `requestAnimationFrame` loop

---

## 2. Tool Classification

**Is this a tool?** Generative Art (configurable animation)

**Input:** Mode selection
**Processing:** Hierarchical transform calculation
**Output:** Animated canvas

**Frame-based?** Yes
**Looping?** Yes (3600 frames = 60 seconds at 60fps)
**Duration:** Infinite loop

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| numCircles | const | 100 | Number of nested circles |
| largestRadius | const | 350 | Outer circle radius |
| radiusDecrement | const | 3.5 | Radius step per circle |
| cycleFrames | const | 3600 | Frames per complete cycle |
| mode | string | lines/bw/gradient | Rendering mode |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Mode | radio | lines/bw/gradient |
| Circle Count | slider | 10-200, step 1 |
| Outer Radius | slider | 100-400, step 10 |
| Cycle Duration | slider | 600-7200, step 60 |
| Play/Pause | button | toggle |
| Reset | button | restart animation |

### Missing Controls (not in source, should add)
- [x] Play/Pause
- [ ] Frame export
- [ ] Video/GIF export
- [ ] Canvas width/height
- [ ] Frame count / duration
- [ ] Loop toggle
- [ ] Playback speed
- [ ] Color customization
- [ ] Line width

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Play/Pause control
- FPS control
- Canvas resize
- Export functionality
- Color picker for lines

### Source features requiring new components:
- None - standard canvas animation

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| mode | radio | lines | - | - | - | lines/bw/gradient |
| numCircles | number | 100 | 10 | 200 | 1 | Performance impact |
| largestRadius | number | 350 | 100 | 400 | 10 | px |
| cycleFrames | number | 3600 | 600 | 7200 | 60 | frames per loop |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Animation | canvas | continuous | Auto |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'ROLLING CIRCLES',
    
    sidebar: [
        ['CONTROLS', [
            ['Display', [
                ['radio', 'Mode', ['lines', 'bw', 'gradient'], { key: 'mode', selectedValue: 'lines' }],
            ]],
            ['Parameters', [
                ['slider', 'Circles', 10, 200, 1, { value: 100, key: 'numCircles' }],
                ['slider', 'Outer Radius', 100, 400, 10, { value: 350, key: 'largestRadius' }],
                ['slider', 'Cycle Frames', 600, 7200, 60, { value: 3600, key: 'cycleFrames' }],
            ]],
            ['Playback', [
                ['button', 'Play/Pause', { key: 'playPause' }],
                ['button', 'Reset', { key: 'reset' }],
                ['value', 'Frame', { key: 'frameDisplay' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.frame = 0;
        this.circles = this.buildCircles(values);
        this.animator = new AnimationFoundation.AnimationLoop({
            onFrame: () => {
                this.frame++;
                this.draw();
            }
        });
        this.animator.start();
    },
    
    onUpdate: function(key, value, allValues) {
        if (['numCircles', 'largestRadius'].includes(key)) {
            this.circles = this.buildCircles(allValues);
        }
    },
    
    onDraw: function(ctx, canvas, values) {
        this.drawCircles(ctx, canvas, values);
    },
    
    destroy: function() {
        if (this.animator) this.animator.destroy();
        if (this.tool) this.tool.destroy();
    }
};
```

---

## 7. Implementation Notes

- **Transform Hierarchy:** Each circle inherits parent's rotation + adds its own orbital motion
- **Performance:** 100+ circles may impact performance; consider reducing for mobile
- **Animation Loop:** Must use AnimationFoundation, not raw RAF
- **Mode Rendering:**
  - `lines`: White stroke outlines
  - `bw`: Alternating black/white fills with white stroke on black
  - `gradient`: 1% alpha white fills for additive glow effect

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| buildCircles | 8 | geometry | - | Low |
| calculateTransforms | 25 | math | torus | Medium |
| drawCircles | 35 | canvas | - | Low |

**Shared Utility Candidates:**
- `AnimationHelper.frameLoop(onFrame)` - Replaced by AnimationFoundation

