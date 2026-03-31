# OPEN/CLOSE — Review 2403

- type: `openclose`
- category: MORPHOLOGY
- isVector: false
- verdict: KEEP — rebuild as compound morphology cleanup and structure-conditioning system
- priority: HIGH
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies morphological opening (erode then dilate) or closing (dilate then erode), suppressing small bright features (OPEN) or filling small dark gaps (CLOSE) while preserving surviving boundary positions better than a single-pass extremum | — |
| 1.2 | Equivalent output from another module? | DILATE/ERODE applies constituent operations individually — OPEN/CLOSE is a distinct compound operation with no equivalent in the pipeline | — |
| 1.3 | Verdict | KEEP — valid compound morphological primitive; meaningful output distinct from all other modules | — |
| 1.4 | Name contains "MODULE" in picker? | NO | — |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | YES — unlike DILATE/ERODE, output is clearly visible: image becomes structurally simplified, softer, and topologically cleaned. Core compound operation is functioning | — |
| 2.2 | Achieves stated purpose? Missing features? | Core open/close functions. Missing: SHAPE/kernel control (structuring element shape is hidden inside algorithm, cannot be user-selected); domain selection (luminance / RGB / alpha / mask / edge map — locked to direct RGBA image only); extended operation modes (OPEN-CLOSE, CLOSE-OPEN, TOPHAT, BLACKHAT, GRADIENT); sequencing/iteration control; residue/field output modes | WARN |
| 2.3 | Based on source reference? | No external source reference; standard morphological operations | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | MODE (select: OPEN/CLOSE), RADIUS (range 1–10 px, driveable) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | YES — MODE, RADIUS compliant | — |
| 4.3 | Primary param visible by default? | Both at tier 3 — visible | — |
| 4.4 | All controls respond correctly across range? | MODE and RADIUS function correctly. No SHAPE param present (unlike DILATE/ERODE — intra-category inconsistency). RADIUS driveability is non-functional | WARN |
| 4.5 | Driver slots (+D) functional? | RADIUS marked `driveable: true` but apply() omits modulate — driver modulation impossible. +D button also broken globally (G1) | ERROR |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | RADIUS — double-pass O(w×h×(2r+1)²×2); at radius 10: 882-tap equivalent per pixel. Cost class D at full resolution. previewMax: 5 | — |
| 5.2 | Interactive in PREVIEW at max params? | Preview capped at radius 5 — likely interactive | — |
| 5.3 | Acceptable FULL-mode render time at max params? | At radius 10, 4K: potentially >500 ms. No worker offload confirmed | WARN |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | Yes | — |
| 6.2 | Broken output at extreme param values? | No crash or NaN at large radius — output becomes heavily simplified but is valid morphology behaviour | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | RADIUS is marked driveable but driver modulation is architecturally impossible in the current apply() signature — same standards failure as DILATE/ERODE. No SHAPE param despite DILATE/ERODE having one — inconsistency within MORPHOLOGY category. Effect reads as blur or oil-smear simplification without framing that explains its structural cleanup role | WARN |
| 7.2 | Additional critique or observations? | Unlike DILATE/ERODE, this module's core is working and valuable. It should be reframed as a compound morphology cleanup and structure-conditioning system with domain selection, kernel control, residue/field outputs, and sequence extensions. It has strong utility as a pre-processing stage for halftone, dither, stipple, tessellation, painterly synthesis, and mask generation workflows | — |

## Issues

```
[ERROR] [BUG] RADIUS marked driveable but apply() lacks modulate parameter — driver modulation impossible
Location: nodes/morphology/OpenCloseNode.js — radius param + apply signature
Evidence: params.radius has driveable: true but apply(src, dst, w, h, p) omits modulate. p.radius is passed as a scalar; no driver influence path exists.
Impact: +D slot is cosmetically present but architecturally non-functional for RADIUS. Misleads users.
```

```
[WARN] [STANDARDS] No SHAPE/kernel control — structuring element shape is implicit in algorithm
Location: nodes/morphology/OpenCloseNode.js — params
Evidence: No shape param. DILATE/ERODE exposes SHAPE (SQUARE/CIRCLE). OPEN/CLOSE does not — intra-category inconsistency within MORPHOLOGY.
Impact: User cannot control whether open/close uses isotropic (circle), axis-aligned (square), or directional (line/cross) structuring element.
```

```
[WARN] [STANDARDS] Module locked to direct RGBA image morphology — no domain selection
Location: nodes/morphology/OpenCloseNode.js — apply
Evidence: No domain param. morphologyOpenCloseRGBA operates on raw image pixels only. No path to luminance-only, alpha, mask, or edge-map morphology.
Impact: Module is framed as a direct image cleaner only; its primary utility as a mask and field conditioning stage is entirely inaccessible.
```

