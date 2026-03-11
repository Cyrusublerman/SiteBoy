# Agent Compliance Guide

Agents instructed to document effect modules will frequently produce incomplete output. The characteristic failure mode is: files are created and non-empty, but content is derived entirely from extraction of surface metadata — param keys without descriptions, algorithm names without formulas, descriptions copied verbatim from the component-level doc. This guide defines how to detect this failure, score the output, and trigger a rerun.

---

## 1. Why Agents Fail

Agent-driven documentation of effect modules fails because:

- **Regex extraction produces structural completeness without semantic completeness.** An agent can list all `paramDef` keys, all tier levels, and all function names by scanning the source with pattern matching. This produces a file that appears non-empty but contains no analysis.
- **Agents use the component-level doc as a substitute for source analysis.** When a well-written component-level doc exists, agents tend to copy or paraphrase it rather than reading the source node. The component-level doc describes the intended interface; the source is the actual implementation. Discrepancies between them are the primary documentation value — an agent that only reads one misses all of them.
- **Formula extraction requires understanding, not pattern matching.** An agent that does not understand that `const w = Math.exp(-i*i / (2*sigma*sigma))` is a Gaussian weight function will not write the corresponding formula in `mechanisms.md`.

---

## 2. Scoring Rubric

Score each of the 8 pack files on a 0–2 scale. Maximum total score: 16.

| Score | Meaning |
| --- | --- |
| 0 | Absent, or contains only regex-extractable metadata (param keys without descriptions, tier numbers without context, one-sentence description = component doc copy) |
| 1 | Partial — some required elements present but one or more major required elements missing |
| 2 | Complete — all required elements present as defined in `review-and-correction-loop.md` |

### Scoring each file

**`source-reference.md`**
- Score 0: missing paths or classifications
- Score 1: paths present but archive entries incomplete or classifications absent
- Score 2: all paths (source node, registry, pipeline), archive entries, algorithm imports, all classifications

**`description.md`**
- Score 0: file is a copy or paraphrase of the component-level doc summary; or file is under 150 words; or no algorithm named; or no scope boundary
- Score 1: algorithm named but visual output or scope boundary missing
- Score 2: algorithm explained, visual output described, algorithm origin noted, scope boundary stated, ≥150 words

**`mechanisms.md`**
- Score 0: contains only a list of param keys, a list of function names, and "no issues detected" — the output of a pattern extraction pass
- Score 1: has some function descriptions but missing formulas, or has formulas but missing numbered execution order or preview strategy
- Score 2: execution order numbered in source sequence, function inventory with roles and complexity, at least one formula with full variable definitions, preview strategy described

**`ui-layout.md`**
- Score 0: contains only tier labels and a param count; or copies the parameter table from the component-level doc without verifying against the source
- Score 1: parameter table present but missing tier column, Controls column, or mask controls section; or modulation targets section absent
- Score 2: full parameter table (all keys, all columns), mask controls section, modulation targets section, UX notes

**`performance.md`**
- Score 0: states only "Off-thread execution, see Pipeline" or equivalent one-line generic statement
- Score 1: names the dominant operation but missing O(n) notation, or missing render cost class, or missing extreme-value analysis
- Score 2: dominant operation named specifically, O(n) with n defined, extreme-value analysis for at least one param, render cost class assigned for PREVIEW and FULL, mitigation candidates listed

**`feature-parity.md`**
- Score 0: states only "component-level doc is the sole reference" with no feature inventory; or feature inventory has all statuses as "Confirmed" without examination
- Score 1: feature inventory present but module standard feature audit absent; or parity holes section absent
- Score 2: feature inventory complete, module standard audit complete, parity holes explicitly numbered

**`issues-and-conflicts.md`**
- Score 0: contains only a generic line (e.g. "Worker context requires no DOM access") with no standards compliance check items
- Score 1: has some compliance check items but incomplete; or issues present but missing Location/Evidence fields
- Score 2: full standards compliance check with pass/fail and evidence, all issues in correct format with Location, Evidence, Impact

**`migration-log.md`**
- Score 0: missing date, or inputs not listed with paths
- Score 1: inputs and archive listed but missing date or compliance score
- Score 2: date, all input paths with classifications, all archive outputs, compliance score table

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

"Minimum to proceed" means: if the score is below this, reject the run immediately. Do not run the full review checklist.

"Minimum to close" means: all files must reach 2 before the migration todo is closed.

---

## 4. Pre-Acceptance Spot Check

Before running the full scoring above, perform these three spot checks. They take under 2 minutes and catch the most common agent failure modes.

**Spot check 1 — `description.md`:**

Open the file. Open the component-level doc.

- If the description file is shorter than or equal in length to the component-level doc's summary section → **Score 0. Reject.**
- If the description file's first two sentences are paraphrases of the component-level doc's identity section → **Score 0. Reject.**
- If the description names a specific algorithm class (convolution, reaction-diffusion, bilateral filter, Otsu thresholding) and has a scope boundary → proceed to full score.

**Spot check 2 — `mechanisms.md`:**

Open the file. Look for:
- A numbered list of `apply()` steps (at minimum: "1. Read quality, 2. ...")
- A table with columns for Function, Role, Inputs, Output (not just a bullet list)
- A backtick formula followed by a "where:" definition list

If none of these are present → **Score 0. Reject.**

If all three are present → proceed to full score.

**Spot check 3 — `ui-layout.md`:**

Open the file. Count the rows in the parameter table. Open the source and count the `paramDef` entries (keys in the `paramDefs` object).

If the table row count does not match the `paramDefs` count → **Score 0 or 1. Reject if 0.**

If the table has a "Controls" column with substantive descriptions (not just key names restated) → proceed to full score.

---

## 5. Rerun Trigger

If any file scores 0 after the spot check or full scoring:

1. **Reject the entire run for that module.** Score 0 indicates the agent did not perform actual source analysis — all other files are also at risk.

2. **Rerun the agent from Step 0 of `document-module.md`** with explicit instructions to: read the source node, identify every formula, read each function, produce the execution-order list before writing any file, and compare every param against the component-level doc.

3. **If the rerun also scores 0 on the spot check:** the agent is not capable of performing this task autonomously. A human must write the pack using `document-module.md` as the step-by-step guide.

If a file scores 1 (partial):

1. **Do not reject the whole run.** Score-1 files have substantive content that is incomplete, not absent.
2. **Identify the specific missing element** using the scoring rubric above.
3. **Correct only that element** by returning to the relevant step in `document-module.md`.
4. **Re-score the file** after correction.

---

## 6. Compliance Record

After scoring a pack, record the result in the module's `migration-log.md`:

```markdown
## Compliance Score

| File | Score | Notes |
| --- | --- | --- |
| source-reference.md | 2 | All paths and classifications present |
| description.md | 2 | Gaussian blur algorithm named; scope boundary present |
| mechanisms.md | 1 | Execution order present; formulas missing — corrected |
| ui-layout.md | 2 | All 4 params in table; mask controls documented |
| performance.md | 2 | O(w × h × k) noted; render cost class A for PREVIEW |
| feature-parity.md | 2 | FAST mode parity hole identified |
| issues-and-conflicts.md | 2 | 12 compliance items checked; 1 WARN flagged |
| migration-log.md | 2 | All fields present |

Total: 15/16
Status: closed (mechanisms.md corrected to 2)
```
