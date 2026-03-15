# Module Code Standards

Applies to all effect module `*Node.js` files. This guide translates the sitewide coding standards (`blog/docs/guides/standards/coding-standards.md`) into the specific constraints of the effect module context. When this guide and the sitewide standards conflict, the sitewide standards win.

**Note on authority:** `blog/docs/guides/tools/effect-module-build-guide.md` (factory pattern) supersedes `blog/docs/guides/effect-module-standards.md` (old class-extension pattern). The factory pattern is authoritative for all module authoring.

---

## 1. Single Source of Truth — What a Module Owns

A `*Node.js` file owns exactly three things:

1. **`params`** — the parameter definition object (inside the `createEffectModule` config)
2. **`apply(src, dst, w, h, p, ctx, modulate)`** — the pixel render function
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

If a module script contains code that belongs to any of the above owners, that code is misplaced and must be flagged as a WARN in `issues-and-conflicts.md`.

---

## 2. Factory Pattern Contract

Effect modules use the factory function `createEffectModule(config)` from `core/EffectModule.js`. Module files contain no class body, no constructor, no `this`.

```javascript
import { createEffectModule } from '../../core/EffectModule.js';
import { someAlgorithm } from '../../../../../shared/algorithms/image/blur-filters.js';

export const GaussianBlurNode = createEffectModule({
  type: 'gaussblur',
  name: 'GAUSS BLUR',
  category: 'BLUR',
  params: {
    sigma:  { value: 2, min: 0.1, max: 30, step: 0.1, label: 'SIGMA',  tier: 3, previewMax: 5, driveable: true },
    passes: { value: 1, min: 1,   max: 3,  step: 1,   label: 'PASSES', tier: 4, previewMax: 1 }
  },
  apply(src, dst, w, h, p) {
    dst.set(someAlgorithm(src, w, h, p.sigma, p.passes));
  }
});
```

The factory internally produces a class extending `EffectNode`. From the module file's perspective, there is no class.

**Module-level helper functions** are stateless pure functions. They take all inputs as arguments and return a value. They do not read `this` and do not access module-level mutable variables.

```javascript
// Correct: pure module-level helper
function _buildKernel(sigma) {
  const r = Math.ceil(sigma * 3);
  const k = new Float32Array(2 * r + 1);
  // ...
  return k;
}
```

Module-level mutable state is acceptable only when it is a cross-call cache (a precomputed LUT that never changes after first construction) and this intent is explicitly documented in a comment.

---

## 3. Four-Layer Architecture

The effect module system has four tiers. Know which tier each concern belongs to:

| Tier | Layer | Files | Owns |
| --- | --- | --- | --- |
| Algorithm | `assets/js/shared/algorithms/` | Pure math functions, image kernels | Stateless computation |
| Module | `nodes/*Node.js` | `createEffectModule` configs | params, apply, applyVector |
| Framework | `core/EffectModule.js`, `core/EffectNode.js` | Factory, base class | Preview resolution, modulation wiring, destroy |
| Host | `core/`, `ui/` | Pipeline, WorkerBridge, NodePanel | Pipeline execution, UI, Workers |

**A module must never reach into the Host tier.** It receives everything it needs through the `apply` arguments. It must not import from `core/` (except `EffectModule.js`) or `ui/`.

**A module should use the Algorithm tier.** If an algorithm exists in `assets/js/shared/algorithms/`, import it. Do not reimplement it in the module.

---

## 4. No DOM in Worker Context

All `apply()` and `applyVector()` execution occurs inside a Web Worker. Worker context has no browser globals.

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

These are runtime ERRORs, not style issues. The Worker throws when these APIs are called.

---

## 5. AnimationFoundation Rule

Modules must not manage their own animation timing. Forbidden in module files:

```javascript
requestAnimationFrame(fn)   // forbidden
cancelAnimationFrame(id)    // forbidden
setInterval(fn, ms)         // forbidden for animation
setTimeout(fn, ms)          // forbidden for animation
```

The host drives all animation via `AnimationFoundation.AnimationLoop`. The module implements only `apply()`. Frame context is available as `ctx.frame` and `ctx.frameCount`.

---

## 6. Algorithm Library Rule

Before writing any algorithm inline in a module, search `assets/js/shared/algorithms/`. All major distort algorithms are already there.

```
Does the algorithm exist in assets/js/shared/algorithms/?
  YES → import and use it; do not reimplement
  NO  → is it non-trivial (more than a one-liner)?
          YES → flag for escalation via component-algorithm-escalation.md
                then implement inline until the library version exists
          NO  → implement inline (one-liners are not escalation candidates)
```

**Escalation does not block implementation.** Implement inline, flag as `[NOTE] [ESCALATION]` in `issues-and-conflicts.md`, and continue.

---

## 7. Naming Conventions

| Item | Convention | Example |
| --- | --- | --- |
| Module `type` | lowercase, no separators | `gaussblur`, `otsuthreshold` |
| Exported constant | `<Name>Node` PascalCase | `GaussianBlurNode`, `OtsuThresholdNode` |
| File name | `<ClassName>.js` | `GaussianBlurNode.js` |
| `param` key | camelCase | `blurRadius`, `noiseScale`, `iterationCount` |
| `param` label | SCREAMING CASE | `BLUR RADIUS`, `NOISE SCALE` |
| Module-scope helper functions | `_camelCase` | `_buildKernel`, `_computeOtsu` |

---

## 8. Comments

Comments must explain non-obvious intent, trade-offs, or algorithmic decisions. They must not narrate what the code does line by line.

**Correct:**
```javascript
// Gray-Scott: inhibitor kill rate k determines whether the pattern is stable.
// Values below ~0.055 produce spot patterns; above ~0.062 produce stripes.
for (let i = 0; i < w * h; i++) {
  const u = uGrid[i], v = vGrid[i];
  const uvv = u * v * v;
  nextU[i] = u + (Du * lapU[i] - uvv + F * (1 - u)) * dt;
  nextV[i] = v + (Dv * lapV[i] + uvv - (F + k) * v) * dt;
}
```

**Incorrect:**
```javascript
// Loop over pixels
for (let y = 0; y < h; y++) {
  // Get pixel index
  const idx = (y * w + x) * 4;
}
```

ASCII only in comments. No emoji, no Unicode arrows, no smart quotes.

---

## 9. Error Handling in apply()

`apply()` must not throw uncaught exceptions. The Pipeline does not wrap node calls in try/catch.

Required defensive practices:
- Guard division by zero: `const safe = a / (b + 1e-6)` or `if (b < 1e-10) return`
- Guard pixel buffer index bounds: clamp `x` to `[0, w-1]` and `y` to `[0, h-1]` before computing `(y * w + x) * 4`
- Guard `Math.sqrt` of quantities that can be negative: `Math.sqrt(Math.max(0, x))`

These guards must be placed only where the risk is real from the code logic. Do not add guards universally — that hides bugs.
