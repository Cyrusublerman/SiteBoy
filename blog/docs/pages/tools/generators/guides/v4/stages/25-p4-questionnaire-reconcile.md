# Card 25 — Phase 4 questionnaire + reconcile — close out v4 plan

## What this stage does
Combined card (Phase 4 has minimal questions). Presents any maintenance-doc Qs to user. Applies answers. Produces phase-4-summary.md. Marks plan complete on user confirmation. Updates v4-state.md to terminal state.

## Applicable rules
Operating: R3, R6, R10. Anti-pattern numbers: 8, 19.

## Inputs
- `phase-4-questions.md`
- All Phase 4 outputs (`drift-detection.md`, `single-gen-review.md`, updated issues.md schema)
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical AskQuestion option lists. Use catalogue entries `Q-card-update`, `Q-promote-sub-guide`, `Q-next-cycle-scope`.

## Outputs
- `phase-4-answers.md` (likely small or empty)
- `phase-4-questions-resolved.md`
- `phase-4-summary.md` (also serves as final v4 plan completion summary)

## Procedure

- [ ] 1. Update v4-state.md: `turn: p4-questionnaire`, `stage: questionnaire`, append checkpoint.
- [ ] 2. Read phase-4-questions.md. Count OPEN Qs.
- [ ] 3. **If zero OPEN Qs**: skip to step 7.
- [ ] 4. Group by category. Likely sole category: `card-update` / `promote-sub-guide`.
- [ ] 5. Build AskQuestion payloads, call, capture answers.
- [ ] 6. Write phase-4-answers.md.
- [ ] 7. Update v4-state.md: `turn: p4-reconcile`, `stage: reconcile`, append checkpoint.
- [ ] 8. **For each answered Q with override**: apply patches per Action table below.
- [ ] 9. Write phase-4-questions-resolved.md.
- [ ] 10. Write phase-4-summary.md from template — this is the v4 plan's terminal artefact summarising all four phases.
- [ ] 11. Print summary to user (plain text). Then `AskQuestion`: "Phase 4 complete. Confirm v4 plan completion?".
- [ ] 12. **If user confirms:**
  - Update v4-state.md `phase: 4-complete`, `turn: terminal`, `stage: complete`, `card: terminal`, `last_action: v4 plan complete`, `next_action: maintenance mode (use single-gen-review.md procedures)`, append checkpoint.
  - Mark all v4 plan todos `completed` in TodoWrite.
  - Print: `v4 plan complete. Maintenance mode active. Use blog/docs/pages/tools/generators/single-gen-review.md for new generators or blog/docs/pages/tools/generators/drift-detection.md for periodic checks.`
  - STOP. Do NOT auto-advance to any further card.
- [ ] 13. **If user requests changes**: queue OBSERVE Qs, return to step 4 with new Qs.

## Action table

| Q category | answer | action |
|---|---|---|
| `card-update` (cards reference v4/ path; user wants update) | `update-now` | Find/replace `guides/v4/system-map-authoring.md` → `guides/standards/system-map-authoring.md` in cards 07 and 09. Be surgical. |
| `card-update` | `defer` | Note in phase-4-summary.md "card path update deferred to next maintenance window" |
| `promote-sub-guide` | confirm/decline | Already actioned in Card 24. Mark Q `RESOLVED-CONFIRMED`. |

## Templates

### phase-4-answers.md

(Same schema as phase-2-answers.md. Often empty.)

### phase-4-questions-resolved.md

(Same schema as phase-1-questions-resolved.md.)

### phase-4-summary.md

```markdown
# Phase 4 — Summary (v4 Plan Completion)

**Generated:** <YYYY-MM-DD>
**v4 Plan complete:** yes
**Active maintenance procedures:** drift-detection.md, single-gen-review.md

## Phase outcomes (rolled up across all four phases)

### Phase 0 — Reference Manifest

- Generators in scope: 25
- Found / WONTREVIEW / external-cdn / missing: <a/b/c/d>
- Foundation reconciliation: <one-line outcome>

### Phase 1 — Reference-driven review

- Generators reviewed: <N> + HOST
- Spot audits: <N>; result: <ALL PASS / details>
- Issues logged: <total>; by type: GEN <n> EXP <n> ARCH <n> PERF <n> DOC <n> HOST <n>; by severity: P0 <n> P1 <n> P2 <n> P3 <n>
- Qs raised / resolved: <N> / <N>

### Phase 2 — Triage

- Issues entering Phase 2: <N>
- Issues marked WONTFIX in Phase 2: <K>
- Issues deferred: <D>
- Total batches in fix-order.md: <B>

### Phase 3 — Fix execution

- Batches executed: <B>
- Issues fixed: <F>
- Issues skipped (mid-fix surprise): <S>
- BLOCK Qs raised in Phase 3: <Q>
- New regressions detected via browser verify: <R>

### Phase 4 — Maintenance docs

- drift-detection.md: created
- single-gen-review.md: created
- issues.md schema header: updated to v4
- Sub-guides promoted to standards/: yes/no

## Outstanding work

- Issues remaining open (skipped-phase-3, deferred): <N> — see issues.md status filter
- Generators DEFERRED in Phase 1 (manifest BLOCK): <N>
- Pending shared-module batches: <N>

## Next steps for the user

1. Periodic drift checks: run drift-detection.md canaries monthly
2. New generators: follow single-gen-review.md
3. Outstanding skipped-phase-3 issues: schedule a Phase 5 (or v4.1 fix sweep) when ready
4. Deferred Phase 1 generators (BLOCK): supply reference paths or confirm WONTREVIEW

## v4 plan terminal state

`v4-state.md` now at:
- phase: 4-complete
- turn: terminal
- stage: complete
- card: terminal

To resume work in maintenance mode: read drift-detection.md or single-gen-review.md (NOT this plan's stage cards) — the cards are for the v4 review cycle, which is complete.
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-4-summary.md && \
echo "OK summary present"

rg "^\*\*v4 Plan complete:\*\* yes" blog/docs/pages/tools/generators/phase-4-summary.md && \
echo "OK v4 marked complete"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| User declines completion confirmation | Stay in Phase 4. Capture concerns as new Qs. Re-run reconcile. |
| Some Phase 3 issues still `in-progress` (Phase 3 wasn't fully closed) | Note in summary; user can either confirm completion accepting the open work, or pause and return to Phase 3. |
| User wants additional cycles (e.g. another Phase 1 over more generators added since v4 started) | OK — that's a new run. Confirm v4 complete; queue OBSERVE Q-next-cycle-scope; user starts a fresh state file for the new cycle. |

## Exit criteria

- [ ] phase-4-summary.md exists with v4 plan completion stats
- [ ] phase-4-questions-resolved.md exists (even if no Qs to resolve)
- [ ] User confirmed v4 plan completion
- [ ] v4-state.md is in terminal state (`phase: 4-complete`)
- [ ] All v4 plan todos marked completed

## Next card

None — terminal state. Maintenance mode uses `drift-detection.md` and `single-gen-review.md`, not stage cards.
