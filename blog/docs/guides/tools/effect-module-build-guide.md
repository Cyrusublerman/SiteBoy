# Effect Module Build Guide

**VERSION:** 2.0
**RELATED:**
- `blog/docs/guides/effect-module-standards.md` — Minimum structural requirements
- `blog/docs/guides/effect-module-style-guide.md` — Visual presentation rules
- `blog/docs/components/distort/driver-system.md` — Modulation / driver system
- `blog/docs/guides/checklists/algorithms.md` — Algorithm authoring checklist
- `assets/js/tools/processors/distort/core/EffectModule.js` — Factory (source of truth)
- `assets/js/tools/processors/distort/nodes/EffectNode.js` — Base class

---

## System Architecture

```
Layer 1 — Algorithm  (pure function, shared library, no DOM, no state)
  assets/js/shared/algorithms/{domain}/{file}.js

Layer 2 — Module     (declarative config + algorithm call, no UI logic)
  assets/js/tools/processors/distort/nodes/{category}/{Name}Node.js
  → imports algorithm + createEffectModule → exports a class

Layer 3 — Framework  (handles everything else: UI, mask, drivers, serialisation)
  core/EffectModule.js        ← factory that builds the class
  core/EffectNode.js          ← base class (mask, modulation, cache, toJSON)
  ui/NodePanel.js             ← reads paramDefs → auto-generates controls
  core/Pipeline.js            ← calls apply(), manages buffers

Layer 4 — Registry
  nodes/registry.js           ← maps type strings → factory functions
```

**Rule:** Every layer is strictly separated. Algorithm files know nothing about EffectNode. Module files contain no pixel logic and no DOM. NodePanel knows nothing about algorithms.

---

## Step 1: Write the Algorithm

**The algorithm MUST exist in `shared/algorithms/` before writing the module.**

### Algorithm file contract

```javascript
/**
 * @fileoverview {Short description}
 * @source {URL or paper citation}
 * @formula {Mathematical expression using standard notation}
 *
 * TERM TO CODE
 * ─────────────────────────────
 * σ  → sigma
 * x  → x (pixel column)
 * G  → kernel weight
 */

/**
 * {Description of what the function does}.
 * @param {Uint8ClampedArray} src - Input RGBA pixels, w×h×4 bytes.
 * @param {Uint8ClampedArray} dst - Output RGBA pixels, same length as src. Written in-place.
 * @param {number} w - Image width in pixels.
 * @param {number} h - Image height in pixels.
 * @param {...number} params - Algorithm-specific parameters.
 */
export function myAlgorithm(src, dst, w, h, /* params */) {
  // Implementation.
  // NO: document.*, window.*, import of EffectNode, BaseComponent, or any UI module.
  // NO: allocation of large buffers inside the hot loop — allocate outside and reuse.
}
```

**Constraints:**
- Pure function — no side effects, no global state.
- No DOM access. This function runs inside a Web Worker.
- Parameters correspond 1-to-1 with paramDefs in the module config.
- Writes to `dst` directly or returns a value — consistent across the algorithm library.

Check `blog/docs/guides/checklists/algorithms.md` for the full authoring checklist.

---

## Step 2: Write the Module

### File location

```
assets/js/tools/processors/distort/nodes/{category}/{Name}Node.js
```

One class per file. One file per node.

### Minimal template

```javascript
import { createEffectModule } from '../../core/EffectModule.js';
import { myAlgorithm } from '../../../../../shared/algorithms/{domain}/{file}.js';

export const MyEffectNode = createEffectModule({
  type:     'myeffect',      // unique, lowercase, no spaces or hyphens
  name:     'MY EFFECT',     // UPPERCASE, max 20 chars
  category: 'CATEGORY NAME', // must match a REGISTRY key

  params: {
    amount: { label: 'AMOUNT', min: 0, max: 100, step: 1, value: 50, tier: 3 }
  },

  apply(src, dst, w, h, p) {
    myAlgorithm(src, dst, w, h, p.amount);
  }
});
```

