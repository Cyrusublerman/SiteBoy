# Card 06 — Phase 1 Stage B — EXTRACT REFERENCE (Capability Table + Coverage Map)

## What this stage does
Builds the Reference Capability Table and the Function Coverage Map from the reference source ONLY. The Coverage gate proves thoroughness: every named function/method/handler/top-level-statement in the reference must be enumerated. This stage is the load-bearing v4 anti-superficial-extraction mechanism.

## Applicable rules
Operating: R6 (queue, don't decide), R9 (halts are STOPs), R10 (state). Anti-Fab: F.1, F.2, F.3, F.4, F.6 (every cap_id evidence cites file:line; every function name from source; no paraphrasing). Anti-pattern numbers: 5 (no skipping artefacts), 6 (no prose), 23 (no empty mapped_to), 24 (no vague not-relevant).

## Inputs
- Reference source (already in context from Stage A)

## Outputs
- Reference Capability Table — held in agent context for now; written to feature-parity.md in Stage F
- Function Coverage Map — held in agent context for now; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: B`, `last_action: stage B begin`, append checkpoint.
- [ ] 2. **Build Reference Capability Table.** Scan the reference source linearly. For every distinct capability, add one row using the schema below. Categories:
  - `param` — every UI parameter the reference exposes (slider, dropdown, button, checkbox)
  - `behaviour` — every distinct rendering behaviour or compute step (one per named function whose output is observable)
  - `render-mode` — every distinct branch of render-mode dispatch (e.g. `if (mode === 'density') { ... }` produces one row per mode)
  - `interaction` — every event handler (click, mousemove, keypress, resize, etc.)
  - `export` — every export hook (image download, JSON state save, etc.)
  - `audio` — any audio input/output (rare)
  - `ui-control` — any UI element NOT a param (legend, debug overlay, etc.)
- [ ] 3. For each row: `evidence` column MUST cite a real file:line in the reference source. Use a range if the capability spans multiple lines (e.g. `45-72`). RULE F.1: re-Read the cited line if you are uncertain it matches.
- [ ] 4. **Build Function Coverage Map.** Run a Grep over the reference source to enumerate every function, method, handler, top-level statement block, and class. Use this regex (adjust for ES module flavour):
  ```
  rg -n "^\s*(function |const \w+\s*=\s*\(|class |\w+\s*:\s*function|\w+\s*=\s*\([^)]*\)\s*=>|export (function|const|class)|.\w+\s*\(.*\)\s*\{)" <reference-path>
  ```
- [ ] 5. For each Grep result, add one row to the Coverage Map using the schema below. `mapped_to` MUST be either:
  - One or more `cap_id`s from the Capability Table (e.g. `R-04` or `R-04, R-07`), OR
  - `not-relevant: <one-line concrete reason>`. Forbidden: "trivial", "boilerplate" with no specifics. Allowed: `not-relevant: pure logging, no behaviour`, `not-relevant: dead code (no callers in this file or external)`, `not-relevant: p5 setup boilerplate, no generator-specific logic`.
- [ ] 6. **Coverage gate self-check** (the BG decision in the v3 flowchart):
  - Count rows in Coverage Map. Must equal Grep result count from step 4 (within ±1 for edge cases like multi-line function declarations).
  - Every row has non-empty `mapped_to`.
  - Every non-`not-relevant` row maps to at least one valid cap_id (cap_id exists in the Capability Table).
  - Every `not-relevant` row has a one-line reason that is NOT in the forbidden vague list.
- [ ] 7. **If Coverage gate FAILS** → STOP. Halt-and-recover: re-run from step 2. Do NOT advance.
- [ ] 8. **If Coverage gate PASSES** → proceed.
- [ ] 9. Apply Minimum Content Gates (table below).
- [ ] 10. Update v4-state.md: `stage: B.5`, `last_action: stage B coverage gate passed (<N> caps, <M> coverage rows)`, `next_action: build reference system map`, append checkpoint.
- [ ] 11. Read card `07-p1-stage-B5.md` — auto-advance.

## Templates

### Reference Capability Table row schema

```markdown
| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | density (slider 0-1) | reference/generators/cymatics/source/cymatics.html:42 | range from comment |
| R-02 | render-mode | density mode rendering | cymatics.html:215-258 | branched on `mode === 'density'` |
```

### Function Coverage Map row schema

```markdown
| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | setup | 30-58 | R-01, R-04 |
| F-02 | function | draw | 60-145 | R-02, R-03 |
| F-03 | function | initBuffers | 147-160 | R-04 |
| F-04 | function | logDebug | 162-170 | not-relevant: pure logging, no behaviour |
| F-05 | top-level-stmt | top:25 | 25-29 | R-01 |
```

## Minimum Content Gates

| Artefact | Minimum | If below |
|---|---|---|
| Reference Capability Table | ≥ 3 rows for any non-stub generator (< 50 lines source); ≥ 8 rows for any source > 200 lines | Re-run extraction. Queue Q-thin-reference-<id> (DEFER) only if user might genuinely have wanted a stub. |
| Function Coverage Map | row count = Grep result from step 4 (±1) | Re-run step 4 with adjusted regex; re-extract. |

Below-minimum is a Stage B STOP — re-run, do NOT advance.

## Validation

```bash
# Run from project root. Example for cymatics; substitute generator id and reference path.
echo "Capability Table row count:"
# (manual count from agent's in-context table)
echo "Coverage Map row count:"
# (manual count)
echo "Grep enumeration count:"
rg -c "^\s*(function |const \w+\s*=\s*\(|class |export (function|const|class))" <reference-path>
```

Coverage Map row count must equal Grep count ±1. If not, re-extract.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Coverage gate fails (rows unmapped, or count mismatch) | STOP. Re-run steps 2-6 by re-reading the reference source line by line. Do NOT skip functions. Do NOT mark "trivial" without reason. Maximum 3 retries; if 3 fails, queue BLOCK Q-coverage-loop-<id> and DEFER turn. |
| Capability Table below minimum | Re-Read reference source — agent likely missed a section. If genuinely a stub, queue Q-thin-reference-<id> (DEFER) and proceed with current count. |
| Reference source has 0 functions (e.g. pure top-level script) | Coverage Map row is the single `top-level-stmt` block covering the whole file. Capability Table must still have ≥ 3 rows derived from observable behaviours in that block. |
| Multiple plausible cap_ids for a function | Map to all of them (comma-separated). It's not a 1:1 relationship. |

## Exit criteria

- [ ] Reference Capability Table built; ≥ minimum rows; every row has `evidence` file:line citation
- [ ] Function Coverage Map built; row count matches Grep enumeration ±1
- [ ] Coverage gate passes (zero unmapped rows; every non-not-relevant has valid cap_id; every not-relevant has concrete reason)
- [ ] All cited file:line ranges have been Read in this turn
- [ ] v4-state.md updated; `stage: B.5`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/07-p1-stage-B5.md`
