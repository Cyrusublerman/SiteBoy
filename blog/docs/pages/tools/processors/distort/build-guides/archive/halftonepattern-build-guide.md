# HALFTONEPATTERN — Build Guide

- module: halftonepattern
- node: HalftonePatternNode.js
- category: PATTERN
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

Factory-pattern module via `createEffectModule`. 19 lines. Delegates all computation to `halftonePatternRGBA` from `pattern-generators.js`. Declares 6 params: SPACING, ANGLE, MIN DOT, MAX DOT, BG LEVEL, DOT LEVEL. All params carry `unit` labels. Four params carry `driveable: true` (spacing, angle, maxDot, dotLevel). Three params carry `previewMax` (spacing→20, minDot→3, maxDot→8). `apply()` passes all values directly from `p` — no `getModulated()` calls; all driver declarations are inert. LITHO preset exists in `registry.js` PRESETS and is confirmed functional.

The current implementation is architecturally flat: pattern type, grid type, response source, and response curve are all hardcoded and implicit. The review mandates a three-part abstraction (sample field / pattern primitive / response mapping) and addition of six new params. This constitutes a MAJOR rebuild.

---

## Reference Parity Gaps

**Current vs reference source (`reference/distort/halftonepattern/source/HalftonePatternNode.js`):**

| Key | Current | Reference | Gap |
|---|---|---|---|
| `minDot` driveable | `true` | absent | Current adds `driveable: true` — reference lacks it. Current is AHEAD; no regression. |
| `bgLevel` driveable | `true` | absent | Current adds `driveable: true` — reference lacks it. Current is AHEAD. |
| `bgLevel` unit | `'lvl'` | absent | Current adds `unit: 'lvl'` — reference lacks it. Current is AHEAD (G16 compliance). |
| `dotLevel` unit | `'lvl'` | absent | Current adds `unit: 'lvl'` — reference lacks it. Current is AHEAD (G16 compliance). |

The reference source is the migration-time snapshot (2026-03-11). The live implementation diverges from it in two directions: it adds `driveable: true` and `unit` to params the reference omitted. These are improvements, not regressions. No feature present in reference is absent from current.

**Tier mismatch (reference docs vs current):**
- `bgLevel`, `dotLevel`: legacy doc assigns tier 2; source assigns tier 4. Source tier is canonical. Legacy doc is incorrect. No code change required.

---

## Review Spec Gaps

All items from `halftonepattern_review2403.md` §Action Items not yet implemented:

| # | Requirement | Status |
|---|---|---|
| 1 | Restructure around three-part abstraction: sample field / pattern primitive / response mapping (G17) | MISSING — architecture is flat; no abstraction layer |
| 2 | Add PATTERN TYPE dropdown (DOT only; architecture must accommodate future types) | MISSING — no param, no dispatch |
| 3 | Add GRID TYPE dropdown (SQUARE / HEXAGONAL / STAGGERED) | MISSING |
| 4 | Add RESPONSE SOURCE dropdown (LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / ALPHA / GRADIENT MAGNITUDE / DISTANCE TO EDGE) | MISSING |
| 5 | Add RESPONSE CURVE dropdown (LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLD / STEPPED) | MISSING |
| 6 | Add INVERT toggle | MISSING |
| 6 | Add SOFT CLAMP toggle | MISSING |
| 8 | Fix +D driver button (G1) | MISSING — global; tracked separately |
| 9 | `driveable: true` on all numeric params | PARTIAL — minDot and bgLevel are newly added (current ahead of reference); all six numeric params now carry `driveable: true`. G2 satisfied for this module. |
| 10 | Slider direct input + double-click-to-default (G5) | MISSING — global; tracked separately |
| 11 | Unit labels on all numeric params (G16) | DONE — all six params carry `unit` |
| 12 | Use shared components for overlapping features (G11) | PENDING — shared components (RESPONSE SOURCE control, RESPONSE CURVE control) do not yet exist; must be built before consuming |

---

## Missing Parameters

