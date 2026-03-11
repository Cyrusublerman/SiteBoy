# Review and Correction Loop

Use this guide after any agent or developer produces a documentation pack. The pack is not accepted until it passes all criteria below. Score each file, identify failures, correct them, and re-score. A generator's migration is complete only when it scores 8/8.

---

## 1. Pass Criteria Per File

### `source-reference.md` — pass requires all of:

- [ ] Live script path is present and correct
- [ ] Registry path is present (`script-registry.js`)
- [ ] Host path is present (`generative-tool-host.js`)
- [ ] Archive destination path is present for the live script
- [ ] Every legacy file in the archive has an entry (or "none located" if genuinely absent)
- [ ] Every file has a classification from `classify-reference-material.md`

**Fail signals:** file is under 10 lines; classifications are absent; archive paths are missing.

---

### `description.md` — pass requires all of:

- [ ] States the mathematical or physical model — not just the SCRIPT_CONFIG `description` field copy
- [ ] Describes the visual output (what it looks like, what shapes or motion are present)
- [ ] States what makes the generator distinct from related generators in its category
- [ ] States the algorithm origin or reference name if one exists; or explicitly states "heuristic"
- [ ] Includes a scope boundary (what the generator does NOT do)
- [ ] Minimum 150 words

**Fail signals:** file is under 150 words; the only mathematical content is the category name or context type; the description is identical to the SCRIPT_CONFIG `description` field; no scope boundary present.

---

### `mechanisms.md` — pass requires all of:

- [ ] State model table: every `this.*` variable with type, what it holds, when initialised, when it mutates, and what triggers reset
- [ ] Function inventory table: every named function with role, inputs, output, and complexity
- [ ] At least one formula written in explicit inline notation with all symbols defined — unless the source contains zero mathematical operations (which must be explicitly stated)
- [ ] Render loop: numbered steps in source order covering the complete `p5Draw` or `draw` function
- [ ] Rebuild mechanism: identifies which params trigger a rebuild vs. are applied live, and how the detection works

**Fail signals:** file has only function name lists with no descriptions; no formulas when the source clearly contains trigonometry, physics, or wave equations; render loop order absent; state model absent; rebuild mechanism not described.

---

### `ui-layout.md` — pass requires all of:

- [ ] Parameter table: every parameter in `SCRIPT_CONFIG.parameters` with key, label, type, min, max, step, default, group, what it controls in the render, and whether it triggers a rebuild
- [ ] Preset table: every preset with name, all parameter values, and a description of the visual character it produces
- [ ] Sidebar structure: tabs in order, blocks under each tab, components under each block
- [ ] Tab presence annotated: PARAMS (always), ANIMATE (if animation config exists, note absent if not), EXPORT (always), INFO (if description field exists)
- [ ] UX notes section: at minimum one note, or explicit statement "no UX concerns identified"

**Fail signals:** only group names listed, no parameter details; preset table absent or has only preset names; sidebar structure absent; no UX notes.

---

### `performance.md` — pass requires all of:

- [ ] Dominant operation named specifically (not "the physics update" — the exact loop or operation)
- [ ] Complexity stated in O(n) notation with n defined
- [ ] At least one extreme parameter value analysed (what happens at max value of the most expensive param)
- [ ] Frame budget calculation: `1000/defaultFps` ms stated, dominant cost estimated relative to budget
- [ ] Web Worker feasibility: explicit statement of feasibility and specific blocking dependencies
- [ ] At least one mitigation candidate listed (or explicit statement that no obvious mitigation exists)

**Fail signals:** no complexity notation; extreme values not analysed; "not clearly indicated" for worker feasibility without naming what blocks it; no frame budget estimate.

---

### `feature-parity.md` — pass requires all of:

- [ ] Feature inventory table: for each feature in each legacy doc, status in live source (Confirmed / Changed / Absent), location in source or reason for absence
- [ ] Host feature audit table: for each host-level feature (presets, INFO tab, animation config, export config), whether the generator uses it and relevant detail
- [ ] Parity holes: explicit numbered list — not "none identified" unless the feature inventory genuinely shows every legacy feature is confirmed in the source
- [ ] If no legacy docs exist: explicit statement and explanation of what the live source alone can confirm

