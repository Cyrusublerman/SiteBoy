# CELLULARAUTOMATA — Build Guide

- module: cellularautomata
- node: CellularAutomataNode.js
- category: PHYSICS
- review verdict: KEEP — rebuild as full stateful rule-based simulation system
- rebuild severity: CRITICAL

---

## Current State Summary

`CellularAutomataNode.js` is a thin `createEffectModule` wrapper (23 lines). It delegates entirely to `cellularAutomataRGBA` from `reaction-diffusion.js`. The implemented architecture is:

- Layer 1 (State Init): luminance threshold only — one mode, no alternatives.
- Layer 2 (Rule System): six named presets, no custom B/S notation, no neighbourhood or boundary mode control.
- Layer 3 (Simulation Stepping): flat step count only — no warmup, no steps-per-frame, no retain-state, no freeze, no auto-stop.
- Layer 4 (Image Coupling): absent — image influences only initial seeding; no spatial rule variation, no ongoing forcing.
- Layer 5 (Output Fields): absent — only alive/dead blended with source; no age map, birth map, death map, change rate, neighbour count, distance-to-active.
- Layer 6 (Image Modification): absent — only scalar blend; no mask partition, age tint, displacement, sharpness, opacity modulation.

The module works correctly within its narrow scope but satisfies approximately 5% of the review specification.

---

## Reference Parity Gaps

Comparing live `CellularAutomataNode.js` against reference source `reference/distort/cellularautomata/source/CellularAutomataNode.js`:

The live source and the reference source are functionally identical. The live source adds two differences:

1. **`frame` param added** — `{ label: 'FRAME', min: 0, max: 240, step: 1, value: 0, tier: 3, driveable: true, unit: 'frames' }` — present in live, absent in reference. Satisfies G9 partially.
2. **`capByFrame` import and call** — `import { capByFrame } from '../../core/frameCap.js'`; `steps = capByFrame(steps, p.frame)` — present in live, absent in reference.
3. **`unit` fields** — `steps` has `unit: 'n'`, `threshold` has `unit: 'lvl'`, `blendAmt` has `unit: '0–1'` — present in live, absent in reference. Satisfies G16 partially for existing params.
4. **`driveable: true` on `steps`** — present in live (`driveable: true`), absent in reference. Satisfies G2 for `steps`.

Reference parity on existing functionality: complete. The reference source itself is the pre-review baseline; the review spec defines the target.

---

## Review Spec Gaps

The review defines a six-layer architecture. Current implementation satisfies none of layers 4–6 and partially satisfies layers 1–3.

### Layer 1 — State Initialisation

| Required param | Present | Notes |
|---|---|---|
| INIT MODE (RANDOM / THRESHOLDED IMAGE / BAND IMAGE / EDGE SEED / DISTANCE SEED / NOISE SEED / REGION SEED / POINT/LINE/MASK SEED) | NO | Only THRESHOLDED IMAGE behaviour exists implicitly |
| INIT SOURCE (IMAGE / NOISE / RANDOM / MASK / EDGE MAP / DISTANCE MAP) | NO | |
| INIT METRIC (LUMINANCE / HUE / SAT / RED / GREEN / BLUE / GRADIENT MAGNITUDE / DISTANCE TO EDGE) | NO | Hardcoded BT.601 luminance only |
| INIT THRESHOLD | YES | `threshold` param — present |
| INIT SOFTNESS | NO | Hard threshold only |
| INIT DENSITY | NO | |
| SEED JITTER | NO | |
| INVERT INIT | NO | |

### Layer 2 — Rule System

| Required param | Present | Notes |
|---|---|---|
| RULE PRESET (with CUSTOM option) | PARTIAL | Six presets present; CUSTOM absent |
| BIRTH SET (B notation input) | NO | |
| SURVIVAL SET (S notation input) | NO | |
| NEIGHBOURHOOD (MOORE / VON NEUMANN / EXTENDED) | NO | Hardcoded Moore |
| BOUNDARY MODE (WRAP / CLAMP / REFLECT / ABSORB) | NO | Hardcoded toroidal wrap |
| STATE COUNT | NO | Hardcoded binary |

### Layer 3 — Simulation Stepping

| Required param | Present | Notes |
|---|---|---|
| INITIAL WARMUP STEPS | NO | |
| STEPS PER FRAME | NO | Flat `steps` only |
| MAX STEPS | PARTIAL | `steps` serves as max; no per-frame control |
| RETAIN STATE | NO | Stateless per call |
| RESET ON CHANGE | NO | |
| FREEZE | NO | |
| AUTO-STOP | NO | |
| RESOLUTION | NO | Always full resolution |
| FRAME | YES | `frame` param present |
| MODE (STATIC MATURE / CONTINUOUS / FRAME-DRIVEN) | NO | |

