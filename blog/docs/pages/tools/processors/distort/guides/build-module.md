# Effect Module Compliance Baseline

Defines the compliance baseline for all effect module `*Node.js` files. Every module must satisfy every rule here before its documentation pack can be considered accurate. This guide applies sitewide standards to the distort module context specifically.

**Authority order for conflicts:**
1. `blog/docs/guides/standards/design-law.md`
2. `blog/docs/guides/standards/coding-standards.md`
3. `blog/docs/guides/tools/effect-module-build-guide.md`
4. `../rules.md` (this tool's rules)
5. This guide

**Note:** `blog/docs/guides/effect-module-standards.md` describes the pre-factory class-extension pattern and is superseded by `effect-module-build-guide.md` for all module authoring decisions.

---

## 1. Module Contract

Every effect module is produced by `createEffectModule(config)` from `core/EffectModule.js`. The returned value is a class extending `EffectNode` internally — module files contain no class body, no constructor, no `this`.

### 1.1 Required config fields (all modules)

| Field | Type | Rule |
| --- | --- | --- |
| `type` | string | Lowercase, no spaces, no hyphens; unique across all modules |
| `name` | string | UPPERCASE display label; max 20 chars |
| `category` | string | Must match a key in `registry.js` REGISTRY object |
| `params` | object | At least one tier-3 param; see §2 |
| `apply` | function | `(src, dst, w, h, p, ctx, modulate) => void`; pixel render function; see §3 |

### 1.2 Optional config fields

| Field | Purpose | Notes |
| --- | --- | --- |
| `isVector` | Flags vector output | Set `true` for line-render modules; requires `applyVector` |
| `applyVector` | Vector render function | `(src, w, h, p, ctx) => LineSet`; required when `isVector: true` |
| `isLUT` | LUT chain participation | Rarely used; defaults `false` |
| `destroy` | Resource cleanup | Called in addition to `EffectNode.destroy()`; use when the config closure holds refs |

### 1.3 Required registration

Every module is registered in `assets/js/tools/processors/distort/nodes/registry.js`:

```javascript
{ type: 'gaussblur', label: 'GAUSS BLUR', description: 'Applies a Gaussian blur with configurable sigma', factory: () => new GaussianBlurNode() }
```

The `description` field is **required**. Rules:
- One sentence only.
- Max 80 characters.
- Describes the visual effect produced, not the algorithm name.
- Written in sentence case.
- Surfaced as a native `title` attribute on picker items for hover information.

A registry entry without a `description` field is incomplete. The fallback (`entry.label`) shows the same text as the button and provides zero additional information.

---

## 2. params Contract

`params` is a plain object keyed by camelCase param key.

### 2.1 Field requirements

| Field | Type | Rule |
| --- | --- | --- |
| `label` | string | SCREAMING CASE; max 16 chars |
| `type` | string | `'range'` (default if omitted), `'select'`, or `'toggle'` |
| `min`, `max`, `step` | number | Required for `type: 'range'` |
| `value` | any | Required default; must be within `[min, max]` for `range` type |
| `tier` | number | 3, 4, or 5; tier 2 is reserved and will throw in the factory validator |
| `options` | string[] | Required for `type: 'select'`; each entry SCREAMING CASE |
| `driveable` | boolean | `true` for any `range` param intended for image or expression drivers |
| `previewMax` | number | Cap applied by factory in PREVIEW quality; no inline check needed |
| `previewMin` | number | Floor applied by factory in PREVIEW quality |
| `unit` | string | Suffix displayed in UI: `'px'`, `'deg'`, `'%'` |

### 2.2 Tier order

| Tier | Meaning | Display position |
| --- | --- | --- |
| 2 | Reserved — universal controls (opacity, blendMode) | Managed by NodePanel; not configurable per-module |
| 3 | Primary effect param (radius, intensity, amount) | Always visible |
| 4 | Secondary param (angle, offset, seed) | Shown after tier-3 |
| 5 | Advanced param (quality override, internal coefficient) | Collapsed by default |

Minimum one tier-3 param is required. A module with all tier-4/5 params only is a WARN.

### 2.3 Key naming rules

| Item | Convention | Example |
| --- | --- | --- |
| param key | camelCase | `blurRadius`, `noiseScale`, `iterationCount` |
| `label` | SCREAMING CASE | `BLUR RADIUS`, `NOISE SCALE`, `ITERATIONS` |
| `select` option values | SCREAMING CASE | `CLASSIC`, `FAST`, `LANCZOS` |

---

## 3. apply() Contract

`apply(src, dst, w, h, p, ctx, modulate)` is the pixel render function. The factory wraps this — the outer `apply(src, dst, w, h, ctx)` on the class calls `_resolveParams`, builds `modulate`, then calls `config.apply` with the resolved args.

| Arg | Type | Content |
| --- | --- | --- |
| `src` | `Uint8ClampedArray` | Source pixel buffer (RGBA, row-major) |
| `dst` | `Uint8ClampedArray` | Output pixel buffer (caller-allocated) |
| `w` | number | Buffer width in pixels |
| `h` | number | Buffer height in pixels |
| `p` | object | Pre-resolved params (preview caps already applied); read `p.key` not `this.params[key]` |
| `ctx` | object | Pipeline context; see §3.1 |
| `modulate` | function | `(key, pixelIdx) => number`; returns per-pixel driver value or `p[key]` if no driver active |

### 3.1 Pipeline context fields

| Field | Type | Meaning |
| --- | --- | --- |
| `ctx.quality` | string | `'preview'` or `'full'`; preview caps are already applied in `p` via `previewMax`/`previewMin` |
| `ctx.frame` | number | Current frame index (0-based) |
| `ctx.frameCount` | number | Total frames in sequence |
| `ctx.seed` | number | Global seed from CANVAS tab |
| `ctx.nodeSeed` | number | Per-node seed (node-id-derived) |
| `ctx.modMaps` | object | Active modulation map buffers (keyed by mapId); used internally by `modulate()` |
| `ctx.pixelVars` | object | Per-pixel expression variable values; set by Pipeline when per-pixel expressions are active |

**No `ctx.pool`:** algorithms take typed arrays directly. Scratch allocations inside `apply()` use `new Float32Array(n)` etc. directly.

### 3.2 apply() rules

Must:
- Write to `dst` only
- Not modify `src`
- Return `void` (or `undefined`)

Must not:
- Access DOM (`document.*`, `window.*`)
- Call `fetch()`, `XMLHttpRequest`, or any network API
- Use `requestAnimationFrame`, `setInterval`, `setTimeout`
- Read `this.params[key]` — use `p[key]` or `modulate(key, i)`
- Throw (guard edge cases; never throw if inputs are in valid range)

### 3.3 apply() execution order

Within `apply()`, the canonical execution order is:

1. Derive any computed values from `p` (preview caps are already resolved)
2. For driveable params used in per-pixel loops, call `modulate(key, i)` inside the loop
3. Compute from `src`
4. Write to `dst`

Inline `ctx.quality` checks are acceptable when the cap cannot be expressed as `previewMax`, but `previewMax` on the param definition is preferred.

---

## 4. Worker Context Rules

All `apply()` and `applyVector()` execution occurs inside a Web Worker. Worker context has no browser globals.

**Forbidden in any `*Node.js` file:**
- `document.*` — any DOM access, including read-only
- `window.*` — any browser global
- `navigator.*` — any navigator API
- `fetch()`, `XMLHttpRequest`, `WebSocket`
- `requestAnimationFrame`, `cancelAnimationFrame`
- `setInterval`, `clearInterval`, `setTimeout`
- `console.*` (permitted for development; remove before publication)
- `importScripts()` (use static imports instead)
- `URL.createObjectURL`, `Blob`, `FileReader`

A module that accesses any browser global is an **ERROR**. It will throw in Worker context.

---

## 5. Preview Strategy Rules

Modules with cost scaling with a param (iterations, radius, pass count) must cap cost in PREVIEW quality.

**Preferred:** declare `previewMax`/`previewMin` on the param. Factory resolves before `apply()` is called.

**Acceptable:** inline `ctx.quality === 'preview'` check for caps that cannot be expressed as a simple bound.

| Category | Required cap |
| --- | --- |
| Physics (reaction-diffusion, cellular automata, wave) | 5 iterations max |
| Accumulation (iterative rewarp, advection) | 2 passes max |
| Generative (paint stroke) | 20 iterations max |
| Blur (median, bilateral, box) | Radius capped at 3px |
| Structural (Sobel, Canny) | No cap needed |

A module with O(n × param) cost that does not implement PREVIEW caps is a **WARN**.

---

## 6. Algorithm Library Rules

Before writing any algorithm inline, check `assets/js/shared/algorithms/`. All major algorithms are already there.

| Category | Path | Example functions |
| --- | --- | --- |
| Noise | `algorithms/noise/` | `noise-functions.js` |
| Physics | `algorithms/physics/` | `reaction-diffusion.js`, `wave-solver.js`, `advection.js` |
| Geometry | `algorithms/geometry/` | `marching-squares.js`, `distortion.js`, `warp.js` |
| Patterns | `algorithms/patterns/` | `pattern-generators.js`, `halftone-patterns.js` |
| Distance | `algorithms/distance/` | `jfa.js`, `geodesic.js` |
| Math utils | `algorithms/core/` | `math-utils.js`, `coordinate-transforms.js` |
| Thresholding | `algorithms/segmentation/` | `thresholding.js` |
| Edge detection | `algorithms/edge-detection/` | `edge-operators.js` |
| Image ops | `algorithms/image/` | `blur-filters.js`, `colour-adjustments.js`, `morphology.js` |
| Line render | `algorithms/line/` | `flow-line-engine.js`, `serpentine-line-engine.js` |
| Dither | `algorithms/dither/` | `ordered.js`, `error-diffusion.js` |

**Rule:** If the algorithm exists in the library, import it. Do not reimplement it.

**Rule:** If the algorithm does not exist and is non-trivial, flag for escalation using `component-algorithm-escalation.md`. Implement inline until the library version exists.

**Rule:** A module that implements an algorithm inline which already exists in the library is a **WARN**.

---

## 7. Naming Rules

| Item | Convention | Example |
| --- | --- | --- |
| Module `type` | lowercase, no separators | `gaussblur`, `otsuthreshold` |
| Exported constant name | `<Name>Node` PascalCase | `GaussianBlurNode`, `OtsuThresholdNode` |
| File name | `<Name>Node.js` PascalCase | `GaussianBlurNode.js` |
| param key | camelCase | `blurRadius`, `noiseScale` |
| Module-scope helper functions | `_camelCase` | `_buildKernel`, `_computeOtsu` |

No `this._xxx` state: the factory pattern has no instance state in module files. If state is needed between renders, it must be held in a closure variable at module scope (not per-instance). Document any module-scope mutable state explicitly.

---

## 8. Module Script Checklist

Use when reviewing a module for compliance. Record results in `issues-and-conflicts.md`.

**Module structure:**
- [ ] Produced by `createEffectModule({...})` — not `class extends EffectNode`
- [ ] `type` is lowercase, no separators, unique
- [ ] `name` is UPPERCASE, max 20 chars
- [ ] `category` matches a key in `registry.js`
- [ ] `params` has at least one tier-3 param
- [ ] All param keys are camelCase
- [ ] All labels are SCREAMING CASE ≤ 16 chars
- [ ] All `range` params have `min`, `max`, `step`, `value`
- [ ] All `select` params have `options` array with SCREAMING CASE strings
- [ ] `apply(src, dst, w, h, p, ctx, modulate)` signature correct

**apply() rules:**
- [ ] Uses `p.key` (not `this.params[key]`) for param reads
- [ ] Uses `modulate(key, i)` inside pixel loops for driveable params
- [ ] `previewMax`/`previewMin` declared on params that need preview capping (preferred over inline `ctx.quality` check)
- [ ] Writes to `dst` only; does not modify `src`

**Worker context:**
- [ ] No `document.*` or `window.*` access
- [ ] No `fetch()`, `XMLHttpRequest`, or network API
- [ ] No `requestAnimationFrame`, `setInterval`, `setTimeout`

**Algorithms:**
- [ ] No inline reimplementation of an algorithm that exists in the algorithm library
- [ ] Escalation flagged for any non-trivial missing algorithm

**Vector modules only (`isVector: true`):**
- [ ] `applyVector(src, w, h, p, ctx)` returns a `LineSet`
- [ ] `isVector: true` declared in config

---

## 9. UI Implementation Gate

Before introducing any new UI element in the host tool, answer all of these questions. Any unclear answer blocks implementation.

**Existence check (Q7):**
- [ ] Does an equivalent element already exist in the tool or site? If yes, reuse it; do not create a new one.

**Boundary completeness (Q8):**
- [ ] Does every edge of this partition share a boundary with a sibling or parent? (Four-edge audit: top, right, bottom, left — each must be a shared border or a container edge, never a private floating outline.)

**Analogy-first (Q9):**
- [ ] Which existing UI element does this most closely resemble? Document the analogy. Inherit its border, sizing, and behaviour conventions before introducing any local exception.

**State completeness (Q10):**
- [ ] For each applicable state (uninitiated, loading, active, hover, active-selected, disabled, error, context-broken), is a distinct visual defined? An element with undefined states is incomplete.

**Label semantics (Q11):**
- [ ] Does the label exactly describe the interaction type triggered (action label = consequence; state label = current state; glyph = matches interaction type per §13.4 of `design-law.md`)?

---

## 10. Post-Build Verification

After implementation, verify against the standards below before marking the component done.

**Design Law compliance (`blog/docs/guides/standards/design-law.md`):**
- [ ] §3: No floating elements; all borders are shared boundaries.
- [ ] §4: All dimensions F-derived; no ad-hoc pixel values.
- [ ] §13: All labels follow the labelling taxonomy and action/state rules.
- [ ] §14: All applicable states defined and implemented.
- [ ] §15: All glyphs match interaction type; positioned correctly (state = left, action = right).
- [ ] §16: Overlays and dropdowns use permitted patterns; dropdown width ≥ trigger width.

**Responsive compliance (`blog/docs/site/ui-interface-overview.md` §5):**
- [ ] Layout reflows correctly at `< 800px`.
- [ ] All T1 controls readable and tappable at `< 500px`.
- [ ] Multi-cell button rows replaced with cyclic buttons at compact width.
- [ ] All interactive targets ≥ `3F × 2F` at portrait width.

**Redundancy check (`design-law.md` §2.8):**
- [ ] No datum, action, or label appears more than once across toolbar, sidebar, and content regions.
