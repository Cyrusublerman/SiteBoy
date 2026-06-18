# SERPENTINE — Build Guide

- module: serpentine
- node: SerpentineNode.js
- category: LINE
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

Factory-pattern module (`createEffectModule`) implementing a luminance-driven wavefront advection renderer. Produces parallel sinusoidal lines that deform around image tonal structure. Declares `isVector: true`; implements both `applyVector` and `apply`. Algorithm is delegated to `serpentine-line-engine.js` (`buildWavefrontLines`) and rasterisation to `node-adapters.js` (`vectorToRaster`). A `buildGeometry` method exists in the live file (lines 62–76) that is absent from the reference source snapshot — this is a forward addition.

Live node has 11 params including `frame` (with `capByFrame` integration). Reference source snapshot has 10 params (no `frame`). The `frame` param and `capByFrame` call represent improvements over the reference source that must be retained.

The module is functionally limited relative to the reference HTML tool: oscillation bounds, drag response shaping, line tension subsystem, colour rendering, and SVG export action are all absent. Rasterisation/compositing has a reported blending defect. Driver wiring is declared but non-functional.

---

## Reference Parity Gaps

| Reference Capability | Live Status | Severity |
|---|---|---|
| Oscillation — SPAWN RATE param | Absent | HIGH |
| Oscillation — TOP BOUND param | Absent | HIGH |
| Oscillation — BOTTOM BOUND param | Absent | HIGH |
| Drag — RESPONSE CURVE dropdown | Absent | WARN |
| Drag — CURVE STRENGTH slider | Absent | WARN |
| Line Tension — BASE TENSION | Absent | WARN |
| Line Tension — BRIGHT TENSION BOOST | Absent | WARN |
| Line Tension — BRIGHT THRESHOLD | Absent | WARN |
| Line Tension — MAX SEGMENT LENGTH | Absent | WARN |
| Rendering — STROKE COLOUR picker (RGBA) | Absent — scalar only | WARN |
| Rendering — BG COLOUR picker (RGBA) | Absent — scalar only | WARN |
| Rendering — LINE OPACITY slider | Absent | WARN |
| Mode — flow / serpentine dropdown | Absent — referenced in legacy doc and WAVEFORM preset data but not implemented | NOTE |
| Animation — timing controls, pause/reset | Absent (global concern) | NOTE |
| Export — SVG export action in module UI | Absent (G10) | WARN |

Legacy doc and WAVEFORM preset both reference `mode: 'flow'` — this param does not exist in either live source or reference source. The preset will silently ignore the `mode` key via `fromJSON`'s keyed guard. The preset is currently valid but the param definition is entirely absent.

---

## Review Spec Gaps

All action items from `serpentine_review2403.md`:

| # | Action | Status |
|---|---|---|
| 1 | Fix rasterisation/compositing — audit vector output compositing into pixel pipeline | OPEN — blending defect confirmed, root cause unverified |
| 2 | Add FRAME param (G9) | CLOSED — present in live file with `capByFrame` integration; absent from reference source snapshot (forward delta) |
| 3 | Add oscillation bounds: SPAWN RATE, TOP BOUND, BOTTOM BOUND | OPEN |
| 4 | Add drag response shaping: RESPONSE CURVE dropdown, CURVE STRENGTH slider | OPEN |
| 5 | Add Line Tension subsystem: BASE TENSION, BRIGHT TENSION BOOST, BRIGHT THRESHOLD, MAX SEGMENT LENGTH | OPEN |
| 6 | Add explicit colour rendering: STROKE COLOUR, BG COLOUR pickers, LINE OPACITY slider | OPEN |
| 7 | Add EXPORT SVG action to NodePanel (G10) | OPEN |
| 8 | Fix +D driver button (G1) | OPEN (global) |
| 9 | Audit all params for `driveable: true` | PARTIAL — see Missing/Extra sections |
| 10 | Slider direct input and double-click-to-default (G5) | OPEN (global) |
| 11 | Vector module indicator in CategoryPicker (G7) | OPEN (global) |
| 12 | Merge LINE RENDER categories (G8) | OPEN (global) |

---

## Missing Parameters

Parameters required by the review spec or reference that are absent from the live node:

