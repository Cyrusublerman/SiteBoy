# CANNY — Build Guide

- module: canny
- node: CannyNode.js
- category: EDGE
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

`CannyNode.js` is a `createEffectModule()` factory with three params: `sigma`, `lowThreshold`, `highThreshold`. It delegates entirely to `cannyEdge()` from the shared edge-operators library. The four-stage Canny pipeline (greyscale → Gaussian blur → Sobel gradient + NMS → hysteresis) is fully functional and algorithmically correct. Output is a fixed monochrome (binary) edge map. There is no colour mapping stage. The review verdict is KEEP with a mandatory colour ramp addition.

The live source is structurally identical to the reference archive snapshot with two additions: `forceWorkerPreview: true` (added post-migration) and `unit` fields on all three params (added for G16 compliance). Both additions are valid.

---

## Reference Parity Gaps

| Gap | Detail | Severity |
|---|---|---|
| Colour ramp stage absent | Reference source has no ramp either — this is a new feature mandated by the review, not a regression from reference | N/A (new) |
| `driveable: true` on `sigma` absent | Reference source does not declare it; live source also does not. G2 requires it be added | Minor |
| `modulate()` never called in `apply()` | Confirmed in both reference and live source. `lowThreshold` and `highThreshold` declare `driveable: true` but `apply()` reads both as pre-resolved scalars. The `+D` button appears but produces no effect — silent failure | Major (G1/architectural) |
| Per-pixel hysteresis driving architecturally infeasible | Hysteresis classification uses scalar `hi`/`lo` applied globally. Even if `modulate()` were wired, spatially varying thresholds would require a full redesign of the hysteresis stage. `driveable: true` on these params is semantically invalid in the current architecture | Major |

---

## Review Spec Gaps

The review (`canny_review2403.md`) mandates the following that are absent from the current implementation:

**Required (WARN [PARITY]):**

| Missing | Type | Section |
|---|---|---|
| Colour Mapping stage | Stage | After hysteresis |
| `minColour` param | colour picker | Colour Mapping section |
| `maxColour` param | colour picker | Colour Mapping section |
| `rampSource` param | dropdown | `BINARY EDGE RESULT` / `EDGE STRENGTH` / `POST-HYSTERESIS VALUE` |
| `rampSpace` param | dropdown | `RGB` / `HSV` |
| `clampNonEdges` param | toggle | Force non-edge regions to minColour |
| Edge-response field separation from rendering | Architectural | Canny stage produces field; mapping stage handles colour |

**Optional (review-listed, not mandatory):**

| Missing | Type | Notes |
|---|---|---|
| `invert` param | toggle | Polarity reversal for compositing/mask workflows |
| `outputMode` param | dropdown | `BINARY EDGES` / `EDGE STRENGTH` / `SUPPRESSED GRADIENT MAGNITUDE` |
| `preNormalise` param | toggle | Normalise threshold input for consistent cross-source behaviour |

**Revised structure required by review:**

```
Detection
  Sigma
  Low Threshold
  High Threshold

Colour Mapping
  Min Colour
  Max Colour
  Ramp Source
  Ramp Space
  Clamp Non-Edges

Compositing
  Opacity
  Blend Mode
```

---

## Missing Parameters

| Key | Label | Type | Default | Tier | Driveable | Notes |
|---|---|---|---|---|---|---|
| `minColour` | `MIN COLOUR` | colour picker | `#000000` | 3 | no | Colour for zero/non-edge regions |
| `maxColour` | `MAX COLOUR` | colour picker | `#ffffff` | 3 | no | Colour for confirmed edge regions |
| `rampSource` | `RAMP SOURCE` | dropdown | `BINARY EDGE RESULT` | 3 | no | Options: `BINARY EDGE RESULT`, `EDGE STRENGTH`, `POST-HYSTERESIS VALUE` |
| `rampSpace` | `RAMP SPACE` | dropdown | `RGB` | 3 | no | Options: `RGB`, `HSV` |
| `clampNonEdges` | `CLAMP NON-EDGES` | toggle | `true` | 3 | no | Force non-edge regions exactly to minColour |
| `invert` | `INVERT` | toggle | `false` | 3 | no | Optional — fast polarity reversal |
| `outputMode` | `OUTPUT MODE` | dropdown | `BINARY EDGES` | 3 | no | Optional — `BINARY EDGES`, `EDGE STRENGTH`, `SUPPRESSED GRADIENT MAGNITUDE` |
| `preNormalise` | `PRE-NORMALISE` | toggle | `false` | 3 | no | Optional — normalise threshold input |

