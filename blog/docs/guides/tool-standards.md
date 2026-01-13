# Tool Page Standards

Minimum requirements and consistency patterns for all tool/generative art pages.

---

## Minimum Functionality by Output Type

### Canvas/Image Output
| Feature | Required | Component |
|---------|----------|-----------|
| Canvas sizing | ✓ | `['slider', 'Width/Height', ...]` |
| Export PNG | ✓ | `['button', 'Download PNG']` |
| Export SVG | If vector | `['button', 'Download SVG']` |
| Background color | Optional | `['color', 'Background', ...]` |
| Clear/Reset | ✓ | `['button', 'Clear']` |

### Animation Output
| Feature | Required | Component |
|---------|----------|-----------|
| Play/Pause | ✓ | `['button', 'Play/Pause']` |
| Stop/Reset | ✓ | `['button', 'Reset']` |
| Frame export | ✓ | Auto via `animation` config |
| GIF/Video export | ✓ | Auto via `animation` config |
| Frame rate | ✓ | Auto via `animation` config |
| Loop toggle | ✓ | `['toggle', 'Options', ['Loop']]` |
| Playback speed | Optional | `['slider', 'Speed', 0.1, 2, 0.1]` |
| Frame scrubber | Optional | `['slider', 'Frame', 0, max, 1]` |
| Duration display | ✓ | Status text |

**Animation Export Integration:**
When using ToolBase, add `animation` config to auto-inject export controls:
```javascript
animation: {
    type: 'loop',           // 'loop' | 'sequence' | 'infinite'
    loopFrames: 360,        // For loop type
    sequenceDuration: 10,   // For sequence type (seconds)
    defaultFps: 60,
    canPrerender: true
}
```
This adds FPS, Frames, Format, and Export Animation button to CANVAS tab.

### Audio Output
| Feature | Required | Component |
|---------|----------|-----------|
| Play/Stop | ✓ | `['button', 'Play/Stop']` |
| Volume | ✓ | `['slider', 'Volume', 0, 100, 1]` |
| Mute toggle | Optional | `['toggle', 'Options', ['Mute']]` |
| Waveform display | Optional | Canvas overlay |
| Export audio | If applicable | `['button', 'Export WAV']` |

### Data/Calculation Output
| Feature | Required | Component |
|---------|----------|-----------|
| Copy to clipboard | ✓ | `['button', 'Copy']` |
| Export JSON/CSV | If applicable | `['button', 'Export Data']` |
| Value displays | ✓ | `['value', ...]` components |

### File Input
| Feature | Required | Component |
|---------|----------|-----------|
| File picker | ✓ | `['file', 'Upload', 'mime/*']` |
| Drag & drop | Optional | FileInput supports this |
| Format info | ✓ | Label showing accepted formats |
| Clear/Reset | ✓ | `['button', 'Clear']` |

---

## Consistency Requirements

### Layout
- Sidebar width: **30F (420px)**
- Control height: **2F (28px)**
- Gap between controls: **F2 (7px)**
- Gap between blocks: **F (14px)**
- Block padding: **F (14px)**

### Tab Organization
Standard tab names (use applicable ones):
```
['CONTROLS', [...]]     ← Primary parameters
['CANVAS', [...]]       ← Size, export, display options
['ANIMATION', [...]]    ← Playback controls (if animated)
['PRESETS', [...]]      ← Saved configurations
['INFO', [...]]         ← Help, about, formulas
```

### Block Naming
Consistent block titles:
```
'Parameters'      ← Main adjustable values
'Style'           ← Colors, stroke, fill
'Canvas'          ← Size, resolution
'Export'          ← Download buttons
'Playback'        ← Animation controls
'Source'          ← File input
'Output'          ← Results display
```

### Status Display
- Location: Below canvas
- Format: `{resolution} → {display} ({scale}%)`
- Errors: Red text, same location

### Export Button Placement
Always in dedicated 'Export' block, ordered:
1. Export current (PNG/Frame)
2. Export all (GIF/Video/SVG)
3. Copy to clipboard

---

## Reusable Code Patterns

### Identified Shared Utilities

