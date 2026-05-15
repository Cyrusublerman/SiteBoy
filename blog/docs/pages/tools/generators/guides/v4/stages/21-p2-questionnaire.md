# Card 21 — Phase 2 questionnaire — present triage questions

## What this stage does
Reads phase-2-questions.md (DEFER triage Qs from Stage 20). Presents to user via AskQuestion. Captures answers. Same machinery as Phase 1 questionnaire, smaller scale.

## Applicable rules
Operating: R3, R6, R7. Anti-pattern numbers: 8.

## Inputs
- `phase-2-questions.md`
- `blog/docs/pages/tools/generators/guides/v4/question-catalogue.md` — canonical AskQuestion option lists. Use catalogue entries `Q-wontfix-candidate`, `Q-batch-conflict`, `Q-priority-override-suggested` for the option sets.

## Outputs
- `phase-2-answers.md`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p2-questionnaire`, `stage: questionnaire`, append checkpoint.
- [ ] 2. Read phase-2-questions.md. Count OPEN Qs.
- [ ] 3. If zero → write empty answers, skip to step 8.
- [ ] 4. Group OPEN Qs by category: `wontfix-candidate`, `batch-conflict`, `priority-override-suggested`, others.
- [ ] 5. For each category (≤ 20 per AskQuestion call): build payload using template below.
- [ ] 6. Call AskQuestion. Capture answers.
- [ ] 7. Repeat for next batch if needed.
- [ ] 8. Write phase-2-answers.md from template.
- [ ] 9. Update v4-state.md: `turn: p2-reconcile`, `card: 22-p2-reconcile.md`, append checkpoint.
- [ ] 10. Print: `Phase 2 questionnaire complete. <N> answers captured. Next: card 22.`
- [ ] 11. Read card 22 — auto-advance.

## Templates

### AskQuestion payload pattern

For wontfix candidates:

```
{
  id: "<q_id>",
  prompt: "Issue <issue_id> (<type> <severity>): <summary>. Agent suggests WONTFIX. Confirm?",
  options: [
    { id: "wontfix", label: "WONTFIX — drop from fix-order" },
    { id: "keep", label: "Keep — fix in Phase 3" },
    { id: "defer", label: "Defer to a future review (mark in fix-order as deferred)" }
  ]
}
```

For batch conflicts:

```
{
  id: "<q_id>",
  prompt: "Issues <a> and <b> both modify <resource>. Sequential, merged, or skip one?",
  options: [
    { id: "sequential", label: "Fix sequentially in same batch (a then b)" },
    { id: "merged", label: "Treat as one combined fix" },
    { id: "skip-a", label: "Skip <a>, fix <b>" },
    { id: "skip-b", label: "Skip <b>, fix <a>" }
  ]
}
```

For priority overrides:

```
{
  id: "<q_id>",
  prompt: "Issue <issue_id> currently <severity>. Promote to higher priority?",
  options: [
    { id: "keep", label: "Keep current priority" },
    { id: "promote-p0", label: "Promote to P0" },
    { id: "promote-p1", label: "Promote to P1" }
  ]
}
```

### phase-2-answers.md

```markdown
# Phase 2 — User Answers

| q_id | user_answer | notes | captured_at |
|---|---|---|---|
| Q-wontfix-candidate-DOC-022 | wontfix | — | <timestamp> |
| Q-batch-conflict-GEN-014-GEN-027 | sequential | — | <timestamp> |
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/phase-2-answers.md && echo "OK"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Zero OPEN Qs | Skip questionnaire. Write empty answers file. Proceed. |
| User abandons | Save partial; mark unanswered as still-OPEN; STOP and wait. |
| Ambiguous answer | Default to "keep" (don't drop work). Note in `notes`. |

## Exit criteria

- [ ] phase-2-answers.md exists
- [ ] Every OPEN Q has an answer row (or marked still-OPEN)
- [ ] v4-state.md points at card 22

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/22-p2-reconcile.md`
