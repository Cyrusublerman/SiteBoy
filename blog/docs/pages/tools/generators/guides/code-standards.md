# Generator Code Standards

Applies to all `.gen.js` generator scripts. This guide translates the sitewide coding standards (`blog/docs/guides/standards/coding-standards.md`) into the specific constraints of the generator script context. When this guide and the sitewide standards conflict, the sitewide standards win.

---

## 1. Single Source of Truth — What a Generator Script Owns

A `.gen.js` file owns exactly three things:

1. **`SCRIPT_CONFIG`** — the exported configuration and state object
2. **Render hooks** — `p5Setup`, `p5Draw`, or `draw` as methods on SCRIPT_CONFIG
3. **Module-level pure helper functions** — stateless functions with no `this` reference and no side effects

A `.gen.js` file must not own:

| Concern | Where it lives |
| --- | --- |
| UI component creation | `assets/js/shared/component-library.js` via the host |
| DOM operations | `assets/js/core/base-component.js` |
| Animation loop management | `assets/js/core/animation-foundation.js` via the host |
| Layout math / dimensions outside canvas | `assets/js/core/mathematical-foundation.js` |
| Stylesheet mutation | `assets/css/styles.css` |
| Routing / navigation | `assets/js/core/router.js` |

If a generator script contains code that belongs to any of the above owners, that code is misplaced and must be flagged as a WARN in `issues-and-conflicts.md`.

---

## 2. OOP in Generator Scripts

Generator scripts use object composition: `SCRIPT_CONFIG` is a plain object literal that contains both data and methods. It is not a class and does not use prototype inheritance.

**State** belongs on `this` — meaning as properties of the SCRIPT_CONFIG object, assigned inside methods:

```javascript
// Correct: state on this
p5Setup(p, params) {
    this._circles = buildCircles(params);
    this._lastKey = cfgKey(params);
},

p5Draw(p, params, frame) {
    for (const c of this._circles) { /* ... */ }
}
```

**Methods** are defined as properties of SCRIPT_CONFIG. They may call each other via `this.methodName(...)`.

**Module-level helper functions** are stateless pure functions defined outside SCRIPT_CONFIG. They take all their inputs as arguments and return a value. They do not read or write `this` and do not access module-level mutable variables.

```javascript
// Correct: pure module-level helper
function _dist(ax, ay, bx, by) {
    const dx = ax - bx, dy = ay - by;
    return Math.sqrt(dx * dx + dy * dy);
}

// Wrong: module-level mutable state
let _circles = [];  // WARN unless explicitly documented as intentional cache
```

**When module-level mutable state is acceptable:** only when the variable is deliberately a cross-call cache (e.g. a precomputed lookup table that never changes after first use) and this intent is explicitly documented in a comment.

---

## 3. No Raw DOM

Generator scripts must not access the browser DOM. This is an unconditional rule. Forbidden APIs in any `.gen.js` file:

```javascript
// All of the following are forbidden:
document.createElement(...)
document.getElementById(...)
document.querySelector(...)
element.innerHTML = ...
element.appendChild(...)
element.removeChild(...)
window.addEventListener(...)
window.location
window.history
```

If a generator needs to signal a state change to the host, it does so through:
- The return value of the render hook (if the host contract supports it)
- A property on `this` that the host reads after each frame
- The `params` object (read-only; the generator reads params, it does not write them)

Any DOM access found in a generator script is a WARN. If the DOM access is also required for the generator to function at all, it is also a bug that must be escalated.

---

## 4. AnimationFoundation Rule

Generator scripts must not manage their own animation timing. This is an unconditional rule.

**Forbidden in generator scripts:**
```javascript
requestAnimationFrame(fn)       // forbidden
cancelAnimationFrame(id)        // forbidden
setInterval(fn, ms)             // forbidden for animation
clearInterval(id)               // forbidden for animation
setTimeout(fn, ms)              // forbidden for animation-related use
p.loop()                        // forbidden in p5 generators
```

**The correct model:** the host creates an `AnimationFoundation.AnimationLoop` (or `FrameSequencer`, `ThrottledLoop`) and calls the generator's render hook on each frame. The generator implements only the frame function — it does not decide when to run.

