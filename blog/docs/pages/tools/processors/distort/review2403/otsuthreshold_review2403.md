# OTSU THRESH — Review 2403

- type: `otsuthreshold`
- category: SEGMENTATION
- isVector: false
- verdict: KEEP — expand as threshold and segmentation primitive system
- priority: MEDIUM
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Computes a global automatic threshold via Otsu's method on BT.601 luminance and renders either a binary black/white segmentation or a masked source image (foreground passes through, background zeroed) | — |
| 1.2 | Equivalent output from another module? | DITHER and POSTERIZE produce tonal reduction but not automatic segmentation — no equivalent exists in the pipeline | — |
| 1.3 | Verdict | KEEP — unique segmentation primitive; correct implementation; no equivalent | — |
| 1.4 | Name contains "MODULE" in picker? | NO | — |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | YES — output shows expected hard binary class split, correct foreground/background segmentation on luminance, alpha preserved | — |
| 2.2 | Achieves stated purpose? Missing features? | Core Otsu segmentation is correct. Missing: computed threshold value is not exposed; no threshold bias/offset control; domain locked to luminance only (no R/G/B/saturation/chroma/gradient/external field); no soft threshold output; no post-segmentation cleanup (hole fill, island removal, morphological open/close); no field output mode; no multi-level Otsu; no adaptive/local threshold variants | WARN |
| 2.3 | Based on source reference? | Otsu's method (1979, IEEE) is the canonical reference; implementation is a standard single-class derivation | — |

## Section 3 — Source Parity

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 3.1 | Features absent vs source reference? | Multi-level Otsu (N thresholds, N+1 classes) not implemented — single binary threshold only | NOTE |
| 3.2 | Visual output matches source reference? | YES — single-threshold binary output is correct for standard Otsu | — |
| 3.3 | Performance matches expectations? | YES — O(n) fixed cost; fast at any resolution | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | MODE (select: BINARY/MASK), INVERT (toggle) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | YES — MODE, INVERT compliant | — |
| 4.3 | Primary param visible by default? | Both at tier 3 — visible | — |
| 4.4 | All controls respond correctly across range? | YES — MODE and INVERT respond correctly; no range params | — |
| 4.5 | Driver slots (+D) functional? | No driveable params on this module — no +D slots | — |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | None — fixed O(n) over pixel count | — |
| 5.2 | Interactive in PREVIEW at max params? | YES — no scaling concern | — |
| 5.3 | Acceptable FULL-mode render time at max params? | YES — fast at any resolution | — |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | YES | — |
| 6.2 | Broken output at extreme param values? | No range params; INVERT is safe; no crash or NaN conditions | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | Module computes and uses a threshold internally but does not surface it — the user has no visibility into the computed threshold value and no way to bias, offset, or override it. On low-contrast or near-uniform images, the automatic threshold may produce a nonsensical split with no recourse. UI is technically truthful but operationally opaque | WARN |
| 7.2 | Additional critique or observations? | This is one of the cleanest modules in the set — implementation is correct, efficient, and coherent. Its weakness is scope, not correctness. It should be reframed as one thresholding method inside a broader segmentation primitive system: Otsu is mode 1; manual, percentile, and adaptive local thresholds would follow. The expansion priority is: (1) expose computed threshold value, (2) add threshold bias/offset, (3) add domain selection, (4) add cleanup stage, (5) add field output. Module has strong upstream utility for morphology, stipple, halftone, tessellation, and painterly region logic | — |

## Issues

```
[WARN] [STANDARDS] Computed threshold value is not exposed — module operates as a black box
Location: nodes/segmentation/OtsuThresholdNode.js — apply()
Evidence: otsuThreshold(luma) returns { threshold: t }. t is used internally but never surfaced to UI or metadata.
Impact: User cannot see, bias, or override the computed threshold. On difficult images (low contrast, non-bimodal histogram) the result is uncontrollable.
```

```
[WARN] [STANDARDS] No threshold bias or offset control
Location: nodes/segmentation/OtsuThresholdNode.js — params
Evidence: No BIAS, OFFSET, or NUDGE param. Only INVERT.
Impact: User must accept Otsu's computed value unconditionally; cannot shift the decision boundary.
```