That is the entire module file. No class body. No constructor. No `this`. No UI code.

### With preview caps and per-pixel modulation

```javascript
export const GaussianBlurNode = createEffectModule({
  type: 'gaussblur', name: 'GAUSS BLUR', category: 'BLUR',

  params: {
    sigma:  { label: 'SIGMA',  min: 0.1, max: 30, step: 0.1, value: 2, tier: 3,
              previewMax: 5 },           // capped to 5 in preview mode
    passes: { label: 'PASSES', min: 1,  max: 3,  step: 1,   value: 1, tier: 3,
              previewMax: 1 }            // capped to 1 in preview mode
  },

  // p contains preview-capped values; modulate() gives per-pixel variation
  apply(src, dst, w, h, p, ctx, modulate) {
    gaussianBlurSeparable(src, dst, w, h, p.sigma, p.passes);
  }
});
```

### With per-pixel modulation inside the loop

```javascript
apply(src, dst, w, h, p, ctx, modulate) {
  const n = w * h;
  for (let i = 0; i < n; i++) {
    const strength = modulate('strength', i); // per-pixel; uses driver if active, else p.strength
    const j = i * 4;
    // ... process pixel j using strength
  }
}
```

`modulate(key, pixelIdx)` is always safe to call. It is O(1) and returns `p[key]` when no driver is active.

### Vector (LINE RENDER) node

```javascript
import { createEffectModule } from '../../core/EffectModule.js';
import { buildFlowLines } from '../../../../../shared/algorithms/line/flow-line-engine.js';

export const LuminanceFlowNode = createEffectModule({
  type: 'lumflow', name: 'LUMINANCE FLOW', category: 'LINE RENDER',
  isVector: true,

  params: {
    spacing:    { label: 'SPACING',    min: 1,  max: 40, step: 1,   value: 8,  tier: 3 },
    stepLength: { label: 'STEP',       min: 1,  max: 20, step: 1,   value: 2,  tier: 4 },
    iterations: { label: 'ITERATIONS', min: 1,  max: 20, step: 1,   value: 6,  tier: 3,
                  previewMax: 2 },
    strokeWidth:{ label: 'STROKE W',   min: 0.1,max: 5,  step: 0.1, value: 0.7,tier: 2 }
  },

  applyVector(src, w, h, p) {
    return buildFlowLines(src, w, h, p.spacing, p.stepLength, p.iterations);
    // Returns: { lines: [[{x,y},...], ...], strokeWidth: p.strokeWidth, strokeRGBA: [0,0,0,255] }
  }
});
```

---

## Step 3: ParamDef Schema

Every key in `params` defines one UI control. `NodePanel` reads this to build controls automatically.

```javascript
{
  [key: string]: {
    // ── Required ────────────────────────────────────────────────
    label:   string,          // UPPERCASE, max 16 chars. Shown in NodePanel.
    value:   number|string|boolean, // Default. Must satisfy min ≤ value ≤ max for range.
    tier:    3 | 4 | 5,       // UI tier. 3=primary, 4=secondary, 5=advanced.
                              // Never 2 (reserved: opacity, blendMode).

    // ── Range params (required when type omitted or 'range') ────
    min:     number,
    max:     number,
    step:    number,          // Precision: step 0.01 → 2dp shown in UI.

    // ── Type (optional, default = 'range') ──────────────────────
    type:    'range' | 'select' | 'toggle',
    options: string[],        // Required when type === 'select'. UPPERCASE strings.

    // ── Preview quality (optional) ──────────────────────────────
    previewMax: number,       // Cap value when ctx.quality === 'preview'.
    previewMin: number,       // Floor value when ctx.quality === 'preview'.
                              // Both can be used on one param (clamp).

    // ── Modulation / driver (optional) ─────────────────────────
    driveable: boolean,       // Show [+D] button. Auto: true for range, false for select/toggle.

    // ── Display (optional) ─────────────────────────────────────
    unit: string,             // Unit suffix: 'px', 'deg', '%', etc.
  }
}
```

