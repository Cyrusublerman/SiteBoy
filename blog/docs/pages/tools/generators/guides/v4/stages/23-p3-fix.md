# Card 23 — Phase 3 fix — execute fixes per fix-order.md (per-batch loop)

## What this stage does
Per-batch fix execution loop. For each batch in `fix-order.md`: agent proposes all fix plans for the batch in one message, user confirms whole batch, agent implements all fixes in the batch, runs validation, advances to next batch. Browser verification permitted in Phase 3 only.

## Applicable rules
Operating: R3 (browser tools allowed in Phase 3 ONLY), R4 (one batch at a time), R10. Anti-Fab: F.1 (any code change cites a real source line). Anti-pattern numbers: 12 (browser was forbidden in Phase 1; allowed here for verification), 4 (one batch at a time, not multiple).

## Inputs
- `fix-order.md` (post-Phase-2 final)
- Live source for affected generators
- Per-gen feature-parity.md (to update post-fix)
- Per-gen issues-and-conflicts.md (to update status)
- Central issues.md (to update status)
- Phase 1 system-map.md (refer to Data Pathways for refactors)

## Outputs (per batch)
- Code changes to live source(s)
- Updated issues.md (status: open → in-progress → fixed)
- Updated per-gen issues-and-conflicts.md (same)
- Updated `phase-3-progress.md` (one block per batch)
- Optionally updated per-gen `feature-parity.md` if a v4 Review row is now `present` (status change)

## Procedure (per-batch loop — repeat until all batches done)

### Per-batch sub-procedure

- [ ] 1. Update v4-state.md: `turn: p3-fix`, `stage: batch-<N>-pre`, `card: 23-p3-fix.md`, `last_action: begin batch <N>`, append checkpoint.
- [ ] 2. Read fix-order.md. Identify the next batch (lowest unprocessed batch index).
- [ ] 3. For each issue in batch:
  - [ ] 3a. Read the issue's `evidence` source line(s)
  - [ ] 3b. Read related context (function containing the line, usually ~50 lines around)
  - [ ] 3c. Draft a fix plan: 1 paragraph + the exact `old_string` / `new_string` for StrReplace (or new file content for Write)
- [ ] 4. **Present batch fix plans to user** as a single message:
  - One header: "Batch <N>: <generator-id> — <K> issues"
  - For each issue: issue_id + summary + fix plan
  - At end: `AskQuestion` with options: confirm-all / confirm-with-changes / skip-batch / abort-phase-3
- [ ] 5. **If user picks `confirm-all`**:
  - [ ] 5a. For each issue in batch order: apply the fix (StrReplace / Write).
  - [ ] 5b. After all fixes in batch: `ReadLints` on changed files. Fix any new lint errors.
  - [ ] 5c. If browser verify is appropriate (live behavioural change): start dev server (only if not already running), navigate to generator, take screenshot, compare to expected behaviour. Capture browser console for errors. Stop dev server unless explicit user request to keep open.
  - [ ] 5d. Update each fixed issue: status `open` → `fixed` in both issues.md and per-gen issues-and-conflicts.md.
  - [ ] 5e. If a fix made a Diff Table row `absent`/`partial` now `present`: StrReplace per-gen feature-parity.md v4 Review Diff Table row. Add a `## Phase 3 Fixes (<date>)` sub-section if not present, listing fixed issue ids.
  - [ ] 5f. Append phase-3-progress.md block (template below).
- [ ] 6. **If user picks `confirm-with-changes`**: capture changes via free-text follow-up; revise the fix plans; re-present (return to step 4).
- [ ] 7. **If user picks `skip-batch`**: mark all batch issues with status `skipped-phase-3` in issues.md; queue OBSERVE Q-batch-skipped-<N>; advance to next batch.
- [ ] 8. **If user picks `abort-phase-3`**: STOP. Update v4-state.md `last_action: phase 3 aborted by user`. Wait for further instruction.
- [ ] 9. **Mid-implementation surprise** (e.g. fix breaks something unexpected, or evidence path no longer matches): STOP that fix. Queue BLOCK Q-mid-fix-<issue_id> with detailed surprise description. SKIP this fix. Continue rest of batch with proposed fixes. Note skip in batch progress block.
- [ ] 10. After batch complete: update v4-state.md `stage: batch-<N>-complete`, `last_action: batch <N> applied (<K_applied> fixed, <K_skipped> skipped)`, `next_action: begin batch <N+1>`, append checkpoint.
- [ ] 11. **Mini-questionnaire trigger.** If batch produced ≥ 3 BLOCK Qs in step 9: pause main loop. Run a mini-questionnaire (`AskQuestion` over the BLOCK Qs) before next batch. User answers determine: continue with skipped fixes deferred, or pause Phase 3 to re-triage (effectively returning to a partial Phase 2).
- [ ] 12. **Loop**: if more batches remain → return to step 1 (next batch).
- [ ] 13. **All batches complete**: update v4-state.md `phase: 4`, `turn: p4-execute`, `card: 24-p4-execute.md`, `stage: pre-execute`, `last_action: phase 3 complete`, `next_action: begin maintenance docs`, append checkpoint.
- [ ] 14. Print: `Phase 3 complete. <total_fixed> issues fixed, <total_skipped> skipped, <BLOCK_qs> BLOCK Qs queued. Next: card 24-p4-execute.md.`
- [ ] 15. **Final reconcile-confirm**: `AskQuestion`: "Phase 3 complete. Confirm entry to Phase 4 (maintenance docs)?". If confirmed, read card 24. If not, stay and await instructions.