```
[WARN] [STANDARDS] Domain locked to BT.601 luminance — no alternative input domain
Location: nodes/segmentation/OtsuThresholdNode.js — apply()
Evidence: luma[i] = 0.299*R + 0.587*G + 0.114*B hardcoded. No domain selection.
Impact: Cannot threshold on R/G/B channels, saturation, chroma magnitude, gradient magnitude, or external fields. Many useful segmentations are not luminance-driven.
```

```
[NOTE] [PARITY] No post-segmentation cleanup — thresholded output often contains speckle, holes, and isolated islands
Location: nodes/segmentation/OtsuThresholdNode.js — apply()
Evidence: Hard binary output only; no hole fill, island removal, morphological cleanup, or area filter.
Impact: Users must chain morphology modules manually to obtain clean segmentation masks.
```

```
[NOTE] [PARITY] No field output mode — module cannot export segmentation result for downstream pipeline use
Location: nodes/segmentation/OtsuThresholdNode.js — apply()
Evidence: Outputs only modified image pixels. No binary region field, soft mask, class index, or driver output.
Impact: Module cannot function as a structural conditioning stage feeding downstream modules.
```

```
[NOTE] [PARITY] Multi-level Otsu not implemented — single binary threshold only
Location: nodes/segmentation/OtsuThresholdNode.js — apply()
Evidence: Single t value; `luma[i] > t ? 1 : 0`. No multi-class partitioning.
Impact: Cannot produce 3-class or 4-class segmentation output.
```

## Required Rebuild Specification

### Operating Modes

| Mode | Notes |
|---|---|
| BINARY | Hard black/white segmentation |
| MASK | Source colours in foreground, black background |
| SOFT MASK | Sigmoid-smoothed boundary, user-controlled softness |
| FIELD | Binary/soft region scalar for downstream use |

### Core Architecture

**A. Input Domain**
LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA MAGNITUDE / GRADIENT MAGNITUDE / LOCAL CONTRAST / BLURRED LUMINANCE / EXTERNAL FIELD

**B. Threshold Method**
OTSU GLOBAL / MANUAL / PERCENTILE / ADAPTIVE LOCAL MEAN / ADAPTIVE LOCAL GAUSSIAN / HYSTERESIS DUAL / MULTI-LEVEL OTSU

**C. Threshold Control**
THRESHOLD READOUT (display only), THRESHOLD OFFSET (−128 to +128), SOFTNESS (for soft mask mode), INVERT, CLASS BALANCE BIAS

**D. Cleanup Stage**
HOLE FILL (toggle), ISLAND REMOVE (min area), OPEN RADIUS, CLOSE RADIUS — applied post-threshold before output

**E. Output**
OUTPUT TYPE (binary/mask/soft mask/field), EXPOSE THRESHOLD VALUE, EXPORT TO DRIVER SYSTEM

### Minimum Acceptable Upgrade
1. Expose computed threshold value in UI (read-only display)
2. Add THRESHOLD OFFSET param (−128 to +128, step 1, default 0)
3. Add INPUT DOMAIN selection (at minimum: LUMINANCE / RED / GREEN / BLUE / SATURATION)
4. Add SOFT MASK output mode (sigmoid around threshold, SOFTNESS param)
5. Add FIELD output mode — expose segmentation result for downstream use

## Action Items

1. **[HIGH]** Expose computed threshold `t` as a read-only display value in the NodePanel.
2. **[HIGH]** Add THRESHOLD OFFSET param (range −128 to +128, step 1, default 0) — shifts computed threshold before binarisation; hide when method is MANUAL (G14).
3. **[HIGH]** Add INPUT DOMAIN param (LUMINANCE / RED / GREEN / BLUE / SATURATION / CHROMA / GRADIENT MAGNITUDE / EXTERNAL FIELD).
4. **[HIGH]** Add SOFT MASK output mode — sigmoid(luma − t, softness); add SOFTNESS param (range 0–64, step 1, default 8), visible only when SOFT MASK active (G14).
5. **[HIGH]** Add FIELD output mode — export segmentation result as scalar field for downstream driver use.
6. Add CLEANUP stage params: HOLE FILL (toggle), ISLAND MIN AREA (range 0–500 px², step 1); hide when cleanup is off (G14).
7. Add MULTI-LEVEL OTSU as a future method option (CLASSES param 2–4).
8. Fix +D driver button (G1) for any numeric params added.
9. Slider direct input and double-click-to-default (G5) for new numeric params.
10. Add unit labels (G16) to new numeric params (OFFSET: none/raw value; SOFTNESS: none; ISLAND MIN AREA: px²).
