# Distort Tool — Module Interrogation Questionnaire

Target: every effect module under `assets/js/tools/processors/distort/nodes/`.
Purpose: identify needed changes — broken modules, redundant modules, missing features, source parity failures, UI issues.
Method: one question at a time, back-and-forth. Agent pre-fills answers from reference pack documentation where possible; user tests live tool and confirms/corrects/adds.

Severity tags follow `issue-flagging.md`: `ERROR` (broken/wrong output), `WARN` (standards violation, not broken), `NOTE` (gap/redundancy/ambiguity).

---

## Agent Pre-Fill Rules

Before asking any questions, the agent MUST read the module's reference pack:
- `reference/distort/{type}/description.md` — for questions 1.1, 1.2, 2.3
- `reference/distort/{type}/source-reference.md` — for question 2.3 (legacy docs section)
- `reference/distort/{type}/feature-parity.md` — for questions 2.2, 3.1
- `reference/distort/{type}/issues-and-conflicts.md` — for questions 4.4, 6.2
- `reference/distort/{type}/performance.md` — for questions 5.1, 5.3

Pre-filled answers are presented as: **"Pre-fill: [answer]. Correct or amend?"**
Questions that cannot be pre-filled are presented as plain questions.

---

## Part A — Per-Module Review Questionnaire (all 69 modules)

### Section 1 — Triage

**Stop the review and record a REMOVE or MERGE verdict if question 1.3 results in that outcome. Skip all remaining sections.**

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 1.1 | What does this module do? (one sentence) | `description.md` — Effect section | Correct or amend |
| 1.2 | Does any other module produce the same or equivalent output? Which one(s)? | `description.md` — Distinction section | Correct or amend |
| 1.3 | Given any overlap: should this module be **kept**, **merged** into another, or **removed**? | User decides | REMOVE → write verdict, stop. MERGE → note target, continue. |
| 1.4 | Does the module name as shown in the CategoryPicker contain the word "MODULE"? | User tests | WARN if YES |
| 1.5 | Is there a hover tooltip visible when hovering the module in the CategoryPicker? | User tests | NOTE if NO |

### Section 2 — Functional Completeness

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 2.1 | Does the module produce correct visible output with a source image and default params? | User tests | ERROR if NO |
| 2.2 | Does the module achieve its stated purpose effectively? Any missing features or weak implementation? | `feature-parity.md` — Parity Holes section | User confirms/adds |
| 2.3 | Was this module based on a specific source project, algorithm paper, script, or reference implementation? | `source-reference.md` — Legacy Docs Archived section | If YES → do Section 3. If NO → skip Section 3. |

### Section 3 — Source Parity (only if module has a source reference)

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 3.1 | What features from the source reference are absent or changed in the live module? | `feature-parity.md` — Parity Holes | User confirms/adds |
| 3.2 | Does the live module's visual output match what the source reference would produce? | User tests | NOTE [PARITY] if mismatch |
| 3.3 | Does the live module's performance match expectations from the source reference? | User tests | NOTE [PERFORMANCE] if much slower |

### Section 4 — Parameter and UI Audit

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 4.1 | List all module-specific params (label, type). Exclude global host params (opacity, blend mode). | User inspects NodePanel | — |
| 4.2 | Are all param labels SCREAMING CASE and visually untruncated? Any violations? | User checks | WARN per violation |
| 4.3 | Is there at least one primary param immediately visible without expanding tiers? | User checks | WARN if NO |
| 4.4 | Do all sliders and dropdowns respond correctly across their full range? Any NaN, breakage, or broken output at extremes? | `issues-and-conflicts.md` — known param issues | User confirms/adds |
| 4.5 | Do all params with a driver (+D) slot produce a visible per-pixel effect when a driver is attached? (Global issue G1: +D button non-functional — confirm if still broken or now fixed) | Pre-fill as broken per G1 | User confirms |

### Section 5 — Performance

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 5.1 | Does the module have cost-scaling params (iterations, radius, passes, steps, size)? List them. | `performance.md` if available | User confirms |
| 5.2 | In PREVIEW mode with scaling params at maximum: does it feel interactive (near-instant response)? | User tests | WARN if sluggish |
| 5.3 | In FULL mode with scaling params at maximum: is the render time acceptable? | `performance.md` cost class | User confirms |

### Section 6 — Load and Stability

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 6.1 | Does the module load without errors on first add? (no console errors, no black output) | User tests | ERROR if NO |
| 6.2 | Does any param at an extreme value produce visually broken output (black frame, NaN, corruption)? | `issues-and-conflicts.md` — known bugs | User confirms/adds |

### Section 7 — Final Critique

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 7.1 | Is there anything about this module's UI, labelling, or behaviour that is confusing, misleading, or inconsistent with other modules? | User judges | WARN/NOTE per finding |
| 7.2 | Any additional critique, issues, or observations not covered above? | User — open-ended | Record verbatim |

### Section 8 — Vector Module Extras (only for: lumflow, serpentine, statichalftone, moduleflowlines, moduleserpentine, modulestaticlines)

| # | Question | Pre-fill source | Failure / action |
|---|----------|-----------------|------------------|
| 8.1 | Does the EXPORT menu include an SVG export option when this module is in the stack? | User tests | WARN if NO |
| 8.2 | Does SVG export produce a valid non-empty SVG file? | User tests | ERROR if NO |
| 8.3 | Does the canvas preview match the structure of the exported SVG? | User compares | NOTE if mismatch |

---

## Review File Template

```markdown
# {DISPLAY NAME} — Review 2403

- type: `{type}`
- category: `{CATEGORY}`
- isVector: {true|false}
- verdict: KEEP / MERGE({target}) / REMOVE
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | | |
| 1.2 | Equivalent output from another module? | | |
| 1.3 | Verdict: keep / merge / remove? | | |
| 1.4 | Name contains "MODULE" in picker? | | |
| 1.5 | Hover tooltip present in picker? | | |

## Section 2 — Functional Completeness
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | | |
| 2.2 | Achieves stated purpose? Missing features? | | |
| 2.3 | Based on source reference? | | |

## Section 3 — Source Parity (if applicable)
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 3.1 | Features absent/changed vs source reference? | | |
| 3.2 | Visual output matches source reference? | | |
| 3.3 | Performance matches source reference expectations? | | |

## Section 4 — Parameter and UI Audit
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | | |
| 4.2 | All labels SCREAMING CASE, untruncated? | | |
| 4.3 | Primary param visible by default? | | |
| 4.4 | All controls respond correctly across range? | | |
| 4.5 | Driver slots (+D) functional? | | |

## Section 5 — Performance
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | | |
| 5.2 | Interactive in PREVIEW at max params? | | |
| 5.3 | Acceptable FULL-mode render time at max params? | | |

## Section 6 — Load and Stability
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | | |
| 6.2 | Broken output at extreme param values? | | |

## Section 7 — Final Critique
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | | |
| 7.2 | Additional critique or observations? | | |

## Section 8 — Vector Extras (if applicable)
| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 8.1 | SVG export option present? | | |
| 8.2 | SVG export produces valid file? | | |
| 8.3 | Canvas preview matches SVG output? | | |

## Issues
(issue-flagging.md format — compiled from all FAIL/WARN/ERROR answers above)

## Action Items
(numbered list of concrete changes needed)
```
