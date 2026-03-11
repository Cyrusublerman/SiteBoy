# Module Documentation Testing Guide

Testing means verifying that a completed documentation pack accurately and completely describes the module source. This is not code testing — modules are not executed here. These are documentation quality tests: cross-checking pack files against the source and against each other to confirm nothing is missing, nothing is invented, and nothing contradicts the source.

---

## 1. What "Tested" Means

A module pack is tested when:

1. Every claim in the pack can be traced to a specific location in the source node or in an archived legacy doc
2. Every feature in the source has a corresponding entry in the pack
3. Every issue in the source has a corresponding entry in `issues-and-conflicts.md`
4. The pack files do not contradict each other

Testing is done by a human (or an agent instructed to verify, not to write) reading the pack file and the source side by side. It is not automated.

---

## 2. Pre-Test Setup

Before starting verification, have both open:
- The live `*Node.js` source file
- The component-level doc in `blog/docs/components/distort/modules/<type>.md`
- All 8 pack files in the module's documentation folder

Work through the verification checklist below. Mark each item as pass or fail. A failed item requires a correction — see §5.

---

## 3. Verification Checklist

### 3.1 `description.md` verification

Read the description, the source, and the component-level doc in parallel.

- [ ] **Algorithm identification:** the description names a specific algorithm (Gaussian blur, bilateral filter, Otsu thresholding, Gray-Scott RDE). Find the corresponding implementation in the source. If no implementation is found for the stated algorithm, the description has invented content — fail.
- [ ] **Visual accuracy:** the description states what the output looks like. Confirm this matches what the module actually produces from the source logic.
- [ ] **Scope boundary:** the description states what the module does NOT do. Confirm this is accurate.
- [ ] **Algorithm origin:** if an algorithm name is stated, confirm it matches the algorithm implemented in the source.
- [ ] **No component-level doc copying:** the description must not be a literal copy of the component-level doc's summary. Read both and confirm they differ in depth and content.
- [ ] **Word count:** count the words. If under 150, fail.

### 3.2 `mechanisms.md` verification

Work through the source `apply()` function step by step.

- [ ] **Execution order accuracy:** work through `apply()` line by line. Confirm the numbered steps in `mechanisms.md` match the actual execution order. Any step in the source that is missing from the numbered list is a failure.
- [ ] **Function inventory completeness:** for every named function (class methods and module-scope helpers), confirm a row exists in the function inventory. List every function from the source and check off each one.
- [ ] **Formula accuracy:** for every formula in `mechanisms.md`, locate the corresponding code in the source. Confirm the formula matches the code. A formula that does not match is a documentation error.
- [ ] **Formula completeness:** for every non-trivial mathematical operation in the source (convolution, gradient, Gaussian weight, RDE step, threshold computation), confirm a corresponding formula appears in `mechanisms.md`.
- [ ] **Preview strategy accuracy:** identify the `ctx.quality` check in the source. Confirm `mechanisms.md` describes the exact cap(s) applied. If no cap is implemented but the module needs one, confirm it is flagged in `issues-and-conflicts.md`.

### 3.3 `ui-layout.md` verification

Work through `paramDefs` entry by entry.

- [ ] **Parameter completeness:** count the total `paramDef` entries in the source. Count the rows in the parameter table in `ui-layout.md`. The counts must match. If they differ, find which parameter is missing.
- [ ] **Parameter accuracy:** for each parameter, confirm: key matches, type matches, min/max/step/default match the source values. Any discrepancy is a documentation error.
- [ ] **Parameter description accuracy:** for each driveable param, the "Controls" column must explain what per-pixel driving does. Confirm by finding how `this.getModulated(key, pixelIdx, ctx)` is used in `apply()`.
- [ ] **Mask controls accuracy:** confirm the mask controls section matches whether `apply()` actually reads mask input.
- [ ] **Modulation targets accuracy:** confirm every param listed as driveable has `driveable: true` in the source `paramDefs`.

### 3.4 `performance.md` verification

- [ ] **Dominant operation accuracy:** read the stated dominant operation and find it in the source. If the source's most expensive loop is not the one stated, the analysis is wrong.
- [ ] **Complexity accuracy:** count the nested loops in the dominant operation. Confirm the O(n) notation is correct. n must be defined as a specific quantity (w × h, not just "number of pixels").
- [ ] **Extreme value accuracy:** for each parameter named in the extreme-value section, confirm the effect described follows from the source logic at that parameter value.
- [ ] **PREVIEW cap accuracy:** if `performance.md` states a PREVIEW cap, confirm `apply()` actually implements it via `ctx.quality` check.

### 3.5 `feature-parity.md` verification

- [ ] **Component-level doc coverage:** for every feature described in `blog/docs/components/distort/modules/<type>.md`, confirm it appears in the feature inventory table with an accurate status.
- [ ] **Parity hole accuracy:** for each entry in the parity holes section, confirm that the feature is genuinely absent from the live source (by searching the source for the relevant code or paramDef key).
- [ ] **Module standard audit accuracy:** for each item in the module standard feature audit (mask, driver, buildGeometry, destroy, PREVIEW cap, presets), confirm the stated usage against the source.

### 3.6 `issues-and-conflicts.md` verification

- [ ] **Standards compliance completeness:** every item in `build-module.md §8` must have an entry in the standards compliance check.
- [ ] **Evidence accuracy:** for every `[WARN]` or `[ERROR]` issue, the Evidence field must quote or precisely reference something actually present in the source. If the quoted code does not appear in the source, the issue is invented and must be removed.
- [ ] **Worker compliance checked:** confirm the source was searched for `document.`, `window.`, `fetch`, `requestAnimationFrame`, `setInterval`.
- [ ] **Param modulation checked:** confirm every driveable param was verified to use `this.getModulated(...)` in `apply()`.

### 3.7 Cross-file consistency

- [ ] **Param count consistency:** the parameter count in `ui-layout.md` must match `paramDefs` entry count in the source.
- [ ] **Parity hole carryover:** every parity hole in `feature-parity.md §7.3` must appear as a `[NOTE] [PARITY]` issue in `issues-and-conflicts.md`.
- [ ] **Performance carryover:** complexity findings in `performance.md` must appear in `issues-and-conflicts.md` if they represent a risk.

---

## 4. Pass Criteria

A pack passes testing when all checklist items above are marked pass. There is no partial credit — a single failed item means the pack fails testing and requires correction.

---

## 5. Fail Protocol

When a checklist item fails:

1. **Identify the specific error:** note which file, which section, and what is wrong (invented content, missing entry, mismatched value)

2. **Classify the error type:**
   - Missing content → return to the relevant step in `document-module.md` and add the missing content
   - Incorrect content → correct the specific value, formula, or description; do not rewrite the whole file
   - Invented content → remove the invented claim; add a NOTE to `issues-and-conflicts.md` if the invented content was an attempt to fill a genuine gap

3. **Correct only the failing section** — do not touch passing sections during correction

4. **Re-run the checklist for the corrected file** — do not assume the correction introduced no new errors

5. **Update the review score** from `review-and-correction-loop.md`
