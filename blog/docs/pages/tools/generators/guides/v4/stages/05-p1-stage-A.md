# Card 05 — Phase 1 Stage A — INGEST (single batched read)

## What this stage does
Opens the seven mandatory per-generator files in one batched parallel Read call, plus three standards files once per session. No analysis. No extraction. This stage exists to load context cleanly and prove all needed files exist.

## Applicable rules
Operating: R3 (batched reads), R5 (one card at a time), R10 (state). Anti-Fab: F.1 (you will need to cite these files later — read them now). Anti-pattern numbers: 22 (no reading >7 files), 16 (do the stage even if "did similar last turn").

## Scope rule — what counts as "the source"
The reference source is **the user's sketch code only**. The library APIs the source uses (p5.js, three.js, d3, custom utility scripts pulled from a CDN) are **opaque** — we do not read into them, we do not extract their internals as capabilities. If the source calls `noiseSeed(42)`, the capability is "uses Perlin noise with seed 42", not "documents Perlin noise algorithm." The translation work is: source uses `library.X` → live should use `assets/js/shared/algorithms/<category>/<file>.js` for the equivalent if one exists. Library bundles must never enter context.

## Inputs
- `reference-manifest.md` (for canonical reference path of current generator)
- `v4-state.md` (for current `turn:` value, e.g. `p1-gen-04-cymatics` → generator id is `cymatics`)

## Outputs
- No new file. Context loaded. State updated.

## Procedure

- [ ] 1. Read v4-state.md. Extract `turn:` value. Parse generator id from id (e.g. `p1-gen-04-cymatics` → `cymatics`). If turn is `p1-host`, STOP — wrong card; read card 16 instead.
- [ ] 2. Read reference-manifest.md. Find row for this generator id. Extract `reference path` and `secondary` (if any). If status is `WONTREVIEW`, `missing`, `external-cdn`, or `bundle-only` → STOP, queue OBSERVE Q-skipped-<id>, advance v4-state.md to next turn id, read card 05 for the next generator.
- [ ] 2a. **Sanity-check the reference path.** Reject if it matches any library-bundle pattern (per Card 01 step 5a): `**/p5.js`, `**/p5.min.js`, `**/three.js`, `**/d3.js`, `**/lib/`, `**/vendor/`, `**/node_modules/`. If matched → manifest is corrupt for this row; queue BLOCK Q-reference-bundle-`<id>`, mark turn DEFERRED, advance.
- [ ] 3. Determine live source path: `Glob assets/js/tools/generators/scripts/**/<id>.gen.js`. Should return exactly one match. If zero → queue BLOCK Q-live-source-missing-<id>, mark generator DEFERRED, advance to next turn. If multiple → pick the one in the canonical category folder; queue OBSERVE Q-live-source-ambiguous-<id>.
- [ ] 4. Determine per-gen doc folder: `blog/docs/pages/tools/generators/<id>/`. Glob to confirm.
- [ ] 5. Construct the 7-file batched Read. Single message, parallel Read tool calls (the Cursor tool harness supports parallel calls in one assistant message — use this).
  - File 1: reference path (from manifest)
  - File 2: live `.gen.js` path
  - File 3: `blog/docs/pages/tools/generators/<id>/feature-parity.md`
  - File 4: `blog/docs/pages/tools/generators/<id>/description.md`
  - File 5: `blog/docs/pages/tools/generators/<id>/ui-layout.md`
  - File 6: `blog/docs/pages/tools/generators/<id>/performance.md`
  - File 7: `blog/docs/pages/tools/generators/<id>/system-map.md` (may not exist yet — that's OK)
- [ ] 5a. **Size backstops** (apply per file as Read returns):
  - If File 1 (reference) > 10,000 lines → almost certainly a library bundle slipped past Card 01 filtering. Halt Stage A, queue BLOCK Q-reference-bundle-`<id>`, mark turn DEFERRED, advance to next.
  - If File 1 (reference) > 2,000 lines but ≤ 10,000 → genuinely large user sketch. Read whole; queue OBSERVE Q-large-source-`<id>` so context cost is tracked. Continue.
  - If File 3 (existing feature-parity.md) > 5,000 lines → likely v3 garbage. Re-Read with `limit: 200` only; do not retain full file. Queue OBSERVE Q-runaway-doc-`<id>` (path, line count). Continue.
  - All other files have no expected upper bound; if any is > 2,000 lines, note in Stage F log.
- [ ] 6. For any file that returns "file not found" (other than file 7): note in the Stage F log; do NOT halt. Files 3-6 may be missing for under-documented generators — that's a finding for Stage E (DOC P3).
- [ ] 7. If this is the FIRST Phase 1 turn of the session (check `v4-state.md` `session_count` and prior turn id): also Read in the same message:
  - `blog/docs/guides/standards/compute-scheduler.md`
  - `blog/docs/guides/standards/gpu-compute.md`
  - `blog/docs/guides/tools/gpu-shader-authoring.md`
  - These are session-cached; do not re-Read for subsequent turns this session.
- [ ] 8. Update v4-state.md: `stage: B`, `last_action: stage A ingest complete (<N> files read)`, `next_action: extract reference capabilities`, append checkpoint.
- [ ] 9. Read card `06-p1-stage-B.md` — auto-advance.

## Templates

(No artefact templates — this stage produces no artefacts.)

## Validation

```bash
echo "Stage A is validated by completion of subsequent stages — there is no file output to validate."
```

Manual: agent confirms all batched Reads returned content (or "file not found" was noted for files 3-7). If the reference source or live source returned no content → halt.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Generator id has status `WONTREVIEW` / `missing` / `external-cdn` / `bundle-only` in manifest | Queue OBSERVE Q-skipped-<id>. Advance v4-state.md to next turn id. Read card 05 for next generator. (i.e. skip this entire turn cleanly.) |
| Reference path matches a library-bundle pattern (per step 2a) | Queue BLOCK Q-reference-bundle-`<id>`. Mark turn DEFERRED. Advance. Manifest will be repaired in Phase 0 reconcile of next session. |
| Reference file > 10,000 lines (bundle slipped past) | Same as above — queue BLOCK Q-reference-bundle-`<id>`, halt turn. Do **not** retain the file content in context. |
| Reference file 2,000–10,000 lines | Queue OBSERVE Q-large-source-`<id>`. Continue. Do not chunk — we need the whole user sketch. |
| Per-gen feature-parity.md > 5,000 lines (runaway v3 doc) | Re-Read with `limit: 200`. Queue OBSERVE Q-runaway-doc-`<id>`. Continue. |
| Live source not found at expected path | Queue BLOCK Q-live-source-missing-<id>. Mark turn DEFERRED. Advance to next turn. |
| Reference source can't be Read (permissions / corrupted) | Queue BLOCK Q-reference-unreadable-<id>. Mark turn DEFERRED. Advance to next turn. |
| Per-gen doc folder doesn't exist | This is OK. Note in Stage F log as DOC P2 candidate for that generator's doc skeleton. CONTINUE Stage A with files 4-6 returning "not found". |
| Standards file missing (only on first turn) | Queue BLOCK Q-standards-missing. STOP — Phase 1 cannot proceed without standards context. |

## Exit criteria

- [ ] Reference source content is in current context (Read returned content)
- [ ] Live source content is in current context
- [ ] Standards files have been Read at least once this session
- [ ] v4-state.md updated; `stage: B`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/06-p1-stage-B.md`
