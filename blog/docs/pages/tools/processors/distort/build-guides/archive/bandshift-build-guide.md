# BANDSHIFT — Build Guide

- module: bandshift
- node: BandShiftNode.js
- category: WARP
- review verdict: KEEP
- rebuild severity: MODERATE

## Current State Summary

The current implementation is structurally sound: correct factory pattern, correct `apply()` signature, correct algorithm delegation to `bandShift()` in the shared library, and full parameter set with unit labels already present. The primary defects are functional — NOISE mode amplitude is not defined in pixel terms and the review confirms its output is incoherent; STEPPED mode param semantics are undefined and its output is incoherent; `driveable: true` is declared on `intensity`, `bandSize`, and `phase` but `apply()` has no `modulate` parameter, making per-pixel driving silently non-functional. Mode-conditional param visibility (`when:` guards) is partially implemented for `freq` and `noiseScale` but absent for `phase` in `stepped` mode, where it has no effect.

## Reference Parity Gaps

1. **`driveable` wiring — `intensity`, `bandSize`, `phase`:** Reference source declares `driveable: true` on these three params (without `unit` labels); current implementation adds `unit` labels (good) but both versions lack a `modulate` call inside `apply()`. The driver declaration is non-functional in both. Current implementation neither fixes nor regresses this relative to the reference — it remains broken. Action: wire `modulate` in `apply()` or explicitly document as deferred.

2. **`freq` driveable absent in reference; present in current:** Current adds `driveable: true` and `unit: 'n'` to `freq`. Reference has neither. This is a divergence from the reference but aligns with G2 (all numeric params must be driveable). This is a correct enhancement, not a defect.

3. **`noiseScale` driveable absent in reference; present in current:** Same as `freq` — current adds `driveable: true` and `unit: 'n'`. Same assessment: correct enhancement per G2.

4. **NOISE mode amplitude semantics:** Reference source does not fix the issue flagged in the review — `intensity` is declared as `unit: 'px'` in the current implementation but the review confirms the noise mode output remains incoherent and the amplitude has no intuitive pixel-scale meaning when passed through `noise2D() × intensity`. The `bandShift` algorithm in `warp.js` must be audited to confirm noise offset is correctly scaled in pixels. No reference source fix exists.

5. **STEPPED mode param semantics:** Reference source does not resolve the stepped mode incoherence flagged in the review. The formula `round(rng.next() × 4 − 2) × intensity × 0.5` produces four levels `{−1, −0.5, 0.5, 1} × intensity` — this is documented in `mechanisms.md` but the review identifies the output as incoherent. Audit required against `warp.js` implementation.

6. **`phase` visibility in `stepped` mode:** Reference has no `when:` guard on `phase`. Current implementation also has no guard on `phase`. `mechanisms.md` explicitly notes `phase` is unused in stepped mode. A `when: { param: 'offsetType', in: ['sine', 'noise'] }` guard must be added to `phase`.

7. **Presets (SCAN, DATAMOSH, SIGNAL):** Cited in `legacy-docs/bandshift.md`. Not present in the node source (reference or current). Status unverified — presets are likely defined elsewhere in the pipeline/preset system, not in the node file itself. No action required in node file; verify preset system separately.

## Review Spec Gaps

1. **[HIGH] NOISE mode fix:** Review requires defining AMPLITUDE in pixels, specifying and exposing noise type (Perlin confirmed), and fixing incoherent output. Current implementation labels `intensity` as `unit: 'px'` but does not verify or fix the actual pixel-scale semantics of noise mode inside `bandShift()` in `warp.js`. The node file alone cannot resolve this — `warp.js` must be audited and fixed.

2. **[HIGH] STEPPED mode fix:** Review requires auditing stepped mode implementation and defining clear param semantics (step count, step size, offset). Current implementation is unchanged from reference. `warp.js` must be audited; stepped mode formula must be verified against expected output.

3. **Unit labels on all params:** Review action item 3 requires unit labels on all params. Current implementation adds `unit: 'px'` to `intensity` and `bandSize`, `unit: 'rad'` to `phase`, `unit: 'n'` to `freq` and `noiseScale`. `axis` and `offsetType` are select params — no unit applicable. This item is satisfied.

4. **Mode-conditional param visibility:** Review action item 4 requires mode-specific param visibility. Current implementation has `when:` guards on `freq` (sine/stepped only) and `noiseScale` (noise only). Missing: `when:` guard on `phase` to hide it in `stepped` mode. Partially satisfied — `phase` guard is absent.

5. **+D driver button (G1):** Not fixed in node file. Global issue — tracked separately.

6. **`driveable: true` on all numeric params (G2):** `intensity`, `bandSize`, `phase`, `freq`, `noiseScale` all have `driveable: true`. Satisfied in the param definitions. Not satisfied functionally (no `modulate` in `apply()`).