| Key | Label | Type | Values / Range | Default | Tier | Purpose |
|---|---|---|---|---|---|---|
| `patternType` | `PATTERN TYPE` | dropdown | `dot` (architecture must accommodate: `line`, `square`, `ellipse`, `diamond`, `cross`, `shapefill`, `stochastic`, `cmykrosette`) | `dot` | 3 | Selects pattern primitive; determines which rasterisation path executes |
| `gridType` | `GRID TYPE` | dropdown | `square` \| `hexagonal` \| `staggered` | `square` | 3 | Selects sample field layout; changes dot placement geometry |
| `responseSource` | `RESPONSE SOURCE` | dropdown | `luminance` \| `red` \| `green` \| `blue` \| `hue` \| `saturation` \| `alpha` \| `gradientMagnitude` \| `distanceToEdge` | `luminance` | 4 | Image property that drives dot size |
| `responseCurve` | `RESPONSE CURVE` | dropdown | `linear` \| `smoothstep` \| `exponential` \| `threshold` \| `stepped` | `linear` | 4 | Mapping shape from response source value to dot radius |
| `invert` | `INVERT` | toggle | boolean | `false` | 4 | Swaps dark/light dot behaviour (bright pixels → large dots) |
| `softClamp` | `SOFT CLAMP` | toggle | boolean | `false` | 4 | Eases min/max size limits vs hard clip at boundaries |

---

## Extra/Incorrect Parameters

None. All six current params (spacing, angle, minDot, maxDot, bgLevel, dotLevel) are correct, present in reference, and required by the review spec. No removal required.

---

## UI Compliance Issues

**G14 — Mode-conditional param visibility:**
After PATTERN TYPE is added, all params specific to non-active pattern types must be hidden. Initially DOT-only, so all current params remain visible. When future types are added (LINE, SQUARE, etc.), their type-specific params must be hidden when not active. Architecture must accommodate this from the start — the param-visibility conditional hook must be wired at implementation time, not deferred.

**G2 — driveable on all numerics:**
Current state: spacing (yes), angle (yes), minDot (yes), maxDot (yes), bgLevel (yes), dotLevel (yes). G2 is satisfied for this module. New numeric params (if any added with future pattern types) must also carry `driveable: true`.

**G16 — Unit labels:**
All current numeric params carry `unit`. New dropdown/toggle params require no unit. G16 satisfied for current params.

**G5 — Slider direct input + double-click-to-default:**
Global; not implemented. Tracked at G5. No per-module code required.

**G1 — +D button non-functional:**
Global; not implemented. Tracked at G1. All four driveable declarations are inert as a result.

**Driver inertness:**
`apply()` reads all values from `p` directly. `getModulated()` is never called. All `driveable: true` params are non-functional. Once G1 is resolved globally, `apply()` must be refactored to call `this.getModulated(key, pixelIdx, ctx)` per-pixel for each driveable param. This requires the `apply()` signature to accept `ctx` and iterate over pixels individually rather than delegating to the monolithic `halftonePatternRGBA` call — or `halftonePatternRGBA` must accept a per-pixel callback for modulated values.

---

## Global Issues

| ID | Title | Impact on this module | Action |
|---|---|---|---|
| G1 | Driver (+D) button non-functional | All four driveable params (spacing, angle, maxDot, dotLevel) — and minDot/bgLevel added in current — are inert. No per-pixel modulation accessible. | Fix NodePanel +D wiring globally; then refactor `apply()` to call `getModulated()` per driveable param. |
| G2 | All numeric params must have `driveable: true` | All six numeric params now carry `driveable: true` in current implementation. G2 satisfied for this module. | None outstanding. Verify new params added by rebuild also carry `driveable: true`. |
| G5 | Slider direct input + double-click-to-default | Affects all six slider params. | Global slider component fix; no per-module work. |
| G6 | Canvas click-to-pick for centre point params | Not applicable — halftonepattern has no centre X/Y params. | None. |
| G7 | Vector modules must be identifiable | Not applicable — halftonepattern is pixel output. | None. |
| G9 | Time/iteration-based modules must expose FRAME param | Not applicable — halftonepattern is stateless per-call; no frame/iteration concept. | None. |
| G10 | Vector modules must include SVG export | Not applicable — pixel output only. | None. |
| G11 | Overlapping features must use shared components | RESPONSE SOURCE and RESPONSE CURVE controls are new shared-component candidates. Must not be implemented inline in this module. Build as shared components first. | Before implementing RESPONSE SOURCE / RESPONSE CURVE params, check component library; if absent, create shared components, then consume here. |
| G12 | Web worker usage for expensive modules | At worst-case params (spacing=2, maxDot=15), render cost is class D (>500ms). Currently runs in apply() — whether this is in a worker depends on Pipeline. Confirm `halftonePatternRGBA` executes in render worker. If not, offload. | Audit Pipeline worker path; confirm apply() runs off main thread. |
| G14 | Mode-conditional params must be hidden when not applicable | Required when PATTERN TYPE dropdown is added. DOT-mode params must hide when non-DOT type is active (future). Wire conditional visibility from the start. | Implement conditional param visibility keyed on `patternType` value when adding the dropdown. |
| G16 | Slider/number inputs must display units | All current numeric params carry `unit`. New params (dropdowns/toggles) require no unit. | Satisfied for current params. Ensure new numeric params in future pattern types also carry `unit`. |