### Layer 4 — Image Coupling

| Required param | Present | Notes |
|---|---|---|
| RULE DRIVER SOURCE | NO | |
| BIRTH BIAS DRIVER | NO | |
| SURVIVAL BIAS DRIVER | NO | |
| NEIGHBOURHOOD BIAS | NO | |
| PRESET FIELD | NO | |
| FORCE SOURCE | NO | |
| FORCE STRENGTH | NO | |
| FORCE INTERVAL | NO | |
| FORCE MODE | NO | |

Entire layer absent.

### Layer 5 — Output Fields

| Required field/param | Present | Notes |
|---|---|---|
| ALIVE STATE | YES | Only output currently |
| CELL AGE | NO | |
| BIRTH MAP | NO | |
| DEATH MAP | NO | |
| CHANGE RATE | NO | |
| NEIGHBOUR COUNT | NO | |
| DISTANCE TO ACTIVE CELLS | NO | |
| OUTPUT MODE selector | NO | |
| NORMALISE OUTPUT | NO | |
| CONTRAST / GAIN | NO | |
| MIN COLOUR / MAX COLOUR | NO | |

### Layer 6 — Image Modification + Compositing

| Required capability | Present | Notes |
|---|---|---|
| MASK (alive cells reveal/hide image) | PARTIAL | Factory-layer mask exists; not CA-state-driven |
| COLOUR PARTITION | NO | |
| AGE MAPPING | NO | |
| DISPLACEMENT | NO | |
| SHARPNESS (birth/death front driven) | NO | |
| OPACITY modulated by CA state | NO | |
| PATTERN DRIVER | NO | |
| OPACITY param | YES | Factory layer |
| BLEND MODE param | YES | Factory layer |

---

## Missing Parameters

All parameters below are absent from the current implementation and required by the review spec. Priority per review action items.

**HIGH PRIORITY (action items 1–4):**

| Key | Label | Type | Notes |
|---|---|---|---|
| `initMode` | INIT MODE | select | RANDOM / THRESHOLDED IMAGE / BAND IMAGE / EDGE SEED / DISTANCE SEED / NOISE SEED / REGION SEED / POINT SEED |
| `initSource` | INIT SOURCE | select | IMAGE / NOISE / RANDOM / MASK / EDGE MAP / DISTANCE MAP |
| `initMetric` | INIT METRIC | select | LUMINANCE / HUE / SATURATION / RED / GREEN / BLUE / GRADIENT MAGNITUDE / DISTANCE TO EDGE |
| `initSoftness` | INIT SOFTNESS | range | Hard vs probabilistic threshold |
| `initDensity` | INIT DENSITY | range | For random/noise modes |
| `seedJitter` | SEED JITTER | range | Stochastic irregularity |
| `invertInit` | INVERT INIT | boolean | Swap alive/dead mapping |
| `warmupSteps` | WARMUP STEPS | range | Steps before first display |
| `stepsPerFrame` | STEPS PER FRAME | range | Updates per visible frame |
| `retainState` | RETAIN STATE | boolean | Continue evolving over time |
| `resetOnChange` | RESET ON CHANGE | boolean | Restart on param change |
| `freeze` | FREEZE | boolean | Hold current state |
| `autoStop` | AUTO-STOP | boolean | Halt at low population/change |
| `simMode` | MODE | select | STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN |
| `outputMode` | OUTPUT MODE | select | ALIVE/DEAD / AGE / BIRTH MAP / DEATH MAP / CHANGE MAP / NEIGHBOUR COUNT / DISTANCE TO ACTIVE |
| `normaliseOutput` | NORMALISE | boolean | Map to predictable range |
| `outputContrast` | CONTRAST | range | Output field contrast |
| `outputGain` | GAIN | range | Output field gain |
| `minColour` | MIN COLOUR | colour | Colour ramp low end |
| `maxColour` | MAX COLOUR | colour | Colour ramp high end |

**MEDIUM PRIORITY (action items 5–6):**

| Key | Label | Type | Notes |
|---|---|---|---|
| `birthSet` | BIRTH SET | text | Custom B notation; visible when RULE PRESET = CUSTOM |
| `survivalSet` | SURVIVAL SET | text | Custom S notation; visible when RULE PRESET = CUSTOM |
| `neighbourhood` | NEIGHBOURHOOD | select | MOORE / VON NEUMANN / EXTENDED |
| `boundaryMode` | BOUNDARY MODE | select | WRAP / CLAMP / REFLECT / ABSORB |