**G14 note:** `outputMode` and `rampSource` dropdowns govern conditional param visibility. When `outputMode` ≠ `BINARY EDGES`, the Colour Mapping section remains relevant. When `clampNonEdges` is off, note in UX that residual sub-threshold values may bleed through. No params become hidden-by-mode in the Detection section — all three detection params are always applicable.

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|---|---|---|
| `lowThreshold` — `driveable: true` | Architecturally invalid: per-pixel hysteresis threshold driving is infeasible in the global-classification stage. `driveable: true` causes `+D` button to appear with no functional effect (silent failure, G1) | Remove `driveable: true` OR accept the architectural limitation and document it. The G2 mandate requires numeric params to be driveable; however, the architecture makes this semantically invalid for these params. Preferred resolution: remove `driveable: true` from both threshold params and document the architectural constraint. Do not add `modulate()` wiring for these params. |
| `highThreshold` — `driveable: true` | Same as above | Same as above |
| `sigma` — missing `driveable: true` | G2 requires all numeric params to support drivers. `sigma` currently omits `driveable: true`. However, note that `sigma` drives the blur kernel size — per-pixel sigma variation would require per-pixel kernel recomputation (O(w×h×k) per pixel), making it computationally degenerate in the current pipeline. Architectural evaluation required before wiring `modulate()` | Add `driveable: true` to satisfy G2 UI requirement; defer `modulate()` wiring to architectural review |

---

## UI Compliance Issues

**Registry entry (`registry.js` line 166):**
- `type: 'canny'` — correct (lowercase)
- `label: 'CANNY EDGE'` — correct (UPPERCASE, ≤16 chars)
- `description: 'Multi-stage edge detector with noise suppression and hysteresis'` — correct (sentence case, `title` attribute context)
- `factory: () => new CannyNode()` — correct

**Parameter labels (current):**
- `'SIGMA'` (5 chars) — correct
- `'LOW THRESH'` (10 chars) — correct
- `'HIGH THRESH'` (11 chars) — correct
- All labels SCREAMING CASE — correct

**Units (`unit` field, G16):**
- `sigma`: `unit: 'σ'` — present, correct
- `lowThreshold`: `unit: '0–1'` — present, correct
- `highThreshold`: `unit: '0–1'` — present, correct
- New params requiring units: `minColour`, `maxColour` — no unit needed (colour pickers); `rampSource`, `rampSpace`, `outputMode` — no unit (dropdowns); `clampNonEdges`, `invert`, `preNormalise` — no unit (toggles)

**Colour Mapping section — new param labels must comply:**
- `MIN COLOUR`, `MAX COLOUR`, `RAMP SOURCE`, `RAMP SPACE`, `CLAMP NON-EDGES`, `INVERT`, `OUTPUT MODE`, `PRE-NORMALISE` — all SCREAMING CASE, all ≤16 chars — compliant by design

**G11 shared component requirement:**
The colour ramp pattern (MIN COLOUR + MAX COLOUR + RAMP SOURCE + RAMP SPACE) is shared across Canny, Sobel, Laplacian, and DoG. Per G11, this must be implemented as a `ColourRampControl` shared component, not reimplemented per-module. Before writing any per-module ramp code, verify whether `ColourRampControl` already exists in the component library. If not, build it as a shared component first and consume it in all four EDGE modules.

**Dropdown glyphs:**
`rampSource`, `rampSpace`, `outputMode` are dropdown params. The NodePanel renders these; confirm the NodePanel dropdown trigger uses `▾` per `semiotics.md §2`. No per-module action required — this is a NodePanel-level compliance item.

**Colour inputs:**
`minColour` and `maxColour` must use `ComponentLibrary.create('color-input', ...)` per `component-patterns.md §2`. Raw hex in param definition is for default value only; the UI component must be the canonical colour input.

---

## Global Issues