| Key | Label | Type | Rationale |
|---|---|---|---|
| `spawnRate` | `SPAWN RATE` | range | Reference oscillation control — density of front spawning independent of spacing |
| `topBound` | `TOP BOUND` | range | Vertical clamp — upper bound of oscillation excursion |
| `bottomBound` | `BOTTOM BOUND` | range | Vertical clamp — lower bound of oscillation excursion |
| `responseCurve` | `RESPONSE CURVE` | dropdown | Drag response shaping — curve type applied to luminance-drag mapping |
| `curveStrength` | `CURVE STRENGTH` | range | Drag response shaping — exponent/strength of curve |
| `baseTension` | `BASE TENSION` | range | Line tension subsystem |
| `brightTensionBoost` | `BRIGHT TENSION BOOST` | range | Line tension in bright regions |
| `brightThreshold` | `BRIGHT THRESHOLD` | range | Luminance threshold for tension boost activation |
| `maxSegmentLength` | `MAX SEGMENT LEN` | range | Structural segment-length cap |
| `strokeColorR/G/B` or colour param | `STROKE COLOUR` | colour | Full RGBA stroke colour — replaces scalar-only `strokeColor` |
| `bgColorR/G/B` or colour param | `BG COLOUR` | colour | Full RGBA background colour — replaces scalar-only `bgColor` |
| `lineOpacity` | `LINE OPACITY` | range | Per-line opacity control |

Implementation note: colour params must use `ComponentLibrary.create('color-input', ...)` (VGA palette restricted). If the colour system used here is greyscale-scalar-only, `STROKE COLOUR` and `BG COLOUR` as full colour pickers require the colour input component; do not add free RGB triplets. Confirm colour input availability before implementing.

---

## Extra / Incorrect Parameters

| Key | Issue |
|---|---|
| `bgColor` / `strokeColor` | Scalar grey levels only (0–255 integer). Correct for current implementation but insufficient per review spec — must be replaced or augmented with colour picker params. The scalar params may be retained as fallback or removed if colour pickers subsume them. |
| `frequency` — missing `unit` field | Live source has no `unit` on `frequency`; reference source also missing. Unit should be declared: `unit: 'Hz'` — currently absent in reference source but present in live file. Verify: live file line 19 has `unit: 'Hz'` — this is correct and should be retained. |
| `baseSpeed` — missing `unit` field | Live file line 20 has `unit: 'n'`; reference source line 18 has no unit. Live file is correct. |

Registry WAVEFORM preset specifies `mode: 'flow'` — this key is silently ignored by `fromJSON` since `mode` is not in `paramDefs`. The key should be removed from the preset data to avoid confusion.

---

## UI Compliance Issues

### G2 — driveable: true on all numeric params

| Param | Live `driveable` | Required |
|---|---|---|
| `frame` | `true` | yes |
| `spacing` | `true` | yes |
| `amplitude` | `true` | yes |
| `frequency` | `true` | yes |
| `baseSpeed` | `true` | yes |
| `dragLight` | `true` | yes — FIXED vs reference source (reference has no `driveable` on `dragLight`) |
| `dragDark` | `true` | yes |
| `iterations` | `true` | yes — FIXED vs reference source (reference has no `driveable` on `iterations`) |
| `strokeW` | `true` | yes — FIXED vs reference source (reference has no `driveable` on `strokeW`) |
| `bgColor` | `true` | yes — FIXED vs reference source (reference has no `driveable` on `bgColor`) |
| `strokeColor` | `true` | yes |

Live file has `driveable: true` on all 11 params — this is correct per G2. Reference source is deficient on this; the live file is ahead.

**Critical defect:** `driveable: true` is declared on 11 params but `apply()` and `applyVector()` do not accept a `modulate` argument and do not call `this.getModulated()`. All driver connections are silent no-ops. This is a compliance failure per the issues-and-conflicts audit. The driver system must be wired: each param lookup in `applyVector`/`apply` must use `this.getModulated(key, pixelIdx, ctx)` for driveable params.

### G5 — Slider direct input / double-click-to-default

Handled at NodePanel level, not per-module. No module-level action required; flagged as global.

### G7 — Vector module indicator

Handled at CategoryPicker level. The registry entry has `vector: true` — the indicator must be rendered by CategoryPicker. No module-level action required.

### G10 — SVG export action

No EXPORT SVG button or action exists in the NodePanel for this module. Must be added. Ownership: sidebar EXPORT block or toolbar (see `component-patterns.md §4, §6.6`). Since the distort tool has a toolbar, the SVG export action belongs there. However, G10 specifies per-module SVG export — if this is a per-module in-NodePanel action, it is in the NodePanel, not the toolbar. Confirm ownership decision before implementing. Per G11, this must use a shared `SVGExportButton` component once built.

### G16 — Units on numeric params

All params in the live file have `unit` declared. Verify NodePanel renders the unit field. Module-level compliance: PASS. Rendering compliance: depends on NodePanel implementation.

### Label compliance (text-treatment.md §2)

All param labels are SCREAMING CASE, ≤16 chars. Pass.

### Colour law (design-law.md)

