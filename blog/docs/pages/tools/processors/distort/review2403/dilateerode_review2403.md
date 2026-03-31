# DILATE/ERODE — Review 2403

- type: `dilateerode`
- category: MORPHOLOGY
- isVector: false
- verdict: KEEP — rebuild as morphology primitive / structure refinement system
- priority: HIGH
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies morphological dilation (neighbourhood maximum) or erosion (neighbourhood minimum) to the image using a structuring element at a given pixel radius | — |
| 1.2 | Equivalent output from another module? | OPEN/CLOSE uses the same operations internally but as a compound — no standalone dilate/erode equivalent exists | — |
| 1.3 | Verdict | KEEP — distinct morphological primitive; no equivalent in pipeline | — |
| 1.4 | Name contains "MODULE" in picker? | NO | — |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | Effect is too subtle on continuous-tone imagery at small radii; on controlled test inputs (binary, masks, edge maps) correctness is unverified — algorithm identity conflict between legacy `grayscaleDilate`/`grayscaleErode` and live `morphologyRGBA` is unresolved | WARN |
| 2.2 | Achieves stated purpose? Missing features? | Partially. Base dilate/erode delegated correctly in code, but: SHAPE param is present in UI and not forwarded to the algorithm call (zero effect); RADIUS is falsely marked driveable (apply signature omits modulate); module is framed as a direct image effect rather than a structural primitive; domain selection (luminance / RGB / alpha / mask / edge map) is entirely absent; compound modes (open, close, gradient, tophat, blackhat) absent; iteration/sequencing absent; field output mode absent | ERROR |
| 2.3 | Based on source reference? | No external source reference; standard morphological operations | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | MODE (select: DILATE/ERODE), RADIUS (range 1–10 px, driveable), SHAPE (select: SQUARE/CIRCLE) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | YES — MODE, RADIUS, SHAPE compliant | — |
| 4.3 | Primary param visible by default? | MODE + RADIUS at tier 3 — visible; SHAPE at tier 4 | — |
| 4.4 | All controls respond correctly across range? | SHAPE has zero effect — not forwarded to algorithm. RADIUS scalar functions but driveability is non-functional. Effect at small radii (1–3 px) is imperceptible on photographic imagery | ERROR |
| 4.5 | Driver slots (+D) functional? | RADIUS marked `driveable: true` but apply() omits modulate — driver modulation cannot function even if +D were fixed. +D button also broken globally (G1) | ERROR |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | RADIUS — O(w×h×(2r+1)²); at radius 10 this is a 441-tap neighbourhood per pixel. previewMax: 5 caps preview cost | — |
| 5.2 | Interactive in PREVIEW at max params? | Preview is capped at radius 5 — likely interactive. Full radius 10 in preview would be slow | — |
| 5.3 | Acceptable FULL-mode render time at max params? | At radius 10 on 4K: estimated several hundred ms to >1 s. No worker offload confirmed | WARN |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | Yes | — |
| 6.2 | Broken output at extreme param values? | No crash; at large radius on photographic source the output reads as no visible change rather than incorrect values — perceptual failure, not a NaN/corruption failure | WARN |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | SHAPE control is present and responsive in UI but has zero algorithmic effect — this is a direct UI/behaviour lie. RADIUS shows a +D button implying driver support but driver modulation is architecturally impossible in the current apply() signature. Module presents as a complete image effect when it is a low-level structural primitive that is perceptually weak on photographic imagery without domain or output framing | ERROR |
| 7.2 | Additional critique or observations? | Module should be rebuilt as a morphology primitive / structure refinement system. It should support: real kernel families (square, circle, diamond, cross, oriented line); input domain selection (luminance, RGB, alpha, mask, edge map, thresholded binary); compound operation modes (dilate, erode, open, close, gradient, tophat, blackhat); iteration/sequencing (steps, step radius, bake); field output modes (image, mask, field, hybrid); downstream driver export. Minimum acceptable upgrade: fix SHAPE forwarding, remove or honestly redesign RADIUS driveability, add domain selection, add output modes, add at least one compound mode. Perform hard validation against binary test inputs before any further development |  |

## Issues

```
[ERROR] [BUG] SHAPE param is non-functional — forwarded to UI but not to algorithm call
Location: nodes/morphology/DilateErodeNode.js line 14
Evidence: apply() calls morphologyRGBA(src, w, h, p.mode.toLowerCase(), p.radius) — p.shape is never passed. Switching SQUARE/CIRCLE produces identical output.
Impact: UI control is a lie; users cannot select a kernel shape despite the control existing.
```

```
[ERROR] [BUG] RADIUS marked driveable but apply() lacks modulate parameter — driver modulation impossible
Location: nodes/morphology/DilateErodeNode.js — radius param + apply signature
Evidence: params.radius has driveable: true but apply(src, dst, w, h, p) omits the modulate argument. p.radius is passed as a scalar with no driver influence path.
Impact: +D slot is cosmetically present but architecturally non-functional for RADIUS. Misleads users about driver capability.
```