| Issue | Applicability to Canny | Required Action |
|---|---|---|
| **G1** — Driver `+D` button non-functional | Applies — `+D` button appears for `lowThreshold` and `highThreshold` and produces no effect | No per-module fix. Tracked as system-level NodePanel bug. When G1 is fixed system-wide, `lowThreshold` and `highThreshold` will still produce no effect because `modulate()` is not wired. Resolution: remove `driveable: true` from both threshold params (see Extra/Incorrect Parameters above) |
| **G2** — All numeric params must be driveable | `sigma` lacks `driveable: true`. `lowThreshold` and `highThreshold` declare it but it is semantically invalid (see above). New ramp params: none are numeric/range type — dropdowns and toggles do not require `driveable: true` | Add `driveable: true` to `sigma`. Remove `driveable: true` from `lowThreshold` and `highThreshold` with documented rationale |
| **G5** — Slider direct input and double-click-to-default | Applies to all three existing range params and any new range params | System-level fix to slider component. No per-module action |
| **G6** — Canvas click-to-pick for centre point params | Does not apply — Canny has no centre X/Y params | None |
| **G7** — Vector module visual indicator | Does not apply — Canny is a pixel module (`isVector: false`) | None |
| **G9** — Time/iteration-based modules must expose FRAME param | Does not apply — Canny has no iteration or time state | None |
| **G10** — Vector modules must include SVG export | Does not apply | None |
| **G11** — Shared components for overlapping feature additions | Applies — colour ramp stage is shared across all four EDGE modules (Sobel, Canny, Laplacian, DoG) | Before implementing colour ramp in Canny: check if `ColourRampControl` shared component exists. If not, build it first. All four EDGE modules must consume the same component |
| **G12** — Web Worker usage for expensive modules | Partially applies — `forceWorkerPreview: true` is already declared (live source addition vs reference). Full-resolution render path must also be confirmed to run in the render worker | Verify `cannyEdge` runs entirely in the render worker at full resolution. `forceWorkerPreview: true` handles preview. Confirm no main-thread blocking at full resolution |
| **G14** — Mode-conditional params must be hidden when not applicable | Applies if `outputMode` optional param is added — `rampSource`, `rampSpace`, `clampNonEdges` may be inapplicable in non-binary output modes; also `preNormalise` | If `outputMode` is implemented: hide `rampSource`, `rampSpace`, `clampNonEdges`, and colour pickers when mode is `SUPPRESSED GRADIENT MAGNITUDE` (no binary classification). Implement via NodePanel conditional visibility |
| **G16** — Slider/number inputs must display units | `sigma`, `lowThreshold`, `highThreshold` already have `unit` fields declared | Confirm NodePanel renders units. New params: dropdowns and toggles require no unit field |

---

## Merge Absorption

The live `CannyNode.js` has two additions vs the reference archive:

1. `forceWorkerPreview: true` — keeps. This is a valid performance improvement absent from the reference snapshot. Do not revert.
2. `unit` fields (`'σ'`, `'0–1'`, `'0–1'`) on all three params — keeps. G16 compliance. Do not revert.

The CORRODED preset in `registry.js` uses `canny` with `{sigma:1.4, lowThreshold:0.08, highThreshold:0.2}`. After adding colour ramp params, CORRODED must be updated with default ramp values so the preset remains functional: `minColour: '#000000', maxColour: '#ffffff', rampSource: 'BINARY EDGE RESULT', rampSpace: 'RGB', clampNonEdges: true`.

---

## Required Changes (priority ordered)

**P1 — Resolve `driveable` on threshold params (architectural correctness)**
- Remove `driveable: true` from `lowThreshold` and `highThreshold`.
- Rationale: per-pixel hysteresis threshold driving is architecturally infeasible in the global classification stage. The `+D` button appearing for these params is a false affordance. Removing `driveable: true` eliminates the silent failure.
- File: `assets/js/tools/processors/distort/nodes/edge/CannyNode.js`

**P2 — Add `driveable: true` to `sigma` (G2 compliance)**
- `sigma` is a numeric/range param and must declare `driveable: true` per G2.
- Note: actual `modulate()` wiring for `sigma` would require per-pixel kernel recomputation — defer wiring. Declare `driveable: true` only.
- File: `assets/js/tools/processors/distort/nodes/edge/CannyNode.js`

**P3 — Implement or consume `ColourRampControl` shared component (G11 prerequisite)**
- Check component library for existing `ColourRampControl`.
- If absent: build `ColourRampControl` as a shared component exposing: `minColour`, `maxColour`, `rampSource` (dropdown), `rampSpace` (dropdown), `clampNonEdges` (toggle).
- This component must be consumed by Canny, Sobel, Laplacian, and DoG — do not implement per-module.
- File: shared component library (new if absent)