For p5 generators: `p.noLoop()` must be called in `p5Setup`. The host calls `p.redraw()` to trigger each frame. If `p.noLoop()` is absent, the p5 sketch runs its own internal loop and bypasses host timing — this is an ERROR.

The `frame` integer argument to `p5Draw(p, params, frame)` and `draw(ctx, canvas, params, frame)` is provided by the host. The generator must use this argument for time-based animation, not an internal counter.

---

## 5. Algorithm Library Rule

Before writing any algorithm inline in a generator script, search `assets/js/shared/algorithms/` for an existing implementation.

**Decision process:**

```
Does the algorithm exist in assets/js/shared/algorithms/?
  YES → import and use it; do not reimplement
  NO  → is it non-trivial (more than a one-liner)?
          YES → flag for escalation via component-algorithm-escalation.md
                then implement inline until the library version exists
          NO  → implement inline (one-liners are not escalation candidates)
```

**Escalation does not block implementation.** If you must implement inline while awaiting escalation, flag it as `[NOTE] [ESCALATION]` in `issues-and-conflicts.md` and proceed.

**What constitutes "non-trivial":** any algorithm with more than one step, any algorithm with a name in the field (simplex noise, Delaunay triangulation, reaction-diffusion, etc.), any algorithm that takes more than 5 lines to implement correctly.

---

## 6. Naming Conventions

All naming follows `blog/docs/guides/standards/coding-standards.md` §Nomenclature, applied to the generator context:

| Item | Convention | Example |
| --- | --- | --- |
| Generator `id` | kebab-case | `fibonacci-balls` |
| Script filename | `<id>.gen.js` | `fibonacci-balls.gen.js` |
| Parameter `key` | camelCase | `collisionPasses`, `hueShiftScale` |
| Preset `name` | Title Case | `Classic`, `Dense Grid` |
| Module-level helper functions | camelCase, leading underscore | `_fibSeq`, `_packFrontChain`, `_dist` |
| Internal SCRIPT_CONFIG state properties | camelCase, leading underscore | `_circles`, `_canvasSize`, `_lastCfgKey` |
| Public SCRIPT_CONFIG methods (render hooks) | camelCase, no underscore | `p5Setup`, `p5Draw`, `draw` |
| Internal SCRIPT_CONFIG methods | camelCase, leading underscore | `_buildCircles`, `_applyCollisionColor` |

Rationale for the underscore prefix on internal names: it signals to the host and to documentation that these are internal implementation details, not part of the public contract between the script and the host.

---

## 7. Comments

Comments in generator scripts must explain non-obvious intent, trade-offs, or algorithmic decisions. They must not narrate what the code does line by line.

**Correct comment use:**

```javascript
// Front-chain packing: each new circle is placed tangent to two existing front circles.
// The "front" is the set of circles that could still accept new neighbours.
// Circles with 6+ neighbours are pruned from the front (fully surrounded).
front = front.filter(idx => {
    const c = packed[idx];
    let nbrs = 0;
    for (let ii = 0; ii < packed.length; ii++) {
        if (ii === idx) continue;
        if (_dist(c.x, c.y, packed[ii].x, packed[ii].y) <= c.r + packed[ii].r + 1) nbrs++;
    }
    return nbrs < 6;
});
```

**Incorrect comment use:**

```javascript
// Loop through circles     <-- narrates obvious code
for (const c of circles) {
    // Update trail          <-- narrates obvious code
    c.trail.push({ x: c.x, y: c.y });
    // Remove oldest entry if too long   <-- narrates obvious code
    if (c.trail.length > params.trailLength) c.trail.shift();
}
```

ASCII only in comments. No emoji, no Unicode arrows, no smart quotes.

---

## 8. Error Handling

Generator render hooks must not throw uncaught exceptions. The host does not wrap frame calls in try/catch — an uncaught exception in `p5Draw` will stop the animation loop without recovery.

Defensive practices required:
- Guard division by quantities that could be zero: `const safe = a / (b + 0.0001)` or `if (b === 0) return`
- Guard array access on indices that could be out of range
- Guard `Math.sqrt` of quantities that could be negative: `Math.sqrt(Math.max(0, x))`

These guards should be minimal and placed only where the risk is real from the code logic. Do not add guards universally — that hides bugs. Add them where the mathematical model can produce a zero denominator or negative radicand.
