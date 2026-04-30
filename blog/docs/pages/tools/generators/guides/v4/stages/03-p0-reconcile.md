# Card 03 — Phase 0 reconcile — apply answers, finalise manifest, summary

## What this stage does
Applies user answers from phase-0-answers.md to the manifest and the rules-reconciliation Qs. Produces phase-0-summary.md. Asks user to confirm entry to Phase 1.

## Applicable rules
Operating: R6 (only act on user-confirmed answers), R10 (state updates). Anti-Fab: F.5 (no v3 reuse — but reconcile is allowed to apply user-supplied paths). Anti-pattern numbers: 19 (do not modify shell), 18 (do not edit pre-v4 content of files).

## Inputs
- `phase-0-questions.md`
- `phase-0-answers.md`
- `reference-manifest.md`
- `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc` (only if user authorised an update)
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical reconcile actions per Q-category and per user answer. The card's Action table below derives from this; if there is any discrepancy, the catalogue wins.

## Outputs
- Updated `reference-manifest.md` (with WONTREVIEW rows marked, missing paths supplied)
- Updated `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc` IF user chose options that require it
- `phase-0-questions-resolved.md` (archive)
- `phase-0-summary.md`

## Procedure

- [ ] 1. Update v4-state.md: `stage: reconcile`, `last_action: phase-0 reconcile begin`, append checkpoint.
- [ ] 2. Read phase-0-answers.md.
- [ ] 3. For each Q in phase-0-questions.md: find its answer in phase-0-answers.md. Apply per the action table below.
- [ ] 4. After all Qs applied: re-read reference-manifest.md and confirm all WONTREVIEW/path-supplied changes were made.
- [ ] 5. Create phase-0-questions-resolved.md from template — copy all Qs with their final status (RESOLVED-CONFIRMED / RESOLVED-OVERRIDE / RESOLVED-WONTREVIEW).
- [ ] 6. Delete or empty phase-0-questions.md (keep file with header only — fresh register for any future Phase 0 work).
- [ ] 7. Write phase-0-summary.md from template below.
- [ ] 8. Print summary to user via plain text (NOT AskQuestion — this is informational, not interactive). Then prompt with one AskQuestion: "Phase 0 reconcile complete. Confirm entry to Phase 1?"
- [ ] 9. If user confirms: update v4-state.md `phase: 1`, `turn: p1-reset`, `card: guides/v4/stages/04-p1-reset.md`, `last_action: phase 0 complete and confirmed`, `next_action: archive v3 DOC issues`, append checkpoint. Print: `Entering Phase 1.` Read card 04. Auto-advance.
- [ ] 10. If user requests changes: queue OBSERVE Qs in NEW phase-0-questions.md, return to step 1 (skip already-applied items).

## Action table (Q answer → action)

| Q category | answer | action |
|---|---|---|
| foundation-reconciliation (Q-rules-base-component) | confirm (option a) | StrReplace `assets/js/core/base-component.js` → `assets/js/shared/foundation.js` in rules.mdc File Ownership row for "Base OO system" |
| foundation-reconciliation (Q-rules-base-component) | override-b (re-export shim) | Write `assets/js/core/base-component.js` containing `export { BaseComponent } from '../shared/foundation.js';` |
| foundation-reconciliation (Q-rules-base-component) | override-c (skip Check 3) | No file change. Note in phase-0-summary.md "BaseComponent verification skipped per user direction" |
| foundation-reconciliation (Q-rules-mathematical-foundation) | confirm (option a — declare aspirational) | No file change. Note in phase-0-summary.md "MathematicalFoundation declared aspirational; Stage E.5 Check 3 layout-math row will not be evaluated" |
| foundation-reconciliation (Q-rules-mathematical-foundation) | override-b (create canonical) | Defer to Phase 4 maintenance; queue PERF-NN tracking Q. Do not create the file in Phase 0. |
| foundation-reconciliation (Q-rules-mathematical-foundation) | override-c (point at existing file) | User-supplied path → StrReplace in rules.mdc |
| rules-pre-decision-reads (Q-rules-compute-scheduler-read) | confirm (option a) | StrReplace rules.mdc Mandatory Pre-Decision Reads table to add `compute-scheduler.md` row |
| rules-pre-decision-reads (Q-rules-compute-scheduler-read) | override-b | No change |
| reference-path-missing (Q-manifest-<id>) | wontreview | StrReplace manifest row for <id>: status → `WONTREVIEW`, notes → `Phase 0 user decision` |
| reference-path-missing (Q-manifest-<id>) | supply (free text) | StrReplace manifest row for <id>: reference path → user-supplied, status → `found`, notes → `Phase 0 user-supplied` |
| any | confirm (default) | If default was DEFER with `ASSUME-NN`, mark all `ASSUME-NN` tags in artefacts as `CONFIRMED-Q-NN` (not yet relevant in Phase 0; relevant later) |

