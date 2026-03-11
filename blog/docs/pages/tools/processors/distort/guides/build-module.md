# Effect Module Rules

Defines the compliance baseline for all effect module `*Node.js` files. Every module must satisfy every rule here before its documentation pack can be considered accurate. This guide does not replace the linked authority documents — it applies their rules to the effect module context specifically.

**Authority order for conflicts:**
1. `blog/docs/guides/standards/design-law.md`
2. `blog/docs/guides/standards/coding-standards.md`
3. `blog/docs/guides/effect-module-standards.md`
4. `blog/docs/guides/tools/effect-module-build-guide.md`
5. This guide

---

## 1. Module Contract

Every effect module exports exactly one class extending `EffectNode`.

### 1.1 Required fields (all modules)

| Field | Type | Rule |
| --- | --- | --- |
| `type` | string | Lowercase, no spaces, no hyphens; unique across all modules; matches the filename prefix (`GaussianBlurNode.js` → `gaussblur`) |
| `category` | string | One of the registered categories in `CategoryPicker`; Title Case with spaces |
| `paramDefs` | object | At least one tier-3 param; see §2 |
| `apply(src, dst, w, h, ctx)` | method | Pixel render function; see §3 |

### 1.2 Optional fields

| Field | Purpose | Notes |
| --- | --- | --- |
| `buildGeometry(w, h, ctx)` | Vector output | Returns a `LineSet`; required for vector module type |
| `destroy()` | Resource cleanup | Required when resources acquired in constructor or `apply()` |
| `presets` | Named param collections | Each must include all param keys |

### 1.3 Required registration

Every module is registered in `assets/js/tools/processors/distort/nodes/registry.js` with its `type` string.

---

## 2. paramDefs Contract

`paramDefs` is a plain object keyed by camelCase param key.

### 2.1 Field requirements

| Field | Type | Rule |
| --- | --- | --- |
| `key` | (implicit) | camelCase; unique within the module |
| `label` | string | SCREAMING CASE; max 16 chars |
| `type` | string | `'range'`, `'select'`, or `'toggle'` |
| `min`, `max`, `step` | number | Required for `type: 'range'` |
| `default` | any | Required; must be within valid range for `range` type |
| `tier` | number | 3, 4, or 5 (see §2.2); omit for type-driven tier-2 positioning |
| `options` | string[] | Required for `type: 'select'`; each entry SCREAMING CASE |
| `driveable` | boolean | Declare `true` for any `range` param intended to be driven by image or expression |

### 2.2 Tier order

Tiers determine display order in NodePanel.

| Tier | Meaning | Display position |
| --- | --- | --- |
| 2 | Type-inherent param (e.g. blend mode, alpha composite) | Above all tier-3 |
| 3 | Primary effect param (radius, intensity, amount) | Always visible |
| 4 | Secondary param (angle, offset, seed) | Shown after tier-3 |
| 5 | Advanced param (quality override, internal coefficient) | Collapsed by default |

Minimum one tier-3 param is required. A module with all tier-4 or tier-5 params only is a WARN.

### 2.3 Key naming rules

| Item | Convention | Example |
| --- | --- | --- |
| `paramDef` key | camelCase | `blurRadius`, `noiseScale`, `iterationCount` |
| `label` | SCREAMING CASE | `BLUR RADIUS`, `NOISE SCALE`, `ITERATIONS` |
| `select` option values | SCREAMING CASE | `CLASSIC`, `FAST`, `LANCZOS` |

---

## 3. apply() Contract

`apply(src, dst, w, h, ctx)` is the pixel render function.

| Arg | Type | Content |
| --- | --- | --- |
| `src` | `Uint8ClampedArray` | Source pixel buffer (RGBA, row-major) |
| `dst` | `Uint8ClampedArray` | Output pixel buffer (caller-allocated) |
| `w` | number | Buffer width in pixels |
| `h` | number | Buffer height in pixels |
| `ctx` | object | Pipeline context; see §3.1 |

### 3.1 Pipeline context fields

| Field | Type | Meaning |
| --- | --- | --- |
| `ctx.quality` | string | `'preview'` or `'full'`; used to apply PREVIEW caps (see §5) |
| `ctx.frame` | number | Current frame index (0-based) |
| `ctx.frameCount` | number | Total frames in sequence |
| `ctx.seed` | number | Global seed from CANVAS tab |
| `ctx.pool` | object | Buffer pool; use `ctx.pool.acquire(size)` / `ctx.pool.release(buf)` |
| `ctx.pixelVars` | object | Per-pixel expression variable values; set by Pipeline when any per-pixel expression is active |
| `ctx.getModulated(key, pixelIdx, ctx)` | method | Returns driven param value for a pixel; use instead of `this.params[key]` for driveable params |

### 3.2 apply() rules

Must:
- Write to `dst` only
- Not modify `src`
- Return `void` (or `undefined`)
- Release any buffer acquired from `ctx.pool` before returning

Must not:
- Access DOM (`document.*`, `window.*`)
- Call `fetch()`, `XMLHttpRequest`, or any network API
- Use `requestAnimationFrame`, `setInterval`, `setTimeout`
- Retain any buffer from `ctx.pool` after return
- Throw (use `ctx.quality` branching to cap cost — never throw if inputs are in range)

### 3.3 Execution order

