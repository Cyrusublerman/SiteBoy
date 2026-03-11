# Agent Compliance Guide

Agents instructed to document generators will frequently produce incomplete output. The characteristic failure mode is: files are created and non-empty, but content is derived entirely from regex extraction of surface metadata — function names without descriptions, group names without parameter details, one-sentence descriptions copied from SCRIPT_CONFIG. This guide defines how to detect this failure, score the output, and trigger a rerun.

---

## 1. Why Agents Fail

Automated and agent-driven documentation fails because:

- **Regex extraction produces structural completeness without semantic completeness.** An agent can list all function names, all group names, and all preset counts by scanning the source with pattern matching. This produces a file that appears non-empty but contains no analysis.
- **Agents stop at the first plausible output.** When a file exists and has content, agents tend not to re-examine whether the content is sufficient. They interpret "file exists" as "done."
- **Formula extraction requires understanding, not pattern matching.** An agent that does not understand that `const dvn = (c1.vx - c2.vx) * nx + ...` is a dot product computing relative normal velocity will not write the corresponding formula in `mechanisms.md`.

The compliance scoring system below is designed to detect these failure modes specifically.

---

## 2. Scoring Rubric

Score each of the 8 pack files on a 0–2 scale. Maximum total score: 16.

| Score | Meaning |
| --- | --- |
| 0 | Absent, or contains only regex-extractable metadata (function names without descriptions, group names without parameter details, one-sentence description = SCRIPT_CONFIG copy) |
| 1 | Partial — some required elements present but one or more major required elements missing |
| 2 | Complete — all required elements present as defined in `review-and-correction-loop.md` |

### Scoring each file

**`source-reference.md`**
- Score 0: missing paths or classifications
- Score 1: paths present but archive entries incomplete or classifications absent
- Score 2: all paths, all archive entries, all classifications present

**`description.md`**
- Score 0: file is a copy of SCRIPT_CONFIG.description field; or file is under 150 words; or no mathematical model named; or no scope boundary
- Score 1: mathematical model named but visual output or scope boundary missing
- Score 2: mathematical model explained, visual output described, algorithm origin noted, scope boundary stated, ≥150 words

**`mechanisms.md`**
- Score 0: contains only a render path paragraph, a bullet list of function names, and "no rebuild keys detected" — i.e. the output of a regex pass
- Score 1: has some function descriptions but missing formulas, or has formulas but missing state model table or render loop order
- Score 2: state model table complete, function inventory with roles complete, at least one formula with full variable definitions, render loop numbered in order, rebuild mechanism described

**`ui-layout.md`**
- Score 0: contains only group names, a 3-line tab list, and a preset count
- Score 1: has parameter group names and some detail but missing parameter table with all keys, or missing preset table, or missing sidebar structure
- Score 2: full parameter table (all keys, all columns), full preset table, sidebar structure, UX notes

**`performance.md`**
- Score 0: states only "Main-thread p5 redraw and embedded simulation state" or equivalent one-line generic assessment
- Score 1: names the dominant operation but missing complexity notation, extreme-value analysis, or worker feasibility
- Score 2: dominant operation named specifically, O(n) with n defined, extreme-value analysis for at least one param, frame budget stated, worker feasibility with specific dependencies

**`feature-parity.md`**
- Score 0: states only "no legacy docs located" when the archive has files; or feature inventory is empty when legacy docs exist
- Score 1: feature inventory present but missing host feature audit, or parity holes section is absent
- Score 2: feature inventory complete, host feature audit complete, parity holes explicitly numbered

**`issues-and-conflicts.md`**
- Score 0: contains only a generic risk line (e.g. "p5 is a semantic dependency, not a performance upgrade") with no standards compliance check
- Score 1: has some compliance check items but incomplete; or issues present but missing Location/Evidence fields
- Score 2: full standards compliance check with pass/fail and evidence for each item, all issues in correct format with Location, Evidence, Impact

