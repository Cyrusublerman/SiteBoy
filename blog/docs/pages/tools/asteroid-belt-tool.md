# Asteroid Belt Tool

**Type:** Tool / Visualization  
**Category:** Astronomy Simulation  
**Status:** Converted (ToolBase)  
**Source:** `assets/js/tools/asteroid-belt-tool.js`

---

## 1. Overview

Interactive visualization of an asteroid belt orbiting a central star. This tool generates a randomized distribution of particles within configurable inner and outer radius boundaries, with optional rotation animation.

### Key Features
- Configurable inner and outer belt radii
- Adjustable particle count
- Optional rotation animation with speed control
- Reference circles showing belt boundaries
- Regenerate and clear functionality
- Black/white noise pattern aesthetic

### Visual Output
A top-down view of an asteroid belt with:
- Central yellow sun marker
- Black and white particles distributed in belt region
- Faint reference circles showing belt boundaries
- Smooth rotation when animation enabled

---

## 2. User Controls

### Belt Parameters
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Inner Radius | slider | 0.5-5.0 | 2.2 | Inner belt boundary (AU) |
| Outer Radius | slider | 1.0-8.0 | 3.2 | Outer belt boundary (AU) |
| Particle Count | slider | 50-2000 | 300 | Number of asteroids |

### Display
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Scale | slider | 20-200 | 80 | Pixels per AU |
| Background | color | hex | #000000 | Canvas background |

### Animation
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Rotation | toggle | Enabled | off | Enable orbital rotation |
| Speed | slider | 0.1-5.0 | 0.5 | Rotation speed multiplier |

### Actions
| Control | Type | Description |
|---------|------|-------------|
| Regenerate | button | Create new random distribution |
| Clear | button | Remove all particles |

---

## 3. Functional Requirements

### Core Behavior
1. **Initialization:** Generate random particles within belt bounds
2. **Static Display:** Render particles centered on canvas
3. **Animation:** Rotate particles when enabled
4. **Regeneration:** New random distribution on demand
5. **Reference Display:** Show inner/outer boundary circles

### Particle Generation
```javascript
function generateParticles(values) {
    particles = [];
    cached = null;
    
    const colors = ['#FFFFFF', '#000000'];
    const innerRadius = values.innerRadius;
    const outerRadius = values.outerRadius;
    const particleCount = values.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            angle: Math.random() * TWO_PI,
            distance: innerRadius + Math.random() * (outerRadius - innerRadius),
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}
```

### Animation System
- Uses AnimationFoundation.AnimationLoop
- Delta-time based rotation for smooth animation
- Speed multiplier applied to rotation increment
- Cache invalidation not needed (rotation applied at render time)

### Rendering
1. Clear canvas with background color
2. Draw central sun marker (yellow circle)
3. Compute cached screen positions if needed
4. Apply rotation transform to each particle
5. Draw particles as 1px rectangles
6. Draw reference circles for boundaries

---

## 4. Technical Architecture

### Source Analysis
```javascript
const TOOL_CONFIG = {
    title: 'ASTEROID BELT',
    
    sidebar: [
        ['CONTROLS', [
            ['Belt Parameters', [
                ['slider', 'Inner Radius', 0.5, 5.0, 0.1, { value: 2.2, ... }],
                ['slider', 'Outer Radius', 1.0, 8.0, 0.1, { value: 3.2, ... }],
                ['slider', 'Particle Count', 50, 2000, 50, { value: 300, ... }],
            ]],
            // ... more controls
        ]],
    ],
    
    onInit: function(values) {
        generateParticles(values);
        initAnimator(this);
        // Wire buttons
    },
    
    onUpdate: function(key, value, allValues) {
        // Regenerate on parameter changes
        // Handle animation toggle
    },
    
    onDraw: function(ctx, canvas, values) {
        // Render particles with optional rotation
    },
};
```

### Dependencies
- ToolBase (rendering framework)
- AnimationFoundation.AnimationLoop (rotation animation)

