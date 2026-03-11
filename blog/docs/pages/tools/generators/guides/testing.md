# Generator Documentation Testing Guide

Testing in this context means verifying that a completed documentation pack accurately and completely describes the generator source. This is not code testing — the generator scripts are not executed here. These are documentation quality tests: cross-checking the pack files against the source and against each other to confirm nothing is missing, nothing is invented, and nothing contradicts the source.

---

## 1. What "Tested" Means

A generator pack is tested when:

1. Every claim in the pack can be traced to a specific location in the source or in an archived legacy doc
2. Every feature in the source has a corresponding entry in the pack
3. Every issue in the source has a corresponding entry in `issues-and-conflicts.md`
4. The pack files do not contradict each other

Testing is done by a human (or an agent instructed to verify, not to write) reading the pack file and the source side by side. It is not automated.

---

## 2. Pre-Test Setup

Before starting verification, have both open:
- The live `.gen.js` source file
- All 8 pack files in the generator's documentation folder

Work through the verification checklist below. Mark each item as pass or fail. A failed item requires a correction — see §5.

---

## 3. Verification Checklist

### 3.1 `description.md` verification

Read the description and the source in parallel.

- [ ] **Model identification:** the description names a mathematical or physical model (e.g. "Keplerian orbital mechanics", "front-chain circle packing"). Find the corresponding implementation in the source. If no implementation is found for the stated model, the description has invented content — fail.
- [ ] **Visual accuracy:** the description states what the output looks like. Confirm this matches what the generator actually produces from the source logic.
- [ ] **Scope boundary:** the description states what the generator does NOT do. Confirm this is accurate (i.e. the source genuinely does not do those things).
- [ ] **Algorithm origin:** if an algorithm name is stated, confirm it matches the algorithm implemented in the source.
- [ ] **No SCRIPT_CONFIG copying:** the description must not be a literal copy of `SCRIPT_CONFIG.description`. Read both and confirm they are different in content and depth.
- [ ] **Word count:** count the words. If under 150, fail.

### 3.2 `mechanisms.md` verification

Work through the source function by function.

- [ ] **State model completeness:** for every `this.*` assignment in the source, confirm a row exists in the state model table. Extract each `this.xxx = ...` from the source and check off each one.
- [ ] **Function inventory completeness:** for every named function (module-level and SCRIPT_CONFIG methods), confirm a row exists in the function inventory. List every `function name(...)` and `methodName(...)` from the source and check off each one.
- [ ] **Formula accuracy:** for every formula in `mechanisms.md`, locate the corresponding code in the source. Confirm the formula matches the code. A formula that does not match the code is an error in the documentation.
- [ ] **Formula completeness:** for every non-trivial mathematical operation in the source (`Math.sin`, `Math.cos`, `Math.atan2`, division of two meaningful quantities, physics update rules), confirm a corresponding formula appears in `mechanisms.md`. List the mathematical operations in the source and check off each one.
- [ ] **Render loop accuracy:** work through the `p5Draw` or `draw` function line by line. Confirm the numbered steps in `mechanisms.md` match the actual execution order. Any step in the source that is missing from the numbered list is a failure.
- [ ] **Rebuild mechanism accuracy:** identify the rebuild detection code in the source. Confirm that `mechanisms.md` names the correct parameter keys and the correct detection mechanism.

### 3.3 `ui-layout.md` verification

Work through SCRIPT_CONFIG.parameters entry by entry.

- [ ] **Parameter completeness:** count the total number of parameter entries in `SCRIPT_CONFIG.parameters` (across all groups). Count the rows in the parameter table in `ui-layout.md`. The counts must match. If they differ, find which parameter is missing.
- [ ] **Parameter accuracy:** for each parameter, confirm: key matches, type matches, min/max/step/default match the source values. Any discrepancy is a documentation error.
- [ ] **Parameter description accuracy:** for each parameter, the "Controls" column must describe what the parameter actually does in the render. Confirm this by finding the parameter key in the render hook and verifying that the described effect matches how the key is used.
- [ ] **Rebuild flag accuracy:** for each parameter, the "Rebuild?" column must match the rebuild mechanism. Check each rebuild-sensitive key against the detection code in the source.
- [ ] **Preset completeness:** count the presets in `SCRIPT_CONFIG.presets`. Count the rows in the preset table. Must match. For each preset, every parameter value listed in `ui-layout.md` must match the corresponding value in the source preset object.
- [ ] **Sidebar structure accuracy:** confirm the tab names and group names in the sidebar structure section match the actual structure of `SCRIPT_CONFIG.parameters`.

