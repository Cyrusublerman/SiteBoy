# Generator Script Rules

This guide defines the compliance baseline for all `.gen.js` generator scripts. Every generator must satisfy every rule here before its documentation pack can be considered accurate. This guide does not replace the linked authority documents — it applies their rules to the generator script context specifically.

**Authority order for conflicts:**
1. `blog/docs/guides/standards/design-law.md`
2. `blog/docs/guides/standards/coding-standards.md`
3. `blog/docs/guides/standards/p5-generator-standards.md`
4. `blog/docs/guides/standards/tool-standards.md`
5. This guide

---

## 1. SCRIPT_CONFIG Contract

Every generator exports exactly one object: `export const SCRIPT_CONFIG = { ... }`.

### 1.1 Required fields (all generators)

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | kebab-case; unique across all generators; matches the filename without `.gen.js` |
| `title` | string | Display name; Title Case |
| `category` | string | One of: `parametric`, `wave`, `pattern`, `physics`, `other` |
| `canvas.width` | number | Fixed pixel width; must be a multiple of F (14px) or a specific fixed domain dimension |
| `canvas.height` | number | Fixed pixel height; same rule |
| `canvas.context` | string | `'2d'` or `'p5'` |
| `parameters` | Array | At least one group with at least one param |

### 1.2 Required render hooks

**For `context: 'p5'`:**
- `p5Setup(p, params)` — called once when the generator loads or the host reinitialises it
- `p5Draw(p, params, frame)` — called every frame by the host

**For `context: '2d'`:**
- `draw(ctx, canvas, params, frame)` — called every frame (or on each param change for static generators)

Both hooks are defined as methods on the SCRIPT_CONFIG object. Neither is a standalone exported function.

### 1.3 Optional fields

| Field | Purpose | Notes |
| --- | --- | --- |
| `description` | Text for the INFO tab | Plain text; not markdown |
| `version` | Semantic version string | `'1.0.0'` format |
| `presets` | Array of preset objects | Each preset must include a `name` property and values for every parameter key |
| `animation` | Animation config | See §4 |
| `export` | Export config override | Rarely needed; host provides default export |

---

## 2. p5 Generator Rules

Applies to all generators with `canvas.context: 'p5'`. See full detail in `blog/docs/guides/standards/p5-generator-standards.md`.

### 2.1 p5Setup

Must:
- Call `p.noLoop()` — the host drives frames; the sketch must not run its own loop
- Use `this` for any state that persists across frames
- Pre-compute anything that is expensive and param-independent

Must not:
- Call `p.createCanvas()` — the host creates and owns the canvas
- Perform async operations (`loadImage`, `loadFont`) — all assets must be synchronously available

### 2.2 p5Draw

Must:
- Accept `(p, params, frame)` — all three arguments
- Clear or redraw the background each frame (unless trails are intentional and bounded)
- Use `params` for all user-controlled values — never read UI state directly

Must not:
- Call `p.loop()` or manage animation internally
- Maintain an internal frame counter — use the `frame` argument
- Produce non-deterministic output unless the randomness is seeded and documented

### 2.3 State

State that persists between frames must be stored on `this` (i.e. as properties of the SCRIPT_CONFIG object). Module-level mutable variables are permitted only when the intent is an intentional cross-call cache (documented as such). Undocumented module-level mutable state is a WARN.

---

## 3. Colour Rules

### 3.1 VGA palette for UI-facing colours

Generator canvas output that uses discrete, intentional colours must use the VGA palette:

```
#000000  #800000  #008000  #808000
#000080  #800080  #008080  #c0c0c0
#808080  #ff0000  #00ff00  #ffff00
#0000ff  #ff00ff  #00ffff  #ffffff
```

### 3.2 Algorithmic colour spaces

A generator that computes colour mathematically (e.g. HSL values derived from velocity, angle, or size ratios in a physics simulation) is permitted to use non-VGA values, provided:

- The colour computation is a direct function of a physical or mathematical quantity in the model
- This justification is documented in `issues-and-conflicts.md` under standards compliance
- The output is not arbitrary (a generator that just picks random RGB is not exempt)

Example of permitted: `c.h = (c.h + angleBasedShift) % 360` where hue evolves through a physics collision model.
Example of not permitted: `p.fill(Math.random() * 255, 100, 200)` — arbitrary RGB.

### 3.3 UI colour (not canvas)

Generator scripts do not own any UI. If a generator renders any text or overlay directly onto the canvas (e.g. a label, a legend), text colour must derive from CSS variables (`var(--c-text)`) or VGA palette values. Raw hex or RGB literals in canvas text are WARN.

---

## 4. Animation Rules

### 4.1 No internal animation loop

Generator scripts must not manage their own animation timing. Forbidden:
- `requestAnimationFrame(...)` or `cancelAnimationFrame(...)`
- `setInterval(...)` or `clearInterval(...)`
- `setTimeout(...)` used to drive frame updates
- `p.loop()` in p5 generators

The host drives all frames via AnimationFoundation. The generator implements only the frame function.

### 4.2 Animation config

If the generator is animated, declare an `animation` field in SCRIPT_CONFIG:

