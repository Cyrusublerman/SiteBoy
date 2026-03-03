# Effect Module Standards

Minimum requirements and consistency patterns for all DISTORT effect modules.

**RELATED:**
- `blog/docs/guides/tools/effect-module-build-guide.md` — Step-by-step authoring
- `blog/docs/guides/effect-module-style-guide.md` — Visual presentation rules
- `blog/docs/guides/tool-standards.md` — Tool-level minimum requirements

---

## Module Types

| Type | Input | Output | Description |
|------|-------|--------|-------------|
| **Pixel effect** | `Uint8ClampedArray` RGBA | `Uint8ClampedArray` RGBA | Transforms existing pixels |
| **Vector effect** | `Uint8ClampedArray` RGBA | `LineSet` → rasterised via `vectorToRaster` | Generates line geometry |
| **Generative** | Ignored | `Uint8ClampedArray` RGBA | Produces pixels from params only (no input dependency) |

---

## NodePanel Contract

Every module is wrapped by a `NodePanel` instance. The NodePanel provides universal controls that are NOT part of the module's `paramDefs` — they operate on the module's output after `apply()` completes.

### Interactive controls

| Control | Stored on | Behaviour |
|---------|-----------|-----------|
| Drag handle | — (UI only) | Reorder in effect stack via drag-and-drop; triggers `EffectStack.reorder(fromIdx, toIdx)` |
| Enable toggle | `EffectNode.enabled` | `false` = bypass; Pipeline passes `src` through unmodified and skips `apply()` entirely |
| Solo button | `AppState.soloId` | Sets global solo ID; Pipeline suppresses all other nodes whose `enabled` is not solo |

### Composition params

Applied by the NodePanel **after** `apply()` writes to `dst`, before passing to the next node.

| Key | Type | Range | Default | Behaviour |
|-----|------|-------|---------|-----------|
| `opacity` | number | 0–1 | 1 | Linearly scales `dst` toward `src` before blending: `out = src·(1−opacity) + dst·opacity` |
| `blendMode` | string | see below | `'normal'` | Blend mode used when compositing `dst` onto `src` at the `opacity` level |

**Blend modes:** `normal` `multiply` `screen` `overlay` `add` `difference` `darken` `lighten`

### Driver system

Any numeric `paramDef` entry can be overridden at render time by a **driver** — either a greyscale image sampled per-pixel, or a math expression evaluated per-pixel or per-frame.

Full specification: `blog/docs/components/distort/driver-system.md`.

**Driver eligibility rules:**

| paramDef type | Driver eligible |
|---------------|----------------|
| `range` (slider) | YES — both image and expression drivers |
| `select` (dropdown) | NO |
| `toggle` (boolean) | NO |

Nodes call `this.getModulated(key, pixelIdx, ctx)` instead of `this.params[key]` for any parameter that meaningfully varies spatially or temporally. Nodes that never benefit from spatial variation (e.g. categorical mode selectors) use `this.params[key]` directly — this is correct and requires no annotation.

### Mask system

Applied per-pixel after composition. Mask luminance `m ∈ [0,1]` scales the effective opacity: `final = src·(1−m·opacity) + dst·(m·opacity)`.

| Property | Stored on | Description |
|----------|-----------|-------------|
| `mask.mode` | `EffectNode.mask` | `'none'` / `'upload'` / `'luminance'` / `'gradient'` |
| `mask.data` | `EffectNode.mask` | `Uint8Array` (single-channel, same dims as image) |
| `mask.invert` | `EffectNode.mask` | Boolean; inverts `m` before apply |
| `mask.feather` | `EffectNode.mask` | Gaussian blur radius applied to `mask.data` before use |

**Mask modes:**
- `none` — `m = 1` everywhere; mask has no effect
- `upload` — user-supplied greyscale PNG loaded into `mask.data`
- `luminance` — source image luminance at the time of render populates `mask.data`
- `gradient` — system-generated linear or radial gradient populates `mask.data`

Modules do not implement mask logic. The NodePanel / Pipeline handles all mask computation.

---

## Vector Geometry Export Contract

Vector modules (type `vector`) MUST expose a `buildGeometry(w, h, ctx)` method in addition to `apply()`. This separates geometry construction from rasterisation, enabling SVG export at the tool level.

```javascript
// Required on all vector-type nodes
buildGeometry(w, h, ctx) {
  // Returns a LineSet: array of point arrays [ [[x0,y0],[x1,y1],...], ... ]
  return this._buildLines(w, h, ctx);
}

apply(src, dst, w, h, ctx) {
  vectorToRaster(this.buildGeometry(w, h, ctx), dst, w, h, this.params);
}
```

