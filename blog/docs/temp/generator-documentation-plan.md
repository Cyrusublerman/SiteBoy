# Generator Documentation Programme — Execution Plan

## Current State

- 25 generators registered in `script-registry.js`
- 25 skeleton packs exist (8 files each) — all at **score 0** per `agent-compliance.md` rubric
- 25 source archives exist in `reference/generators/*/source/`
- 15 generators have legacy docs archived; 10 have none
- `verification.md` falsely claims 100% completion — must be corrected post-migration

## Governing Documents

All in `blog/docs/pages/tools/generators/guides/`. Read order defined in `guides/index.md`. No guide may be edited.

## Per-Generator Procedure

For each generator, execute Steps 0–9 of `document-generator.md` in strict order. No step may be skipped. Each step's output overwrites the existing score-0 skeleton file.

### Step Sequence (condensed)

| Step | Action | Output file |
| --- | --- | --- |
| 0 | Read `.gen.js`: SCRIPT_CONFIG, all functions, state model (`this.*`), render loop trace, rebuild mechanism | (working notes) |
| 1 | Read + classify legacy docs per `classify-reference-material.md`; consolidate feature list; check each against source → confirmed/changed/absent/conflicting | (working notes) |
| 2 | Write `source-reference.md` — paths, archive entries, classifications | `source-reference.md` |
| 3 | Write `description.md` — model, visual output, distinction, algorithm origin, scope boundary; ≥150 words; not a SCRIPT_CONFIG copy | `description.md` |
| 4 | Write `mechanisms.md` — state model table (all `this.*`), function inventory (name/role/inputs/output/complexity), all formulas with variable definitions per `maths-standards.md`, numbered render loop, rebuild mechanism | `mechanisms.md` |
| 5 | Write `ui-layout.md` — full parameter table (every key, all columns including Controls and Rebuild?), preset table (all values + visual character), sidebar structure, UX notes | `ui-layout.md` |
| 6 | Write `performance.md` — dominant op, O(n) with n defined, extreme params, frame budget, worker feasibility, mitigation candidates | `performance.md` |
| 7 | Write `feature-parity.md` — feature inventory vs legacy docs, host feature audit, explicit parity holes | `feature-parity.md` |
| 8 | Write `issues-and-conflicts.md` — full `build-page.md` §8 checklist (pass/fail + evidence per item), bugs, performance risks, parity holes in issue format per `issue-flagging.md` | `issues-and-conflicts.md` |
| 9 | Write `migration-log.md` — date, inputs with paths + classifications, archive outputs, pack file list, compliance score table | `migration-log.md` |

### Quality Gate Per Generator

After Step 9, before closing:

1. **Spot check** (`agent-compliance.md` §4): description.md names a model + scope boundary + ≥150w; mechanisms.md has function table with roles + ≥1 formula with definitions; ui-layout.md parameter table row count = SCRIPT_CONFIG parameter count. If any fail → reject and redo from Step 0.
2. **Full score** (`agent-compliance.md` §2): every file scored 0/1/2. All 8 must reach 2 to close.
3. **Verification** (`testing.md` §3): source-vs-pack cross-check on all 7 subsections.
4. Update `inventory.md` row for the generator.
5. Update `verification.md` counts.

## Execution Order

### Phase 1: clockwise (priority trigger)

| # | ID | Source | Legacy docs | Reason |
| --- | --- | --- | --- | --- |
| 1 | `clockwise` | `scripts/other/clockwise.gen.js` | none | original trigger issue; performance/fit-fill-actual/zoom problems must be captured in issues-and-conflicts.md |

### Phase 2: generators with legacy docs (14 generators)

Ordered by legacy material volume (most docs first):

