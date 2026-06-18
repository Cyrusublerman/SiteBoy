# LAPLACIAN — Build Guide

- module: laplacian
- node: LaplacianNode.js
- category: EDGE
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

Factory-pattern node (`createEffectModule`) with two params: `mode` (select, 4-conn/8-conn, tier 3) and `normalize` (toggle, tier 4). `apply()` delegates entirely to `laplacianEdge` in `shared/algorithms/edge-detection/edge-operators.js`. No driveable params. Output is fixed greyscale. Architecturally clean — no rule violations, no inline DOM, no animation primitives. Structurally minimal.

The current node is functionally correct for what it implements. It is missing the full Detection parameter set specified in the review and the entire Colour Mapping section. These are additive changes, not corrections to broken logic.

---

## Reference Parity Gaps

The reference source (`reference/distort/laplacian/source/LaplacianNode.js`) is **identical** to the live source — it was archived from the live file on 2026-03-11. No reference-vs-live delta exists. All gaps are therefore review-specified additions, not regressions.

One noted discrepancy: `normalize` is tier 4 in the live source; the legacy doc (`laplacian.md`) assigns tier 5. This is a non-functional presentation-order difference. Resolution: change `normalize` to tier 5 to match the legacy specification, placing it subordinate to the new params that will be inserted at tier 3–4.

---

## Review Spec Gaps

All items from `review2403/laplacian_review2403.md` §Required Params not present in current implementation:

**Detection section — missing:**

| Param | Type | Notes |
|---|---|---|
| PRE BLUR | slider | Gaussian smoothing before Laplacian; suppresses noise |
| OUTPUT MODE | dropdown | SIGNED / ABSOLUTE / POSITIVE ONLY / NEGATIVE ONLY / ZERO-CROSSING |
| GAIN | slider | Scale response before normalisation/mapping |
| THRESHOLD | slider | Suppress weak-response regions |

**Colour Mapping section — missing entirely:**

| Param | Type | Notes |
|---|---|---|
| MIN COLOUR | colour picker | Colour for minimum mapped value |
| MAX COLOUR | colour picker | Colour for maximum mapped value |
| RAMP SOURCE | dropdown | SIGNED RESPONSE / ABSOLUTE RESPONSE / NORMALISED RESPONSE |
| RAMP SPACE | dropdown | RGB / HSV |
| CLAMP ZERO | toggle | Force near-zero values to MIN COLOUR |

**Processing pipeline — missing stages (per review §Required Addition):**

Current pipeline: luminance → kernel → abs → optional normalise → write greyscale.

Required pipeline:
1. Convert to luminance
2. Optional PRE BLUR
3. Compute Laplacian (MODE: 4-CONN / 8-CONN)
4. Apply OUTPUT MODE interpretation
5. Apply GAIN scaling
6. Apply optional THRESHOLD
7. Optional NORMALIZE
8. Map scalar to 0..1
9. Interpolate MIN COLOUR → MAX COLOUR in RAMP SPACE
10. Output mapped colour
11. Compositing (opacity + blend mode)

---

## Missing Parameters

| Key | Label | Type | Default | Tier | Driveable | Unit |
|---|---|---|---|---|---|---|
| `preBlur` | PRE BLUR | slider | 0 | 3 | true | px |
| `outputMode` | OUTPUT MODE | select | `'absolute'` | 3 | no | — |
| `gain` | GAIN | slider | 1.0 | 4 | true | × |
| `threshold` | THRESHOLD | slider | 0 | 4 | true | 0–1 |
| `minColour` | MIN COLOUR | colour | `#000000` | 5 | no | — |
| `maxColour` | MAX COLOUR | colour | `#ffffff` | 5 | no | — |
| `rampSource` | RAMP SOURCE | select | `'absolute'` | 5 | no | — |
| `rampSpace` | RAMP SPACE | select | `'rgb'` | 5 | no | — |
| `clampZero` | CLAMP ZERO | toggle | 0 | 5 | no | — |

`outputMode` options: `'signed'`, `'absolute'`, `'positive-only'`, `'negative-only'`, `'zero-crossing'`.
`rampSource` options: `'signed'`, `'absolute'`, `'normalised'`.
`rampSpace` options: `'rgb'`, `'hsv'`.

---

## Extra/Incorrect Parameters

None. Existing params (`mode`, `normalize`) are correct and retained. `normalize` tier must change from 4 → 5 to match legacy spec and to position it correctly relative to the new detection params.

