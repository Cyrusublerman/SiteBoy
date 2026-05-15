# Card 18 — Phase 1 questionnaire — present batched questions

## What this stage does
Reads `phase-1-questions.md` (now containing all DEFER/BLOCK Qs accumulated across 26 turns + spot audit). Groups by category. Presents to user via `AskQuestion` in batches ≤ 20 per call. Captures answers to `phase-1-answers.md`. Same machinery as Phase 0 questionnaire but at scale.

## Applicable rules
Operating: R3 (AskQuestion only here), R6 (no decisions), R7. Anti-pattern numbers: 8 (no questions outside this card).

## Inputs
- `phase-1-questions.md` (frozen as-is when this card starts)
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical AskQuestion option lists for every category. The register's `category` column maps to a catalogue entry; use that entry's options verbatim.

## Outputs
- `blog/docs/pages/tools/generators/phase-1-answers.md`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p1-questionnaire`, `stage: questionnaire`, `card: 18-p1-questionnaire.md`, append checkpoint.
- [ ] 2. Read phase-1-questions.md. Count OPEN Qs.
- [ ] 3. If zero OPEN Qs → write empty phase-1-answers.md (just header), skip to step 9.
- [ ] 4. Group OPEN Qs by `category` column. Likely categories: `intentional-drop`, `v4-extension-confirm`, `reference-canonical`, `status-classification`, `mode-extension`, `parallelisable-extension`, `v4-extension-stub-live`, `spot-audit-fail`.
- [ ] 5. Order categories by impact-on-Phase-2 priority:
  1. `spot-audit-fail` (must resolve before Phase 2 — affects re-run decisions)
  2. `intentional-drop` (affects severity classification of GEN issues)
  3. `v4-extension-confirm` (affects whether live-only is a feature or a bug)
  4. `reference-canonical` (affects which source was actually reviewed)
  5. `status-classification` (affects severity)
  6. `mode-extension` / `parallelisable-extension` / `vocabulary-extension` (catalogue maintenance)
  7. `v4-extension-stub-live` (affects which generators may need rebuild from scratch)
  8. Others
- [ ] 6. For each category (≤ 20 Qs per AskQuestion call): build payload using template below. Multiple-choice where Qs have discrete agent_default options; free-text otherwise.
- [ ] 7. Call AskQuestion. Capture answers to a running list.
- [ ] 8. If a category has > 20 Qs, repeat for next batch.
- [ ] 9. Write `phase-1-answers.md` from template — one row per Q.
- [ ] 10. Update v4-state.md: `turn: p1-reconcile`, `card: 19-p1-reconcile.md`, `last_action: questionnaire complete (<N> answers captured across <K> AskQuestion calls)`, `next_action: apply answers and reconcile`, append checkpoint.
- [ ] 11. Print: `Phase 1 questionnaire complete. <N> Qs answered. Next: card 19-p1-reconcile.md.`
- [ ] 12. Read card 19 — auto-advance.

## Templates

### AskQuestion payload patterns

For Qs with agent_default options (typical for `intentional-drop`):

```
{
  id: "<q_id>",
  prompt: "<gen_id> — <ref capability description from Q summary> — agent default: <agent_default>. Choose:",
  options: [
    { id: "confirm-bug", label: "Confirm: this is a bug — restore in Phase 3" },
    { id: "intentional-drop", label: "Intentional drop — update feature-parity.md to record" },
    { id: "wontfix", label: "WONTFIX — accept absence permanently" }
  ]
}
```

For `v4-extension-confirm`:

```
{
  id: "<q_id>",
  prompt: "<gen_id> has live-only capability '<L_name>' not in reference. Intentional addition or accidental?",
  options: [
    { id: "intentional", label: "Intentional v4-extension — keep" },
    { id: "remove", label: "Accidental — remove or align with reference" },
    { id: "investigate", label: "Need to investigate — defer to Phase 2 triage" }
  ]
}
```

For `reference-canonical`:

```
{
  id: "<q_id>",
  prompt: "<gen_id>: two reference files plausible (<file_a>, <file_b>). Used <file_a>. Confirm?",
  options: [
    { id: "confirm", label: "Confirm <file_a>" },
    { id: "switch", label: "Use <file_b> — re-run Stage B/C/D for this generator" },
    { id: "both", label: "Both are canonical (different aspects) — combine in feature-parity" }
  ]
}
```

### phase-1-answers.md

```markdown
# Phase 1 — User Answers

| q_id | user_answer | notes (if free-text) | captured_at |
|---|---|---|---|
| Q-intentional-drop-cymatics-R-04 | confirm-bug | — | <timestamp> |
| Q-v4-extension-cymatics-L-09 | intentional | — | <timestamp> |
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-1-answers.md && \
echo "OK answers file exists"
```

Manual: count OPEN Qs in phase-1-questions.md vs answer rows in phase-1-answers.md (should match).

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| User abandons mid-batch | Save partial answers; mark unanswered Qs as `OPEN`; queue continuation in phase-1-answers.md. STOP and wait for resume. |
| User answer is ambiguous | Note in `notes` column. Default to most-conservative (favour bug/restore over wontfix) unless answer is clearly opposite. |
| AskQuestion call fails for a batch | Retry once. If persistent → queue BLOCK Q-tooling-askquestion. Continue with remaining batches; STOP after all batches attempted. |
| > 200 OPEN Qs (very many turns produced lots of DEFER) | Allowed — split into ~10+ AskQuestion calls. Grouping by category mitigates user fatigue. |

## Exit criteria

- [ ] phase-1-answers.md exists
- [ ] Every OPEN Q in phase-1-questions.md has an answer row (or is marked still-OPEN with reason)
- [ ] v4-state.md updated; points at card 19

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/19-p1-reconcile.md`
