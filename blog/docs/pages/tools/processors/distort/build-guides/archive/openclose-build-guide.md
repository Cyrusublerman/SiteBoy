# OPENCLOSE — Build Guide

- module: openclose
- node: OpenCloseNode.js
- category: MORPHOLOGY
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

15-line factory module. Implements compound morphological opening (erode→dilate) and closing (dilate→erode) via `morphologyOpenCloseRGBA`. Two params: `mode` (select) and `radius` (range). Core operation is functional and produces correct output at all tested values. `apply()` signature is truncated — omits `ctx` and `modulate`, making `driveable: true` on `radius` architecturally inert. No SHAPE param (unlike sibling DILATE/ERODE). No domain selection, extended modes, field output, or iteration control. Performance class D at `radius=10` on 4K with no worker offload confirmed. The module is minimal but correct — all required changes are additive or corrective, not structural replacements.

---

## Reference Parity Gaps

| Gap | Source | Severity |
|-----|--------|----------|
| Legacy doc (`openclose.md`) references `grayscaleOpen`/`grayscaleClose`; live source imports `morphologyOpenCloseRGBA` — algorithm identity unconfirmed | feature-parity.md, issues-and-conflicts.md | NOTE |
| Legacy doc states "No reduction" for preview — incorrect; live source has `previewMax: 5` | feature-parity.md | NOTE (corrected in pack) |
| Legacy doc describes explicit per-channel plane splitting (R,G,B independently); `morphologyOpenCloseRGBA` internal behaviour unconfirmed | feature-parity.md | NOTE |
| Reference source and live source are identical — no divergence between archived snapshot and current file | source-reference.md | — |

---

## Review Spec Gaps

| Gap | Spec Reference | Severity |
|-----|----------------|----------|
| No SHAPE param — structuring element shape implicit in algorithm, not user-selectable | §2.2, §4.4, action item 2 | WARN |
| No INPUT DOMAIN param — module locked to direct RGBA morphology; no luminance / alpha / mask / edge-map path | §2.2, §4.4, action item 3 | WARN |
| MODE dropdown contains only OPEN and CLOSE — OPEN-CLOSE, CLOSE-OPEN, TOPHAT, BLACKHAT, GRADIENT absent | §2.2, action item 4 | NOTE |
| No FIELD / MASK output mode — no residue, difference-from-source, or cleaned-mask export | §2.2, action item 5 | NOTE |
| No ITERATIONS param — single application only | action item 6 | WARN |
| Worker offload unconfirmed — no evidence computation runs off main thread | §5.3, action item 7 | WARN |
| No separable approximation for rectangular kernels — inherently 2× cost of single-pass morph | performance.md | NOTE |

---

## Missing Parameters

| Key | Label | Type | Range / Options | Default | Tier | Driveable | Reason Required |
|-----|-------|------|-----------------|---------|------|-----------|-----------------|
| `shape` | SHAPE | select | SQUARE / CIRCLE / DIAMOND / CROSS | SQUARE | 3 | no | Intra-category consistency with DILATE/ERODE; controls structuring element geometry |
| `domain` | INPUT DOMAIN | select | LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP | RGB LINKED | 3 | no | Domain selection unlocks mask/field conditioning utility |
| `iterations` | ITERATIONS | range | 1–10, step 1, previewMax: 3 | 1 | 3 | yes | Sequential application; driver-targetable |

Extended mode additions (review action item 4, NOTE severity — not minimum required):

| Key | Label | Type | New Options | Notes |
|-----|-------|------|-------------|-------|
| `mode` | MODE | select | + OPEN-CLOSE / CLOSE-OPEN / TOPHAT / BLACKHAT / GRADIENT | Extend existing `mode` param |

---

## Extra/Incorrect Parameters

| Param | Issue | Action |
|-------|-------|--------|
| `radius` has `driveable: true` | `apply()` omits `modulate`; per-pixel radius variation is impossible — driver slot is cosmetically present but inert | Remove `driveable: true` from `radius` until `apply()` is extended with `modulate` and `morphologyOpenCloseRGBA` supports per-pixel radius; OR extend the signature and algorithm to support it |

---

## UI Compliance Issues