### Tier usage

| Tier | Controls | Examples |
|------|----------|---------|
| 2 | Universal (reserved — DO NOT USE in paramDefs) | opacity, blendMode |
| 3 | Primary — most important, always visible | amount, sigma, spacing |
| 4 | Secondary — refinement params | step size, damping, exponent |
| 5 | Advanced — rarely adjusted | seed offset, lookup precision, edge mode |

NodePanel renders tiers top-to-bottom in order. Each tier boundary is a 1px divider.

### Control type mapping

| `type` | UI component rendered | Notes |
|--------|----------------------|-------|
| `'range'` (default) | Slider + numeric readout | Shows `[+D]` driver button |
| `'select'` | Dropdown | Options UPPERCASE; no driver button |
| `'toggle'` | Toggle switch | Boolean; no driver button |

---

## Step 4: What createEffectModule Provides

The factory builds a class that extends `EffectNode`. The created class automatically has:

| Capability | Source | Module needs to... |
|------------|--------|--------------------|
| `this.params` populated from defaults | `EffectModule` | Declare in `params` |
| `this.mask` (4 sources, feather) | `EffectNode` | Nothing |
| `this.modulation` (per-param driver state) | `EffectNode` | Nothing |
| `this.opacity` | `EffectNode` | Nothing |
| `this.blendMode` | `EffectNode` | Nothing |
| `this.enabled` | `EffectNode` | Nothing |
| `toJSON()` / `fromJSON()` | `EffectNode` | Nothing |
| `destroy()` | `EffectNode` + `EffectModule` | Optional `destroy()` hook |
| Cache invalidation | `EffectNode.invalidate()` | Nothing |
| Preview caps | `EffectModule._resolveParams()` | Declare `previewMax`/`previewMin` |
| Per-pixel modulation helper | `EffectModule._makeModulate()` | Use `modulate(key, i)` in apply |
| Config validation at startup | `EffectModule` | Nothing |

**The module file does not need:**
- A constructor
- `super()` call
- `toJSON()` / `fromJSON()`
- `destroy()`
- Any UI logic
- Any mask logic
- Any driver/modulation logic

---

## Step 5: RenderContext (`ctx`) Reference

`ctx` is passed as the 5th argument to `apply(src, dst, w, h, p, ctx, modulate)`:

```javascript
ctx = {
  width:       number,   // render width (may be < sourceW in preview)
  height:      number,   // render height
  quality:     'preview' | 'full',
  previewScale:number,   // spatial scale factor (e.g. 0.25); use to scale spatial params manually if needed
  globalSeed:  number,
  nodeSeed:    number,   // deterministic per-node seed: hashSeed(globalSeed, nodeIndex, nodeId)
  modMaps:     Object,   // { [mapId]: Uint8Array } — single-channel modulation maps
  nodeIndex:   number,   // index of this node in the active stack
}
```

Preview caps via `previewMax`/`previewMin` in paramDefs handle most quality concerns. Only implement manual preview logic in `apply` when the algorithm has a non-parameter quality axis (e.g. number of steps in a simulation).

---

## Step 6: Register in registry.js

```javascript
// nodes/registry.js
import { GaussianBlurNode } from './blur/GaussianBlurNode.js';

export const REGISTRY = {
  // ...
  'BLUR': [
    { type: 'gaussblur', label: 'GAUSS BLUR', factory: () => new GaussianBlurNode() },
  ],
  // ...
};
```

**Registry entry shape:**

```javascript
{
  type:    string,         // Must match config.type exactly.
  label:   string,         // UPPERCASE display name for CategoryPicker.
  factory: () => EffectNode  // Zero-argument factory function.
}
```

`type` must be globally unique across all registered nodes.

---

## Step 7: Mask Behaviour (no action required)

Pipeline calls `node.buildMask(srcPixels, w, h)` before `apply()` when `node.mask.enabled === true`. The mask is populated into `node.mask.data` (a `Uint8Array` of length `w×h`). Pipeline handles mask blending via `node.opacity` — the module does not need to blend the mask itself.

