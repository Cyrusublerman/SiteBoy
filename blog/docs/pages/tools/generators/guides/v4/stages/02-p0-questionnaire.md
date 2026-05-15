# Card 02 — Phase 0 questionnaire — present batched questions to user

## What this stage does
Reads phase-0-questions.md, groups OPEN Qs by category, presents them via `AskQuestion` in one or more batches. Captures user answers. Does NOT apply answers — that's the next card.

## Applicable rules
Operating: R3 (AskQuestion only at phase questionnaires), R6 (don't decide for user), R7 (no chat prose). Anti-pattern numbers: 8 (no questions outside this card).

## Inputs
- `phase-0-questions.md` (frozen as-is when this card starts)
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical Q content (wording, AskQuestion option lists). Each register row's `category` column references one entry here.

## Outputs
- `phase-0-answers.md` (raw user answers, with q_id mapping)

## Procedure

- [ ] 1. Update v4-state.md: `stage: questionnaire`, `last_action: phase-0 questionnaire begin`, append checkpoint.
- [ ] 2. Read phase-0-questions.md. Count OPEN Qs.
- [ ] 3. If zero OPEN Qs → skip to step 8.
- [ ] 4. Group OPEN Qs by `category` column. Look up each category in the question-catalogue.md to get its canonical wording and options.
- [ ] 5. For each category (≤ 20 Qs per AskQuestion call): build an AskQuestion payload. **Use the AskQuestion options listed in question-catalogue.md for that category as authoritative.** The template below shows only the structural shape; the option `id` and `label` values come from the catalogue. Free-text option ("other — specify") always available.
- [ ] 6. Call AskQuestion. Capture answers.
- [ ] 7. If category had > 20 Qs, repeat step 6 for the next batch.
- [ ] 8. Write phase-0-answers.md from template below — one row per Q, mapping q_id → user_answer.
- [ ] 9. Update v4-state.md: `turn: p0-reconcile`, `card: guides/v4/stages/03-p0-reconcile.md`, `last_action: questionnaire complete, <N> answers captured`, `next_action: apply answers and reconcile`, append checkpoint.
- [ ] 10. Print: `Phase 0 questionnaire complete. <N> Qs answered. Next: card 03-p0-reconcile.md.`
- [ ] 11. Read card `03-p0-reconcile.md` — auto-advance.

## Templates

### AskQuestion payload pattern

For each Q with discrete options (a/b/c):

```
{
  id: "<q_id>",
  prompt: "<summary from Q register> — agent default: <agent_default>. Choose:",
  options: [
    { id: "confirm", label: "Confirm agent default" },
    { id: "override-a", label: "<option a label>" },
    { id: "override-b", label: "<option b label>" },
    { id: "wontreview", label: "Mark as WONTREVIEW (permanent skip)" }
  ]
}
```

For free-text Qs (e.g. supplying a missing reference path):

```
{
  id: "<q_id>",
  prompt: "<summary> — please provide path or say WONTREVIEW",
  options: [
    { id: "wontreview", label: "WONTREVIEW (permanent skip for this generator)" },
    { id: "supply", label: "I will supply the path in the next message" }
  ]
}
```

If user picks `supply`, the agent waits for the next message containing the path; the path is then captured in phase-0-answers.md as the answer.

### phase-0-answers.md

```markdown
# Phase 0 — User Answers

| q_id | user_answer | notes (if free-text) | captured_at |
|---|---|---|---|
| Q-rules-base-component | confirm | — | <ISO timestamp> |
| Q-manifest-defecated | wontreview | — | <ISO timestamp> |
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-0-answers.md && \
test "$(grep -c '^|' blog/docs/pages/tools/generators/phase-0-answers.md)" -ge "$(grep -c 'OPEN' blog/docs/pages/tools/generators/phase-0-questions.md | xargs)" && \
echo "OK every OPEN Q has an answer row"
```

(If the bash test is unreliable on Windows shell, manually count.)

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| User provides ambiguous free-text answer | Treat as `confirm` of agent_default unless answer clearly contradicts. Note in phase-0-answers.md `notes` column. Queue an OBSERVE Q for follow-up if needed. |
| User abandons the questionnaire mid-batch | Save partial answers; mark unanswered Qs as `OPEN` still; queue continuation in phase-0-answers.md. STOP and wait for resume. |
| AskQuestion call fails | Retry once. If persistent → queue BLOCK Q-tooling-askquestion. STOP. |

## Exit criteria

- [ ] phase-0-answers.md exists
- [ ] Every OPEN Q in phase-0-questions.md has an answer row in phase-0-answers.md
- [ ] v4-state.md updated

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/03-p0-reconcile.md`
