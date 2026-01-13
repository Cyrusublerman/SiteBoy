# Tool Page Standards — Vite Edition

**VERSION:** 2.0.0  
**UPDATED:** 2025-12-20 — Updated for Vite/ES Modules  

Minimum requirements and consistency patterns for all tool/generative art pages in a Vite-based ES Module environment.

---

## Critical Changes from v1.x

**🔴 BREAKING CHANGES:**
- All code examples now use ES Module imports
- Shared utilities require explicit imports
- Component promotion path updated for ES modules
- No window globals or script tags

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
| Play/Pause | ✓ | Auto via `animation` config |
| Stop/Reset | ✓ | Auto via `animation` config |
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
// In _createConfig() method
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
- Location: Below canvas (via `canvas.showControls: true`)
- Format: `{resolution} → {display} ({scale}%)`
- Errors: Red text, same location

### Export Button Placement
Always in dedicated 'Export' block, ordered:
1. Export current (PNG/Frame)
2. Export all (GIF/Video/SVG)
3. Copy to clipboard

---

## ES Module Import Patterns

### Basic Tool Imports
```javascript
// Required imports for ALL tools
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';
```

### Conditional Imports
```javascript
// For animations
import { AnimationFoundation } from '../core/animation-foundation.js';

// For math utilities
import { safePow, clamp, lerp, map } from '../shared/utils/math.js';

// For color work
import { ColorSpaceConverter } from '../shared/utils/color.js';
import { deltaE76, deltaE94, deltaE00 } from '../shared/utils/color-distance.js';

// For image processing
import { ImageProcessor } from '../shared/utils/image-processor.js';

// For parametric equations
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// For orbital mechanics
import { OrbitalMechanics } from '../shared/algorithms/physics/orbital-mechanics.js';

// For audio synthesis
import { AudioSynthesizer } from '../shared/utils/audio-synthesizer.js';
```

---

## Reusable Code Patterns

### Identified Shared Utilities

| Pattern | Used In | Component/Utility | Import Path |
|---------|---------|-------------------|-------------|
| Parametric equations | Lissajous, Harmonics, Wave, Spirals | `EquationEngine` | `../shared/algorithms/parametric/equation-engine.js` |
| Color space conversion | Quantizer, any color tool | `ColorSpaceConverter` | `../shared/utils/color.js` |
| Image filters | Quantizer, Pixel Tiler | `ImageProcessor` | `../shared/utils/image-processor.js` |
| Orbital mechanics | Solar System, Asteroid Belt | `OrbitalMechanics` | `../shared/algorithms/physics/orbital-mechanics.js` |
| Audio synthesis | Cymatics, any audio | `AudioSynthesizer` | `../shared/utils/audio-synthesizer.js` |
| Animation loop | All animated | `AnimationFoundation` | `../core/animation-foundation.js` |
| State management | Wave, Lissajous | `StateManager` | `../shared/utils/state-manager.js` |

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
**Import:** `import { UtilityName } from '../shared/utils/{name}.js';`

### Interface
```javascript
// ES Module export
export class UtilityName {
    constructor(options) {
        // ...
    }
    
    method() {
        // ...
    }
}

// Or for utility functions
export function utilityFunction(param) {
    // ...
}
```

### Usage Example
```javascript
import { UtilityName } from '../shared/utils/utility-name.js';

const util = new UtilityName({ option: value });
const result = util.method();
```