| # | ID | Category | Source path | Legacy docs in archive |
| --- | --- | --- | --- | --- |
| 2 | `solar-system` | other | `scripts/other/solar-system.gen.js` | solar-system.md, solar-system-audit.md, SOLAR-SYSTEM-TOOL-README.md |
| 3 | `lissajous` | parametric | `scripts/parametric/lissajous.gen.js` | lissajous.md, lissajous-audit.md |
| 4 | `cymatics` | wave | `scripts/wave/cymatics.gen.js` | cymatics.md, cymatics-audit.md |
| 5 | `wave-interference` | wave | `scripts/wave/wave-interference.gen.js` | wave-interference.md, wave-interference-audit.md |
| 6 | `moire` | wave | `scripts/wave/moire.gen.js` | moire-generator-spec.md, moire-generator-audit.md |
| 7 | `generative-pattern` | pattern | `scripts/pattern/generative-pattern.gen.js` | generative-pattern-algorithm-spec.md, generative-pattern-algorithm-audit.md |
| 8 | `tile-mosaic` | pattern | `scripts/pattern/tile-mosaic.gen.js` | tile-mosaic-spec.md, tile-mosaic-audit.md |
| 9 | `unified-pattern` | other | `scripts/other/unified-pattern.gen.js` | unified-pattern-generator-spec.md, unified-pattern-generator-audit.md |
| 10 | `interference-figure` | other | `scripts/other/interference-figure.gen.js` | interference-figure-spec.md, interference-figure-audit.md |
| 11 | `wave-equation-synth` | other | `scripts/other/wave-equation-synth.gen.js` | wave-equation-synth-spec.md, wave-equation-synth-audit.md |
| 12 | `torus` | parametric | `scripts/parametric/torus.gen.js` | torus.md, torus-audit.md |
| 13 | `harmonics` | parametric | `scripts/parametric/harmonics.gen.js` | lissajous.md (shared), harmonics-audit.md |
| 14 | `circles` | other | `scripts/other/circles.gen.js` | circles.md, circles-audit.md |
| 15 | `squares` | other | `scripts/other/squares.gen.js` | squares.md, squares-audit.md |

### Phase 3: generators with no legacy docs (10 generators)

Source-only analysis. `feature-parity.md` records "no legacy docs located."

| # | ID | Category | Source path |
| --- | --- | --- | --- |
| 16 | `fibonacci-balls` | physics | `scripts/physics/fibonacci-balls.gen.js` |
| 17 | `animated-lines` | pattern | `scripts/pattern/animated-lines.gen.js` |
| 18 | `golden-grid` | pattern | `scripts/pattern/golden-grid.gen.js` |
| 19 | `order-disorder` | pattern | `scripts/pattern/order-disorder.gen.js` |
| 20 | `shape-array` | pattern | `scripts/pattern/shape-array.gen.js` |
| 21 | `curtain-morph` | other | `scripts/other/curtain-morph.gen.js` |
| 22 | `defecated` | other | `scripts/other/defecated.gen.js` |
| 23 | `p5-wave-colour` | wave | `scripts/wave/p5-wave-colour.gen.js` |
| 24 | `p5-wave-interference` | wave | `scripts/wave/p5-wave-interference.gen.js` |
| 25 | `quine` | other | `scripts/other/quine.gen.js` |

## Effort Model

### Per-generator cost drivers

| Factor | Low cost (source-only, simple script) | High cost (legacy docs + complex physics/wave model) |
| --- | --- | --- |
| Step 0 (source read) | short script, few functions | 500+ line script, 15+ functions, complex state |
| Step 1 (legacy consolidation) | none — skip | 2–3 legacy docs, each 200+ lines; feature extraction + cross-check |
| Steps 2–9 (8 files) | baseline | formulas, O(n²) analysis, parity hole inventory |
| Quality gate | fast pass | correction loops on mechanisms.md or ui-layout.md |

### Estimated distribution

- Phase 1 (clockwise): 1 generator. Medium complexity (p5, physics sim, known issues).
- Phase 2 (14 generators): highest total cost. Legacy consolidation step adds ~40% effort vs source-only. solar-system and lissajous are the most complex scripts.
- Phase 3 (10 generators): lowest per-unit cost. No legacy step. fibonacci-balls is the most complex script in this group.

## Constraints

- `.gen.js` files: read-only. No code edits.
- Guide files: read-only. No edits.
- Template files: read-only. No edits.
- `reference/` archive: read-only input.
- No `gendocs.py` or automated extraction — all content from manual source analysis.
- Existing skeleton files (score 0) must be overwritten with compliant content.

## Completion Criteria

Programme is complete when:
1. All 25 generators score 16/16 (2 on every file)
2. `inventory.md` reflects accurate classifications for all 25
3. `verification.md` reflects verified completion (not the current false 100%)
4. Every `migration-log.md` records date, inputs, outputs, and compliance score table

## Escalation Registry

Any `[NOTE] [ESCALATION]` issues found during documentation must also be recorded in `blog/docs/guides/shared-utilities.md` per `component-algorithm-escalation.md` §4. This is a side-effect of the documentation programme, not a blocking dependency.
