# DILATEERODE — Build Guide

- module: dilateerode
- node: DilateErodeNode.js
- category: MORPHOLOGY
- review verdict: KEEP — rebuild as morphology primitive / structure refinement system
- rebuild severity: MAJOR

---

## Current State Summary

`DilateErodeNode.js` is a 16-line factory module wrapping a single `morphologyRGBA` call. It exposes three params: `MODE` (select: DILATE/ERODE), `RADIUS` (range 1–10), `SHAPE` (select: SQUARE/CIRCLE). The module is structurally minimal and loads without error.

Two ERRORs make the current implementation functionally deceptive:

1. `SHAPE` param is declared and rendered in UI but `p.shape` is never passed to `morphologyRGBA` — all output uses a square kernel regardless of selection.
2. `RADIUS` is marked `driveable: true` but `apply()` is declared as `apply(src, dst, w, h, p)` — `modulate` is absent from the signature. Per-pixel radius variation is architecturally impossible; the +D slot is cosmetically present but has no effect.

Additionally, the `apply()` signature does not match the full factory contract `apply(src, dst, w, h, p, ctx, modulate)` — `ctx` and `modulate` are both omitted.

The module is framed as a general image effect. It is structurally a low-level morphological primitive. Without domain selection, compound modes, or field output, its utility on photographic imagery is perceptually negligible at typical radii. The CORRODED global preset (registry.js line 276) uses `dilateerode` with `shape:'circle'` — this currently has zero effect on output.

---

## Reference Parity Gaps

Reference source (`reference/distort/dilateerode/source/DilateErodeNode.js`) is identical to the live implementation — the archive is a snapshot of the current file, not a prior working version. No additional functionality exists in the reference that is missing from live code.

| Gap | Detail |
|---|---|
| `apply()` full signature | Both ref and live omit `ctx` and `modulate`; neither fulfils the `createEffectModule` contract fully |
| `p.shape` forwarding | Absent in both ref and live — not a regression, an unresolved forward-declared hook |
| Legacy `grayscaleDilate`/`grayscaleErode` | Legacy docs reference these; live code calls `morphologyRGBA`. Functional equivalence unconfirmed without reading `morphology.js`. Channel-independence guarantee in legacy doc is unverifiable from node alone |
| Preview cap | Legacy doc claims "No reduction" — incorrect. Live source has `previewMax: 5`. Corrected in pack docs |
| `shape` tier discrepancy | Legacy doc implies tier 5; live source declares tier 4 |

---

## Review Spec Gaps

All items from `dilateerode_review2403.md §Required Rebuild Specification` are absent from the current implementation.

| Feature | Specified | Status |
|---|---|---|
| INPUT DOMAIN param (LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP / THRESHOLDED BINARY / EXTERNAL FIELD) | Required | Absent |
| Compound operation modes (OPEN, CLOSE, GRADIENT, INTERNAL GRADIENT, EXTERNAL GRADIENT, TOPHAT, BLACKHAT) | Required | Absent — MODE only offers DILATE/ERODE |
| Expanded SHAPE set (DIAMOND, HORIZONTAL LINE, VERTICAL LINE, CROSS, ORIENTED LINE) | Required | Absent — SHAPE options limited to SQUARE/CIRCLE and non-functional |
| RADIUS X / RADIUS Y anisotropic radii | Specified | Absent |
| ROTATION param (for oriented kernel) | Specified | Absent |
| ISOTROPIC toggle | Specified | Absent |
| ITERATIONS param (range 1–10, previewMax: 3) | Required | Absent |
| STEP RADIUS param | Specified | Absent |
| SEQUENCE MODE | Specified | Absent |
| WARMUP STEPS | Specified | Absent |
| BAKE STATE | Specified | Absent |
| OUTPUT TYPE (image / mask / field / hybrid) | Required | Absent |
| INVERT output | Specified | Absent |
| NORMALISE output | Specified | Absent |
| DIFFERENCE AGAINST SOURCE | Specified | Absent |
| FIELD output mode | Required | Absent |
| Worker offload | Required (G12) | Unconfirmed — apply() runs synchronously |
| Separable approximation for rectangular kernels | Performance mitigation | Absent |
| `driveable: true` on RADIUS removed or redesigned | Required | Not done — flag still set; apply() still broken |
| SHAPE forwarded to algorithm | Required | Not done |
| CORRODED preset shape:'circle' effect | Preset dependency | Non-functional due to shape not forwarded |

---

## Missing Parameters

All items below are absent from the current param set and are required per review spec.