### Notes
(why extract, concerns, etc.)
```

---

## Equation System Standardization

Given Lissajous, Harmonics, Wave Interference, Spirals all use similar patterns:

### EquationEngine Usage

```javascript
// Import
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// In your tool class
_initEquationEngine(values) {
    this.engine = new EquationEngine({
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
}

_evaluateEquations() {
    // Evaluate with current parameters
    const points = this.engine.evaluate({ 
        tStart: 0, 
        tEnd: 2 * Math.PI, 
        steps: 1000 
    });
    
    return points;
}
```

### Safe Math Functions

```javascript
// Import
import { safePow, clamp, lerp, map } from '../shared/utils/math.js';

// Usage
_calculate(base, exponent) {
    // Handle negative bases with fractional exponents
    const result = safePow(base, exponent);
    
    // Clamp to range
    const clamped = clamp(result, 0, 1);
    
    // Linear interpolation
    const interpolated = lerp(0, 100, clamped);
    
    // Map from one range to another
    const mapped = map(clamped, 0, 1, -50, 50);
    
    return mapped;
}
```

**These functions should be in `assets/js/shared/utils/math.js`:**
```javascript
export function safePow(base, exp) {
    // Handle negative bases with fractional exp
    if (base < 0 && exp % 1 !== 0) {
        return -Math.pow(-base, exp);
    }
    return Math.pow(base, exp);
}

export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

export function lerp(a, b, t) {
    return a + (b - a) * t;
}

export function map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
}
```

---

## Component Promotion Path (Vite Edition)

```
One-off code in tool
        ↓
Noted in page MD "Reusable Code Candidates"
        ↓
Used in 2nd tool → Copy (with note)
        ↓
Used in 3rd tool → Extract to shared/utils/
        ↓
Create ES Module with proper exports
        ↓
Import in tools that need it
        ↓
Needs UI → Promote to component
        ↓
Add to component-library.js exports
```

### Creating a New Shared Utility

**1. Create the file:** `assets/js/shared/utils/my-utility.js`

```javascript
/**
 * MyUtility - Brief description
 * @version 1.0.0
 */

export class MyUtility {
    constructor(options = {}) {
        this.options = options;
    }
    
    process(input) {
        // Implementation
        return output;
    }
}

// Or for simple functions
export function myUtilityFunction(param) {
    // Implementation
    return result;
}

// Can export multiple items
export function helperFunction(param) {
    return result;
}

console.log('✅ MyUtility loaded (ES Module)');
```

**2. Import in tools:**

```javascript
import { MyUtility, myUtilityFunction } from '../shared/utils/my-utility.js';

export class MyTool {
    _onInit(values) {
        this.utility = new MyUtility({ option: value });
    }
    
    _process(data) {
        return this.utility.process(data);
    }
}
```

**3. Document in registry:**

Add to `blog/docs/guides/shared-utilities.md` with import examples.

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

| Code Block | Lines | Category | Reuse Potential | Import Path (if extracted) |
|------------|-------|----------|-----------------|----------------------------|
| safePow() | 5 | math | High - used in all parametric | `../shared/utils/math.js` |
| deltaE76() | 8 | color | Medium - color tools only | `../shared/utils/color-distance.js` |
| blueNoiseDither() | 40 | image | Low - very specific | Not yet extracted |
```

---

## Import Examples by Category

### Math Utilities
```javascript
import { 
    safePow,      // Safe power function
    clamp,        // Clamp to range
    lerp,         // Linear interpolation
    map,          // Map between ranges
    normalize,    // Normalize to 0-1
    smoothstep    // Smooth interpolation
} from '../shared/utils/math.js';
```

### Color Utilities
```javascript
import { 
    ColorSpaceConverter,  // RGB/HSL/LAB conversion
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    hslToRgb,
    rgbToLab,
    labToRgb
} from '../shared/utils/color.js';

import {
    deltaE76,    // CIE76 color distance
    deltaE94,    // CIE94 color distance  
    deltaE00     // CIEDE2000 color distance
} from '../shared/utils/color-distance.js';
```

### Image Processing
```javascript
import { 
    ImageProcessor,       // Main processor class
    quantizeColors,       // Color quantization
    applyDither,          // Dithering algorithms
    detectEdges,          // Edge detection
    applyBlur             // Blur filters
} from '../shared/utils/image-processor.js';
```

### Parametric Equations
```javascript
import { 
    EquationEngine        // Parametric equation evaluator
} from '../shared/algorithms/parametric/equation-engine.js';

import {
    lissajous,           // Lissajous curve generator
    harmonograph,        // Harmonograph pattern
    spiral               // Spiral generator
} from '../shared/algorithms/parametric/curves.js';
```

### Animation
```javascript
import { 
    AnimationFoundation  // Main animation system
} from '../core/animation-foundation.js';

// Usage
_startAnimation() {
    this.animator = new AnimationFoundation.AnimationLoop({
        fps: 60,
        onFrame: () => this.tool.draw()
    });
    this.animator.start();
}

destroy() {
    if (this.animator) {
        this.animator.destroy();
    }
}
```

### Audio Synthesis
```javascript
import { 
    AudioSynthesizer,    // Audio synthesis utility
    createOscillator,
    createFMSynth,
    applyADSR
} from '../shared/utils/audio-synthesizer.js';

// Usage
_initAudio() {
    this.synth = new AudioSynthesizer({
        waveform: 'sine',
        frequency: 440
    });
    this.synth.play();
}

destroy() {
    if (this.synth) {
        this.synth.stop();
    }
}
```

### Physics/Simulation
```javascript
import {
    OrbitalMechanics,    // Orbital calculations
    calculatePosition,
    calculateVelocity
} from '../shared/algorithms/physics/orbital-mechanics.js';

import {
    ParticleSystem,      // Particle simulation
    Particle,
    Force
} from '../shared/algorithms/physics/particles.js';
```

---

## Checklist for New Tools

Before submitting a tool conversion:

### Functionality
- [ ] All minimum features for output type present
- [ ] Export buttons work
- [ ] Canvas sizing works
- [ ] Reset/clear works
- [ ] All imports have `.js` extension
- [ ] No references to `window` globals
- [ ] ComponentLibrary passed in deps

### ES Module Compliance
- [ ] File uses ES Module syntax (no IIFE)
- [ ] All dependencies imported at top
- [ ] Class exported as default
- [ ] Optional alias export if needed
- [ ] Registered in AssetLoader
- [ ] Registered in tools_section.js (5 places)

### Consistency
- [ ] Uses standard tab names
- [ ] Uses standard block names
- [ ] Follows F-system sizing
- [ ] Status in correct location
- [ ] Follows constructor-based config pattern
- [ ] Uses arrow functions for callbacks

### Code Quality
- [ ] No duplicate logic from other tools
- [ ] Complex code noted in "Reusable Code Candidates"
- [ ] Uses existing shared utilities where applicable
- [ ] Utilities imported with correct paths
- [ ] Proper cleanup in destroy() method
- [ ] No memory leaks (animations/audio stopped)

### Documentation
- [ ] Page MD has all required sections
- [ ] Variables fully documented
- [ ] Config section complete
- [ ] Import statements documented
- [ ] Reusable code candidates noted

---

## Common Import Paths Quick Reference

```javascript
// Core framework
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';

// Animation
import { AnimationFoundation } from '../core/animation-foundation.js';

// Math utilities
import { safePow, clamp, lerp, map } from '../shared/utils/math.js';

// Color utilities
import { ColorSpaceConverter } from '../shared/utils/color.js';
import { deltaE76 } from '../shared/utils/color-distance.js';

// Image processing
import { ImageProcessor } from '../shared/utils/image-processor.js';

// Parametric curves
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// Physics
import { OrbitalMechanics } from '../shared/algorithms/physics/orbital-mechanics.js';
import { ParticleSystem } from '../shared/algorithms/physics/particles.js';

// Audio
import { AudioSynthesizer } from '../shared/utils/audio-synthesizer.js';
```

---

## Migration Notes

### Converting Old Tools to Vite

When converting tools that use old patterns:

**Before (WRONG for Vite):**
```javascript
// Assumed global
var result = safePow(base, exp);
```

**After (CORRECT for Vite):**
```javascript
// Explicit import
import { safePow } from '../shared/utils/math.js';

// Then use
const result = safePow(base, exp);
```

**Before (WRONG for Vite):**
```javascript
// Global EquationEngine
var engine = new window.EquationEngine({ ... });
```

**After (CORRECT for Vite):**
```javascript
// Import first
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';

// Then use
const engine = new EquationEngine({ ... });
```

---

## Shared Utility Best Practices

### 1. Always Use Imports
```javascript
// ❌ NEVER assume globals
const result = someUtilityFunction();

// ✅ ALWAYS import first
import { someUtilityFunction } from '../shared/utils/utilities.js';
const result = someUtilityFunction();
```

### 2. Import Only What You Need
```javascript
// ❌ Import everything
import * as MathUtils from '../shared/utils/math.js';
const result = MathUtils.safePow(2, 3);

// ✅ Import specific items
import { safePow, clamp } from '../shared/utils/math.js';
const result = safePow(2, 3);
```

### 3. Document Your Imports
```javascript
/**
 * MyTool - Description
 * 
 * Dependencies:
 * - ToolBase: Core framework
 * - ComponentLibrary: UI components
 * - safePow, clamp: Math utilities from shared/utils/math.js
 * - EquationEngine: Parametric equations from shared/algorithms
 */
import { ToolBase } from './tool-base.js';
import ComponentLibrary from '../shared/component-library.js';
import { safePow, clamp } from '../shared/utils/math.js';
import { EquationEngine } from '../shared/algorithms/parametric/equation-engine.js';
```

### 4. Check for Existing Utilities First
Before implementing any algorithm:
1. Check `assets/js/shared/utils/` for existing utilities
2. Check `assets/js/shared/algorithms/` for complex algorithms
3. Check `blog/docs/guides/shared-utilities.md` for registry
4. If it exists → IMPORT IT
5. If missing → Add to library FIRST, then import

---

End of Tool Standards v2.0.0 - Vite Edition