7. **Slider direct input and double-click-to-default (G5):** Global component-level issue — not a node-file concern.

## Missing Parameters

None. All seven params defined in the reference (`axis`, `intensity`, `bandSize`, `offsetType`, `phase`, `freq`, `noiseScale`) are present in the current implementation with correct types, ranges, steps, and defaults.

## Extra/Incorrect Parameters

| Param name | Issue |
|---|---|
| `freq` | Has `when: { param: 'offsetType', in: ['sine', 'stepped'] }` — INCORRECT. `freq` has no effect in `stepped` mode (stepped uses `rng.next()` only, not frequency). Guard should be `when: { param: 'offsetType', equals: 'sine' }`. |
| `phase` | No `when:` guard present. `phase` is inert in `stepped` mode per `mechanisms.md` and `description.md`. Guard `when: { param: 'offsetType', in: ['sine', 'noise'] }` must be added. |

## UI Compliance Issues

1. **Registry entry:** `type: 'bandshift'`, `label: 'BAND SHIFT'`, `description: 'Offsets horizontal or vertical bands by a noise or sine pattern'`, `category: 'WARP'`. Type and label match review spec. Description is accurate but does not mention stepped mode — minor omission, not a standards violation.

2. **Label casing:** All param labels are UPPERCASE (`'AXIS'`, `'INTENSITY'`, `'BAND SIZE'`, `'OFFSET TYPE'`, `'PHASE'`, `'FREQ'`, `'NOISE SC'`). All ≤16 chars. Compliant with `text-treatment.md §2`.

3. **No raw hex/rgb colours:** Module file contains no colour declarations. Compliant.

4. **No inline DOM construction:** Factory pattern — no DOM operations in node file. Compliant.

5. **No `document.*` / `window.*`:** Confirmed absent. Compliant.

6. **`freq` `when:` guard includes `'stepped'`:** Functionally incorrect — `freq` has no effect in `stepped` mode. UI will display `FREQ` when `offsetType = 'stepped'`, giving the user a control with no effect. Fix: change guard to `equals: 'sine'`.

7. **`phase` always visible:** UI will display `PHASE` when `offsetType = 'stepped'`, where it has no effect. Fix: add `when: { param: 'offsetType', in: ['sine', 'noise'] }`.

## Global Issues

**G1 — +D button non-functional (all modules):**
Action for BANDSHIFT: No node-file change required. Fix is in `NodePanel.js` event handler. Verify +D button works once global fix is applied; confirm it correctly identifies `intensity`, `bandSize`, and `phase` as driveable targets.

**G2 — All numeric params need `driveable: true`:**
Action for BANDSHIFT: `intensity`, `bandSize`, `phase`, `freq`, `noiseScale` all have `driveable: true`. Declaration is complete. However, `apply()` does not accept a `modulate` argument — `driveable: true` is non-functional. Once G1 is fixed (UI side), the driver pipeline must be wired into `apply()` for all three originally-driveable params. For `freq` and `noiseScale` (newly added `driveable: true` in current vs reference), wiring is also required if per-pixel driving is intended. Confirm with user whether `freq` and `noiseScale` should support per-pixel modulation before wiring.

**G5 — Slider direct input + double-click-to-default:**
Action for BANDSHIFT: No node-file change required. All five range params (`intensity`, `bandSize`, `phase`, `freq`, `noiseScale`) will benefit once global slider component is updated.

**G14 — Mode-conditional param visibility:**
Action for BANDSHIFT (specific):
- `phase`: add `when: { param: 'offsetType', in: ['sine', 'noise'] }` — hide in `stepped` mode.
- `freq`: change `when: { param: 'offsetType', in: ['sine', 'stepped'] }` to `when: { param: 'offsetType', equals: 'sine' }` — currently exposes `freq` in `stepped` mode where it has no effect.
- `noiseScale`: guard `when: { param: 'offsetType', equals: 'noise' }` is already correct. No change.

**G16 — Unit labels on numeric params:**
Action for BANDSHIFT: Already resolved in current implementation. `intensity: unit 'px'`, `bandSize: unit 'px'`, `phase: unit 'rad'`, `freq: unit 'n'`, `noiseScale: unit 'n'`. Verify that `'n'` (dimensionless/normalised) is the correct unit token for `freq` and `noiseScale` in the NodePanel renderer, or substitute an appropriate token (e.g. `'×'` for multiplier). No standard unit token is defined for dimensionless multipliers — confirm with NodePanel unit rendering implementation.

**G12 — Worker:**
Not applicable. BANDSHIFT is cost class A–B per `performance.md`. No worker required.

**G6 — Canvas pick:**
Not applicable. BANDSHIFT has no centre X/Y params.

**G7 — Vector badge:**
Not applicable. BANDSHIFT is a pixel module (`isVector: false`).

**G9 — FRAME param:**
Not applicable. BANDSHIFT is not a time/iteration-based module. `phase` serves as the animation-driveable param; no separate FRAME param is required.