**P4 — Add Colour Mapping stage to `CannyNode.js` (primary new feature)**
- Add params: `minColour`, `maxColour`, `rampSource`, `rampSpace`, `clampNonEdges`.
- Restructure `apply()`: (a) run `cannyEdge()` to get edge-response field; (b) map field through colour ramp using `rampSource` to select input (binary result / edge strength / post-hysteresis value), `rampSpace` for interpolation, and `minColour`/`maxColour` as endpoints; (c) write mapped RGBA to `dst`.
- `clampNonEdges: true` must force non-edge pixels to exactly `minColour` with no residual bleed.
- The `cannyEdge()` function currently returns a binary-ish result (0 or 255). For `EDGE STRENGTH` and `POST-HYSTERESIS VALUE` ramp sources, the algorithm must expose intermediate values (gradient magnitude after NMS, post-hysteresis weak/strong values). Evaluate whether `cannyEdge()` must be extended or a new algorithm variant created.
- File: `assets/js/tools/processors/distort/nodes/edge/CannyNode.js`; possibly `assets/js/shared/algorithms/edge-detection/edge-operators.js`

**P5 — Add optional params (review action items 3)**
- Add `invert` (toggle), `outputMode` (dropdown), `preNormalise` (toggle).
- `outputMode` controls what `apply()` writes to dst before the ramp stage.
- Implement G14 conditional visibility: hide ramp params when `outputMode` is `SUPPRESSED GRADIENT MAGNITUDE`.
- File: `assets/js/tools/processors/distort/nodes/edge/CannyNode.js`

**P6 — Update CORRODED preset with ramp defaults**
- Add default colour ramp values to the CORRODED preset entry in `registry.js` to prevent broken preset state after new params are added.
- File: `assets/js/tools/processors/distort/nodes/registry.js`

**P7 — Verify full-resolution worker offload (G12)**
- Confirm `cannyEdge()` runs in the render worker at full resolution, not the main thread.
- `forceWorkerPreview: true` is already declared; ensure this flag is respected and that full-resolution `apply()` is also worker-side.
- File: pipeline/worker infrastructure — no CannyNode.js change if already correct

---

## Verification Criteria

Each criterion maps to a required change above. All must pass before the module is marked complete.

| # | Criterion | Maps to |
|---|---|---|
| V1 | `lowThreshold` and `highThreshold` do not declare `driveable: true`; no `+D` button appears for either param | P1 |
| V2 | `sigma` declares `driveable: true`; `+D` button appears (pending G1 system fix to be functional) | P2 |
| V3 | `ColourRampControl` shared component exists and is consumed — not reimplemented inline in CannyNode.js | P3 |
| V4 | Colour Mapping section renders in the NodePanel with `MIN COLOUR`, `MAX COLOUR`, `RAMP SOURCE`, `RAMP SPACE`, `CLAMP NON-EDGES` controls | P4 |
| V5 | With `minColour: #000000`, `maxColour: #ff0000`, ramp produces red edges on black background — not a fixed greyscale output | P4 |
| V6 | `CLAMP NON-EDGES: true` produces zero residual bleed in non-edge regions (exactly minColour, not near-minColour) | P4 |
| V7 | `RAMP SOURCE: BINARY EDGE RESULT` produces binary two-colour output; `EDGE STRENGTH` produces a smooth gradient interpolation from minColour to maxColour | P4 |
| V8 | `INVERT` toggle reverses polarity (edges become minColour, non-edges become maxColour) | P5 |
| V9 | `OUTPUT MODE: SUPPRESSED GRADIENT MAGNITUDE` hides Colour Mapping section params (G14) | P5 |
| V10 | CORRODED preset loads without console error after param addition; produces visually equivalent output to pre-change CORRODED | P6 |
| V11 | Full-resolution render does not block the main thread; `cannyEdge()` executes in the render worker | P7 |
| V12 | Module structure in NodePanel matches review spec: Detection / Colour Mapping / Compositing sections in that order | P4 |
| V13 | All new param labels are SCREAMING CASE, ≤16 chars, rendered at `F × 0.75` | P4, P5 |
| V14 | Colour picker controls use `ComponentLibrary.create('color-input', ...)` — no raw hex colour in UI element styling | P4 |