| Pattern | Used In | Candidate Component/Utility |
|---------|---------|----------------------------|
| Parametric equations | Lissajous, Harmonics, Wave, Spirals | `EquationEngine` |
| Color space conversion | Quantizer, any color tool | `ColorSpaceConverter` |
| Image filters | Quantizer, Pixel Tiler | `ImageProcessor` |
| Orbital mechanics | Solar System, Asteroid Belt | `OrbitalMechanics` |
| Audio synthesis | Cymatics, any audio | `AudioSynthesizer` |
| Animation loop | All animated | `AnimationController` |
| Export handling | All tools | `ExportManager` |
| Checkpoint/undo | Wave, Lissajous | `StateManager` |

### When to Extract a Utility

Extract when:
1. **Used in 3+ tools** — Not just 2 (could be coincidence)
2. **Complex logic** — More than 20 lines of non-trivial code
3. **Testable** — Can be unit tested in isolation
4. **Configurable** — Has parameters that vary between uses

Don't extract when:
1. **Too specific** — Only makes sense in one context
2. **Simple** — Just a few lines, inline is clearer
3. **Tightly coupled** — Depends heavily on tool-specific state

### Shared Utility Registry

Track potential utilities in: `blog/docs/guides/shared-utilities.md`

```markdown
## {Utility Name}

**Status:** Candidate | Implemented | Rejected
**Used in:** [list of tools]
**Complexity:** Low | Medium | High
**Location:** `assets/js/shared/utils/{name}.js`

### Interface
(describe API)

### Notes
(why extract, concerns, etc.)
```

---

## One-Off Code Tracking

### Process

1. **During conversion:** Note any complex logic that seems reusable
2. **Add to registry:** Even if only used once, if it's substantial
3. **Tag with category:** equation, image, audio, animation, math, etc.
4. **Review periodically:** When 3+ uses exist, extract

### Registry Format

In page description MD, add section:

```markdown
## 8. Reusable Code Candidates

| Code Block | Lines | Category | Reuse Potential |
|------------|-------|----------|-----------------|
| safePow() | 5 | math | High - used in all parametric |
| deltaE76() | 8 | color | Medium - color tools only |
| blueNoiseDither() | 40 | image | Low - very specific |
```

---

## Equation System Standardization

Given Lissajous, Harmonics, Wave Interference, Spirals all use similar patterns:

### Proposed: `EquationEngine`

```javascript
// Shared equation evaluation
const engine = new EquationEngine({
    variables: {
        A: { value: 1, min: -2, max: 2 },
        w: { value: 3, min: 1, max: 300 },
        p: { value: 1, min: -7, max: 7 },
        phi: { value: 0, min: -Math.PI, max: Math.PI },
    },
    equations: {
        x: 'A * pow(cos(w*t + phi), p)',
        y: 'A * pow(sin(w*t + phi), p)',
    },
});

// Evaluate
const points = engine.evaluate({ tStart: 0, tEnd: 2*Math.PI, steps: 1000 });
```

### Safe Math Functions
```javascript
// These should be in shared/utils/math.js
safePow(base, exp)      // Handle negative bases with fractional exp
clamp(value, min, max)
lerp(a, b, t)
map(value, inMin, inMax, outMin, outMax)
```

---

## Component Promotion Path

```
One-off code in tool
        ↓
Noted in page MD "Reusable Code Candidates"
        ↓
Used in 2nd tool → Copy (with note)
        ↓
Used in 3rd tool → Extract to shared/utils/
        ↓
Needs UI → Promote to component
        ↓
Add to component-library.js routing
```

---

## Checklist for New Tools

Before submitting a tool conversion:

### Functionality
- [ ] All minimum features for output type present
- [ ] Export buttons work
- [ ] Canvas sizing works
- [ ] Reset/clear works

### Consistency
- [ ] Uses standard tab names
- [ ] Uses standard block names
- [ ] Follows F-system sizing
- [ ] Status in correct location

### Code Quality
- [ ] No duplicate logic from other tools
- [ ] Complex code noted in "Reusable Code Candidates"
- [ ] Uses existing shared utilities where applicable

### Documentation
- [ ] Page MD has all required sections
- [ ] Variables fully documented
- [ ] Config section complete

