# Document Module Guide

Produces a complete 8-file documentation pack for one effect module. Work through every step in order. Do not skip steps. Do not proceed to a later step until the current step is finished. All 8 output files must pass the criteria in `review-and-correction-loop.md` before the module is considered migrated.

---

## Step 0 — Pre-read the source node

Before writing anything, read the live `*Node.js` file completely. The file is in `assets/js/tools/processors/distort/nodes/<category>/<ClassName>Node.js`.

**Read in this order:**

### 0.1 Module declaration and registration

- How is the module exported? (Must be `export const XNode = createEffectModule({...})`)
- What is the `type` string?
- What is the `name` string (display label)?
- What is the `category` string?
- Is `isVector: true` present? (indicates a line-render module)

### 0.2 params

Read every entry in `params`. For each, note:

- `key` (camelCase)
- `label` (SCREAMING CASE)
- `type` — `range` (default if omitted), `select`, or `toggle`
- `min`, `max`, `step`, `value` (for `range`)
- `options` (for `select`)
- `tier` — 3, 4, or 5
- `driveable` — is this param intended to have an image or expression driver?
- `previewMax` / `previewMin` — any preview caps declared on the param?

Record the full param count by tier.

### 0.3 apply() signature and body

Trace the complete execution path of `apply(src, dst, w, h, p, ctx, modulate)`:

1. What does `p` contain? (Pre-resolved params with preview caps applied by factory)
2. Does the module also check `ctx.quality` inline? Where? (Legacy or complex cap only)
3. Which params are read via `modulate(key, i)` inside pixel loops vs. `p.key` directly?
4. What algorithm does the main loop implement? (per-pixel, convolution, integral-image, recursive, pass-based?)
5. What imports come from `assets/js/shared/algorithms/`?
6. What is the execution order — list every numbered step in source order

**No `ctx.pool`:** algorithms receive typed arrays directly. Note any scratch allocations (`new Float32Array`, etc.).

### 0.4 applyVector() — if present (`isVector: true`)

- What geometry type does it return?
- Is it per-pixel, region-based, or derived from param values only?
- What params influence the geometry?
- What is the relationship between the pixel output (`apply`) and the vector output (`applyVector`)?

### 0.5 destroy() — if present

- What resources were acquired that require cleanup?
- When was the acquisition (constructor or apply)?

### 0.6 Preview strategy

- Are `previewMax` or `previewMin` declared on any params? (Primary mechanism — factory resolves before calling apply)
- Does `apply()` also check `ctx.quality === 'preview'` inline? (Secondary/complex cap only)
- If neither: is the module O(1) per pixel (no cap needed), or does it need caps (flag as WARN)?

---

## Step 1 — Read and consolidate legacy docs

Check `reference/distort/<type>/legacy-docs/` for archived files. Always present: `<type>.md` (the component-level doc). There may be additional files.

For each file found:

### 1.1 Classify it using `classify-reference-material.md`

### 1.2 Read the component-level doc completely

Extract every feature, parameter, behaviour, or constraint it describes. Write a flat list: "Component-level doc describes: [algorithm name], [visual effect], [param A with label X, range Y–Z, default D, tier T], [mask control behaviour], [modulation targets]."

### 1.3 For each feature in the list, check the live source

- **Confirmed**: exists in source and matches the doc
- **Changed**: exists but differs from the doc (different default, label, tier, range, or behaviour)
- **Absent**: described in doc, no corresponding implementation in source
- **Conflicting**: doc and source describe the same thing in contradictory ways

### 1.4 Record consolidation summary

Three lists: confirmed features, absent features (parity holes), conflicts.

This consolidation drives `feature-parity.md` (Step 7) and `issues-and-conflicts.md` (Step 8).

---

## Step 2 — Write `source-reference.md`

Required content:

```markdown
# <Display Name> — Source Reference

## Current Owners

- source node: `assets/js/tools/processors/distort/nodes/<cat>/<ClassName>Node.js`
- registry: `assets/js/tools/processors/distort/nodes/registry.js`
- pipeline: `assets/js/tools/processors/distort/core/Pipeline.js`

## Archive

- `reference/distort/<type>/source/<ClassName>Node.js`

## Legacy Docs Archived

- `reference/distort/<type>/legacy-docs/<type>.md` — classification: component-level doc
- (any additional files with their classifications)

## Algorithm Imports

- (list every import from assets/js/shared/algorithms/)
- (or: none — all computation is inline)

## Classifications

- source node: functional source node
- <type>.md: component-level doc
- <other file>: <classification>
```

---

## Step 3 — Write `description.md`

Must answer all of the following. Do not copy from the component-level doc verbatim — synthesise from both the doc and the source.

### 3.1 Algorithm name and image effect

What algorithm does this module implement? Name it precisely. What image processing effect does it produce?

Example: "Implements a 2D Gaussian blur using a separable kernel convolution. Smoothes the input image by convolving it with a Gaussian function, reducing high-frequency detail."

### 3.2 Visual output

What does the output look like? Describe the visual change produced on a typical input image. What structures appear or disappear? What parameter drives the most visible change?

### 3.3 What makes it distinct

What makes this module different from similar modules in the same category? (e.g. "Unlike Box Blur, Gaussian Blur weights pixels by a bell-curve function, producing smoother transitions and fewer ring artefacts at large radii.")

### 3.4 Algorithm origin

If the algorithm has a standard name (Gaussian blur, Otsu thresholding, Gray-Scott reaction-diffusion, bilateral filter, Canny edge detection), state it. If it is a heuristic or bespoke variation, say so and describe what makes it bespoke.

### 3.5 Scope boundary

State explicitly what this module does NOT do. One to three sentences. (e.g. "Does not operate on vector geometry. Does not animate over time — apply() is stateless.")

**Minimum 150 words.** A description shorter than this has not been written from the source.

---

## Step 4 — Write `mechanisms.md`

Four required sections:

### 4.1 apply() execution order

Number every step in `apply(src, dst, w, h, p, ctx, modulate)` in source order:

1. Derive computed values from `p` (preview caps already applied by factory via `previewMax`)
2. (If any inline `ctx.quality` check present: note what it does and why it cannot use `previewMax`)
3. Build separable Gaussian kernel: `_buildKernel(p.sigma)` → array of weights
4. Horizontal pass: for each row, convolve `src` into `tmp` buffer
5. Vertical pass: for each column, convolve `tmp` into `dst`

### 4.2 Function inventory

List every named function (the config methods and module-scope helpers):

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `apply(src, dst, w, h, p, ctx, modulate)` | Pixel render function | buffers + resolved params + context | void (writes dst) | O(w × h × k) where k = kernel size |
| `_buildKernel(sigma)` | Constructs Gaussian kernel weights | `sigma: number` | `Float32Array` of weights | O(k) |
| `_convolveRow(src, tmp, w, h, kernel)` | Horizontal convolution pass | buffers, dimensions, kernel | void (writes tmp) | O(w × h × k) |

### 4.3 Mathematical model

Write every non-trivial formula with all symbols defined:

**Gaussian kernel weight:**
`w[i] = exp(−i² / (2σ²))`

where:
- `w[i]` — kernel weight at offset `i` from centre
- `σ` — standard deviation in pixels; derived from `blurRadius` as `σ = blurRadius / 3`
- Kernel is normalised: `Σw[i] = 1`

**If the module contains zero mathematical operations**, state that explicitly: "This module performs no mathematical operations — it is a lookup-table / colour-remap module."

### 4.4 Preview strategy detail

Document the exact PREVIEW caps implemented:

- Which params declare `previewMax` or `previewMin`? What are the cap values?
- Does the module also have an inline `ctx.quality === 'preview'` check? Why (cannot express as `previewMax`)?
- Does the cap apply to all expensive params or only the most expensive?
- Evidence: cite the param def field or the source condition