---

## Merge Absorption

**From `issues-and-conflicts.md`:**

1. **Driver inertness** — `spacing`, `angle`, `maxDot`, `dotLevel` declared driveable; `apply()` never calls `getModulated()`. Fix: refactor `apply()` to iterate pixels and call `getModulated()` for each driveable param, or pass a per-pixel resolver into `halftonePatternRGBA`.
2. **Performance at worst-case params** — O(w×h×maxDot²/spacing²) at spacing=2, maxDot=15 is ~56× per-pixel work. `previewMax` mitigates preview; full render is unbounded. Mitigation: confirm worker offload; consider precomputed luminance map cache; consider scanline rasterisation.
3. **bgLevel/dotLevel tier** — legacy doc says tier 2; source says tier 4. Source is canonical. No code change needed.

**From `feature-parity.md`:**

1. Modulation declared but inert — absorbed into driver inertness fix above.
2. LITHO preset confirmed present in registry PRESETS — no action.
3. `previewMax` correction — already correct in source; no action.

**From `migration-log.md` PLAN2403 note:**
Full pack rewrite required. Cross-check: Phase 8 items — mode logic, G14 `when`, driver boundary, field output, worker, compositing. These are all absorbed into the Required Changes below.

---

## Required Changes (priority ordered)

### P1 — Architectural: Three-Part Abstraction
**File:** `HalftonePatternNode.js` + `pattern-generators.js`

Restructure `apply()` to dispatch through three layers:
1. **Sample field** — compute grid point positions based on `gridType` (SQUARE: current; HEXAGONAL: offset rows; STAGGERED: alternating row offset).
2. **Pattern primitive** — at each grid point, rasterise based on `patternType` (DOT only initially; architecture must dispatch without structural change for future additions).
3. **Response mapping** — compute the driving value per grid point from `responseSource` (LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / ALPHA / GRADIENT MAGNITUDE / DISTANCE TO EDGE), then map through `responseCurve` (LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLD / STEPPED), then apply `invert` and `softClamp`.

The `halftonePatternRGBA` function in `pattern-generators.js` must be refactored or replaced. Either extend it to accept responseSource/responseCurve/gridType/patternType arguments, or replace the monolithic call with a composed pipeline.

### P2 — Add Six New Params
**File:** `HalftonePatternNode.js`

Add to `params`:
```js
patternType:    { label: 'PATTERN TYPE',    type: 'select', value: 'dot',       options: ['dot'], tier: 3 },
gridType:       { label: 'GRID TYPE',       type: 'select', value: 'square',    options: ['square','hexagonal','staggered'], tier: 3 },
responseSource: { label: 'RESPONSE SOURCE', type: 'select', value: 'luminance', options: ['luminance','red','green','blue','hue','saturation','alpha','gradientMagnitude','distanceToEdge'], tier: 4 },
responseCurve:  { label: 'RESPONSE CURVE',  type: 'select', value: 'linear',    options: ['linear','smoothstep','exponential','threshold','stepped'], tier: 4 },
invert:         { label: 'INVERT',          type: 'toggle', value: false, tier: 4 },
softClamp:      { label: 'SOFT CLAMP',      type: 'toggle', value: false, tier: 4 },
```
Check component library before implementing RESPONSE SOURCE / RESPONSE CURVE — if shared controls exist, use them (G11).