### 3.4 `performance.md` verification

- [ ] **Dominant operation accuracy:** read the stated dominant operation and find it in the source. If the source's most expensive loop is not the one stated, the analysis is wrong.
- [ ] **Complexity accuracy:** count the nested loops in the identified dominant operation. Confirm the O(n) notation is correct. Example: two nested loops over `circles` = O(n²); multiplied by `collisionPasses` = O(n² × collisionPasses). Both factors must appear.
- [ ] **Extreme value accuracy:** for each parameter named in the extreme-value section, confirm the effect described actually follows from the source logic at that parameter value.
- [ ] **Worker feasibility accuracy:** the stated blocking dependencies must be real dependencies in the source (e.g. if `p5 instance` is listed as a blocking dependency, confirm the source actually uses the p5 `p` object in the render hook).

### 3.5 `feature-parity.md` verification

- [ ] **Legacy doc coverage:** for every legacy file in `reference/generators/<id>/legacy-docs/`, confirm that features from that file appear in the feature inventory table. If a legacy file is listed in the archive but none of its features appear in the table, the inventory is incomplete.
- [ ] **Parity hole accuracy:** for each entry in the parity holes section, confirm that the feature is genuinely absent from the live source (by searching the source for the relevant code).
- [ ] **Host feature audit accuracy:** for each host feature in the audit table, confirm the stated usage against the source. If `animation config: Yes` is stated but `SCRIPT_CONFIG.animation` is absent, the entry is wrong.

### 3.6 `issues-and-conflicts.md` verification

- [ ] **Standards compliance check completeness:** every item in `build-page.md` §8 (the generator script checklist) must have an entry in the standards compliance check. If any item is absent, the check is incomplete.
- [ ] **Evidence accuracy:** for every `[WARN]` or `[ERROR]` issue, the Evidence field must quote or precisely reference something actually present in the source. If the quoted code does not appear in the source, the issue is invented and must be removed.
- [ ] **No missing obvious issues:** confirm the following were checked even if the result is pass: `p.noLoop()` presence (p5 generators), non-VGA colour usage, DOM access, `requestAnimationFrame`/`setInterval`, inline algorithm duplication.

### 3.7 Cross-file consistency

- [ ] **Parameter count consistency:** the number of parameters in `mechanisms.md` state model must be consistent with `ui-layout.md` parameter table. The state model covers `this.*` variables, not parameters, but rebuild-sensitive parameters must appear in both `ui-layout.md` and `mechanisms.md` §rebuild mechanism.
- [ ] **Issue carryover:** every parity hole in `feature-parity.md` must appear as a `[NOTE] [PARITY]` issue in `issues-and-conflicts.md`.
- [ ] **Performance carryover:** complexity findings in `performance.md` must be echoed in `issues-and-conflicts.md` if they represent a risk (i.e. if there is no cap parameter bounding the complexity).

---

## 4. Pass Criteria

A pack passes testing when all checklist items above are marked pass. There is no partial credit for testing — a single failed item means the pack fails testing and requires correction.

---

## 5. Fail Protocol

When a checklist item fails:

1. **Identify the specific error:** note which file, which section, and what is wrong (invented content, missing entry, mismatched value, etc.)

2. **Classify the error type:**
   - Missing content → return to the relevant step in `document-generator.md` and add the missing content
   - Incorrect content → correct the specific value, formula, or description; do not rewrite the whole file
   - Invented content → remove the invented claim; add a NOTE to `issues-and-conflicts.md` if the invented content was an attempt to fill a genuine gap

3. **Correct only the failing section** — do not touch passing sections during correction

4. **Re-run the checklist for the corrected file** — do not assume the correction introduced no new errors

5. **Update the review score** from `review-and-correction-loop.md`