The `buildGeometry()` method MUST:
- Be pure relative to `src` (for generative vector nodes: `src` is ignored)
- Return a `LineSet` conforming to `docs/specs/module-contracts.md`
- Not write to `dst`
- Respect `ctx.nodeSeed` for deterministic output

SVG export is a tool-level action in `DistortActions.js` — it calls `buildGeometry()` directly, bypassing `vectorToRaster`.

---

## Minimum Structure

Every module MUST:

| Requirement | Detail |
|-------------|--------|
| Extend `EffectNode` | No other base class permitted |
| Define `paramDefs` | Passed as third arg to `super()` |
| Implement `apply(src, dst, w, h, ctx)` | Override is mandatory; base is pass-through |
| Register in `registry.js` | Under the correct category key |
| Live in a `{category}-nodes.js` file | No standalone node files |
| Export from category file | Named export only; no default export |

---

## paramDefs Requirements

Every paramDef entry MUST have all required fields:

| Field | Required | Type | Constraint |
|-------|----------|------|------------|
| `value` | YES | number \| string | Must satisfy `min <= value <= max` for numeric |
| `min` | YES (numeric) | number | Lower bound of slider |
| `max` | YES (numeric) | number | Upper bound of slider |
| `step` | YES (numeric) | number | > 0 |
| `label` | YES | string | UPPERCASE, max 16 chars |
| `type` | NO (default = range) | `'select'` \| `'toggle'` | Omit for range slider |
| `options` | YES when `type === 'select'` | `string[]` | UPPERCASE, max 16 chars each |

### Bijection requirement

|paramDefs| == |algorithm parameters|. Every user-facing algorithm parameter gets a paramDef. Internal/quality parameters that are not user-facing must NOT have paramDefs.

---

## Algorithm SSoT Rules

| Rule | Enforcement |
|------|-------------|
| All non-trivial algorithms live in `shared/algorithms/` | Mandatory; no exceptions |
| Nodes import from `shared/algorithms/` | Never copy-paste algorithm code into node |
| Algorithm created before node | Do not write node until algorithm exists |
| Inline threshold | Pixel loops ≤ 10 lines with no reusable formula: allowed inline with `// NOTE:` comment |
| If algorithm is > 10 lines | Must be in `shared/algorithms/` |
| If algorithm exists in shared | MUST import it; do not reimplement |

---

## ctx Object Contract

`ctx` is passed from Pipeline to every `apply()` call. Fields are guaranteed:

| Field | Type | Always present | Description |
|-------|------|----------------|-------------|
| `globalSeed` | number | YES | Tool-level seed from AppState |
| `nodeSeed` | number | YES | `globalSeed XOR node.id` |
| `quality` | `'preview'` \| `'full'` | YES | Render quality mode |
| `previewScale` | number | YES | 0.1–1.0; scale spatial params |
| `modMaps` | `{ [id]: Uint8Array }` \| `{}` | YES | Single-channel maps (0–255) |

Nodes must not write to `ctx`. Nodes must not store `ctx` beyond the `apply()` call.

---

## Preview Quality Pattern

Every node must produce recognisable output at `ctx.quality === 'preview'`. Strategies by node type:

| Node type | Preview strategy |
|-----------|-----------------|
| Iteration-heavy (RD, wave) | Cap iterations: `Math.min(100, this.params.iterations)` |
| Convolution (blur, sharpen) | Reduce kernel radius proportionally |
| Spatial (warp, distort) | Scale spatial params: `param * ctx.previewScale` |
| Sampling-heavy | Use nearest-neighbour; skip bilinear in preview |
| Generative | Reduce sample count or grid resolution |
| Simple colour (LUT, levels) | No preview change needed; computation is cheap |

**NEVER skip the effect entirely in preview mode.**

---

## Serialisation Contract

`EffectNode.toJSON()` and `fromJSON()` are defined in the base class and handle:

- `type`, `enabled`, `opacity`
- `params`: shallow copy of `this.params`
- `mask`: `{ enabled, source, invert, feather }` (no pixel data)
- `modulation`: shallow copy

Nodes do NOT override `toJSON()` or `fromJSON()` unless they have state outside `params`.

If a node has non-param state that must survive serialisation:
1. Add it as a paramDef entry, OR
2. Override `toJSON()` / `fromJSON()` and call `super.toJSON()` / `super.fromJSON()` first