| Issue | Standard | Severity |
|-------|----------|----------|
| `radius` has `driveable: true` but driver modulation path is architecturally absent — misleads user | G2, review §4.5 | ERROR |
| No SHAPE param despite DILATE/ERODE (same category) exposing one — intra-category inconsistency | review §4.4, §7.1 | WARN |
| Mode-conditional params (e.g. domain-specific options) are not yet hidden per active domain — will apply once domain param is added | G14 | WARN (future) |
| `radius` `unit: 'px'` is already present in live source — compliant | G16 | PASS |
| Both params at tier 3 — visible by default — compliant | review §4.3 | PASS |
| All labels SCREAMING CASE, ≤16 chars — compliant | review §4.2 | PASS |

---

## Global Issues

| ID | Title | Applicability to OPENCLOSE | Status |
|----|-------|---------------------------|--------|
| G1 | +D button non-functional | Affects RADIUS +D slot; cosmetically rendered, no action | Global fix required |
| G2 | All numeric params must support drivers | RADIUS has `driveable: true` but `apply()` lacks `modulate` — fails G2 contract; ITERATIONS (when added) must also be `driveable: true` | Fix: correct `apply()` signature + algorithm, or remove `driveable` until compliant |
| G5 | Slider direct input + double-click-to-default | RADIUS is a slider — affected; fix is in slider component globally | Global fix required |
| G6 | Canvas click-to-pick for centre params | Not applicable — no spatial origin params in this module | N/A |
| G7 | Vector modules identifiable | Not applicable — pixel module | N/A |
| G9 | Time/iteration-based modules need FRAME param | Not currently applicable; if ITERATIONS added and state becomes time-dependent, FRAME param required | Conditional |
| G10 | Vector modules need SVG export | Not applicable — pixel module | N/A |
| G11 | Shared components for overlapping patterns | SHAPE param should reuse any shared KernelShapeControl if built for DILATE/ERODE; DOMAIN param should reuse shared DomainPicker if built | Build shared; consume here |
| G12 | Web worker for expensive modules | OPENCLOSE at `radius=10` is cost class D (>500 ms at 4K) — must confirm offload; double-pass makes this higher priority than single-pass morphology | Confirm/enforce offload |
| G14 | Mode-conditional params hidden when inapplicable | Will apply once domain and extended mode params are added — domain-specific options must hide when domain is inactive | Implement `when` predicates on new params |
| G16 | Slider inputs must display units | `radius` already has `unit: 'px'` — compliant; ITERATIONS (when added) unit: `×` or `iter` | PASS for existing; enforce on new params |

---

## Merge Absorption

| Source Module | Overlap | Absorption Action |
|---------------|---------|-------------------|
| DILATE/ERODE | SHAPE param pattern — same kernel shape vocabulary (SQUARE/CIRCLE/DIAMOND/CROSS) | Reuse shared KernelShapeControl component (build in G11 shared component phase); do not re-implement |
| DILATE/ERODE | Per-pixel radius modulation via `modulate` | Same architectural fix required in both nodes — coordinate; share algorithm refactor if `morphologyOpenCloseRGBA` is restructured |

---

## Required Changes (priority ordered)

**P1 — CRITICAL: Remove false driveability**
- Remove `driveable: true` from `radius` param definition, OR extend `apply(src, dst, w, h, p, ctx, modulate)` with full signature and restructure `morphologyOpenCloseRGBA` to accept per-pixel radius.
- Removing is the minimum safe fix. Re-adding `driveable: true` is only valid once the algorithm supports it.
- File: `OpenCloseNode.js` — params.radius

**P2 — HIGH: Correct `apply()` signature**
- Extend to `apply(src, dst, w, h, p, ctx, modulate)` to comply with factory contract.
- Required for G2 compliance and future modulation targets (ITERATIONS, BLEND AMOUNT).
- File: `OpenCloseNode.js` — apply()

**P3 — HIGH: Add SHAPE param**
- Add `shape: { label: 'SHAPE', type: 'select', options: ['SQUARE', 'CIRCLE', 'DIAMOND', 'CROSS'], value: 'SQUARE', tier: 3 }`.
- Pass to algorithm; `morphologyOpenCloseRGBA` must accept and apply shape parameter.
- Maintains intra-category parity with DILATE/ERODE.
- Files: `OpenCloseNode.js`, `morphology.js`