No raw hex/rgb in module params — scalars are 0–255 integer greyscale levels passed to `strokeRGBA`/`clearRGBA` as `[n, n, n, 255]`. Internal colour construction is acceptable here; not a UI styling violation.

---

## Global Issues

| Issue | Applicability | Status |
|---|---|---|
| G1 — +D button non-functional | Applies — 11 driveable params visible in NodePanel | OPEN (global) |
| G2 — all numeric params need `driveable: true` | CLOSED at param definition level — all 11 params have `driveable: true`; OPEN at wiring level — `getModulated` not called in apply paths | PARTIAL |
| G5 — slider direct input / double-click-to-default | Applies — 10 slider params | OPEN (global/NodePanel) |
| G6 — canvas click-to-pick for centre point | Not applicable — no centre X/Y params in this module | N/A |
| G7 — vector module indicator | Applies — `isVector: true`; `vector: true` in registry; indicator not rendered | OPEN (global/CategoryPicker) |
| G9 — FRAME param required | CLOSED — `frame` param present in live file with `capByFrame` | CLOSED |
| G10 — SVG export action in NodePanel | Applies — vector module, no export action present | OPEN |
| G11 — shared components for overlapping feature additions | Applies — colour pickers, FRAME slider, SVG export must use shared components | OPEN (shared components not yet built) |
| G12 — web worker for expensive modules | Applies — worst-case O(w×h × 20000); simulation runs on main thread | OPEN |
| G14 — mode-conditional params | Applies if `responseCurve` dropdown is added — curve-specific params must hide when inapplicable | PENDING (no mode param currently) |
| G16 — unit labels on numeric params | Live params have `unit` declared — NodePanel must render them | CLOSED at module level; OPEN at NodePanel level |

---

## Merge Absorption

The live file (`SerpentineNode.js`) differs from the reference source snapshot in the following ways — all live-file-only additions must be retained in any rebuild:

| Addition | Live file | Reference source | Action |
|---|---|---|---|
| `frame` param | Present (line 16) | Absent | RETAIN |
| `capByFrame` import and usage | Present (lines 2, 32, 46, 67) | Absent | RETAIN |
| `buildGeometry` method | Present (lines 62–76) | Absent | RETAIN |
| `driveable: true` on `dragLight`, `iterations`, `strokeW`, `bgColor` | Present | Absent | RETAIN |
| `unit` on `frequency`, `baseSpeed` | Present | Absent | RETAIN |

The reference source snapshot is the migration archive (2026-03-11). The live file is ahead on these points. Do not regress them.

---

## Required Changes (priority ordered)

### P1 — CRITICAL: Fix rasterisation / compositing defect

**File:** `assets/js/tools/processors/distort/nodes/line/SerpentineNode.js` + `nodes/bridge/node-adapters.js` + pipeline compositing stage.

Audit `vectorToRaster` output: confirm `Uint8ClampedArray` is correctly sized and channel-packed as RGBA. Confirm `dst.set(result)` in `apply()` writes the full buffer. Audit pipeline compositing: verify alpha compositing and blend mode application for vector-module output. The reported blending defect may originate in `vectorToRaster` opacity handling (`opacity: 1` hardcoded) or in the pipeline compositing stage (see G13 — blend mode bug affects all modules). Isolate whether the defect is module-local or pipeline-global. If pipeline-global, fix in pipeline and note here.

### P2 — HIGH: Wire driver modulation in apply paths

**File:** `SerpentineNode.js` — `apply()` and `applyVector()`.

All 11 driveable params currently read from `p.key` (pre-resolved scalar). Must call `this.getModulated(key, pixelIdx, ctx)` per pixel for pixel-driveable params. For whole-frame params (spacing, iterations, amplitude, frequency, baseSpeed), modulation at frame level (single call at pixel 0 or centroid) is acceptable if per-pixel is cost-prohibitive. Document the decision. This is prerequisite to G1 fix being verifiable.

### P3 — HIGH: Add oscillation bounds params

**File:** `SerpentineNode.js` — params block + `buildWavefrontLines` call.

Add: `spawnRate` (range), `topBound` (range, 0–1 normalised or px), `bottomBound` (range). Pass to `buildWavefrontLines`. May require extending `serpentine-line-engine.js` to accept and apply these constraints. Confirm engine API before adding params.

### P4 — HIGH: Add drag response shaping params

**File:** `SerpentineNode.js` — params block + engine call.

Add: `responseCurve` (dropdown: LINEAR | EXPONENTIAL | SIGMOID), `curveStrength` (range). Apply as shaping function on the drag-luminance mapping inside `buildWavefrontLines` or as a post-map transform before passing to the engine. Per G14, if `responseCurve` controls param visibility, implement conditional param rendering in NodePanel for `curveStrength`.