```
[WARN] [STANDARDS] Module is framed as a direct image effect — incorrect for a morphological primitive
Location: nodes/morphology/DilateErodeNode.js — architecture
Evidence: No domain selection (luminance vs RGB vs alpha vs mask vs edge map). Morphology on raw photographic RGB is perceptually weak and confusingly subtle at small radii. Core utility is as a structural preprocessing and field-derivation stage.
Impact: Users get imperceptible output on typical source images; the module's real utility is not surfaced.
```

```
[WARN] [STANDARDS] Algorithm identity unverified — legacy docs reference grayscaleDilate/grayscaleErode; live code imports morphologyRGBA
Location: shared/algorithms/image/morphology.js
Evidence: Per-channel semantics, alpha handling, and correctness of morphologyRGBA relative to documented behaviour are unconfirmed without inspecting the algorithm file.
Impact: Correctness of the core operation on real inputs is unverified.
```

```
[WARN] [PERFORMANCE] O((2r+1)²) per-pixel cost — no worker offload confirmed; slow at full radius on large images
Location: nodes/morphology/DilateErodeNode.js — apply
Evidence: At radius 10: 441-tap neighbourhood per pixel. Estimated several hundred ms to >1 s at 4K.
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
| IMAGE | Direct pixel-space morphology output |
| MASK | Produce binary or soft mask from morphological result |
| FIELD | Export scalar field for downstream driver use |
| HYBRID | Image output + field export simultaneously |

### Core Architecture

**A. Input Domain**
LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP / THRESHOLDED BINARY / EXTERNAL FIELD

**B. Kernel**
SHAPE: SQUARE / CIRCLE / DIAMOND / HORIZONTAL LINE / VERTICAL LINE / ORIENTED LINE / CROSS
RADIUS X, RADIUS Y (anisotropic), ROTATION (for oriented), ISOTROPIC toggle

**C. Operation**
DILATE / ERODE / OPEN / CLOSE / GRADIENT / INTERNAL GRADIENT / EXTERNAL GRADIENT / TOPHAT / BLACKHAT

**D. Sequencing**
ITERATIONS, STEP RADIUS, SEQUENCE MODE, WARMUP STEPS, BAKE STATE

**E. Output**
OUTPUT TYPE (image/mask/field/hybrid), INVERT, NORMALISE, DIFFERENCE AGAINST SOURCE

### Driver Boundary
RADIUS must not be marked `driveable: true` unless the algorithm supports per-pixel varying radius. Until then: remove driveability from RADIUS; driver slots may apply to BLEND AMOUNT, OUTPUT THRESHOLD, ITERATION COUNT.

### Minimum Acceptable Upgrade
1. Fix SHAPE forwarding to algorithm or remove SHAPE from UI
2. Remove `driveable: true` from RADIUS or redesign algorithm to support it honestly
3. Verify morphologyRGBA correctness against binary test inputs (dots, lines, checkerboard)
4. Add domain selection: at minimum LUMINANCE / RGB / MASK
5. Add compound modes: OPEN and CLOSE at minimum, GRADIENT recommended
6. Add FIELD output mode

## Action Items

1. **[CRITICAL]** Fix SHAPE param — forward `p.shape` to `morphologyRGBA` or remove SHAPE from UI until algorithm supports it.
2. **[CRITICAL]** Remove `driveable: true` from RADIUS param until apply() architecture supports per-pixel radius modulation.
3. **[CRITICAL]** Verify `morphologyRGBA` against binary test inputs — confirm dilate expands bright regions, erode contracts them, shape selection produces distinct output.
4. **[HIGH]** Add INPUT DOMAIN param (LUMINANCE / RGB LINKED / RGB INDEPENDENT / ALPHA / MASK / EDGE MAP / THRESHOLDED BINARY).
5. **[HIGH]** Add compound operation modes: OPEN, CLOSE, GRADIENT, TOPHAT, BLACKHAT to MODE dropdown.
6. **[HIGH]** Add FIELD output mode — expose morphological result as scalar field for downstream driver use.
7. **[HIGH]** Add ITERATIONS param (range 1–10, previewMax: 3) for iterative application.
8. **[HIGH]** Expand kernel SHAPE set: add DIAMOND, HORIZONTAL LINE, VERTICAL LINE, CROSS, ORIENTED LINE.
9. Ensure computation runs in web worker (G12); implement separable approximation for rectangular kernels.
10. Rebuild RADIUS driveability correctly once apply() architecture supports modulate.
11. Fix +D driver button (G1).
12. Slider direct input and double-click-to-default (G5).
13. Add unit labels to all numeric params (G16) — RADIUS already has `unit: 'px'`.
14. Hide mode-conditional params per active domain and operation (G14).
