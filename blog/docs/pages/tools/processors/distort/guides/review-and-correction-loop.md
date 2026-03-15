# Review and Correction Loop

Use this guide after any agent or developer produces a documentation pack. The pack is not accepted until it passes all criteria below. Score each file, identify failures, correct them, and re-score. A module's migration is complete only when it scores 8/8.

---

## 1. Pass Criteria Per File

### `source-reference.md` — pass requires all of:

- [ ] Source node path is present and correct
- [ ] Registry path is present (`nodes/registry.js`)
- [ ] Pipeline path is present (`core/Pipeline.js`)
- [ ] Archive destination path is present for the source node
- [ ] Component-level doc archive entry is present (or "not found" if absent)
- [ ] Every file has a classification from `classify-reference-material.md`
- [ ] Algorithm imports section is present (or "none — all computation is inline")

**Fail signals:** file is under 10 lines; classifications are absent; archive paths are missing; algorithm imports section absent.

---

### `description.md` — pass requires all of:

- [ ] States the specific algorithm name or mathematical class — not just the display name
- [ ] Describes the visual output (what changes in an image when this module is applied)
- [ ] States what makes this module distinct from similar modules in the same category
- [ ] States the algorithm origin or reference name if one exists; or explicitly states "bespoke" or "heuristic"
- [ ] Includes a scope boundary (what the module does NOT do)
- [ ] Minimum 150 words

**Fail signals:** file under 150 words; the algorithm content is only the category name or a description copied verbatim from the component-level doc; no scope boundary present.

---

### `mechanisms.md` — pass requires all of:

- [ ] `apply()` execution order: numbered steps in source order covering the complete function
- [ ] Function inventory table: every named function with role, inputs, output, and complexity
- [ ] At least one formula written in explicit inline notation with all symbols defined — unless the module has zero mathematical operations (must be explicitly stated)
- [ ] Preview strategy section: the exact cap(s) implemented, or explicit statement that no cap is needed and why

**Fail signals:** file has only function name lists with no descriptions; no formulas when source clearly contains convolution, gradient, or signal-processing operations; execution order absent; preview strategy absent.

---

### `ui-layout.md` — pass requires all of:

- [ ] Parameter table: every `paramDef` entry with key, label, type, min/max/step/default, tier, driveable, and what it controls in the render
- [ ] Mask controls section: whether this module uses masks and how
- [ ] Modulation targets section: every driveable param listed with what per-pixel driving does
- [ ] UX notes section: at minimum one note, or explicit statement "no UX concerns identified"

**Fail signals:** only key names listed with no descriptions; mask controls section absent; modulation targets absent; entire param table missing.

---

### `performance.md` — pass requires all of:

- [ ] Dominant operation named specifically
- [ ] Complexity stated in O(n) notation with n defined (n must be specific: "n = w × h", not "n = number of pixels")
- [ ] At least one extreme parameter value analysed
- [ ] Render cost class assigned (A, B, C, or D) for PREVIEW and FULL separately
- [ ] At least one mitigation candidate listed, or explicit statement that no obvious mitigation exists

**Fail signals:** no complexity notation; extreme values not analysed; render cost class absent; no mitigation candidates.

---

### `feature-parity.md` — pass requires all of:

- [ ] Feature inventory table: for each feature in the component-level doc, status in live source (Confirmed / Changed / Absent / Conflicting), location in source or reason for absence
- [ ] Module standard feature audit table: mask support, driver system (`driveable` params), `applyVector`/`isVector`, `destroy`, PREVIEW cap (`previewMax` or inline), presets — each with Yes/No and notes
- [ ] Parity holes: explicit numbered list — not "none identified" unless the feature inventory genuinely shows every feature is confirmed

**Fail signals:** feature inventory absent when component-level doc exists; module standard feature audit absent; parity holes section says only "none" without examination.

---

### `issues-and-conflicts.md` — pass requires all of:

- [ ] Standards compliance check: each item from `build-module.md §8` explicitly marked pass or fail with evidence
- [ ] At least one issue recorded (even if all items pass, there is typically at least one NOTE from parity or escalation)
- [ ] Every issue uses the format from `issue-flagging.md`
- [ ] Bug detection: evidence that the source was read for pixel index bounds, NaN propagation, and param modulation wiring
- [ ] Performance risks section referencing the complexity identified in `performance.md`

**Fail signals:** compliance check absent or has generic pass/fail without evidence; no issues recorded when the module has driveable params, O(n×param) cost, or missing PREVIEW caps; issue records missing Location or Evidence fields.

---

### `migration-log.md` — pass requires all of:

- [ ] Date recorded
- [ ] Every input file listed with its path and classification
- [ ] Every archive output listed with path and copied/not-found status
- [ ] Pack files produced listed

**Fail signals:** date absent; archive outputs not listed; input files not listed with paths.

---

## 2. Scoring

Score each file as pass (1) or fail (0). Maximum score: 8/8.

Record the score and failures:

```
Pack score: 6/8
Failing files:
- mechanisms.md: no formulas; execution order is a single paragraph not numbered steps
- ui-layout.md: mask controls section absent; modulation targets absent
```

A module's migration is not complete until it scores 8/8.

---

## 3. Correction Protocol

For each failing file:

1. **Identify specifically which required element is missing** — use the pass criteria above. Do not re-do the whole file if only one element is missing.

2. **Return to the relevant step in `document-module.md`** — each file has a corresponding step. Reread only the instructions for that file's step.

3. **Rewrite only the failing section of the failing file** — do not modify passing files during correction.

4. **Re-score the corrected file** — recheck all pass criteria for that file, not just the element you added.

5. **Update the score record.**

Example correction path:
- `mechanisms.md` fails because formulas are absent
- Return to `document-module.md` Step 4 §4.3 Mathematical model
- Read every formula in the source node
- Write each formula in the required notation with variable definitions
- Re-read the full `mechanisms.md` pass criteria above
- Confirm all other criteria still pass
- Update score

---

## 4. Agent Compliance Pre-Check

Before running the full scoring above, perform this quick pre-check on three files. If any fail, reject the run immediately and rerun from Step 0 of `document-module.md`.

**Check 1 — `description.md`:**
Read the file. Does it name a specific algorithm (Gaussian blur, Otsu thresholding, Gray-Scott RDE, bilateral filter)? Is there a scope boundary sentence ("This module does not...")? Is it longer than 150 words?

If the file contains only: the display name, the category, and a sentence copied verbatim from the component-level doc → **reject immediately**.

**Check 2 — `mechanisms.md`:**
Read the file. Is there a numbered execution order for `apply()`? Is there a function inventory table with at least 2 rows? Is there at least one formula in explicit notation?

If the file contains only: a "This module performs a Gaussian blur" paragraph, a list of param keys, and "no preview cap detected" → **reject immediately**.

**Check 3 — `ui-layout.md`:**
Read the file. Is there a parameter table with a row for every `param` key (including `value` column, not `default`)? Is there a mask controls section? Is there a modulation targets section?

If the file contains only: a tier list, a count of driveable params, and a single UX note → **reject immediately**.

---

## 5. Do Not Close Until 8/8

A module's migration todo must not be closed until:
1. All 8 files pass their criteria
2. The archive contains the source node and component-level doc
3. `inventory.md` has been updated to reflect pack status `complete`
4. The score has been explicitly confirmed as 8/8
