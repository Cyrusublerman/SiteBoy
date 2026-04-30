# Card 01 — Phase 0 execute — build reference manifest, scan rules.mdc

## What this stage does
Locates the reference source for every one of the 25 generators. Records canonical paths in `reference-manifest.md`. Identifies foundation-path discrepancies in `rules.mdc`. Queues all ambiguities to phase-0-questions.md without blocking. Single turn.

## Applicable rules
Operating: R3 (tool discipline — Glob/Read), R6 (queue don't decide), R10 (state updates). Anti-Fab: F.1 (cite paths). Anti-pattern numbers: 6 (no prose), 8 (no mid-phase questions), 22 (no exploration beyond what's listed).

## Inputs
- `blog/docs/pages/tools/generators/inventory.md` (the canonical 25-generator list)
- `reference/generators/`, `reference/p5js january/extracted/`, `reference/QuickToolRebuildReference/Generative Art/`, `reference/tools/`
- `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc`
- `assets/js/shared/foundation.js`
- `assets/js/core/animation-foundation.js`
- `assets/js/core/gpu-foundation.js`
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical Q definitions. When this card queues a Q, `category` must match a catalogue entry id (e.g. `Q-rules-base-component`, `Q-rules-mathematical-foundation`, `Q-rules-compute-scheduler-read`, `Q-manifest-<id>`, `Q-reference-canonical-<id>`).

## Outputs
- `blog/docs/pages/tools/generators/reference-manifest.md`
- Updated `phase-0-questions.md` with manifest gaps + foundation reconciliation Qs

## Procedure (tick boxes in order)

- [ ] 1. Update v4-state.md: `stage: discovery`, `last_action: turn p0-execute begin`, append checkpoint.
- [ ] 2. Read `blog/docs/pages/tools/generators/inventory.md`. Extract the 25 generator ids into a working list.
- [ ] 3. Glob `reference/generators/*/source/*.gen.js` — list all reference source files in the primary location.
- [ ] 4. Glob `reference/p5js january/extracted/*/`, `reference/QuickToolRebuildReference/Generative Art/*/src/`, `reference/tools/*` — list secondary locations.
- [ ] 5. For each of the 25 ids, find its canonical reference path:
  - Priority 1: `reference/generators/<id>/source/<id>.gen.js` or similar
  - Priority 2: `reference/p5js january/extracted/<sketch_name>/sketch.js` (the **user sketch**, not the bundled `p5.js` sibling)
  - Priority 3: `reference/QuickToolRebuildReference/Generative Art/<name>/src/`
  - Priority 4: `reference/tools/<name>/`
- [ ] 5a. **EXCLUDE library bundles unconditionally.** When listing candidates, reject any path matching:
  - `**/p5.js`, `**/p5.min.js`, `**/p5.sound.js`, `**/p5.sound.min.js`
  - `**/three.js`, `**/three.min.js`, `**/three.module.js`
  - `**/d3.js`, `**/d3.min.js`
  - `**/lib/`, `**/libs/`, `**/vendor/`, `**/node_modules/`
  - any file > 10,000 lines (a sketch is never that long; almost certainly a library bundle)
  Library bundles are out of scope for parity work — we only care about the user's sketch code. If a reference folder contains both `sketch.js` and `p5.js`, the canonical reference is `sketch.js`.
- [ ] 6. For each found path: Read the first 20 lines to (a) confirm it's not a stub, (b) confirm it's user code (sketch / setup / draw functions, not a library namespace declaration), (c) count line range. RULE F.1 — every path you write to the manifest must be one you have just Read.
- [ ] 7. For each generator, record a row using the manifest schema below. Status field:
  - `found` — single canonical user-sketch file located, content is real generator code
  - `ambiguous` — multiple plausible canonical files (e.g. `.html` + `.js`); choose higher-line-count active draw loop, queue DEFER Q. **If one candidate is a library bundle (per 5a) and the other is user code, auto-pick user code, no Q needed.**
  - `external-cdn` — reference relies on external CDN code only; no local user sketch
  - `bundle-only` — only candidate found is a library bundle (per 5a); no user sketch present → queue BLOCK Q-reference-bundle-`<id>`, mark generator DEFERRED
  - `missing` — searched all 4 locations, found nothing → queue BLOCK Q
- [ ] 8. Read `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc`. Locate the File Ownership section.
- [ ] 9. Verify `assets/js/core/base-component.js` — `Glob assets/js/core/base-component.js`. If missing → queue Q-rules-base-component (DEFER) per template below.
- [ ] 10. Verify `assets/js/core/mathematical-foundation.js` — `Glob`. If missing → queue Q-rules-mathematical-foundation (DEFER) per template below.
- [ ] 11. Verify `assets/js/shared/foundation.js` exists, contains `BaseComponent` class — `Grep "class BaseComponent" assets/js/shared/foundation.js`. Record actual line in the Q.
- [ ] 12. Check `rules.mdc` "Mandatory Pre-Decision Reads" table for `compute-scheduler.md` row. If absent → queue Q-rules-compute-scheduler-read (DEFER).
- [ ] 13. Write `reference-manifest.md` from template below. One row per generator id.
- [ ] 14. Append all queued Qs to `phase-0-questions.md` using the schema in shell §Universal mechanism.
- [ ] 15. Append a one-paragraph summary to `phase-0-progress.md`: count of `found`/`ambiguous`/`external-cdn`/`missing`, count of Qs queued.
- [ ] 16. Update v4-state.md: `turn: p0-questionnaire`, `stage: between-turns`, `card: guides/v4/stages/02-p0-questionnaire.md`, `last_action: manifest written`, `next_action: present batched questionnaire`, append checkpoint.
- [ ] 17. Print: `Phase 0 execute complete. Manifest: <N found>/<25>. Qs queued: <count>. Next: card 02-p0-questionnaire.md.`
- [ ] 18. Read card `02-p0-questionnaire.md` — auto-advance.