## Templates

### phase-0-questions-resolved.md

```markdown
# Phase 0 — Questions Register (Resolved)

| q_id | original_severity | user_answer | resolution | applied_to | notes |
|---|---|---|---|---|---|
| Q-rules-base-component | DEFER | confirm | RESOLVED-CONFIRMED | rules.mdc:<line> | path updated |
```

### phase-0-summary.md

```markdown
# Phase 0 — Summary

**Generated:** <ISO timestamp>
**Reconcile complete:** yes
**Ready for Phase 1:** <yes / no — with reason>

## Manifest

- Total generators: 25
- Status `found`: <N>
- Status `ambiguous`: <N>
- Status `external-cdn`: <N>
- Status `WONTREVIEW` (user decision): <N>

## Foundation reconciliation

- Q-rules-base-component: <resolution>
- Q-rules-mathematical-foundation: <resolution>
- Q-rules-compute-scheduler-read: <resolution>

## Q resolution stats

- Total Qs: <N>
- RESOLVED-CONFIRMED: <N>
- RESOLVED-OVERRIDE: <N>
- RESOLVED-WONTREVIEW: <N>

## Phase 1 readiness

- Manifest covers <N>/25 generators (the rest are WONTREVIEW)
- Foundation paths reconciled: yes/no
- Open blockers: <list, or "none">
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-0-questions-resolved.md && \
test -f blog/docs/pages/tools/generators/phase-0-summary.md && \
echo "OK reconcile artefacts present"
```

Manual: every Q in phase-0-questions-resolved.md has a `resolution` value in {RESOLVED-CONFIRMED, RESOLVED-OVERRIDE, RESOLVED-WONTREVIEW}.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| User answer references a path that doesn't exist | Re-Read to confirm. If genuinely missing, treat as user error → re-prompt with single AskQuestion in this card (allowed exception). |
| StrReplace on rules.mdc fails (string not unique) | Re-Read rules.mdc, find unique surrounding context, retry. If still fails after 3 attempts → queue BLOCK Q-rules-mdc-edit-failure. STOP. |
| User declines to confirm Phase 1 entry | Stay in Phase 0. Queue user concerns as new Qs. Re-run reconcile when concerns addressed. |

## Exit criteria

- [ ] Every Q in phase-0-questions-resolved.md has RESOLVED-* status
- [ ] phase-0-summary.md exists with Phase 1 readiness section
- [ ] reference-manifest.md WONTREVIEW rows match user answers
- [ ] If rules.mdc was modified, the modification matches the user's chosen option
- [ ] User has confirmed entry to Phase 1 (or has been informed of remaining blockers)
- [ ] v4-state.md updated; if Phase 1 confirmed, points at card 04

## Next card

If user confirmed: `blog/docs/pages/tools/generators/guides/v4/stages/04-p1-reset.md`
If user did not confirm: stay on this card; await new Qs/answers.