**LOWER PRIORITY (action items 7–8):**

| Key | Label | Type | Notes |
|---|---|---|---|
| `ruleDriverSource` | RULE DRIVER SOURCE | select | Image field selecting rule spatially |
| `birthBiasDriver` | BIRTH BIAS DRIVER | select | Image field modifying local birth probability |
| `survivalBiasDriver` | SURVIVAL BIAS DRIVER | select | Image field modifying local survival probability |
| `neighbourhoodBias` | NEIGHBOURHOOD BIAS | select | Image weighting of neighbourhood |
| `presetField` | PRESET FIELD | select | Different regions use different rule presets |
| `forceSource` | FORCE SOURCE | select | Image field / mask for ongoing forcing |
| `forceStrength` | FORCE STRENGTH | range | |
| `forceInterval` | FORCE INTERVAL | select | EVERY STEP / EVERY N STEPS / FRAME BOUNDARY |
| `forceMode` | FORCE MODE | select | ADD ALIVE / KILL CELLS / BIAS BIRTH / BIAS SURVIVAL / REPLACE STATE |

---

## Extra/Incorrect Parameters

None. All current params (`frame`, `rule`, `steps`, `threshold`, `blendAmt`) are valid and required by the spec. No parameters are to be removed.

One structural issue: `steps` with `capByFrame` conflates warmup/total steps with frame-driven stepping. When `warmupSteps` and `stepsPerFrame` are added, the semantics of `steps` must be clarified or renamed to `maxSteps`.

---

## UI Compliance Issues

### Registry / Labels

- `name: 'CELL AUTOMATA'` — correct: SCREAMING CASE, ≤16 chars, matches legacy doc.
- `type: 'cellularautomata'` — correct: lowercase, no separators, unique.
- `category: 'PHYSICS'` — correct.
- `forceWorkerPreview: true` — present in live source; appropriate for compute cost.

### Parameter Labels

All current labels pass SCREAMING CASE check: `RULE`, `STEPS`, `INIT THRESH`, `BLEND`, `FRAME`. Max char count: `INIT THRESH` = 11 chars — pass.

### Driveable / Unit audit (current params)

| Key | driveable | unit | Status |
|---|---|---|---|
| `frame` | true | 'frames' | PASS |
| `rule` | — (select) | — | N/A |
| `steps` | true | 'n' | PASS — G2 satisfied |
| `threshold` | true | 'lvl' | PASS |
| `blendAmt` | true | '0–1' | PASS |

All existing numeric params have `driveable: true` and `unit` fields. G2 and G16 satisfied for current param set.

### `modulate` signature gap

`apply(src, dst, w, h, p, ctx)` — `modulate` argument absent. `threshold` and `blendAmt` are `driveable: true` but are passed as scalars to `cellularAutomataRGBA`. Two driver slots are non-functional. This is an existing pre-review issue documented in `issues-and-conflicts.md`.

**Required fix:** Add `modulate` to `apply` signature and read driveable params per-pixel via `modulate(key, i)` when driver is active.

### Redundant inline preview cap

`steps = ctx?.quality === 'preview' ? Math.min(p.steps, 20) : p.steps` — dead code; `previewMax: 20` on the param handles this via factory. Remove.

### Rule key normalisation

Fragile inline translation: `DAYNIGHT→dayNight`, `HIGHLIFE→highLife`. Adding any new rule requires two-touch change. Acceptable as-is for six fixed presets; if custom rules are added, this must be replaced with a lookup table or a direct value-to-key mapping in the options definition.

---

## Global Issues

Issues applicable to this module:

**G1 — Driver (+D) button non-functional**
Applies. `threshold`, `blendAmt`, `frame`, `steps` all have `driveable: true`. All driver slots currently inaccessible from UI. Fix is in NodePanel, not this module. No module-level action required until G1 is resolved.

**G2 — All numeric params must support drivers**
Applies. Status: SATISFIED for current params. All range-type params have `driveable: true`. New params added in rebuild must also include `driveable: true`. Additionally, `modulate` must be wired into `apply()` for driver values to take effect.

**G5 — Slider direct input and double-click-to-default**
Applies. Infrastructure fix in NodePanel/slider component. No module-level action.

**G6 — Canvas click-to-pick for centre params**
Does not apply. No centre X/Y params in this module.

**G7 — Vector modules must be identifiable**
Does not apply. Pixel module.

**G9 — Time/iteration-based modules must expose FRAME param**
Applies. SATISFIED — `frame` param present. `capByFrame` wires frame into step count. However: when `simMode`, `warmupSteps`, and `stepsPerFrame` are added, the FRAME param semantics must remain as the animation driver for continuous evolution and frame-driven reinitialisation modes.

