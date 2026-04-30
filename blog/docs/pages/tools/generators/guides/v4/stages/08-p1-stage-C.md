# Card 08 — Phase 1 Stage C — EXTRACT LIVE (Live Capability Table)

## What this stage does
Builds the Live Capability Table from the live `.gen.js` source ONLY. Same row schema as Reference Capability Table. No comparison yet — that's Stage D.

## Applicable rules
Operating: R5, R10. Anti-Fab: F.1, F.2, F.4, F.6 (cite live file:line; no paraphrasing). Anti-pattern numbers: 5, 6, 13 (no v3 reuse without re-verification).

## Inputs
- Live `.gen.js` source (in context from Stage A)

## Outputs
- Live Capability Table — held in agent context; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: C`, append checkpoint.
- [ ] 2. Re-Read the live `.gen.js` if it has scrolled out of context (always cheap).
- [ ] 3. **Extract every entry in `parameters` arrays** within `SCRIPT_CONFIG` (or equivalent). Each entry → one `param` row in Live Capability Table. `evidence` cites the parameters array entry's file:line.
- [ ] 4. **Identify the entry function** (`onInit`, `setup`, `p5Setup`, or top-level for non-class). Identify the per-frame entry (`draw`, `p5Draw`, `onTick`, or `onAnimate`). Record both.
- [ ] 5. **Extract every method called from `draw`/`p5Draw`** (transitively, one level deep). Each distinct compute or render step → one `behaviour` row.
- [ ] 6. **Extract every distinct branch** in render-mode dispatch (e.g. `if (this.mode === 'density')`, `switch (this.params.mode)`). Each branch → one `render-mode` row.
- [ ] 7. **Extract every event registration** in `onInit`/`p5Setup` (`addEventListener`, `p5.mousePressed`, `canvas.onclick`, etc.). Each → one `interaction` row.
- [ ] 8. **Extract every export hook** (image/blob download, JSON state, etc.). Each → one `export` row.
- [ ] 9. **Extract any audio in/out** (Web Audio API, p5.sound). Each → one `audio` row.
- [ ] 10. **Extract any UI controls beyond params** (legends, debug overlays, info pop-ups). Each → one `ui-control` row.
- [ ] 11. Apply Minimum Content Gates: ≥ 3 rows for non-stub generators.
- [ ] 12. Re-Read each cited file:line to confirm citations (RULE F.1).
- [ ] 13. Update v4-state.md: `stage: C.5`, `last_action: live capability table built (<N> rows)`, `next_action: build live system map + divergence`, append checkpoint.
- [ ] 14. Read card `09-p1-stage-C5.md` — auto-advance.

## Templates

### Live Capability Table row schema (same as Reference)

```markdown
| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | density | assets/js/tools/generators/scripts/wave/cymatics.gen.js:34 | matches reference R-01 (cap_id correlation in Stage D) |
| L-02 | render-mode | density mode | cymatics.gen.js:215 | branched on params.mode === 'density' |
```

Note the `cap_id` prefix is `L-` for live (vs `R-` for reference). Stage D will join via the `live_match` column.

### Notable extraction patterns

| Live source pattern | What to extract |
|---|---|
| `parameters: [ { id: 'foo', type: 'slider', ... } ]` in SCRIPT_CONFIG | One `param` row per entry; `name` from `label` or `id` |
| `onInit(host) { this.foo = ... }` | Inspect what's set up — buffer allocations, event registrations |
| `draw(host) { ... }` | Walk top-level of body; each named call is a candidate behaviour |
| `if (mode === 'X') { ... } else if (mode === 'Y') { ... }` | One `render-mode` row per branch |
| `host.canvas.addEventListener('click', ...)` | One `interaction` row |
| `compute: { worker: true, computePixels: ... }` | Note in `notes` column of relevant `behaviour` row — Stage E.6 will pick this up |
| `mode: 'p5'` in SCRIPT_CONFIG | Live is a p5 generator; affects Mode in Stage C.5 |

## Minimum Content Gates

| Artefact | Minimum | If below |
|---|---|---|
| Live Capability Table | ≥ 3 rows | Re-Read live source — agent likely missed sections. If stub (live < 50 lines, no real logic), record fewer rows and queue Q-stub-live-<id> (DEFER). |

## Validation

(No file output yet — Live Capability Table is in context, written in Stage F.)

Manual: agent confirms every cited file:line in the in-context table has been Read this turn.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Live source < 50 lines, no real logic (stub) | Capability Table will be near-empty. That's OK — note in Stage F as ARCH P1 `live-stub-<id>`. CONTINUE. |
| `parameters` array has dynamic generation (e.g. `parameters: buildParams()`) | Read `buildParams()`; treat its return value as the parameters array. Cite both call site and definition. |
| Live source uses an unfamiliar pattern not in the table above | Inspect, classify into the closest `kind`, queue OBSERVE Q-pattern-<id>. CONTINUE. |
| Cited file:line content doesn't match | Fix the citation. F.1 is non-negotiable. |

## Exit criteria

- [ ] Live Capability Table built; ≥ minimum rows; every row has `evidence` file:line citation
- [ ] All cited file:lines have been Read in this turn
- [ ] v4-state.md updated; `stage: C.5`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/09-p1-stage-C5.md`