**P4 — HIGH: Add INPUT DOMAIN param**
- Add `domain: { label: 'INPUT DOMAIN', type: 'select', options: ['LUMINANCE', 'RGB LINKED', 'RGB INDEPENDENT', 'ALPHA', 'MASK', 'EDGE MAP'], value: 'RGB LINKED', tier: 3 }`.
- Route algorithm call based on selected domain before passing to morphology function.
- Files: `OpenCloseNode.js`, `morphology.js` (or domain-routing utility)

**P5 — HIGH: Add ITERATIONS param**
- Add `iterations: { label: 'ITERATIONS', type: 'range', min: 1, max: 10, step: 1, value: 1, tier: 3, previewMax: 3, unit: '×', driveable: true }`.
- Loop `morphologyOpenCloseRGBA` call `iterations` times; each pass feeds output of previous.
- `driveable: true` valid here only after P2 (correct `apply()` signature) is applied.
- Files: `OpenCloseNode.js`

**P6 — HIGH: Confirm/enforce worker offload**
- Verify that `apply()` runs inside the render worker, not on the main thread.
- If running on main thread, migrate per G12 action plan.
- Files: Pipeline / worker configuration

**P7 — MODERATE: Add MODE extensions**
- Extend `mode` options to include `OPEN-CLOSE`, `CLOSE-OPEN`, `TOPHAT`, `BLACKHAT`, `GRADIENT`.
- Route to corresponding compound algorithm sequences in `morphology.js`.
- Add `when` visibility predicate to domain-specific sub-params per G14.
- Files: `OpenCloseNode.js`, `morphology.js`

**P8 — MODERATE: Implement G14 mode-conditional param visibility**
- Once DOMAIN and extended MODE params exist, apply `when` predicates to hide domain-irrelevant controls.
- File: `OpenCloseNode.js` param definitions

**P9 — NOTE: Add FIELD output mode**
- Add `outputType: { label: 'OUTPUT', type: 'select', options: ['IMAGE', 'MASK', 'FIELD'], value: 'IMAGE', tier: 3 }`.
- IMAGE: current behaviour. MASK: cleaned-region binary output. FIELD: difference-from-source scalar field.
- Required for downstream pipeline participation as structural conditioning stage.
- Files: `OpenCloseNode.js`, algorithm

**P10 — NOTE: Confirm algorithm identity**
- Confirm whether `morphologyOpenCloseRGBA` is equivalent to the legacy `grayscaleOpen`/`grayscaleClose` with per-channel processing, or whether channel treatment differs.
- If RGBA function operates on all four channels jointly rather than independently, document the divergence and assess whether per-channel operation should be restored for LUMINANCE/RGB domain modes.
- Files: `morphology.js` — audit only

---

## Verification Criteria

- [ ] `radius` does not have `driveable: true` unless `apply()` signature includes `modulate` and the algorithm supports per-pixel radius variation.
- [ ] `apply()` signature matches `apply(src, dst, w, h, p, ctx, modulate)`.
- [ ] SHAPE param present with options SQUARE / CIRCLE / DIAMOND / CROSS; selection changes structuring element shape in algorithm output.
- [ ] INPUT DOMAIN param present; LUMINANCE and RGB LINKED produce observably different outputs on a colour image.
- [ ] ITERATIONS param present; setting to 3 produces visibly stronger morphological effect than 1 (idempotency only applies to same-operation repeats — cross-domain or alternating modes are not idempotent).
- [ ] ITERATIONS param has `driveable: true` and `previewMax: 3`.
- [ ] Extended MODE options (OPEN-CLOSE, CLOSE-OPEN, TOPHAT, BLACKHAT, GRADIENT) each produce distinct, correct output.
- [ ] Mode-conditional params hide when their parent mode/domain is not active.
- [ ] At `radius=10`, full-res render completes in worker without blocking UI.
- [ ] `radius` unit label 'px' renders in NodePanel slider row.
- [ ] Module loads without console errors and produces correct open/close output with default params.
- [ ] DILATE/ERODE and OPEN/CLOSE share the same SHAPE vocabulary and, where applicable, the same shared KernelShapeControl component.