---

## Step 5 — Write `ui-layout.md`

Three required sections:

### 5.1 Parameter table

One row per `param` entry. Never omit a parameter.

| Key | Label | Type | Min | Max | Step | Default (`value`) | Tier | Driveable | previewMax | Controls |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sigma` | SIGMA | range | 0.1 | 30 | 0.1 | 2 | 3 | yes | 5 | Standard deviation in pixels. Larger values produce more blur. Factory caps to 5 in PREVIEW. |
| `blurMode` | BLUR MODE | select | — | — | — | SYMMETRIC | 4 | no | — | How boundary pixels are handled: SYMMETRIC (reflect), CLAMP (repeat edge), ZERO (black pad). |

The "Controls" column must explain what the parameter actually does in the render, not just restate the label.

### 5.2 Mask controls

State whether this module supports masks. If yes:
- What does the mask drive? (alpha blend between src and dst, selective apply, pixel-weight modulation?)
- How is the mask applied in `apply()`?

If the module does not support masks, state: "No mask controls. This module does not read mask input."

### 5.3 Modulation targets

State which params can have image or expression drivers attached (from `paramDefs` entries with `driveable: true`). For each driveable param:
- What does per-pixel driving do? (e.g. "blurRadius driven per-pixel by luminance map: brighter regions get more blur")
- Is the driver per-frame or per-pixel (determined by `ctx.pixelVars` presence)?

If no driveable params: "No modulation targets."

### 5.4 UX notes

Note parameters that interact non-obviously, labels that may be misleading, or values where maximum causes severe performance impact.

---

## Step 6 — Write `performance.md`

Five required sections:

### 6.1 Dominant operation

Name the single most expensive computation in `apply()`. Be specific: not "the blur pass" but "the separable convolution — O(w × h × k) where k = 2×radius+1, evaluated twice (horizontal and vertical pass)."

### 6.2 Complexity

State the loop complexity with all variables defined.

Example: "Total cost is O(w × h × k) where w = output width, h = output height, k = kernel size = `2 × blurRadius + 1`. At default radius 2: k = 5, total ops ≈ 5 × w × h for each pass × 2 passes = 10 × w × h per frame. At max radius 50: k = 101, total ops ≈ 202 × w × h per frame."

### 6.3 Extreme parameter values

For each param with significant performance impact at its maximum, state what happens:

- `blurRadius: 50` — kernel size 101; two passes of 101×w×h ops; Class D at PREVIEW resolution, Class D at FULL resolution

### 6.4 Render cost class

Assign a render cost class (from `tool.md` performance contract):
- A: < 16ms at PREVIEW resolution on typical hardware
- B: 16–100ms
- C: 100–500ms
- D: > 500ms

State whether PREVIEW caps reduce the class (e.g. "Class D at full radius, Class A at PREVIEW with radius cap").

### 6.5 Mitigation candidates

List as flagged items (not fixes) anything that could reduce cost:
- Integral-image box blur approximation for large radii
- LUT precomputation for kernel weights (already implemented if `_buildKernel` caches)
- OffscreenCanvas operation already in Worker — no further offload needed

---

## Step 7 — Write `feature-parity.md`

Three required sections:

### 7.1 Feature inventory

Read each legacy doc and record every described feature's status in the live source.

| Feature | Legacy source | Status in live source | Notes |
| --- | --- | --- | --- |
| Separable Gaussian convolution | gaussblur.md | Confirmed | Horizontal + vertical pass in apply() |
| FAST mode (box blur approximation) | gaussblur.md | Absent | Component doc describes FAST mode; source has SYMMETRIC/CLAMP/ZERO only |

### 7.2 Module standard feature audit

| Feature | Used? | Notes |
| --- | --- | --- |
| Mask support | Yes / No | |
| Driver system (driveable params) | Yes / No | Which params? |
| buildGeometry() | Yes / No | |
| destroy() | Yes / No | What does it clean up? |
| PREVIEW quality cap | Yes / No | |
| Presets | Yes / No | How many? |

### 7.3 Parity holes

Explicit numbered list of every gap:

1. No FAST mode — component doc describes it; source does not implement it
2. (or: "No parity holes identified — all features described in the component-level doc are confirmed in the source.")

---

## Step 8 — Write `issues-and-conflicts.md`

Three required sections plus carry-overs:

### 8.1 Standards compliance check

Run through every item in `build-module.md §8`. Record pass or specific failure with evidence.

Module structure:
- [ ] Produced by `createEffectModule({...})` — pass/fail
- [ ] `type` lowercase, no separators, unique — pass/fail
- [ ] `name` UPPERCASE, max 20 chars — pass/fail
- [ ] `params` has ≥1 tier-3 param — pass/fail
- [ ] All param keys camelCase — pass/fail
- [ ] All labels SCREAMING CASE ≤16 chars — pass/fail
- [ ] All `range` params have `min`, `max`, `step`, `value` — pass/fail
- [ ] `apply(src, dst, w, h, p, ctx, modulate)` signature correct — pass/fail
- [ ] Uses `p.key` not `this.params[key]` — pass/fail
- [ ] `previewMax`/`previewMin` declared on cost-scaling params (or inline `ctx.quality` justified) — pass/fail
- [ ] No `document.*`, `window.*` — pass/fail
- [ ] No `fetch`, network API — pass/fail
- [ ] No `requestAnimationFrame`, `setInterval`, `setTimeout` — pass/fail
- [ ] No inline algorithm that exists in library — pass/fail

### 8.2 Bug and risk detection

Use the record format from `issue-flagging.md` for each finding:

```
[SEVERITY] [CATEGORY] Short description
Location: method name or step reference
Evidence: exact quote or precise paraphrase
Impact: what goes wrong or is missing
```

Look for:
- Buffer index out of bounds (off-by-one with w, h, stride = 4)
- Driveable param read via `p[key]` directly inside a pixel loop instead of `modulate(key, i)`
- Missing PREVIEW cap (no `previewMax` and no inline `ctx.quality` check) for an O(n × param) module
- Allocation inside the pixel loop (`new Float32Array()` per pixel) — costly GC pressure
- Missing alpha passthrough (`dst[j+3] = src[j+3]`) in pixel transforms that write RGB only
- Division by accumulated sum that can be zero (e.g. normalisation of empty histogram)

### 8.3 Performance risks (carried from Step 6)

Copy the mitigation candidates from `performance.md §6.5` in issue format.

### 8.4 Parity holes (carried from Step 7)

Copy each parity hole from `feature-parity.md §7.3` as a `[NOTE] [PARITY]` issue.

---

## Step 9 — Write `migration-log.md`

```markdown
# <Display Name> — Migration Log

## Date

<ISO date: YYYY-MM-DD>

## Inputs Used

- source node: `assets/js/tools/processors/distort/nodes/<cat>/<ClassName>Node.js`
- component-level doc: `blog/docs/components/distort/modules/<type>.md` — classification: component-level doc
- (any additional legacy files with their paths and classifications)
- (or: no additional legacy docs located)

## Archive Outputs

- `reference/distort/<type>/source/<ClassName>Node.js` — copied
- `reference/distort/<type>/legacy-docs/<type>.md` — copied
- (any additional archived files)

## Pack Files Produced

- source-reference.md
- description.md
- mechanisms.md
- ui-layout.md
- performance.md
- feature-parity.md
- issues-and-conflicts.md
- migration-log.md (this file)

## Classification Summary

- source node: functional source node
- <type>.md: component-level doc
- (others as applicable)

## Notes

Any decisions made during migration not obvious from the pack files themselves.
```

---

## Completion Gate

Before marking a module's migration as done, verify every file against the pass criteria in `review-and-correction-loop.md`. A score of 8/8 files passing is required. Do not close the todo until the score is confirmed. Update `inventory.md` pack status from `absent` to `complete`.