| Key | Label | Type | Range / Options | Tier | Notes |
|---|---|---|---|---|---|
| `domain` | DOMAIN | select | LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP / THRESHOLDED BINARY | 3 | Input domain for morphological operation |
| `iterations` | ITERATIONS | range | 1–10, step 1, default 1, previewMax: 3 | 3 | Iterative application count |
| `outputType` | OUTPUT TYPE | select | IMAGE / MASK / FIELD / HYBRID | 3 | Controls what the node writes to dst or exports as field |
| `open` / `close` / `gradient` / `tophat` / `blackhat` modes | — | — | — | — | Extend MODE dropdown; do not add as separate params |
| `radiusX` | RADIUS X | range | 1–10, step 1, previewMax: 5 | 4 | Horizontal radius for anisotropic kernels (when ISOTROPIC off) |
| `radiusY` | RADIUS Y | range | 1–10, step 1, previewMax: 5 | 4 | Vertical radius for anisotropic kernels (when ISOTROPIC off) |
| `isotropic` | ISOTROPIC | toggle | bool, default true | 4 | When true: single RADIUS drives both axes |
| `rotation` | ROTATION | range | 0–360, step 1, unit: °, default 0 | 4 | Kernel rotation for ORIENTED LINE shape |
| `invert` | INVERT | toggle | bool, default false | 4 | Invert output after morphological computation |
| `normalise` | NORMALISE | toggle | bool, default false | 4 | Normalise output range to 0–255 |
| `diffSrc` | DIFF SOURCE | toggle | bool, default false | 4 | Output = |morphology(src) − src| |

G14 conditional visibility applies: `radiusX`, `radiusY`, `rotation` must be hidden when `isotropic: true` and/or when SHAPE is not ORIENTED LINE respectively.

---

## Extra/Incorrect Parameters

| Param | Issue |
|---|---|
| `radius` with `driveable: true` | Driveable flag is a lie. `apply()` omits `modulate`; `morphologyRGBA` takes a scalar radius. Remove `driveable: true` until algorithm is rebuilt to support per-pixel radius (requires fundamentally different call pattern — not a simple fix). |
| `shape` with options only SQUARE/CIRCLE | Non-functional (not forwarded). Must be expanded to SQUARE / CIRCLE / DIAMOND / HORIZONTAL LINE / VERTICAL LINE / CROSS / ORIENTED LINE and forwarded. |

No params should be removed outright; both `shape` and `radius` must be fixed in-place.

---

## UI Compliance Issues

| Issue | Source | Severity |
|---|---|---|
| SHAPE control present and non-functional — UI affordance is a lie | issues-and-conflicts.md; review 4.4 | ERROR |
| RADIUS shows +D button implying driver support but modulation is impossible | review 4.5, 7.1 | ERROR |
| `apply()` missing `ctx` and `modulate` from factory signature | issues-and-conflicts.md compliance check | FAIL |
| CORRODED preset passes `shape:'circle'` — has zero effect | registry.js line 276 | BUG |
| No unit label on RADIUS in rendered output (unit field present in def but rendering depends on NodePanel implementation — G16) | G16 | WARN |
| Mode-conditional params not implemented — future params (radiusX, radiusY, rotation) must be hidden per active mode/shape (G14) | G14 | Required on rebuild |

---

## Global Issues

| Issue | Applicability | Status |
|---|---|---|
| **G1** — +D button non-functional in NodePanel | Affects all driveable params including RADIUS | Open — NodePanel bug, not fixed in this module |
| **G2** — All numeric params must have `driveable: true` | RADIUS already has it but is non-functional; ITERATIONS, RADIUS X, RADIUS Y, ROTATION must also have `driveable: true` when added; driver architecture must be rebuilt before it can function | Partially applied; requires apply() signature fix |
| **G5** — Slider direct number input and double-click-to-default | Applies to RADIUS (and future ITERATIONS, RADIUS X, RADIUS Y, ROTATION) | Open — NodePanel component bug |
| **G6** — Canvas click-to-pick for centre params | Not applicable — no spatial origin point in this module | N/A |
| **G7** — Vector module identifiability | Not applicable — pixel module | N/A |
| **G9** — Time/iteration modules must expose FRAME param | Not applicable in current state; if ITERATIONS is added with stateful sequencing this must be re-evaluated | N/A unless sequencing is stateful |
| **G10** — SVG export for vector modules | Not applicable — pixel module | N/A |
| **G11** — Shared components for overlapping features | DOMAIN selector, OUTPUT TYPE, INVERT, NORMALISE, DIFF SOURCE are patterns shared with other morphology/segmentation modules — build as shared components before consuming here | Open |
| **G12** — Web worker offload for expensive modules | `morphologyRGBA` at radius 10, 4K image = ~3.67 billion comparisons; estimated 200 ms–1 s+ on main thread. Worker offload required. No worker confirmed | Open — WARN |
| **G14** — Mode-conditional param visibility | Future params RADIUS X, RADIUS Y (when ISOTROPIC=false), ROTATION (when SHAPE=ORIENTED LINE) must be hidden when not applicable | Required on rebuild |
| **G16** — Unit labels on all numeric params | RADIUS has `unit: 'px'` defined; ITERATIONS needs `unit: 'steps'`; ROTATION needs `unit: '°'`; RADIUS X/Y need `unit: 'px'` | Partially done on RADIUS; others required |