Within `apply()`, the expected execution order is:

1. Read `ctx.quality` — set PREVIEW caps if applicable
2. Read params via `this.getModulated(key, pixelIdx, ctx)` (not `this.params[key]` for driveable params)
3. Compute from `src`
4. Write to `dst`
5. Release acquired buffers

Deviating from this order must be justified and flagged in `issues-and-conflicts.md`.

---

## 4. Worker Context Rules

All `apply()` and `buildGeometry()` execution occurs inside a Web Worker. Worker context has no browser globals.

**Forbidden in any `*Node.js` file:**
- `document.*` — any DOM access, including read-only
- `window.*` — any browser global
- `navigator.*` — any navigator API
- `fetch()`, `XMLHttpRequest`, `WebSocket`
- `requestAnimationFrame`, `cancelAnimationFrame`
- `setInterval`, `clearInterval`, `setTimeout`
- `console.*` (permitted for development; must be removed before publication)
- `importScripts()` (use static imports via the registry bundler instead)
- `URL.createObjectURL`, `Blob`, `FileReader`

A module that accesses any browser global is an **ERROR**. It will throw in Worker context. This is a runtime failure, not a style issue.

---

## 5. Preview Strategy Rules

Modules with cost that scales with a param (iterations, radius, pass count) must cap their cost in PREVIEW quality.

Rule: read `ctx.quality` at the start of `apply()` and apply caps when `ctx.quality === 'preview'`.

| Category | PREVIEW cap |
| --- | --- |
| Physics (reaction-diffusion, cellular automata, wave) | 5 iterations max |
| Accumulation (iterative rewarp, advection) | 2 passes max |
| Generative (paint stroke) | 20 iterations max |
| Blur (median, bilateral, box) | Radius capped at 3px |
| Structural (Sobel, Canny) | No cap needed |

A module with O(n × param) cost that does not implement PREVIEW caps is a **WARN**.

---

## 6. Algorithm Library Rules

Before implementing any algorithm inline in a `*Node.js` file, check `assets/js/shared/algorithms/`.

| Module | Location | Functions |
| --- | --- | --- |
| Noise | `algorithms/noise/` | `simplex2D`, `fbm`, `turbulence`, `seededRandom` |
| Physics | `algorithms/physics/` | `reactionDiffusion`, `waveSolver` |
| Geometry | `algorithms/geometry/` | `marchingSquares`, `delaunay` |
| Patterns | `algorithms/patterns/` | `truchet`, `halftone` |
| Distance | `algorithms/distance/` | `sdf`, `geodesic` |
| Math utils | `algorithms/math-utils/` | `hashInt`, `seededRandom` |
| Thresholding | `algorithms/segmentation/` | `otsuThreshold` |

**Rule:** If the algorithm exists in the library, import it. Do not reimplement it.

**Rule:** If the algorithm does not exist in the library and is non-trivial, flag for escalation using `component-algorithm-escalation.md`. Do not implement inline without noting the escalation.

**Rule:** A module that implements an algorithm inline which already exists in the library is a **WARN** in `issues-and-conflicts.md`.

---

## 7. Naming Rules

| Item | Convention | Example |
| --- | --- | --- |
| Module `type` | lowercase, no separators | `gaussblur`, `otsuthreshold` |
| Class name | `<Name>Node` PascalCase | `GaussianBlurNode`, `OtsuThresholdNode` |
| File name | `<Name>Node.js` PascalCase | `GaussianBlurNode.js` |
| paramDef key | camelCase | `blurRadius`, `noiseScale` |
| Internal state | `_camelCase` with leading underscore | `_lut`, `_kernelCache` |
| Helper functions (module scope) | `_camelCase` with leading underscore | `_buildGaussKernel`, `_computeOtsu` |
| Preset `name` | Title Case | `Classic`, `Fast Blur` |

---

## 8. Module Script Checklist

Use when reviewing a module for compliance. Record results in `issues-and-conflicts.md`.

**Module structure:**
- [ ] Class extends `EffectNode`
- [ ] `type` is lowercase, no separators, unique
- [ ] `category` matches a registered category
- [ ] `paramDefs` has at least one tier-3 param
- [ ] All param keys are camelCase
- [ ] All labels are SCREAMING CASE ≤ 16 chars
- [ ] All `range` params have `min`, `max`, `step`, `default`
- [ ] All `select` params have `options` array with SCREAMING CASE strings
- [ ] `apply(src, dst, w, h, ctx)` signature correct

**apply() rules:**
- [ ] Reads `ctx.quality` and applies PREVIEW caps where required
- [ ] Driveable params read via `this.getModulated(key, pixelIdx, ctx)`, not `this.params[key]`
- [ ] Writes to `dst` only; does not modify `src`
- [ ] Releases all acquired buffers before return

**Worker context:**
- [ ] No `document.*` or `window.*` access
- [ ] No `fetch()`, `XMLHttpRequest`, or network API
- [ ] No `requestAnimationFrame`, `setInterval`, `setTimeout`

**Algorithms:**
- [ ] No inline reimplementation of an algorithm that exists in the algorithm library
- [ ] Escalation flagged for any non-trivial missing algorithm

**buildGeometry (vector modules only):**
- [ ] Returns `LineSet` or equivalent geometry type
- [ ] Exported SVG paths are correct closed/open segments
