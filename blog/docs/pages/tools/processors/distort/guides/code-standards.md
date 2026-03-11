# Module Code Standards

Applies to all effect module `*Node.js` files. This guide translates the sitewide coding standards (`blog/docs/guides/standards/coding-standards.md`) into the specific constraints of the effect module context. When this guide and the sitewide standards conflict, the sitewide standards win.

---

## 1. Single Source of Truth — What a Module Owns

A `*Node.js` file owns exactly three things:

1. **`paramDefs`** — the parameter definition object
2. **`apply(src, dst, w, h, ctx)`** — the pixel render function
3. **Module-scope pure helper functions** — stateless functions with no side effects

A `*Node.js` file must not own:

| Concern | Where it lives |
| --- | --- |
| UI component creation | `assets/js/shared/component-library.js` via NodePanel |
| DOM operations | `assets/js/core/base-component.js` |
| Animation loop management | `assets/js/core/animation-foundation.js` |
| Layout math | `assets/js/core/mathematical-foundation.js` |
| Sidebar tab or block definition | `assets/js/tools/processors/distort/ui/` |
| Routing / navigation | `assets/js/core/router.js` |
| Buffer pool management | `assets/js/tools/processors/distort/core/Pipeline.js` |

If a module script contains code that belongs to any of the above owners, that code is misplaced and must be flagged as a WARN in `issues-and-conflicts.md`.

---

## 2. EffectNode Class Contract

Effect modules use class inheritance. Every module extends `EffectNode`:

```javascript
// Correct: class hierarchy
import { EffectNode } from '../EffectNode.js';

export class GaussianBlurNode extends EffectNode {
    constructor() {
        super();
        this.type = 'gaussblur';
        this.category = 'Blur';
        this.paramDefs = { /* ... */ };
    }

    apply(src, dst, w, h, ctx) {
        // pixel computation
    }

    destroy() {
        this._kernelCache = null;
    }
}
```

**State** belongs as class instance properties (`this._xxx`). It must not be stored in module-level mutable variables.

**Module-level helper functions** are stateless pure functions. They take all inputs as arguments and return a value. They do not read `this` and do not access module-level mutable variables.

```javascript
// Correct: pure module-level helper
function _buildKernel(sigma) {
    const r = Math.ceil(sigma * 3);
    const k = new Float32Array(2 * r + 1);
    // ...
    return k;
}

// Wrong: module-level mutable state
let _sharedBuffer = null;  // WARN unless documented as intentional cross-call cache
```

Module-level mutable state is acceptable only when it is deliberately a cross-call cache (a precomputed LUT that never changes after first construction) and this intent is explicitly documented.

---

## 3. Three-Layer Architecture

The effect module system has three tiers in scope. Know which tier each concern belongs to:

| Tier | Layer | Files | Owns |
| --- | --- | --- | --- |
| Algorithm | `assets/js/shared/algorithms/` | Math functions, image kernels | Stateless math |
| Module | `nodes/*Node.js` | EffectNode subclasses | paramDefs, apply, buildGeometry |
| Framework | `core/`, `ui/` | Pipeline, WorkerBridge, NodePanel | Pipeline execution, UI, Workers |

**A module must never reach into the Framework tier.** It receives everything it needs through the `apply(src, dst, w, h, ctx)` arguments. It must not import from `core/` or `ui/`.

**A module should use the Algorithm tier.** If an algorithm exists in `assets/js/shared/algorithms/`, import it. Do not reimplement it in the module.

---

## 4. No DOM in Worker Context

All `apply()` and `buildGeometry()` execution occurs inside a Web Worker. Worker context has no browser globals.

**Forbidden unconditionally in any `*Node.js` file:**
```javascript
document.createElement(...)     // ERROR: no DOM in Worker
document.getElementById(...)    // ERROR
document.querySelector(...)     // ERROR
element.innerHTML = ...         // ERROR
element.appendChild(...)        // ERROR
window.addEventListener(...)    // ERROR
window.location                 // ERROR
fetch(...)                      // ERROR: no network in Worker
requestAnimationFrame(fn)       // ERROR
setInterval(fn, ms)             // ERROR
setTimeout(fn, ms)              // ERROR
```

These are not style violations — they are runtime ERRORs. The Worker throws when these APIs are called. A module that accesses any of these is broken in production.

If a module has a genuine need for async data (e.g. an ML model), the pattern is to load data in the main thread and pass it to the Worker via `ctx` — not to call network APIs in the module.