**Fail signals:** feature inventory absent when legacy docs exist in archive; host feature audit absent; parity holes section says only "no legacy docs" when the archive has files; all statuses are "Confirmed" with no examination.

---

### `issues-and-conflicts.md` — pass requires all of:

- [ ] Standards compliance check: each item in the checklist from `build-page.md` §8 is explicitly marked pass or fail with evidence
- [ ] At least one issue recorded (even if all items pass, there is typically at least one NOTE from parity or escalation)
- [ ] Every issue uses the format from `issue-flagging.md`: `[SEVERITY] [CATEGORY] description`, Location, Evidence, Impact
- [ ] Bug detection: evidence that the source was read for division-by-zero risks, unbounded growth, and unwired parameters
- [ ] Performance risks section: at minimum references the complexity identified in `performance.md`

**Fail signals:** compliance check is absent or has only generic pass/fail without evidence; no issues recorded at all when legacy docs, p5 usage, or O(n²) loops are present; issue records missing Location or Evidence fields.

---

### `migration-log.md` — pass requires all of:

- [ ] Date recorded
- [ ] Every input file listed with its path and classification
- [ ] Every archive output listed
- [ ] Pack files produced listed

**Fail signals:** date absent; archive outputs not listed; input files not listed with paths.

---

## 2. Scoring

Score each file as pass (1) or fail (0). Maximum score: 8/8.

Record the score and failures:

```
Pack score: 6/8
Failing files:
- mechanisms.md: no formulas; function inventory has names only, no descriptions
- ui-layout.md: parameter table absent; only group names listed
```

A generator's migration is not complete until it scores 8/8.

---

## 3. Correction Protocol

For each failing file:

1. **Identify specifically which required element is missing** — use the pass criteria above. Do not re-do the whole file if only one element is missing.

2. **Return to the relevant step in `document-generator.md`** — each file has a corresponding step. Reread only the instructions for that file's step.

3. **Rewrite only the failing section of the failing file** — do not modify passing files during correction.

4. **Re-score the corrected file** — recheck all pass criteria for that file, not just the element you added.

5. **Update the score record.**

Example correction path:
- `mechanisms.md` fails because formulas are missing
- Return to `document-generator.md` Step 4 §4.3 Mathematical model
- Read every formula in the source
- Write each formula in the required notation with variable definitions
- Re-read the full `mechanisms.md` pass criteria above
- Confirm all other criteria still pass
- Update score

---

## 4. Agent Compliance Pre-Check

Before running the full scoring above, perform this quick pre-check on three files. If any of these spot checks fail, reject the run immediately and rerun from Step 0 of `document-generator.md`.

**Check 1 — `description.md`:**
Read the file. Is there a sentence that begins with "This generator models..." or that names a specific mathematical class? Is there a scope boundary (what it does NOT do)? Is it longer than 150 words?

If the file contains only: metadata fields (id, category, context, canvas) and a sentence copied from `SCRIPT_CONFIG.description` → **reject immediately**.

**Check 2 — `mechanisms.md`:**
Read the file. Is there a table with at least 3 rows describing named functions with their roles? Is there at least one formula in `backtick notation` followed by a definitions list?

If the file contains only: a "Render Path" paragraph, a bullet list of function names, and "no explicit rebuild-only keys detected" → **reject immediately**.

**Check 3 — `ui-layout.md`:**
Read the file. Is there a table with a row for every parameter key from `SCRIPT_CONFIG.parameters`? Is there a row for every preset?

If the file contains only: group names, a 3-line tab presence list, and a preset count → **reject immediately**.

---

## 5. Do Not Close Until 8/8

A generator's migration todo must not be closed until:
1. All 8 files pass their criteria
2. The archive contains the live script and any located legacy docs
3. The inventory has been updated to reflect the completed pack
4. The score has been explicitly confirmed as 8/8