If a module needs mask-aware per-pixel logic (e.g. to exit early on masked-out pixels):
```javascript
apply(src, dst, w, h, p, ctx, modulate) {
  // node.mask.data is available on `this` inside the function via call context
  // but the normal pattern is to just write to dst — Pipeline blends it
}
```

In standard usage: **modules ignore the mask entirely.** Pipeline composites the result with the source using `node.mask.data` and `node.opacity` after `apply()` returns.

---

## Step 8: Full Working Example

**Algorithm (`shared/algorithms/blur/gaussian.js`):**
```javascript
/**
 * @fileoverview Separable Gaussian blur via 1D convolution.
 * @source https://en.wikipedia.org/wiki/Gaussian_blur
 * @formula G(x) = exp(−x² / 2σ²) / √(2πσ²)
 *
 * TERM TO CODE
 * σ   → sigma
 * r   → radius (ceil(sigma × 3))
 * G   → kernel weight (normalised)
 */

/**
 * @param {Uint8ClampedArray} src
 * @param {Uint8ClampedArray} dst
 * @param {number} w
 * @param {number} h
 * @param {number} sigma   - Standard deviation in pixels.
 * @param {number} passes  - Number of blur passes (1–5).
 */
export function gaussianBlurSeparable(src, dst, w, h, sigma, passes = 1) {
  const rad    = Math.ceil(sigma * 3);
  const kernel = _makeKernel(sigma, rad);
  const buf    = new Uint8ClampedArray(src);
  const tmp    = new Uint8ClampedArray(src.length);

  for (let pass = 0; pass < passes; pass++) {
    _convolveH(buf, tmp, w, h, kernel, rad);
    _convolveV(tmp, buf, w, h, kernel, rad);
  }
  dst.set(buf);
}

function _makeKernel(sigma, r) {
  const k = new Float32Array(r * 2 + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) { k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)); sum += k[i + r]; }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  return k;
}

function _convolveH(s, d, w, h, k, r) {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let cr = 0, cg = 0, cb = 0, ca = 0;
      for (let j = -r; j <= r; j++) {
        const cx = Math.max(0, Math.min(w - 1, x + j));
        const i = (y * w + cx) * 4, wt = k[j + r];
        cr += s[i] * wt; cg += s[i + 1] * wt; cb += s[i + 2] * wt; ca += s[i + 3] * wt;
      }
      const o = (y * w + x) * 4;
      d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = ca;
    }
  }
}

function _convolveV(s, d, w, h, k, r) {
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let cr = 0, cg = 0, cb = 0, ca = 0;
      for (let j = -r; j <= r; j++) {
        const cy = Math.max(0, Math.min(h - 1, y + j));
        const i = (cy * w + x) * 4, wt = k[j + r];
        cr += s[i] * wt; cg += s[i + 1] * wt; cb += s[i + 2] * wt; ca += s[i + 3] * wt;
      }
      const o = (y * w + x) * 4;
      d[o] = cr; d[o + 1] = cg; d[o + 2] = cb; d[o + 3] = ca;
    }
  }
}
```

**Module (`nodes/blur/GaussianBlurNode.js`):**
```javascript
import { createEffectModule } from '../../core/EffectModule.js';
import { gaussianBlurSeparable } from '../../../../../shared/algorithms/blur/gaussian.js';

export const GaussianBlurNode = createEffectModule({
  type: 'gaussblur', name: 'GAUSS BLUR', category: 'BLUR',

  params: {
    sigma:  { label: 'SIGMA',  min: 0.1, max: 30, step: 0.1, value: 2, tier: 3, previewMax: 5 },
    passes: { label: 'PASSES', min: 1,   max: 3,  step: 1,   value: 1, tier: 3, previewMax: 1 }
  },

  apply(src, dst, w, h, p) {
    gaussianBlurSeparable(src, dst, w, h, p.sigma, p.passes);
  }
});
```