**`migration-log.md`**
- Score 0: missing date, or inputs not listed with paths
- Score 1: inputs and archive listed but missing date or pack file list
- Score 2: date, all input paths with classifications, all archive outputs, pack file list

---

## 3. Minimum Acceptable Scores

| File | Minimum to proceed | Minimum to close |
| --- | --- | --- |
| `description.md` | 2 (no partial credit) | 2 |
| `mechanisms.md` | 2 (no partial credit) | 2 |
| `ui-layout.md` | 2 (no partial credit) | 2 |
| `source-reference.md` | 1 | 2 |
| `performance.md` | 1 | 2 |
| `feature-parity.md` | 1 | 2 |
| `issues-and-conflicts.md` | 1 | 2 |
| `migration-log.md` | 1 | 2 |

"Minimum to proceed" means: if the score is below this, reject the run immediately. Do not run the full review checklist — the output is too incomplete to be worth checking in detail.

"Minimum to close" means: all files must reach 2 before the migration todo is closed.

---

## 4. Pre-Acceptance Spot Check

Before running the full scoring above, perform these three spot checks. They take less than 2 minutes and will catch the most common agent failure modes.

**Spot check 1 — `description.md`:**

Open the file. Read the first 3 sentences. Now open the source file and find `SCRIPT_CONFIG.description`.

- If the description file is shorter than the source's description field → **Score 0. Reject.**
- If the description file contains only metadata fields (id, category, context, canvas, animated) and one sentence → **Score 0. Reject.**
- If the description file names a mathematical model (e.g. "parametric sinusoids", "Keplerian elements", "front-chain packing") → proceed to full score.

**Spot check 2 — `mechanisms.md`:**

Open the file. Look for:
- A table with columns for Function, Role, Inputs, Output — not just a bullet list of names
- A backtick formula followed by a "where:" definition list

If neither is present → **Score 0. Reject.**

If both are present → proceed to full score.

**Spot check 3 — `ui-layout.md`:**

Open the file. Count the rows in the parameter table. Open the source file. Count the entries in `SCRIPT_CONFIG.parameters` (sum all params across all groups).

If the table row count does not match the parameter count → **Score 0 or 1. Reject if 0.**

If the table has a column for "Controls" or "What it does" with substantive descriptions → proceed to full score.

---

## 5. Rerun Trigger

If any file scores 0 after the spot check or full scoring:

1. **Reject the entire run for that generator.** Do not correct individual files — the failure at score 0 indicates the agent did not perform actual source analysis, meaning all other files are also at risk.

2. **Rerun the agent on that generator from Step 0 of `document-generator.md`** with explicit instructions to: read the source, identify each mathematical formula, read each function, and produce the state model table before writing any file.

3. **If the rerun also scores 0 on the spot check:** the agent is not capable of performing this task autonomously. A human must write the pack files using `document-generator.md` as the step-by-step guide.

If a file scores 1 (partial):

1. **Do not reject the whole run.** Score-1 files have substantive content that is incomplete, not absent.
2. **Identify the specific missing element** using the scoring rubric above.
3. **Correct only that element** by returning to the relevant step in `document-generator.md`.
4. **Re-score the file** after correction.

---

## 6. Compliance Record

After scoring a pack, record the result in the generator's `migration-log.md`:

```markdown
## Compliance Score

| File | Score | Notes |
| --- | --- | --- |
| source-reference.md | 2 | All paths and classifications present |
| description.md | 2 | Mathematical model and scope boundary present |
| mechanisms.md | 1 | State model table present; formulas missing — corrected |
| ui-layout.md | 2 | All 14 parameters in table; 3 presets in table |
| performance.md | 2 | O(n² × collisionPasses) noted; worker feasibility assessed |
| feature-parity.md | 2 | 4 legacy features compared; 2 parity holes identified |
| issues-and-conflicts.md | 2 | 8 compliance items checked; 3 issues flagged |
| migration-log.md | 2 | All fields present |

Total: 15/16
Status: closed (all files at 2, except mechanisms.md which was corrected to 2)
```

This record is part of the evidence that a migration is complete.