---

## Merge Absorption

The following review action items have been absorbed into the Required Changes list below and need not be tracked separately:

- Review §Action Items 1–14 — all absorbed.
- `feature-parity.md` parity holes 1–4 — all absorbed.
- `issues-and-conflicts.md` four issues — all absorbed.
- `mechanisms.md` signature note (`ctx` and `modulate` omitted) — absorbed into change #1.
- `performance.md` mitigation candidates (separable approximation, span tables) — absorbed into change #6.

---

## Required Changes (priority ordered)

### CRITICAL

**C1. Fix `apply()` signature — add `ctx` and `modulate`.**
`apply(src, dst, w, h, p)` → `apply(src, dst, w, h, p, ctx, modulate)`.
Required before any driver work can function. This is the factory contract.

**C2. Fix SHAPE forwarding — pass `p.shape` to `morphologyRGBA` or remove SHAPE from UI.**
Current: `morphologyRGBA(src, w, h, p.mode.toLowerCase(), p.radius)` — `p.shape` absent.
Required: either (a) extend `morphologyRGBA` to accept shape argument and implement SQUARE/CIRCLE dispatch internally, or (b) remove SHAPE from params until algorithm supports it.
Minimum acceptable: pass `p.shape.toLowerCase()` as 5th argument; ensure `morphologyRGBA` dispatches correctly. CORRODED preset fix is a direct consequence.

**C3. Remove `driveable: true` from RADIUS until apply() supports per-pixel radius.**
`morphologyRGBA` takes a single scalar radius. Per-pixel variation requires a structurally different algorithm (per-pixel neighbourhood call or a variable-radius morphology function). Until that architecture exists, the flag is a lie. Remove it. Re-add once algorithm supports it.

**C4. Verify `morphologyRGBA` correctness against binary test inputs.**
Confirm: dilation expands bright pixels, erosion contracts them, CIRCLE shape produces distinct output from SQUARE. Identify whether `morphologyRGBA` dispatches `grayscaleDilate`/`grayscaleErode` internally (channel-independence) or operates on full RGBA. Document result. This is a prerequisite before any of the expand-mode work is trustworthy.

### HIGH

**H1. Add `domain` param — INPUT DOMAIN selection.**
Options: `LUMINANCE` / `RGB LINKED` / `RGB INDEPENDENT` / `ALPHA` / `MASK` / `EDGE MAP` / `THRESHOLDED BINARY`. Default: `LUMINANCE`. Tier 3. Algorithm must pre-process src into the selected domain plane before passing to `morphologyRGBA`, then reconstruct output. This is the primary fix for perceptual weakness on photographic imagery.

**H2. Extend MODE dropdown — add compound operation modes.**
Current: DILATE / ERODE. Add: OPEN / CLOSE / GRADIENT / TOPHAT / BLACKHAT at minimum. OPEN = erode then dilate; CLOSE = dilate then erode; GRADIENT = dilate − erode; TOPHAT = src − open; BLACKHAT = close − src. Implement in `apply()` as sequential `morphologyRGBA` calls. Per G14, no additional params appear for simple compound modes unless they have additional params.

**H3. Expand SHAPE options — add DIAMOND, HORIZONTAL LINE, VERTICAL LINE, CROSS, ORIENTED LINE.**
Wire all shapes through to `morphologyRGBA` (after C2 is done). ORIENTED LINE requires ROTATION param (tier 4). Per G14, ROTATION must be hidden unless SHAPE = ORIENTED LINE.

**H4. Add `iterations` param.**
Range 1–10, step 1, default 1, previewMax 3, unit: 'steps', tier 3. Apply morphological operation iteratively. Per G2: `driveable: true` (requires C1 first).

**H5. Add `outputType` param — OUTPUT TYPE.**
Options: IMAGE / MASK / FIELD / HYBRID. Default: IMAGE. Tier 3. IMAGE = current behaviour. MASK = threshold morphological result to binary mask written to dst. FIELD = export scalar field for downstream driver use (requires pipeline field-export contract). HYBRID = write image to dst + export field.