## Templates

### Batch presentation message (step 4)

```markdown
## Batch <N>: <generator-id> — <K> issues

### Batch summary
- Generator: <id>
- Issues to fix: <K>
- Affected files: <list>
- Estimated risk: <low / medium / high — based on number of files and severity>

### Issue 1: <issue_id>
**Summary:** <from issues.md>
**Evidence:** <file:line from issues.md>
**Fix plan:** <1 paragraph explaining what changes, why, expected behavioural effect>

**Proposed change:**
```
<old_string for StrReplace>
```
becomes
```
<new_string for StrReplace>
```

### Issue 2: <issue_id>
... (same structure)

---

Confirm: apply all fixes in this batch?
```

### phase-3-progress.md per-batch block

```markdown

---

## Batch <N> — <generator-id> — <YYYY-MM-DD HH:MM>

- Issues in batch: <K>
- Fixed: <issue_id list>
- Skipped (mid-fix surprise): <issue_id list with Q references>
- Files changed: <list>
- Lint errors introduced and fixed: <count>
- Browser verify: <yes/no/n-a> — <result>
```

### phase-3-progress.md initial header (if not present)

```markdown
# Phase 3 — Fix Progress Log
```

(Created at first batch; re-use across batches.)

## Validation (per batch)

```bash
# After each batch:
# Lint check
# (use ReadLints tool on each changed file)

# Issue status check
ID=<generator-id>
rg "(GEN|EXP|ARCH|PERF|DOC|HOST)-\d+" blog/docs/pages/tools/generators/${ID}/issues-and-conflicts.md | head
# Manual: confirm batch's issue ids show status 'fixed' or 'skipped-phase-3'

# Progress block
rg "^## Batch <N>" blog/docs/pages/tools/generators/phase-3-progress.md && echo "OK batch <N> block present"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| User picks `confirm-with-changes` but doesn't specify what to change | Ask via `AskQuestion` (allowed in Phase 3 — this card permits per-batch interaction): "What change?" with free-text option. NOT a violation of R6 because Phase 3 has explicit per-batch user touchpoints. |
| Fix `evidence` line no longer matches source (someone edited the file between Phase 1 and Phase 3) | Re-Read source. Re-locate the issue. Update fix plan. Re-present batch (return to step 4). |
| StrReplace `old_string` not unique | Expand `old_string` with more surrounding context. Retry. |
| Fix introduces new lint errors agent can't quickly resolve | Capture lint errors. Queue BLOCK Q-fix-introduces-lint-<issue_id>. Mark fix `partial`. Continue rest of batch. |
| Fix breaks existing functionality (caught via browser verify) | Revert the fix. Mark issue `skipped-phase-3-broke-X`. Queue BLOCK Q-fix-regression-<issue_id>. Continue rest of batch. |
| Browser dev server already running | Use existing instance. Don't start a new one. |
| Browser navigation fails (page won't load) | Capture browser console error. Skip browser verify for this batch (note in progress). Continue. |
| Issue's source file no longer exists (was deleted in earlier batch) | Mark `obsolete-due-to-prior-fix`. Update issues.md. Skip. |

## Exit criteria (per batch)

- [ ] All batch issues processed (fixed, skipped, or partial)
- [ ] Lint clean on changed files
- [ ] Progress block written to phase-3-progress.md
- [ ] issues.md and per-gen issues-and-conflicts.md statuses updated
- [ ] feature-parity.md updated for any newly-`present` Diff rows
- [ ] v4-state.md updated; checkpoint appended

## Exit criteria (Phase 3 overall)

- [ ] All batches in fix-order.md processed
- [ ] All P0 and P1 issues either `fixed`, `skipped-phase-3` (with Q), or `wontfix`
- [ ] No `in-progress` status remains in issues.md
- [ ] phase-3-progress.md has a block per batch
- [ ] User confirmed entry to Phase 4

## Next card

After all batches and user confirms Phase 4 entry: `blog/docs/pages/tools/generators/guides/v4/stages/24-p4-execute.md`