```
[NOTE] [PARITY] Extended compound operations absent — TOPHAT, BLACKHAT, OPEN-CLOSE, CLOSE-OPEN, GRADIENT not implemented
Location: nodes/morphology/OpenCloseNode.js — mode param
Evidence: Mode dropdown contains only OPEN and CLOSE.
Impact: Second-order morphological transforms (tophat, blackhat, alternating filters) unavailable.
```

```
[NOTE] [PARITY] No residue or field output — module cannot export structural results downstream
Location: nodes/morphology/OpenCloseNode.js — apply
Evidence: Output is always a modified image. No difference field, residue mask, cleaned-region mask, or driver output.
Impact: Module cannot participate in the pipeline as a structural conditioning stage feeding downstream modules.
```

```
[WARN] [PERFORMANCE] Double-pass O((2r+1)²) cost — no worker offload confirmed; >500 ms at radius 10, 4K
Location: nodes/morphology/OpenCloseNode.js — apply
Evidence: Performance class D at full resolution, max radius. No separable approximation.
Impact: Unacceptable render time at max params on large images without worker offload.
```

```
[ERROR] [BUG] Driver slot +D button non-functional — see G1
Location: NodePanel — all param +D buttons
```

## Required Rebuild Specification

### Operating Modes

| Mode | Notes |
|---|---|
| IMAGE | Direct compound morphology output on chosen domain |
| MASK | Cleaned or filled binary/soft mask output |
| FIELD | Residue or structural scalar field for downstream use |
| HYBRID | Image output + field export simultaneously |

### Core Architecture

**A. Input Domain**
LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / THRESHOLDED LUMINANCE / EDGE MAP / EXTERNAL FIELD

**B. Kernel**
SHAPE: SQUARE / CIRCLE / DIAMOND / HORIZONTAL LINE / VERTICAL LINE / ORIENTED LINE / CROSS
RADIUS X, RADIUS Y (anisotropic), ROTATION (for oriented kernels), ISOTROPIC toggle

**C. Operation**
OPEN / CLOSE / OPEN-CLOSE / CLOSE-OPEN / TOPHAT / BLACKHAT / GRADIENT / ALTERNATING SEQUENTIAL FILTER

**D. Sequencing**
ITERATIONS, SEQUENCE TYPE, ALTERNATING COUNT, WARMUP STEPS, BAKE STATE, PREVIEW CAP, FINAL CAP

**E. Output**
OUTPUT TYPE (image/field/mask/hybrid), INVERT, NORMALISE, RESIDUE OUTPUT, DOWNSTREAM DRIVER EXPORT

### Driver Boundary
RADIUS must not be `driveable: true` unless the algorithm supports per-pixel varying radius. Remove driveability from RADIUS; allow drivers on BLEND AMOUNT, OUTPUT THRESHOLD, ITERATION COUNT.

### Minimum Acceptable Upgrade
1. Remove `driveable: true` from RADIUS or redesign to support it honestly
2. Add SHAPE param to match DILATE/ERODE (intra-category consistency)
3. Add INPUT DOMAIN selection (at minimum: LUMINANCE / RGB / MASK)
4. Add OPEN-CLOSE and CLOSE-OPEN to MODE dropdown
5. Add at least one residue/field output mode (difference from source, or cleaned-mask output)

## Action Items

1. **[CRITICAL]** Remove `driveable: true` from RADIUS param until apply() supports per-pixel radius modulation.
2. **[HIGH]** Add SHAPE param (SQUARE / CIRCLE / DIAMOND / CROSS) — match DILATE/ERODE for intra-category consistency.
3. **[HIGH]** Add INPUT DOMAIN param (LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP).
4. **[HIGH]** Extend MODE dropdown: OPEN / CLOSE / OPEN-CLOSE / CLOSE-OPEN / TOPHAT / BLACKHAT / GRADIENT.
5. **[HIGH]** Add FIELD output mode — export residue, cleaned-mask, or difference-from-source as scalar field.
6. **[HIGH]** Add ITERATIONS param (range 1–10, previewMax: 3) for sequential application.
7. Ensure computation runs in web worker (G12); implement separable approximation for rectangular kernels.
8. Fix +D driver button (G1).
9. Audit remaining params for `driveable: true` once apply() architecture is corrected (G2).
10. Slider direct input and double-click-to-default (G5).
11. Add unit label to RADIUS (G16) — add `unit: 'px'`.
12. Hide mode-conditional params per active domain and operation (G14).
