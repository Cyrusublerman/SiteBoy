# Card 20 — Phase 2 execute — produce fix-order.md from issues.md

## What this stage does
Reads the fully-populated post-Phase-1 `issues.md`. Sorts and groups issues into a fix-order.md prioritising P0 → P1 → P2 → P3, batched by generator (so Phase 3 can verify each generator end-to-end as it goes). Queues triage ambiguities as DEFER Qs. Single turn.

## Applicable rules
Operating: R5, R6 (queue triage ambiguities), R10. Anti-pattern numbers: 6 (no prose).

## Inputs
- `blog/docs/pages/tools/generators/issues.md` (post-Phase-1, fully populated v4 issues)
- `phase-1-summary.md` (issue count tables for sanity check)

## Outputs
- `blog/docs/pages/tools/generators/fix-order.md`
- Updated `phase-2-questions.md`

## Procedure

- [ ] 1. Update v4-state.md: `phase: 2`, `turn: p2-execute`, `stage: pre-execute`, `card: 20-p2-execute.md`, append checkpoint.
- [ ] 2. Write `phase-2-questions.md` (empty register with header — same schema as phase-1-questions.md).
- [ ] 3. Read `issues.md`. Extract all v4 issues into a working list (in agent context) with columns: issue_id, type, severity, generator (parsed from per-gen file or summary), summary, status.
- [ ] 4. **Compute fix priority score** per issue:
  - Severity weight: P0=1000, P1=100, P2=10, P3=1
  - Type adjustment: GEN/EXP/HOST keep weight; ARCH multiply by 0.8 (architectural fixes often need broader refactor); PERF multiply by 0.9; DOC multiply by 0.5 (docs after code)
  - Status filter: skip `wontfix`, `wontfix-intentional-drop`
- [ ] 5. **Group by generator.** Within each generator group, sort by priority score descending.
- [ ] 6. **Order generator groups** by:
  - Generators with any P0 issue first (alphabetical within tier)
  - Then generators with any P1 GEN/EXP/HOST issue (alphabetical)
  - Then remaining generators with P1 ARCH/PERF (alphabetical)
  - Then P2/P3 only generators (alphabetical)
  - HOST issues form their own group at the top if any P0/P1 HOST issues exist (or interleaved if HOST changes block per-gen fixes)
- [ ] 7. **Define batches.** A batch = one generator's issues. Phase 3 will process batches sequentially with per-batch user confirmation. Exception: cross-generator batches for shared algorithm ARCH issues that affect 3+ generators (note as "shared-algorithm" batch).
- [ ] 8. **Identify cross-cutting work.** ARCH issues like `algorithm-shared-module-missing-<algorithm>` affect multiple generators. Pull these out of per-gen batches into a "shared-modules" batch that runs FIRST (so subsequent per-gen ARCH fixes can import the new module).
- [ ] 9. **Identify potential WONTFIX candidates** (issues that look like over-flagging or low-value fixes). Queue DEFER Q-wontfix-candidate-<issue_id> for each.
- [ ] 10. **Identify batch grouping conflicts** (e.g. fix for issue X in generator A might break issue Y in generator B if they share a shader). Queue DEFER Q-batch-conflict-<issue_a>-<issue_b>.
- [ ] 11. **Identify priority conflicts** (e.g. user might want a P3 DOC issue fixed first if it's blocking a release). Queue OBSERVE Q-priority-override-suggested-<issue_id>.
- [ ] 12. Write `fix-order.md` from template below.
- [ ] 13. Update v4-state.md: `turn: p2-questionnaire`, `card: 21-p2-questionnaire.md`, `last_action: fix-order written (<N> batches, <M> issues)`, `next_action: present triage questions`, append checkpoint.
- [ ] 14. Read card 21 — auto-advance.

## Templates

### fix-order.md

```markdown
# Phase 3 — Fix Order

**Generated:** <YYYY-MM-DD>
**Total issues to fix:** <N>
**Total batches:** <M>
**Skipped (wontfix):** <K>

## Batch ordering rationale

1. Shared-modules batch (cross-cutting ARCH fixes that unblock per-gen fixes)
2. P0 generator batches (alphabetical)
3. P1 GEN/EXP/HOST generator batches (alphabetical)
4. P1 ARCH/PERF generator batches (alphabetical)
5. P2/P3 only generator batches (alphabetical)

## Batches

### Batch 0: Shared modules (cross-cutting)

| issue_id | type | severity | summary | affects |
|---|---|---|---|---|
| ARCH-018 | ARCH | P1 | create assets/js/shared/algorithms/wave-equation.js (currently missing) | wave-interference, p5-wave-interference, cymatics, wave-equation-synth |
| ARCH-022 | ARCH | P1 | create assets/js/shared/algorithms/noise.js | generative-pattern, animated-lines, curtain-morph |

### Batch 1: cymatics (3 issues)

| issue_id | type | severity | summary | priority_score |
|---|---|---|---|---|
| GEN-014 | GEN | P1 | restore click-to-add-source interaction | 100 |
| PERF-031 | PERF | P1 | declare compute.interactionScale: 0.5 | 90 |
| ARCH-040 | ARCH | P2 | refactor _computeIntensities to import shared/algorithms/wave-equation.js (depends on Batch 0) | 8 |

### Batch 2: harmonics (...)

...

## Skipped issues

| issue_id | reason | resolved by |
|---|---|---|
| GEN-009 | wontfix-intentional-drop per Q-intentional-drop-cymatics-R-09 | Phase 1 reconcile |

## Triage questions queued

- Q-wontfix-candidate-DOC-022 (DEFER): low-value DOC fix, suggest skip
- Q-batch-conflict-GEN-014-GEN-027 (DEFER): both modify shared sketch tile; sequential or merged?
- Q-priority-override-suggested-DOC-008 (OBSERVE): release-blocking documentation
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/fix-order.md && \
test "$(rg -c '^### Batch' blog/docs/pages/tools/generators/fix-order.md)" -ge 1 && \
echo "OK fix-order has at least one batch"

# Sanity: total issues in fix-order.md should equal active (non-wontfix) issues in issues.md
echo "Manual check: fix-order issue count + skipped count == issues.md non-wontfix count"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Issues.md row count differs significantly from phase-1-summary.md count | Re-Read issues.md and summary; reconcile counts. Possibly issues were added/removed between Phase 1 reconcile and now. Update summary if needed (rare). |
| Issue's generator can't be parsed (no per-gen association) | Look up in per-gen issues-and-conflicts.md to find owner. If genuinely cross-generator, place in a "miscellaneous" batch. |
| Ambiguous priority (e.g. P1 DOC vs P2 GEN) | Apply formula deterministically; queue OBSERVE Q if intuition strongly disagrees. |

## Exit criteria

- [ ] fix-order.md exists with all non-wontfix issues sorted into batches
- [ ] Batch 0 (shared-modules) is present if any cross-cutting ARCH issues exist
- [ ] Skipped section lists wontfix issues with resolution citation
- [ ] Triage Qs queued in phase-2-questions.md
- [ ] v4-state.md updated; points at card 21

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/21-p2-questionnaire.md`