**Registry entry (`nodes/registry.js`):**
```javascript
import { GaussianBlurNode } from './blur/GaussianBlurNode.js';
// In REGISTRY:
'BLUR': [
  { type: 'gaussblur', label: 'GAUSS BLUR', factory: () => new GaussianBlurNode() },
]
```

---

## Step 9: Testing Protocol

| Test | Procedure | Pass criteria |
|------|-----------|---------------|
| Apply fires | Add node to empty stack, load image | Canvas changes from source |
| Each param | Drag slider min → max | Visible change on canvas |
| Param at extremes | Set each param to min, then max | No error, no crash |
| Preview quality | Set quality = Preview | Effect visible, not identical to full |
| Preview caps | Set quality = Preview, set param to > previewMax | Capped value applied |
| Mask: luminance | Enable mask, source = LUMINANCE | Effect in bright areas only |
| Mask: gradient | Enable mask, source = GRADIENT | Effect fades toward edges |
| Modulation | Assign image driver to a range param | Per-pixel variation visible |
| Expression driver | Enter `= lum * 30` as driver | Variation follows luminance |
| Serialise | `node.toJSON()` → `node.fromJSON(data)` | All params, mask, modulation, blendMode round-trip |
| Destroy | `node.destroy()` | No errors; `_cache` and `mask.data` null |
| Worker context | Check no `document.*` or `window.*` calls | No ReferenceError in Worker |

---

## Validation Checklist

### Module file
- [ ] Uses `createEffectModule({...})` — does NOT extend `EffectNode` directly
- [ ] No algorithm logic in `apply()` (only: call imported function, pass `p.*` values)
- [ ] No DOM access, no `window.*`, no `document.*`
- [ ] No `requestAnimationFrame`, `setInterval`, `setTimeout`
- [ ] `type` is lowercase, no spaces or hyphens, globally unique

### Algorithm file
- [ ] In `shared/algorithms/{domain}/{file}.js`
- [ ] Has `@source`, `@formula`, and TERM-TO-CODE table in JSDoc
- [ ] Pure function — no side effects, no imports from EffectNode or UI
- [ ] Parameters correspond 1-to-1 with module `params`

### paramDefs
- [ ] Every param has: `label`, `value`, `tier`
- [ ] Range params have: `min`, `max`, `step`
- [ ] Select params have: `type: 'select'`, `options` (UPPERCASE strings)
- [ ] Labels are UPPERCASE, max 16 chars
- [ ] No param uses `tier: 2` (reserved for universal controls)
- [ ] Slow-path params (iterations, radius) have `previewMax` or `previewMin`

### Registry
- [ ] Module imported and registered in `registry.js`
- [ ] `type` matches `config.type` exactly
- [ ] `factory` is a zero-argument function returning the node

### Tests
- [ ] All params produce visible change
- [ ] Preview quality produces a result (not a pass-through)
- [ ] `toJSON()`/`fromJSON()` round-trip verified
- [ ] `destroy()` leaves no leaked references

---

## Error Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `apply()` does nothing | Missing `apply` in config | Add `apply(src, dst, w, h, p) { ... }` |
| Algorithm not found | Wrong import path | Verify path relative to node file |
| param not in `p` | Key not in `params` config | Add paramDef entry |
| Config validation error at startup | Missing required field | Read error message — it names the field |
| Slider does not appear | `type: 'range'` missing min/max/step | Add all three |
| Dropdown options empty | `options` not provided for select param | Add `options: ['OPT_A', 'OPT_B']` |
| `tier: 2` error | Reserved tier used in paramDefs | Change to 3, 4, or 5 |
| `isVector` without `applyVector` | Config validation | Add `applyVector()` or remove `isVector` |
| Modulation has no effect | Driver not active or `modMaps` missing | Check AppState.modulation + WorkerBridge |
| Type collision in registry | Two nodes with same `type` | Make type strings globally unique |
| ReferenceError in Worker | `document.*` or `window.*` in algorithm | Remove — Worker has no DOM |