---

## UI Compliance Issues

**NORMALIZE label is ambiguous (review §Issues [WARN]).**
The label does not specify what is being normalised (signed response, absolute magnitude, pre-clip, post-abs). Review requires this to be made explicit via the new OUTPUT MODE and RAMP SOURCE params. NORMALIZE itself can remain as a toggle but its label must be accompanied by the new params that contextualise it. Consider relabelling to `NORMALISE` (Australian English, consistent with site language standard).

**No driveable params on any numeric param (G2).**
`preBlur`, `gain`, and `threshold` — all range-type params being added — must declare `driveable: true`. Neither existing param is range-type; no correction required to existing params.

**No unit declarations on slider params (G16).**
`preBlur` (px), `gain` (×), `threshold` (0–1 normalised). Units must be defined in param defs and rendered by NodePanel.

**G14 — mode-conditional params.**
OUTPUT MODE drives which downstream params are meaningful. If OUTPUT MODE is `zero-crossing`, GAIN has no well-defined effect on signed response. Implement conditional visibility: hide GAIN and THRESHOLD when OUTPUT MODE is `zero-crossing` (or define their behaviour explicitly for that mode and document it). RAMP SOURCE `signed` is only meaningful when OUTPUT MODE is `signed` or `zero-crossing` — hide or constrain accordingly.

**Colour ramp must use shared ColourRampControl component (G11, review action item 4).**
Do not implement MIN COLOUR / MAX COLOUR / RAMP SOURCE / RAMP SPACE inline. This pattern is shared with Sobel, Canny, and DoG. Build `ColourRampControl` as a shared component first; consume it here.

---

## Global Issues

| Issue | Applicability | Action |
|---|---|---|
| **G1** — +D button non-functional | Applies; no driver slots work anywhere | Fix NodePanel +D wiring globally before per-module driver work |
| **G2** — All numeric params must have `driveable: true` | Directly applicable: `preBlur`, `gain`, `threshold` must declare `driveable: true` | Add to new param defs when implementing |
| **G5** — Slider direct input and double-click-to-default | Applies to all sliders including new `preBlur`, `gain`, `threshold` | NodePanel-level fix; no per-module code required |
| **G6** — Canvas click-to-pick for centre params | Not applicable; Laplacian has no centre X/Y params | None |
| **G7** — Vector module identifiability | Not applicable; Laplacian is pixel output | None |
| **G9** — FRAME param for time-based modules | Not applicable; Laplacian is stateless | None |
| **G10** — SVG export for vector modules | Not applicable | None |
| **G11** — Shared ColourRampControl component | Directly applicable; colour ramp addition required by review | Build ColourRampControl as shared component before implementing here |
| **G12** — Web worker usage | Partially applicable; Laplacian is class A (< 10 ms at full res) so blocking is not an urgent concern. PRE BLUR adds a Gaussian pass — if implemented as separable blur, still class A. No immediate worker migration required but architecture must not regress | Ensure new PRE BLUR implementation does not introduce a class C+ cost that would require mitigation |
| **G13** — Blend modes incorrectly implemented | Applies to all modules; Laplacian uses compositing blend modes | Fix compositing pipeline globally |
| **G14** — Mode-conditional param visibility | Directly applicable; OUTPUT MODE drives param visibility for GAIN, THRESHOLD, RAMP SOURCE | Implement `when` conditions on affected params |
| **G16** — Slider inputs must display units | Directly applicable to `preBlur` (px), `gain` (×), `threshold` (0–1) | Add `unit` field to param defs; NodePanel renders |

---

## Merge Absorption

No merge candidates from other modules. The colour ramp pattern (MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE) is shared with Sobel, Canny, and DoG — but these are parallel additions, not consolidations. The shared component (`ColourRampControl`) is the merge vehicle; build it once and consume across all four EDGE modules.

PRE BLUR in this module is a single Gaussian smoothing pass before the Laplacian. It does not replace or duplicate GAUSS BLUR (which operates on full RGBA). The algorithm should call the shared Gaussian 1D kernel utility already used by GaussianBlurNode if available; do not re-implement inline.

---

## Required Changes (priority ordered)

**P0 — Prerequisite (global, not module-specific):**
1. Fix G1: +D button event wiring in NodePanel so driver slots open.
2. Build `ColourRampControl` shared component (G11). All four EDGE modules (Sobel, Canny, Laplacian, DoG) block on this.
3. Fix G13: Correct blend mode compositing implementation in Pipeline.