### P3 — G14: Conditional Param Visibility
**File:** `HalftonePatternNode.js`

Wire a `when` constraint on all DOT-specific params such that they hide when `patternType !== 'dot'`. Since only DOT is implemented initially, all current params remain visible. The `when` hook must exist in the param definitions from day one so that future pattern types can correctly hide inapplicable params without structural change.

### P4 — Fix Driver Inertness in apply()
**File:** `HalftonePatternNode.js` (dependent on G1 global fix)

After G1 is resolved, refactor `apply()` to resolve driveable params via `getModulated()` per pixel. This requires either:
- (a) Iterating over pixels inside `apply()` and passing resolved-per-pixel values into a per-point rendering function, or
- (b) Passing a `getModulated`-backed resolver closure into the algorithm function.

The monolithic `halftonePatternRGBA(src, w, h, p.spacing, p.angle, ...)` call cannot support per-pixel param variation. The algorithm function signature must change.

Driveable targets: `spacing`, `angle`, `minDot`, `maxDot`, `bgLevel`, `dotLevel`.

### P5 — Performance: Confirm Worker Offload
**File:** Pipeline / render worker config

Confirm `apply()` for `halftonepattern` executes inside the render worker, not on the main thread. At worst-case params (spacing=2, maxDot=15), compute is class D. If main-thread, offload (G12).

### P6 — Update algorithm function in pattern-generators.js
**File:** `assets/js/shared/algorithms/patterns/pattern-generators.js`

Extend or replace `halftonePatternRGBA` to accept:
- `gridType` — changes sample point generation
- `responseSource` — changes the image property sampled per grid point
- `responseCurve` — changes the mapping from sampled value to radius
- `invert` — flips the response
- `softClamp` — eases radius at min/max boundaries

The DOT rasterisation path remains unchanged for the DOT pattern type.

---

## Verification Criteria

1. **Functional parity** — Output at default params (spacing=8, angle=45, minDot=0.5, maxDot=4, bgLevel=255, dotLevel=0, patternType=dot, gridType=square, responseSource=luminance, responseCurve=linear, invert=false, softClamp=false) is pixel-identical to current output.
2. **LITHO preset** — `{spacing:6, angle:45, minDot:0.5, maxDot:3, bgLevel:255, dotLevel:0}` still produces correct output after rebuild.
3. **PATTERN TYPE dropdown** — DOT is the only selectable option; selecting it shows all current params.
4. **GRID TYPE: HEXAGONAL** — Grid points are offset per row by spacing/2; dot centres form a hexagonal lattice.
5. **GRID TYPE: STAGGERED** — Alternating row offset by spacing/2; visually distinct from both SQUARE and HEXAGONAL.
6. **RESPONSE SOURCE: RED** — Dot radius driven by red channel value, not luminance.
7. **RESPONSE SOURCE: GRADIENT MAGNITUDE** — Dot radius driven by local gradient magnitude (Sobel-derived); edge regions produce large dots.
8. **RESPONSE CURVE: SMOOTHSTEP** — Radius mapping follows smoothstep(0,1,t); visually smoother transition than LINEAR.
9. **RESPONSE CURVE: THRESHOLD** — Radius snaps to minDot or maxDot at a midpoint cutoff; produces binary dot field.
10. **INVERT toggle** — Bright pixels → large dots, dark pixels → small dots (reverse of default).
11. **SOFT CLAMP toggle** — Radius at boundaries eases rather than hard-clipping; no abrupt minDot/maxDot cutoff.
12. **G14 compliance** — When PATTERN TYPE is switched to a future non-DOT type, DOT-specific params are hidden.
13. **G2 compliance** — All new numeric params carry `driveable: true`.
14. **G16 compliance** — All numeric params carry `unit`; dropdown/toggle params require none.
15. **Driver resolution** — After G1 global fix, setting a driver on `spacing` modulates grid density per-pixel; setting a driver on `angle` modulates grid rotation per-pixel.
16. **previewMax retained** — spacing capped at 20, minDot at 3, maxDot at 8 in preview mode.
17. **No regressions** — No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval` introduced. No inline layout math. No raw hex colours.
18. **Worker offload** — apply() executes in render worker; no main-thread blocking confirmed at worst-case params.