**G10 — SVG export:**
Not applicable. BANDSHIFT is a pixel module.

**G11 — Shared components:**
Action for BANDSHIFT: No new shared component is needed for this module. NoiseSourceControl (if built per G11) would not apply here as the noise type (Perlin) is fixed and not user-selectable. If a future requirement exposes noise type as a param, revisit.

## Merge Absorption

None.

## Required Changes (priority ordered)

1. **[CRITICAL] Audit and fix `bandShift()` in `warp.js` — NOISE mode:** Verify that `noise2D(b/numBands × noiseScale, phase) × intensity` produces offsets in pixel units at the scale the user expects. If not, correct the formula. Document the fix with the specific mapping (e.g. output range ∈ [−intensity, +intensity] px). This is the root cause of the review's highest-severity bug.

2. **[CRITICAL] Audit and fix `bandShift()` in `warp.js` — STEPPED mode:** Verify formula `round(rng.next() × 4 − 2) × intensity × 0.5` produces intelligible output. Confirm four discrete levels produce visually distinct, predictable displacement steps. If the issue is in the RNG range or the quantisation, fix in `warp.js`. Document expected levels clearly.

3. **[HIGH] Fix `freq` `when:` guard in `BandShiftNode.js`:**
   Change: `when: { param: 'offsetType', in: ['sine', 'stepped'] }`
   To: `when: { param: 'offsetType', equals: 'sine' }`
   Rationale: `freq` has no effect in `stepped` mode. Showing it there is misleading.

4. **[HIGH] Add `when:` guard to `phase` in `BandShiftNode.js`:**
   Add: `when: { param: 'offsetType', in: ['sine', 'noise'] }`
   Rationale: `phase` is inert in `stepped` mode per `mechanisms.md`. Hiding it eliminates silent non-effect.

5. **[MODERATE] Wire `modulate` into `apply()` for driveable params:** Once G1 (+D button) is fixed globally, `apply()` must accept and call `this.getModulated(key, pixelIdx, ctx)` for `intensity`, `bandSize`, and `phase`. This requires restructuring the inner pixel loop to call `getModulated` per pixel for each driveable param — note this changes the pre-computation model (band offsets can no longer be fully pre-computed if `intensity` is modulated per pixel). Confirm intended scope: if `intensity` is modulated globally (per-band) rather than per-pixel, the pre-computation model is preserved. Confirm driver semantics with user before implementation.

6. **[LOW] Confirm unit token `'n'` for `freq` and `noiseScale`:** Verify that the NodePanel slider renderer handles `unit: 'n'` correctly (displays as "×" or similar). If `'n'` is not a recognised token, replace with the correct token or no unit. This is a display-only fix.

7. **[LOW] Registry description update (optional):** Current description `'Offsets horizontal or vertical bands by a noise or sine pattern'` omits stepped mode. Consider `'Offsets horizontal or vertical bands by sine, noise, or stepped pattern'` for completeness. Non-critical.

## Verification Criteria

1. **NOISE mode fix:** Apply BAND SHIFT with `offsetType: noise`, `intensity: 50px`, `bandSize: 20`. Shifting `noiseScale` from 0.1 to 10 must produce a visible and predictable change in the spatial frequency of the offset pattern. Shifting `intensity` from 0 to 200 must produce a proportional change in lateral displacement, measurable in pixels by comparing displaced band positions. Output must not be visually incoherent at any param combination.

2. **STEPPED mode fix:** Apply BAND SHIFT with `offsetType: stepped`, `intensity: 50`, `bandSize: 20`. Output must show clearly discrete displacement levels (visually identifiable as 2–4 distinct shift amounts). Changing `intensity` must proportionally scale the step magnitudes. Bands must be shifted by consistent, repeatable amounts for a given seed.

3. **`freq` guard fix:** With `offsetType: stepped`, the `FREQ` param row must not be visible in the NodePanel. With `offsetType: sine`, `FREQ` must be visible. With `offsetType: noise`, `FREQ` must not be visible.

4. **`phase` guard fix:** With `offsetType: stepped`, the `PHASE` param row must not be visible in the NodePanel. With `offsetType: sine` or `noise`, `PHASE` must be visible.

5. **Driver wiring:** With G1 fixed, clicking `+D` on `intensity`, `bandSize`, or `phase` must open the driver settings panel. Connecting an image driver to `intensity` must produce per-pixel (or per-band) variation in lateral displacement visibly correlated to the driver image luminance.

6. **Unit display:** `INTENSITY` and `BAND SIZE` display `px` suffix. `PHASE` displays `rad` suffix. `FREQ` and `NOISE SC` display a consistent dimensionless unit token. No slider shows a bare number with no unit.

7. **No visible regressions:** Sine mode output must remain visually identical before and after all changes. All seven params must remain present with unchanged ranges, steps, and defaults.