**P1 — Core algorithm extension:**
4. Extend `laplacianEdge` (or add a new wrapper in `edge-operators.js`) to support: optional Gaussian pre-blur (`preBlur` radius), `outputMode` interpretation (signed raw, absolute, positive-only, negative-only, zero-crossing), `gain` scalar, and `threshold` suppression. Keep existing 4-conn/8-conn kernel logic unchanged.
5. Update `apply()` in `LaplacianNode.js` to pass new params to the extended algorithm and apply the colour ramp mapping after the scalar response is computed.

**P2 — New param declarations:**
6. Add `preBlur` (slider, tier 3, `driveable: true`, unit: px, default 0, min 0, max 10, step 0.1).
7. Add `outputMode` (select, tier 3, options as above, default `'absolute'`).
8. Add `gain` (slider, tier 4, `driveable: true`, unit: ×, default 1.0, min 0.1, max 10, step 0.1).
9. Add `threshold` (slider, tier 4, `driveable: true`, unit: 0–1, default 0, min 0, max 1, step 0.01).
10. Add `minColour` (colour, tier 5, default `#000000`).
11. Add `maxColour` (colour, tier 5, default `#ffffff`).
12. Add `rampSource` (select, tier 5, options as above, default `'absolute'`).
13. Add `rampSpace` (select, tier 5, options as above, default `'rgb'`).
14. Add `clampZero` (toggle, tier 5, default 0).
15. Change `normalize` tier from 4 → 5. Rename key label to `NORMALISE` (Australian English).

**P3 — UI conditional visibility:**
16. Implement G14 `when` conditions: hide `gain` and `threshold` when `outputMode === 'zero-crossing'` (or define behaviour explicitly). Constrain `rampSource` to `'signed'` or `'absolute'` options when `outputMode` is `'absolute'`, `'positive-only'`, or `'negative-only'` — or hide `rampSource: 'signed'` option when signed response is not available.

**P4 — NodePanel-level fixes (global, confirmed applicable here):**
17. G5: Slider direct input and double-click-to-default — NodePanel level.
18. G16: Unit display on all slider params — add `unit` field to param defs, render in NodePanel.

---

## Verification Criteria

- [ ] PRE BLUR at 0 produces output identical to current implementation (no regression).
- [ ] PRE BLUR > 0 visibly smooths noise before edge detection on a noisy test image.
- [ ] OUTPUT MODE `absolute` matches current `normalize: off` behaviour (raw absolute values).
- [ ] OUTPUT MODE `signed` outputs negative response as distinct from positive (can be negative channel values clamped to 0 without abs, or encoded via colour ramp).
- [ ] OUTPUT MODE `positive-only` produces response only where Laplacian is positive (local minima in luminance).
- [ ] OUTPUT MODE `negative-only` produces response only where Laplacian is negative (local maxima, i.e. bright blobs).
- [ ] OUTPUT MODE `zero-crossing` marks pixels where sign changes between adjacent pixels.
- [ ] GAIN scales response magnitude before normalisation — increasing GAIN brightens weak-response regions.
- [ ] THRESHOLD suppresses all response below the threshold value to zero/MIN COLOUR.
- [ ] NORMALIZE on: max response maps to 255 (or MAX COLOUR at full scale) after GAIN and THRESHOLD.
- [ ] MIN COLOUR applied at zero (or below-threshold) response; MAX COLOUR at full response.
- [ ] RAMP SPACE RGB and HSV both produce distinct output for non-greyscale colour pairs.
- [ ] RAMP SOURCE options produce perceptually correct source-to-ramp mapping.
- [ ] CLAMP ZERO forces below-threshold to MIN COLOUR exactly (no faint residual structure).
- [ ] `normalize` tier renders at tier 5 (below new detection params, not tier 4).
- [ ] `driveable: true` params show +D button in NodePanel (pending G1 fix).
- [ ] Unit labels visible on `preBlur`, `gain`, `threshold` sliders.
- [ ] Mode-conditional params hidden (not just disabled) when OUTPUT MODE makes them inapplicable (G14).
- [ ] `ColourRampControl` is consumed from shared component, not re-implemented inline (G11).
- [ ] No `document.*`, `window.*`, `requestAnimationFrame`, or `setInterval` introduced.
- [ ] All new algorithm code lives in `edge-operators.js` (or a delegated shared utility); `LaplacianNode.js` contains only param declarations and `apply()` delegation.