```javascript
animation: {
    type: 'infinite',       // 'infinite' | 'sequence' | 'parametric'
    defaultFps: 60,         // host uses this as the target frame rate
    loopFrames: 360,        // if type is 'sequence': total frames per loop
    animatableParams: ['phase', 'time']  // params safe to animate in export sequences
}
```

If `animatableParams` is omitted, the host cannot produce deterministic frame-sequence exports. This is a parity hole (NOTE), not an error.

### 4.3 Determinism requirement for export

If the generator uses `Math.random()` or `p.random()` and the animation config declares a `loopFrames` or supports sequence export, the output must be seeded. Unseeded randomness in an animated generator is a WARN.

Seeded pattern for p5:
```javascript
p5Setup(p, params) {
    p.randomSeed(params.seed ?? 42);
    p.noiseSeed(params.seed ?? 42);
    // ...
}
p5Draw(p, params, frame) {
    p.randomSeed((params.seed ?? 42) + frame);
    // ...
}
```

---

## 5. Algorithm Library Rules

Before implementing any algorithm inline in a `.gen.js` file, check `assets/js/shared/algorithms/`. The library provides:

| Module | Location | Functions |
| --- | --- | --- |
| Noise | `algorithms/noise/` | `simplex2D`, `fbm`, `turbulence`, `seededRandom` |
| Physics | `algorithms/physics/` | `reactionDiffusion`, `waveSolver` |
| Geometry | `algorithms/geometry/` | `marchingSquares`, `delaunay` |
| Patterns | `algorithms/patterns/` | `truchet`, `halftone` |
| Distance | `algorithms/distance/` | `sdf`, `geodesic` |
| Math utils | `algorithms/math-utils/` | `hashInt`, `seededRandom` |

**Rule:** If the algorithm exists in the library, import it. Do not reimplement it.

**Rule:** If the algorithm does not exist in the library and is non-trivial, flag it for escalation using `component-algorithm-escalation.md`. Do not implement it inline without noting the escalation.

**Rule:** A generator that implements an algorithm inline which already exists in the library is a WARN in `issues-and-conflicts.md`.

---

## 6. DOM and Scope Rules

### 6.1 No DOM access

Generator scripts must not access the DOM. Forbidden in any `.gen.js` file:
- `document.createElement`
- `document.getElementById` / `querySelector` / `querySelectorAll`
- `.innerHTML`, `.textContent` (on DOM nodes)
- `.appendChild`, `.removeChild`
- `window.addEventListener`
- Any `window.*` API that reads or modifies the page

Generators communicate with the host through their render hook return values and through the `params` object, not through the DOM.

### 6.2 No layout math

Generators do not compute their own layout dimensions. The host provides the canvas dimensions. If a generator needs the canvas size, it reads `canvas.width` and `canvas.height` from the arguments to the render hook.

### 6.3 Module-level scope

Module-level code (code outside SCRIPT_CONFIG and outside named helper functions) must not produce side effects on import. No DOM queries, no global assignments, no fetch calls at module level.

---

## 7. Naming Rules

| Item | Convention | Example |
| --- | --- | --- |
| Generator `id` | kebab-case | `fibonacci-balls` |
| File name | `<id>.gen.js` | `fibonacci-balls.gen.js` |
| Parameter `key` | camelCase | `collisionPasses` |
| State variable (`this.*`) | camelCase with leading underscore for internal | `_circles`, `_canvasSize` |
| Module-level helper functions | camelCase with leading underscore | `_fibSeq`, `_packFrontChain` |
| Preset `name` | Title Case | `Classic`, `Dense Grid` |

---

## 8. Generator Script Checklist

Use this checklist when reviewing a generator script for compliance. Record results in `issues-and-conflicts.md`.

**SCRIPT_CONFIG structure:**
- [ ] `id` is kebab-case and matches filename
- [ ] `title` is Title Case
- [ ] `category` is one of the permitted values
- [ ] `canvas.context` is `'2d'` or `'p5'`
- [ ] Render hook exists and has correct signature
- [ ] All parameter keys are camelCase
- [ ] All preset objects include `name` and all parameter keys

**p5 generators additionally:**
- [ ] `p5Setup` calls `p.noLoop()`
- [ ] `p5Setup` does not call `p.createCanvas()`
- [ ] `p5Draw` does not call `p.loop()`
- [ ] `frame` argument used; no internal frame counter

**Colour:**
- [ ] Discrete colours use VGA palette, OR
- [ ] Algorithmic colour space with documented justification in `issues-and-conflicts.md`

**Animation:**
- [ ] No `requestAnimationFrame` / `setInterval` / `setTimeout` for animation
- [ ] If animated: `animation` config present with at minimum `type` and `defaultFps`
- [ ] If using `Math.random()` / `p.random()` in animated context: randomness is seeded

**Algorithms:**
- [ ] No inline implementation of an algorithm that exists in `assets/js/shared/algorithms/`

**DOM:**
- [ ] No `document.*` or `window.*` access
- [ ] No `.innerHTML`, `.createElement`, `.appendChild`

**State:**
- [ ] Persistent state stored on `this`, not undocumented module-level variables