### State Management
Module-level state:
- `particles[]` - Array of {angle, distance, color}
- `cached[]` - Pre-computed screen positions
- `rotationAngle` - Current rotation offset
- `animator` - AnimationLoop instance

### Performance Optimizations
- Screen positions cached (only invalidated on scale change)
- Rotation applied mathematically (no re-projection)
- Batch rendering with fillRect

---

## 5. ToolBase Configuration

### Current Implementation
```javascript
const TOOL_CONFIG = {
    title: 'ASTEROID BELT',
    
    sidebar: [
        ['CONTROLS', [
            ['Belt Parameters', [
                ['slider', 'Inner Radius', 0.5, 5.0, 0.1, { value: 2.2, withNumber: true, key: 'innerRadius' }],
                ['slider', 'Outer Radius', 1.0, 8.0, 0.1, { value: 3.2, withNumber: true, key: 'outerRadius' }],
                ['slider', 'Particle Count', 50, 2000, 50, { value: 300, withNumber: true, key: 'particleCount' }],
            ]],
            ['Display', [
                ['slider', 'Scale', 20, 200, 10, { value: 80, withNumber: true, key: 'scale' }],
                ['color', 'Background', '#000000', { key: 'bgColor' }],
            ]],
            ['Animation', [
                ['toggle', 'Rotation', ['Enabled'], { key: 'rotationEnabled', selectedValues: [] }],
                ['slider', 'Speed', 0.1, 5.0, 0.1, { value: 0.5, precision: 1, withNumber: true, key: 'speed' }],
            ]],
            ['Actions', [
                ['button', 'Regenerate', null, { key: 'regenerate' }],
                ['button', 'Clear', null, { key: 'clear' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
};
```

### Potential Enhancements
```
[ENHANCED CONTROLS]
  └─ Distribution
      └─ [dropdown] Pattern (Uniform, Clustered, Rings)
      └─ [slider] Density Variance (0-100)
  └─ Colors
      └─ [color] Particle Color 1
      └─ [color] Particle Color 2
      └─ [slider] Color Mix Ratio
  └─ Export
      └─ [button] Export PNG
      └─ [button] Export SVG
```

---

## 6. Visual Design

### Layout
- Square canvas (420px default)
- Single CONTROLS tab in sidebar
- Minimal UI for focus on visualization

### Color Scheme
- Black background (space)
- Yellow central sun
- Black/white particles (noise pattern)
- Semi-transparent white reference circles

### Aesthetic Notes
- Deliberately simple/abstract representation
- Noise pattern creates organic feel
- Reference circles provide scale context

---

## 7. Testing Checklist

### Functional Tests
- [ ] Particles generate within belt bounds
- [ ] Inner/outer radius sliders work
- [ ] Particle count slider regenerates
- [ ] Scale slider resizes visualization
- [ ] Background color changes
- [ ] Rotation toggle starts/stops animation
- [ ] Speed slider affects rotation rate
- [ ] Regenerate creates new distribution
- [ ] Clear removes all particles

### Visual Tests
- [ ] Sun marker visible at center
- [ ] Particles distributed in annular region
- [ ] Reference circles visible
- [ ] Animation smooth at 60fps
- [ ] No particles outside bounds

### Cleanup Tests
- [ ] Animator stopped on destroy
- [ ] State reset on destroy
- [ ] No memory leaks

---

## 8. References

### Astronomical Background
- **Main Asteroid Belt:** 2.2-3.2 AU from Sun (default values)
- **AU (Astronomical Unit):** ~150 million km
- **Real Belt:** Contains millions of asteroids

### Implementation References
- Source: `assets/js/tools/asteroid-belt-tool.js`
- AnimationFoundation: `assets/js/core/animation-foundation.js`
- ToolBase: `assets/js/tools/tool-base.js`

### Related Tools
- [Solar System](#solar-system) - Full planetary visualization
- [Spinning Phyllo Ball](#spinning-phyllo-ball) - Similar rotation animation

### Origin Note
This tool was created as an original demonstration during the ToolBase conversion process. It does not have a CodePen source reference.

