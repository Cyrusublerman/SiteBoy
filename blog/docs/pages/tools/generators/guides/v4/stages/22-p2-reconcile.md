# Card 22 — Phase 2 reconcile — finalise fix-order, confirm Phase 3

## What this stage does
Applies user triage answers from phase-2-answers.md to fix-order.md (drop wontfix, reorder per overrides, merge/split batches per conflict resolution). Writes phase-2-summary.md. Asks user to confirm entry to Phase 3.

## Applicable rules
Operating: R6, R10. Anti-pattern numbers: 18 (additive — fix-order is rewritten if needed; issues.md is patched).

## Inputs
- `phase-2-questions.md`
- `phase-2-answers.md`
- `fix-order.md`
- `issues.md`
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical reconcile actions per Q-category and per user answer. Catalogue wins on any discrepancy with this card's Action table.

## Outputs
- Updated `fix-order.md` (post-triage)
- Updated `issues.md` (status changes for new wontfix; severity changes for promotions)
- `phase-2-questions-resolved.md`
- `phase-2-summary.md`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p2-reconcile`, `stage: reconcile`, append checkpoint.
- [ ] 2. Read phase-2-answers.md.
- [ ] 3. **For each `wontfix` answer**: StrReplace fix-order.md to remove that issue's row from its batch; StrReplace issues.md to set issue status to `wontfix`. Add to fix-order.md's "Skipped issues" section.
- [ ] 4. **For each `keep` answer**: no change; mark Q `RESOLVED-CONFIRMED`.
- [ ] 5. **For each `defer` answer**: StrReplace fix-order.md to remove from batch; add to a new "Deferred issues" section with note "post-Phase 3 review".
- [ ] 6. **For each `sequential`/`merged` batch-conflict answer**: re-write the affected batch in fix-order.md with notes `(sequential per Q-NN)` or `(merged per Q-NN)`.
- [ ] 7. **For each `skip-a` / `skip-b` answer**: drop the skipped issue from fix-order, mark wontfix in issues.md.
- [ ] 8. **For each `promote-p0` / `promote-p1` answer**: StrReplace issues.md to update severity; re-sort fix-order.md to reflect new priority (issue may move to higher batch position).
- [ ] 9. **Recompute fix-order summary counts** (total batches, total issues, skipped) at the top of fix-order.md.
- [ ] 10. Write `phase-2-questions-resolved.md`.
- [ ] 11. Write `phase-2-summary.md`.
- [ ] 12. Print summary to user (plain text). Then `AskQuestion`: "Phase 2 reconcile complete. Confirm entry to Phase 3 (fix execution)?"
- [ ] 13. **If user confirms:** update v4-state.md `phase: 3`, `turn: p3-fix`, `card: 23-p3-fix.md`, `stage: pre-batch-1`, append checkpoint. Print: `Entering Phase 3.` Read card 23. Auto-advance.
- [ ] 14. **If user requests changes:** queue OBSERVE Qs in NEW phase-2-questions.md, return to step 3.

## Templates

### phase-2-questions-resolved.md

(Same schema as phase-1-questions-resolved.md.)

### phase-2-summary.md

```markdown
# Phase 2 — Summary

**Generated:** <YYYY-MM-DD>
**Reconcile complete:** yes
**Ready for Phase 3:** <yes / no>

## Triage outcomes

- Issues entering Phase 2: <N>
- Issues marked WONTFIX in Phase 2: <K>
- Issues deferred (post-Phase 3 review): <D>
- Issues with severity promoted: <P>
- Batches merged: <M>
- Batches split: <S>

## Final fix-order summary

- Total batches: <B>
- Batches with P0 issues: <n>
- Batches with P1 issues: <n>
- Batches with P2/P3 only: <n>
- Total fix actions: <F>
- Estimated Phase 3 user touchpoints: <≥ 2 + B + (mini-questionnaires)>

## Q resolution stats

- Total Qs: <N>
- RESOLVED-CONFIRMED: <N>
- RESOLVED-OVERRIDE: <N>

## Phase 3 readiness

- fix-order.md final and authoritative: yes
- All triage Qs resolved: yes
- Open blockers: <list, or "none">
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-2-questions-resolved.md && \
test -f blog/docs/pages/tools/generators/phase-2-summary.md && \
echo "OK reconcile artefacts present"

# Sanity: fix-order.md issue count + skipped count == issues.md non-wontfix count + Phase 2 wontfix count
echo "Manual: counts reconcile across fix-order, issues, summary"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| StrReplace on fix-order.md fails (heavy editing makes structure brittle) | Re-Write the entire fix-order.md from in-context working list (recompute from issues.md if needed). |
| Severity promotion creates batch reorder cycle | Apply promotion. Re-sort. Note in summary. |
| User declines Phase 3 entry | Stay in Phase 2. Queue concerns. Re-run reconcile. |

## Exit criteria

- [ ] phase-2-questions-resolved.md exists with all RESOLVED-*
- [ ] phase-2-summary.md exists with all sections
- [ ] fix-order.md updated to reflect all triage decisions
- [ ] issues.md severity/status updates applied
- [ ] User confirmed entry to Phase 3 (or declined and reset state)
- [ ] If confirmed, v4-state.md points at card 23

## Next card

If confirmed: `blog/docs/pages/tools/generators/guides/v4/stages/23-p3-fix.md`
If not confirmed: stay on this card; await new Qs/answers.