**G10 — Vector modules must include SVG export**
Does not apply. Pixel module.

**G11 — Shared components for overlapping features**
Applies. The colour ramp output mapping (`minColour`, `maxColour`, `outputMode`) required by Layer 5 is the same pattern identified in the edge module reviews (Sobel, Canny, Laplacian, DoG). Before implementing `minColour`/`maxColour` here, check whether `ColourRampControl` has been built as a shared component. If not, build it first. `FrameSlider` already satisfied by existing `frame` param pattern.

**G12 — Web worker usage for expensive modules**
Applies. `forceWorkerPreview: true` is already set — preview runs in worker. Full render cost class is B–C at 4K/steps=50–500. Verify that all computation for expanded layers (age map, birth map, distance-to-active) also executes in worker, not on main thread.

**G14 — Mode-conditional params must be hidden**
Applies strongly. The expanded param set is heavily mode-conditional:
- `birthSet`, `survivalSet` — show only when `rule = CUSTOM`
- `initSoftness`, `initDensity`, `seedJitter` — show only when `initMode` is RANDOM/NOISE modes
- `initSource`, `initMetric` — show only when `initMode` is an image-driven mode
- `warmupSteps`, `stepsPerFrame`, `retainState`, `freeze`, `autoStop` — show only when `simMode` is CONTINUOUS EVOLUTION or FRAME-DRIVEN
- `ruleDriverSource`, `birthBiasDriver`, `survivalBiasDriver`, `neighbourhoodBias`, `presetField` — show only when coupling is enabled
- `forceSource`, `forceStrength`, `forceInterval`, `forceMode` — show only when forcing is enabled
- `outputContrast`, `outputGain`, `minColour`, `maxColour` — show only when `outputMode` ≠ ALIVE/DEAD

Requires `when` conditionals on all mode-gated params per factory/NodePanel conditional visibility support.

**G16 — Unit labels on all numeric params**
Applies. SATISFIED for current params (`frame: 'frames'`, `steps: 'n'`, `threshold: 'lvl'`, `blendAmt: '0–1'`). All new numeric params added in rebuild must include `unit` field.

---

## Merge Absorption

No other module to merge into this one. The review identifies visual overlap risk with dithering and pattern overlays if the module remains a static overlay, but the solution is full simulation implementation, not consolidation. The simulation algorithm is shared with `reactiondiffusion` at the import level (`reaction-diffusion.js`) — this is acceptable; the algorithms remain distinct.

---

## Required Changes (priority ordered)

### P1 — Fix `modulate` wiring (blocks all driver functionality)

Add `modulate` to `apply` signature. For each driveable param called inside `apply`, read via `modulate(key, i)` per pixel. This is a prerequisite for any driver value to take effect on `threshold` or `blendAmt`. Does not require algorithm changes — only the `apply()` wrapper.

File: `CellularAutomataNode.js`

### P2 — Remove redundant inline preview cap

Remove: `let steps = ctx?.quality === 'preview' ? Math.min(p.steps, 20) : p.steps;`

The `previewMax: 20` declaration on `steps` handles this via factory. Dead code.

File: `CellularAutomataNode.js`

### P3 — Implement Layer 5 output fields (HIGH PRIORITY per review)

Add `outputMode` select param. Expand the algorithm (or add a new algorithm function) to compute and return the requested derived field in addition to the alive/dead grid. Required output modes: ALIVE/DEAD (existing), AGE, BIRTH MAP, DEATH MAP, CHANGE MAP, NEIGHBOUR COUNT, DISTANCE TO ACTIVE. Add `normaliseOutput`, `outputContrast`, `outputGain` params. Add `minColour`, `maxColour` colour ramp params (pending G11 shared component check).

This requires extending `cellularAutomataRGBA` or creating a new `cellularAutomataFull` function in `reaction-diffusion.js` that maintains per-cell state arrays (age, birth, death counters) across the step loop.

Files: `CellularAutomataNode.js`, `shared/algorithms/physics/reaction-diffusion.js`

### P4 — Implement Layer 1 expanded init modes (HIGH PRIORITY per review)

Add `initMode` select with options: RANDOM / THRESHOLDED IMAGE / EDGE SEED / DISTANCE SEED / NOISE SEED. Add `initSource`, `initMetric`, `initSoftness`, `initDensity`, `seedJitter`, `invertInit` params. Apply `when` conditionals to hide inapplicable params per G14.

Files: `CellularAutomataNode.js`, `reaction-diffusion.js` (seed generation)