**Round-trip requirement:** `fromJSON(toJSON())` must produce identical `params`, `mask` config, and `modulation` to the original node.

---

## Destroy Contract

`EffectNode.destroy()` nulls `_cache`, `mask.data`, and `mask._sourcePixels`. Nodes override only if they hold additional resources:

```javascript
destroy() {
  // clean up node-specific allocated buffers or workers
  this._myWorker?.terminate();
  this._myWorker = null;
  super.destroy();
}
```

Guarantee after `destroy()`:

| Property | State |
|----------|-------|
| `this._cache` | `null` |
| `this.mask.data` | `null` |
| `this.mask._sourcePixels` | `null` |
| Any node-allocated buffers | released |

---

## Category File Structure

One file per REGISTRY category. Structure:

```javascript
/**
 * @fileoverview {Category} effect nodes for the DISTORT pipeline.
 * Each node is a thin wrapper calling the corresponding shared algorithm.
 */

import { EffectNode } from './EffectNode.js';
import { fnA } from '../../../../shared/algorithms/{domain}/{file}.js';

export class NodeA extends EffectNode {
  constructor() { super('typea', 'NODE A', { /* paramDefs */ }); }
  apply(src, dst, w, h, ctx) { dst.set(fnA(src, w, h, this.params.x)); }
}

export class NodeB extends EffectNode { /* ... */ }
```

Rules:
- Named exports only (no `export default`)
- All imports at file top
- One class per algorithm dependency chain; related nodes that share imports can coexist in one file

---

## Forbidden Patterns

| Pattern | Category | Alternative |
|---------|----------|-------------|
| `document.*` in node | DOM access | Nodes have no UI code |
| `window.*` in node | Global access | Use `ctx` for runtime data |
| `requestAnimationFrame` | Animation | Pipeline handles frame scheduling |
| `setInterval` / `setTimeout` | Async | Prohibited in nodes |
| Inline algorithm > 10 lines | Algorithm logic | Extract to `shared/algorithms/` |
| Copy-paste from another node | Duplication | Import shared algorithm |
| Mutable shared state between nodes | Side effect | Nodes are stateless except `this.params` |
| Side effects in constructor | Impure | Constructor: assign params only |
| File I/O, fetch, XHR | I/O | Prohibited |
| Non-RGBA output without `vectorToRaster` | API contract | Use node-adapters.js bridge |
| Storing `ctx` beyond `apply()` scope | Leak | Only use `ctx` within `apply()` |

---

## Reusable Code Tracking

If a node contains algorithm logic that might be shared:

| Threshold | Action |
|-----------|--------|
| > 20 lines of non-trivial logic | Must go to `shared/algorithms/` immediately |
| 10–20 lines, possibly reusable | Add note to `blog/docs/guides/shared-utilities.md` |
| < 10 lines, domain-specific | Inline with `// NOTE:` explaining why not extracted |

---

## Pre-submission Checklist

### Structure
- [ ] Extends `EffectNode` directly
- [ ] Registered in `registry.js` with unique `type` string
- [ ] Lives in correct `{category}-nodes.js` file
- [ ] Named export (no default export)

### Algorithm SSoT
- [ ] Algorithm lives in `shared/algorithms/`
- [ ] No inline implementation > 10 lines in `apply()`
- [ ] Import path resolves correctly

### paramDefs
- [ ] All algorithm params covered (bijection)
- [ ] All entries have `value`, `min`, `max`, `step`, `label`
- [ ] Select params have `type` and `options`
- [ ] Labels UPPERCASE, max 16 chars

### apply()
- [ ] Signature: `apply(src, dst, w, h, ctx)`
- [ ] Writes to `dst` (not returned)
- [ ] No logic outside: unpack params → call algorithm → write dst
- [ ] Spatial/temporal params use `this.getModulated(key, pixelIdx, ctx)` not `this.params[key]`

### Quality
- [ ] Preview mode produces recognisable output
- [ ] No effect skipped in preview

### Serialisation
- [ ] `toJSON()` / `fromJSON()` round-trip verified (or base class handles it)

### Cleanup
- [ ] `destroy()` nulls any buffers held beyond `EffectNode` base

### Vector modules (type `vector` only)
- [ ] `buildGeometry(w, h, ctx)` implemented and returns valid `LineSet`
- [ ] `apply()` calls `buildGeometry()` internally (no duplicated geometry code)
- [ ] `buildGeometry()` is pure — does not write to `dst`

### Forbidden
- [ ] No DOM, window, RAF, setInterval, setTimeout
- [ ] No mutable shared state
- [ ] No side effects in constructor