### P5 — MODERATE: Add line tension subsystem params

**File:** `SerpentineNode.js` — params block + engine call.

Add: `baseTension`, `brightTensionBoost`, `brightThreshold`, `maxSegmentLength`. Pass to engine. May require engine extension. Confirm engine API.

### P6 — MODERATE: Add colour rendering params

**File:** `SerpentineNode.js` — params block + apply/applyVector.

Replace or augment `bgColor`/`strokeColor` scalar params with full colour params. If `color-input` component is available in the system, use it (VGA palette restricted). If full colour is deferred, add `lineOpacity` range param (0–1) and wire into `vectorToRaster` `opacity` arg (currently hardcoded `1`). This is the minimum colour addition.

### P7 — MODERATE: Add EXPORT SVG action

**File:** NodePanel or toolbar — per component-patterns.md §4/§6.6 ownership decision.

Per G11, build as shared `SVGExportButton` component first, then consume here. The module's `buildGeometry` / `applyVector` path already returns the `LineSet` — the export action serialises it to SVG. Confirm ownership (toolbar vs NodePanel) before implementing.

### P8 — LOW: Remove `mode` from WAVEFORM preset data

**File:** `assets/js/tools/processors/distort/nodes/registry.js` line 249.

Remove `mode:'flow'` from the WAVEFORM preset params object. The key is silently ignored by `fromJSON` but is misleading and documents a removed feature.

### P9 — LOW: Add `previewMax` to `spacing` and `baseSpeed`

**File:** `SerpentineNode.js` — params block.

Per performance.md — extreme values of `spacing` and `baseSpeed` independently multiply simulation cost. Add `previewMax` declarations: `spacing` suggest `previewMax: 10`; `baseSpeed` suggest `previewMax: 0.5`. These cap preview-quality renders at sane cost without affecting full-quality output.

### P10 — LOW: Move simulation to web worker (G12)

**File:** Pipeline worker dispatch or a dedicated serpentine worker.

At extreme params (spacing=2, iter=2000, speed=0.05) the simulation is O(w×h × 20000) — multi-second on main thread. Dispatch `buildWavefrontLines` to a worker. This is a significant infrastructure change; coordinate with G12 global web worker initiative. Do not implement in isolation — implement as part of the global worker pool improvement.

---

## Verification Criteria

After all changes are applied, verify the following. Each item maps to a specific required change above.

1. **Compositing (P1):** Place SERPENTINE in a pipeline stack with a second module below. Toggle blend modes (NORMAL, LIGHTEN, DARKEN, MULTIPLY). Output must composite correctly — no bleed-through, correct alpha blending. Compare with known-good pixel-module output at same opacity.
2. **Driver wiring (P2):** Connect an image driver to `spacing`. Confirm output geometry varies spatially in response to the driver map. Repeat for `amplitude` and `dragDark`.
3. **Oscillation bounds (P3):** Confirm TOP BOUND and BOTTOM BOUND clip line excursion to the specified region. Confirm SPAWN RATE controls front density independently of SPACING.
4. **Drag response shaping (P4):** Set RESPONSE CURVE to EXPONENTIAL. Confirm drag response is non-linear relative to LINEAR mode. CURVE STRENGTH at max must produce visible difference from CURVE STRENGTH at min.
5. **Line tension (P5):** BRIGHT TENSION BOOST at max must produce visible difference in line stiffness in bright regions relative to default. MAX SEGMENT LENGTH at minimum must produce visible segmentation of line trajectories.
6. **Colour rendering (P6):** LINE OPACITY at 0.5 must produce semi-transparent line output. STROKE COLOUR (if full colour picker added) must produce non-greyscale line output.
7. **SVG export (P7):** Click EXPORT SVG. A valid `.svg` file is downloaded containing polyline elements representing the current frame's wavefront geometry. File opens correctly in Inkscape/browser SVG viewer.
8. **WAVEFORM preset (P8):** Load WAVEFORM preset. Confirm no console warning or error about unknown param `mode`. Confirm visual output matches expected serpentine wave output.
9. **Preview cap (P9):** Set `spacing=2`, `baseSpeed=0.05`. Preview render must complete in < 200 ms. Full-quality render may be slow.
10. **driveable coverage (G2):** All numeric params display a `+D` button in NodePanel. None are absent.
11. **Units (G16):** All param value readouts display their unit suffix (px, Hz, n, frames, 0–1, lvl). No param shows a bare number.
12. **FRAME param (G9):** FRAME slider at 0 produces shortest wavefront geometry. FRAME at 240 produces full-length wavefronts. Intermediate values produce proportionally extended fronts via `capByFrame`.