### P5 — Implement Layer 3 simulation stepping control (HIGH PRIORITY per review)

Add `simMode` select (STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN REINITIALISATION). Add `warmupSteps`, `stepsPerFrame`, `retainState`, `resetOnChange`, `freeze`, `autoStop` params. Apply `when` conditionals per G14. Clarify or rename `steps` as `maxSteps` to avoid semantic conflict.

Stateful simulation (RETAIN STATE, CONTINUOUS EVOLUTION) requires persistent grid storage across `apply()` calls — the current stateless factory pattern must be extended to support per-node state. Coordinate with the factory/pipeline layer.

Files: `CellularAutomataNode.js`, potentially `core/EffectModule.js` or `core/Pipeline.js`

### P6 — Expand rule system: CUSTOM rule, NEIGHBOURHOOD, BOUNDARY MODE (MEDIUM PRIORITY)

Add `CUSTOM` option to `rule` select. Add `birthSet`, `survivalSet` text params (shown only when `rule = CUSTOM`, per G14). Add `neighbourhood` select (MOORE / VON NEUMANN / EXTENDED). Add `boundaryMode` select (WRAP / CLAMP / REFLECT / ABSORB). Update algorithm to handle Von Neumann neighbourhood count and non-toroidal boundary modes.

Files: `CellularAutomataNode.js`, `reaction-diffusion.js`

### P7 — Implement Layer 4 image coupling (HIGH PRIORITY long-term per review)

Add image-driven birth/survival bias fields: `birthBiasDriver`, `survivalBiasDriver`, `ruleDriverSource`, `neighbourhoodBias`, `presetField`. Add ongoing forcing: `forceSource`, `forceStrength`, `forceInterval`, `forceMode`. Apply `when` conditionals per G14. This requires the algorithm to accept per-pixel bias maps derived from image fields and apply them at each generation step.

Files: `CellularAutomataNode.js`, `reaction-diffusion.js`

### P8 — Unit labels on all new numeric params (G16)

Every numeric param added in P3–P7 must include a `unit` field. Common values: `'steps'`, `'frames'`, `'0–1'`, `'lvl'`, `'n'`. Do not omit.

File: `CellularAutomataNode.js`

### P9 — `driveable: true` on all new numeric params (G2)

Every range-type param added in P3–P7 must include `driveable: true`. Do not omit.

File: `CellularAutomataNode.js`

### P10 — SEEDS rule early-exit optimisation (performance)

In `cellularAutomataRGBA` / expanded algorithm: detect all-dead state after each generation. If the entire grid is dead, break the step loop early. This prevents wasted computation at high step counts with the SEEDS rule. Add within algorithm, not the module node.

File: `shared/algorithms/physics/reaction-diffusion.js`

---

## Verification Criteria

After all changes, every item below must pass:

1. `apply()` signature includes `modulate` argument; `threshold`, `blendAmt`, and any new driveable range params are read via `modulate(key, i)` inside pixel loops.
2. Redundant inline preview cap removed; `previewMax: 20` on `steps` remains.
3. `outputMode` param present with all seven options; selecting each mode produces visually distinct output (not identical to ALIVE/DEAD).
4. `initMode` param present; EDGE SEED and DISTANCE SEED modes produce seeding patterns distinct from simple luminance threshold.
5. `warmupSteps` and `stepsPerFrame` produce observable differences in simulation maturity vs flat `steps` at equivalent total compute.
6. `simMode = CONTINUOUS EVOLUTION` with `retainState = true` continues evolving state between apply() calls without resetting.
7. `rule = CUSTOM` with user-specified `birthSet`/`survivalSet` produces different output from all six named presets.
8. `neighbourhood = VON NEUMANN` produces structurally different evolution pattern from `MOORE` on identical seed.
9. `boundaryMode = CLAMP` produces edge artefacts absent in `WRAP` mode — confirming boundary mode is active.
10. `birthBiasDriver` set to a luminance-derived field produces spatially non-uniform birth probability — alive cell density varies with image content after N steps.
11. All new range params have `driveable: true` and a non-empty `unit` field.
12. All mode-conditional params are hidden when their condition is not met (per G14).
13. SEEDS rule terminates step loop early when grid reaches all-dead state; step count in logs is less than `maxSteps`.
14. Full render at 4K, `outputMode = DISTANCE TO ACTIVE`, `stepsPerFrame = 1`, `simMode = CONTINUOUS` completes within class C budget (< 500 ms); PREVIEW completes within class A (< 16 ms).
15. Registry entry for `cellularautomata` unchanged; module loads and renders correctly in the distort tool stack.