**H6. Add `isotropic` toggle and `radiusX` / `radiusY` params.**
`isotropic`: bool, default true, tier 4. When false, expose `radiusX` and `radiusY` separately (each range 1–10, previewMax 5, unit: 'px', driveable: true). Per G14: RADIUS X/Y hidden when ISOTROPIC = true. When ISOTROPIC = true, existing `radius` param drives both axes.

**H7. Ensure computation runs in web worker (G12).**
`morphologyRGBA` at radius 10 on large images is in Class C–D render cost (200 ms–1 s+). Move apply() execution off the main thread via the pipeline's worker mechanism. Verify previewMax: 5 cap is applied before worker call.

### MODERATE

**M1. Add `invert`, `normalise`, `diffSrc` output modifiers.**
`invert`: toggle, bool, default false, tier 4 — invert output post-morphology.
`normalise`: toggle, bool, default false, tier 4 — stretch output to 0–255.
`diffSrc`: toggle, bool, default false, tier 4 — compute |morphology(src) − src|.
Applied in `apply()` after `morphologyRGBA` returns, before `dst.set(...)`.

**M2. Implement separable approximation for rectangular (SQUARE) kernels.**
Replace naive O(w×h×(2r+1)²) scan with two 1D passes (row then column) reducing to O(w×h×2r). ~(2r+1)/2 speedup — factor ~10× at radius 10. Implement in `morphologyRGBA` or as a separate function consumed by `apply()`. Belongs in the algorithm file (`morphology.js`), not in the node.

**M3. Add ROTATION param for ORIENTED LINE shape.**
Range 0–360, step 1, default 0, unit: '°', tier 4. Per G14: hidden unless SHAPE = ORIENTED LINE. Per G2: `driveable: true`.

**M4. Re-add `driveable: true` to RADIUS once per-pixel radius architecture is in place.**
Dependent on C3 being resolved and algorithm being extended. Track as deferred. When re-added, `apply()` must call `this.getModulated('radius', pixelIdx, ctx)` per pixel.

### LOW

**L1. Unit labels for all new numeric params (G16).**
ITERATIONS: `unit: 'steps'`. ROTATION: `unit: '°'`. RADIUS X / RADIUS Y: `unit: 'px'`. RADIUS already has `unit: 'px'`.

**L2. Mode-conditional param visibility (G14).**
When implementing H6 and M3, ensure `radiusX`, `radiusY` are hidden when `isotropic: true`; `rotation` is hidden when SHAPE ≠ ORIENTED LINE. Implement via `when` condition in param definition per G14 standard.

**L3. Slider direct input and double-click-to-default (G5).**
NodePanel-level fix. No node-file change required; track for NodePanel work.

**L4. +D button fix (G1).**
NodePanel-level fix. No node-file change required; track for NodePanel work.

---

## Verification Criteria

| Criterion | Pass condition |
|---|---|
| SHAPE forwarded | Switching SQUARE → CIRCLE produces visually distinct output on a binary test image (e.g. white square on black) |
| SHAPE CIRCLE correctness | CIRCLE output is rotationally symmetric; corners of dilation are rounded, not square |
| DILATE correctness | Bright regions expand outward by exactly `r` pixels (verified on single-pixel white dot on black) |
| ERODE correctness | Bright regions contract inward by exactly `r` pixels |
| RADIUS driveable flag removed | `params.radius.driveable` is absent or false; no +D slot rendered for RADIUS |
| `apply()` signature | `apply(src, dst, w, h, p, ctx, modulate)` — all 7 arguments present |
| CORRODED preset | With shape:'circle' and SHAPE forwarded, CORRODED preset produces visually different output from a square kernel at equivalent radius |
| Compound modes | OPEN = ERODE then DILATE on same input; CLOSE = DILATE then ERODE. Verify on salt-and-pepper noise: OPEN removes isolated bright specs, CLOSE fills isolated dark specs |
| DOMAIN = LUMINANCE | Morphology applied to luminance channel only; colour information preserved from source |
| ITERATIONS = 3 | Equivalent to applying the single-pass operation 3 times sequentially |
| Worker offload | No main-thread blocking observable at radius 10, 4K source; render remains async |
| Separable perf | At radius 10, render time class improves from C–D to B–C relative to naive implementation |
| G14 conditional visibility | RADIUS X/Y hidden when ISOTROPIC = true; ROTATION hidden when SHAPE ≠ ORIENTED LINE |
| G16 units | All numeric params display unit suffix in NodePanel |
| OUTPUT TYPE = FIELD | Scalar field exported and consumable by a downstream driver; verified by wiring to a driver target and observing spatial variation |