---

## 5. AnimationFoundation Rule

Modules must not manage their own animation timing.

**Forbidden in module files for animation purposes:**
```javascript
requestAnimationFrame(fn)   // forbidden
cancelAnimationFrame(id)    // forbidden
setInterval(fn, ms)         // forbidden for animation
setTimeout(fn, ms)          // forbidden for animation
```

The host drives all animation via `AnimationFoundation.AnimationLoop`. The module implements only `apply()`. The `ctx.frame` and `ctx.frameCount` arguments to `apply()` provide frame-level temporal context.

If a module needs frame-dependent output (e.g. animated noise that changes over time), it reads `ctx.frame` — it does not track its own frame counter.

---

## 6. Algorithm Library Rule

Before writing any algorithm inline in a module, search `assets/js/shared/algorithms/`:

```
Does the algorithm exist in assets/js/shared/algorithms/?
  YES → import and use it; do not reimplement
  NO  → is it non-trivial (more than a one-liner)?
          YES → flag for escalation via component-algorithm-escalation.md
                then implement inline until the library version exists
          NO  → implement inline (one-liners are not escalation candidates)
```

**Escalation does not block implementation.** Implement inline, flag as `[NOTE] [ESCALATION]` in `issues-and-conflicts.md`, and continue.

**What constitutes "non-trivial":** any algorithm with more than one step, any algorithm with a name in the field (Gaussian convolution, Sobel gradient, Otsu threshold, bilinear interpolation), any algorithm that takes more than 5 lines to implement correctly.

---

## 7. Naming Conventions

All naming follows `blog/docs/guides/standards/coding-standards.md` §Nomenclature, applied to the module context:

| Item | Convention | Example |
| --- | --- | --- |
| Module `type` | lowercase, no separators | `gaussblur`, `otsuthreshold` |
| Class name | `<Name>Node` PascalCase | `GaussianBlurNode`, `OtsuThresholdNode` |
| File name | `<ClassName>.js` | `GaussianBlurNode.js` |
| `paramDef` key | camelCase | `blurRadius`, `noiseScale`, `iterationCount` |
| `paramDef` label | SCREAMING CASE | `BLUR RADIUS`, `NOISE SCALE` |
| Internal class properties | `_camelCase` | `_kernelCache`, `_lut` |
| Module-scope helper functions | `_camelCase` | `_buildKernel`, `_computeOtsu` |
| Preset `name` | Title Case | `Soft`, `High Contrast` |

Rationale for the underscore prefix on internal names: it signals to the framework and to documentation that these are internal implementation details, not part of the public contract between the module and the Pipeline.

---

## 8. Comments

Comments must explain non-obvious intent, trade-offs, or algorithmic decisions. They must not narrate what the code does line by line.

**Correct:**
```javascript
// Gray-Scott: inhibitor kill rate k determines whether the pattern is stable.
// Values below ~0.055 produce spot patterns; above ~0.062 produce stripes.
// The transition is sensitive — small k changes produce qualitatively different morphologies.
for (let i = 0; i < w * h; i++) {
    const u = uGrid[i], v = vGrid[i];
    const uvv = u * v * v;
    nextU[i] = u + (Du * lapU[i] - uvv + F * (1 - u)) * dt;
    nextV[i] = v + (Dv * lapV[i] + uvv - (F + k) * v) * dt;
}
```

**Incorrect:**
```javascript
// Loop over pixels     <-- narrates obvious code
for (let y = 0; y < h; y++) {
    // Get pixel index  <-- narrates obvious code
    const idx = (y * w + x) * 4;
}
```

ASCII only in comments. No emoji, no Unicode arrows, no smart quotes.

---

## 9. Error Handling in apply()

`apply()` must not throw uncaught exceptions. The Pipeline does not wrap node calls in try/catch — an uncaught exception terminates the render.

Required defensive practices:
- Guard division by zero: `const safe = a / (b + 1e-6)` or `if (b < 1e-10) return`
- Guard pixel buffer index bounds: clamp `x` to `[0, w-1]` and `y` to `[0, h-1]` before computing `(y * w + x) * 4`
- Guard `Math.sqrt` of quantities that can be negative: `Math.sqrt(Math.max(0, x))`
- Release all `ctx.pool` buffers before any early return

These guards must be minimal and placed only where the risk is real from the code logic. Do not add guards universally — that hides bugs.