## Templates

### reference-manifest.md

```markdown
# Reference Manifest (v4)

Built by Phase 0 execute. Authoritative source of canonical reference paths for every generator.

| id | reference path | secondary | status | line count | notes |
|---|---|---|---|---|---|
| harmonics | reference/generators/harmonics/source/harmonics.gen.js | — | found | 245 | — |
| ... | ... | ... | ... | ... | ... |
```

### Q template — rules-base-component (queue if file missing)

```markdown
| Q-rules-base-component | 0 | p0-execute | DEFER | foundation-reconciliation | rules.mdc cites assets/js/core/base-component.js but BaseComponent actually lives at assets/js/shared/foundation.js:<line>. Resolution options: (a) update rules.mdc path, (b) add re-export shim at the cited path, (c) keep as-is and skip Stage E.5 Check 3 BaseComponent verification | (a) update rules.mdc | E.5 Check 3 will produce false ARCH issues for every generator | rules.mdc, every generator's E.5 report | OPEN |
```

### Q template — rules-mathematical-foundation

```markdown
| Q-rules-mathematical-foundation | 0 | p0-execute | DEFER | foundation-reconciliation | rules.mdc cites assets/js/core/mathematical-foundation.js which does not exist. Options: (a) declare aspirational and skip E.5 Check 3 layout-math row, (b) create canonical file re-exporting scattered helpers, (c) update rule to point at existing file | (a) declare aspirational | E.5 Check 3 will produce false ARCH issues | rules.mdc, every generator's E.5 report | OPEN |
```

### Q template — rules-compute-scheduler-read

```markdown
| Q-rules-compute-scheduler-read | 0 | p0-execute | DEFER | rules-pre-decision-reads | compute-scheduler.md is not in rules.mdc Mandatory Pre-Decision Reads, but Stage E.6 depends on it. Options: (a) add to table, (b) leave out | (a) add to table | E.6 may be applied without context for some agents | rules.mdc | OPEN |
```

### Q template — manifest gap

```markdown
| Q-manifest-<id> | 0 | p0-execute | BLOCK | reference-path-missing | <id>: searched reference/generators/<id>/source/, reference/p5js january/extracted/, reference/QuickToolRebuildReference/Generative Art/, reference/tools/. Found: <list of files seen, or "nothing"> | mark generator DEFERRED | cannot run Phase 1 turn for <id> | reference-manifest.md | OPEN |
```

### Q template — reference-bundle (only library bundle found, no user sketch)

```markdown
| Q-reference-bundle-<id> | 0 | p0-execute | BLOCK | reference-path-missing | <id>: only found library bundle(s) at <path(s)>, no user sketch sibling (sketch.js / index.js / source.gen.js). Library bundles are out of scope. | mark generator DEFERRED | cannot run Phase 1 turn for <id> | reference-manifest.md | OPEN |
```

## Validation (run before exit)

```bash
test -f blog/docs/pages/tools/generators/reference-manifest.md && \
test "$(grep -c '^|' blog/docs/pages/tools/generators/reference-manifest.md)" -ge 27 && \
echo "OK manifest has at least 25 generator rows + 2 header rows"
```

Also manually verify: every row's `reference path` was Read (not invented) — re-Glob if uncertain.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| `inventory.md` missing | Queue BLOCK Q-inventory-missing. STOP. Cannot continue without canonical id list. |
| Glob returns no `.gen.js` files in `reference/` | Queue BLOCK Q-reference-tree-missing. STOP. |
| For a single generator, all 4 locations return nothing | Mark `missing` in manifest, queue BLOCK Q per template. CONTINUE — other generators still proceed. |
| Manifest write fails | Re-attempt; if persistent, queue BLOCK Q-write-permissions. STOP. |

## Exit criteria

- [ ] reference-manifest.md exists with ≥ 25 generator rows
- [ ] Every row has a status from {found, ambiguous, external-cdn, bundle-only, missing}
- [ ] No row's `reference path` matches a library-bundle exclusion pattern (per step 5a)
- [ ] Every `missing` and `bundle-only` row has a corresponding BLOCK Q in phase-0-questions.md
- [ ] Foundation-reconciliation Qs (3 of them) are present in phase-0-questions.md
- [ ] phase-0-progress.md has the execute summary paragraph
- [ ] v4-state.md updated with checkpoint

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/02-p0-questionnaire.md`
