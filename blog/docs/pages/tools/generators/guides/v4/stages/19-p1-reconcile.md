# Card 19 — Phase 1 reconcile — apply answers, patch artefacts, summary

## What this stage does
Applies user answers from phase-1-answers.md to affected artefacts (per-gen feature-parity.md, system-map.md, issues.md). Marks Q register entries RESOLVED. Produces phase-1-summary.md. Asks user to confirm entry to Phase 2.

## Applicable rules
Operating: R6 (only act on user-confirmed answers), R10. Anti-Fab: F.5 (re-verify when applying overrides). Anti-pattern numbers: 18 (additive — apply overrides as patches, don't restructure).

## Inputs
- `phase-1-questions.md`
- `phase-1-answers.md`
- All affected per-gen `feature-parity.md`, `system-map.md`, `issues-and-conflicts.md`
- Central `issues.md`
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical reconcile actions per Q-category and per user answer. Catalogue wins on any discrepancy with this card's Action table.

## Outputs
- Updated per-gen artefacts (per `RESOLVED-OVERRIDE` Q's `applied_to`)
- Updated `issues.md` (issue rows added/removed/severity-adjusted per overrides)
- `phase-1-questions-resolved.md`
- `phase-1-summary.md`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p1-reconcile`, `stage: reconcile`, `card: 19-p1-reconcile.md`, append checkpoint.
- [ ] 2. Read phase-1-answers.md.
- [ ] 3. **For each answered Q**, classify:
  - `RESOLVED-CONFIRMED` — user picked the agent's default option
  - `RESOLVED-OVERRIDE` — user picked a different option (requires artefact patch)
  - `RESOLVED-WONTREVIEW` — user marked permanent skip
- [ ] 4. **For each `RESOLVED-OVERRIDE`**: identify affected artefact rows (from Q's `files_affected` column). Apply per the Action table below. Use StrReplace for surgical edits.
- [ ] 5. **For each `RESOLVED-CONFIRMED` with ASSUME-NN tag in artefact**: re-Read affected row, change `ASSUME-NN` to `CONFIRMED-Q-NN`.
- [ ] 6. **For each `RESOLVED-WONTREVIEW`**: mark relevant items in artefacts with `WONTREVIEW-Q-NN` per-row tag; relevant issues in issues.md status changed to `wontfix`.
- [ ] 7. **For BLOCK Qs resolved with new info** (e.g. user supplied a missing reference path): re-run only the affected turn(s). Update v4-state.md to point at that turn's card 05 and execute. Return to this card after completion.
- [ ] 8. Write `phase-1-questions-resolved.md` from template — every Q with its final state.
- [ ] 9. Empty `phase-1-questions.md` (keep header only).
- [ ] 10. Write `phase-1-summary.md` from template below.
- [ ] 11. Run final acceptance checks (the Phase 1 acceptance checklist from the shell). For each unchecked → fix or queue Q.
- [ ] 12. Print summary to user (plain text). Then prompt with one AskQuestion: "Phase 1 reconcile complete. Confirm entry to Phase 2 (triage)?"
- [ ] 13. **If user confirms:** update v4-state.md `phase: 2`, `turn: p2-execute`, `card: 20-p2-execute.md`, `last_action: phase 1 complete and confirmed`, `next_action: build fix-order.md`, append checkpoint. Print: `Entering Phase 2.` Read card 20. Auto-advance.
- [ ] 14. **If user requests changes:** queue OBSERVE Qs in NEW phase-1-questions.md, return to step 4 with the new Qs.

## Action table (Q answer → artefact patches)

| Category | answer | action |
|---|---|---|
| `intentional-drop` | `confirm-bug` | No artefact change (default was `log GEN`); ensure issue exists in issues.md and per-gen file |
| `intentional-drop` | `intentional-drop` | StrReplace per-gen `feature-parity.md` Diff Table row: status → `intentionally-dropped`; remove issue from issues.md (mark status `wontfix-intentional-drop`); update per-gen issues-and-conflicts.md |
| `intentional-drop` | `wontfix` | Same as `intentional-drop` (drop from active issues, mark wontfix) |
| `v4-extension-confirm` | `intentional` | Add note to per-gen feature-parity.md v4 Review section's Live-only footer: `confirmed v4-extension`. No issue. |
| `v4-extension-confirm` | `remove` | Log new GEN-NN P2 `accidental-v4-extension-<L-id>`; suggested fix `align with reference or remove` |
| `v4-extension-confirm` | `investigate` | Defer to Phase 2 triage; mark in feature-parity.md `pending Phase 2 triage` |
| `reference-canonical` | `confirm` | No change; mark Q `RESOLVED-CONFIRMED` |
| `reference-canonical` | `switch` | Update reference-manifest.md row; queue re-run for that generator (handled in step 7) |
| `reference-canonical` | `both` | Update reference-manifest.md row to list both files; queue re-extraction with combined source |
| `status-classification` (e.g. partial vs absent) | (user-supplied status) | StrReplace Diff Table row's status; recompute decision/severity per Stage D rules |
| `mode-extension` / `parallelisable-extension` | `accept-extension` | Add to closed vocabulary in system-map-authoring.md (queue OBSERVE Q-card-update in NEW phase-1-questions.md) |
| `spot-audit-fail` | re-run scheduled and complete | Mark Q `RESOLVED-CONFIRMED`; note re-run results in summary |

## Templates

### phase-1-questions-resolved.md

```markdown
# Phase 1 — Questions Register (Resolved)

| q_id | original_severity | category | user_answer | resolution | applied_to | notes |
|---|---|---|---|---|---|---|
| Q-intentional-drop-cymatics-R-04 | DEFER | intentional-drop | confirm-bug | RESOLVED-CONFIRMED | issues.md GEN-014 (no patch needed) | — |
| Q-v4-extension-cymatics-L-09 | DEFER | v4-extension-confirm | intentional | RESOLVED-OVERRIDE | feature-parity.md cymatics Live-only footer:line — added 'confirmed' | — |
```

### phase-1-summary.md

```markdown
# Phase 1 — Summary

**Generated:** <YYYY-MM-DD>
**Reconcile complete:** yes
**Ready for Phase 2:** <yes / no>

## Coverage

- Generators reviewed: <N> / 25
- Generators WONTREVIEW: <N>
- Generators DEFERRED (re-run pending): <N>
- HOST review complete: yes/no

## Issues logged (post-reconcile)

| type | P0 | P1 | P2 | P3 | total |
|---|---|---|---|---|---|
| GEN | <n> | <n> | <n> | <n> | <n> |
| EXP | ... | ... | ... | ... | <n> |
| ARCH | ... | ... | ... | ... | <n> |
| PERF | ... | ... | ... | ... | <n> |
| DOC | ... | ... | ... | ... | <n> |
| HOST | ... | ... | ... | ... | <n> |
| TOTAL | <n> | <n> | <n> | <n> | <n> |

## Q resolution stats

- Total Qs (cumulative across 26 turns + spot audit): <N>
- RESOLVED-CONFIRMED: <N>
- RESOLVED-OVERRIDE: <N>
- RESOLVED-WONTREVIEW: <N>
- Re-runs triggered: <N> generators

## Spot audit

- Audits performed: <N>
- Result: <ALL PASS | <X> FAILED, all re-run successfully>

## Acceptance checklist

(copy of the checklist from shell `## Acceptance criteria for "Phase 1 complete"` with checked/unchecked status)

- [x] reference-manifest.md complete
- [x] every generator has v4 Review section
- [ ] (any unchecked items here)

## Phase 2 readiness

- All acceptance items checked: yes/no
- Open blockers: <list, or "none">
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-1-questions-resolved.md && \
test -f blog/docs/pages/tools/generators/phase-1-summary.md && \
echo "OK reconcile artefacts present"
```

Manual: every Q in phase-1-questions-resolved.md has a `resolution` value. Every override Q has `applied_to` cite (file:line of the patch).

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| StrReplace fails on a per-gen feature-parity.md (file structure odd after additive edits) | Re-Read file. Find unique surrounding context. Retry. If persistent, log BLOCK Q-feature-parity-corrupt-<id>. STOP that patch; continue with others. |
| Override changes a row that was already changed by a prior reconcile patch (race) | Re-Read the row's current state, apply the override on top. Note in resolved register. |
| User declines Phase 2 entry | Stay in Phase 1. Queue user concerns as new Qs. Re-run reconcile when concerns addressed. |
| Acceptance checklist has unchecked items after reconcile | List them in summary. Inform user. Either user accepts and confirms entry anyway, or specifies fixes (which may require new turns). |

## Exit criteria

- [ ] phase-1-questions-resolved.md has RESOLVED-* status on every Q
- [ ] phase-1-summary.md exists with all sections including acceptance checklist
- [ ] Every override Q has applied_to file:line cite
- [ ] User has confirmed entry to Phase 2 (or has declined and reset state to address concerns)
- [ ] If confirmed, v4-state.md points at card 20

## Next card

If confirmed: `blog/docs/pages/tools/generators/guides/v4/stages/20-p2-execute.md`
If not confirmed: stay on this card; await new Qs/answers.
