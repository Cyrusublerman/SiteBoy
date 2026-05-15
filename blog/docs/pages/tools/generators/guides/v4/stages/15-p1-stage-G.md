# Card 15 — Phase 1 Stage G — VALIDATE & ADVANCE (turn close)

## What this stage does
Runs 10 automated validation commands over the artefacts written in Stage F. Asserts all pass. Marks turn complete. Updates v4-state.md to point at the next turn's first card.

## Applicable rules
Operating: R7, R9, R10. Anti-Fab: F.7 (final integrity check). Anti-pattern numbers: 9 (auto-advance), 25 (state at every transition).

## Inputs
- All artefacts written this turn (Stages B–F outputs persisted to files)

## Outputs
- v4-state.md updated to next turn's `state-init` (or to `p1-host` after gen-25)
- No new artefact files; this is the gate

## Procedure

- [ ] 1. Update v4-state.md: `stage: G`, `last_action: stage G validation begin`, append checkpoint.
- [ ] 2. Run V1: confirm `## v4 Review` heading exists in `<id>/feature-parity.md`.
- [ ] 3. Run V2: confirm exactly 6 `### sub-headings` under v4 Review (Reference Capability Table, Function Coverage Map, Live Capability Table, Diff Table, Library Hygiene Report, Performance Tier Audit).
- [ ] 4. Run V3: confirm `<id>/system-map.md` exists and has all 3 top-level sections (Reference, Live, Architectural Divergence).
- [ ] 5. Run V4: confirm Function Coverage Map has zero unmapped rows (no row with empty `mapped_to`; no row matching `(empty)`).
- [ ] 6. Run V5: confirm Diff Table row count = Reference Capability Table row count (within ±0).
- [ ] 7. Run V6: confirm every Diff Table row with `status: absent` or `partial` or `diverged` has either `decision: log <TYPE>` OR a queued `intentionally-dropped` Q.
- [ ] 8. Run V7: confirm closed-vocabulary fields use only allowed values:
  - Diff Table `status` ∈ {present, partial, absent, diverged, intentionally-dropped}
  - System Map `Mode:` ∈ closed set per Standard
  - Data Pathways `parallelisable?` ∈ closed set per Standard
  - State Inventory `scope` ∈ closed set per Standard
- [ ] 9. Run V8: confirm `feature-parity.md` v4 section contains no TODOs, FIXMEs, `(populated...)` placeholders, or `???` markers.
- [ ] 10. Run V9: confirm every issue id allocated this turn appears in BOTH `<id>/issues-and-conflicts.md` AND central `issues.md`.
- [ ] 11. Run V10: confirm `phase-1-progress.md` has a block for this turn (turn_id matches v4-state.md `turn:`).
- [ ] 12. **If ANY validation fails**: STOP. Halt-and-recover. Re-run the failed stage. Do NOT mark turn complete.
- [ ] 13. **All validations pass.** Mark this turn's todo `completed`.
- [ ] 14. **Determine next turn.** Read the shell's todos list. Find the next `pending` turn id after the current one. Cases:
  - Next is another `p1-gen-NN-*` → set `turn:` to next id, `card: guides/v4/stages/05-p1-stage-A.md`, `stage: pre-A`
  - Next is `p1-host` → set `turn: p1-host`, `card: guides/v4/stages/16-p1-host.md`, `stage: host-pre`
  - Next is `p1-spot-audit` → set `turn: p1-spot-audit`, `card: guides/v4/stages/17-p1-spot-audit.md`
- [ ] 15. Update v4-state.md with new turn pointer; `last_action: turn <previous turn_id> complete and validated`, `next_action: begin next turn`, append checkpoint.
- [ ] 16. Print: `Turn <prev> complete (artefacts: 7; issues: <N>; Qs queued: <M>; validation: PASS). Next: turn <next>, card <next card>.`
- [ ] 17. Read the next card — auto-advance per shell Rule 5.

## Validation commands (V1-V10) — exact bash forms

V1 (v4 Review heading):
```bash
ID=<generator-id>
test "$(rg -c '^## v4 Review \(' "blog/docs/pages/tools/generators/${ID}/feature-parity.md")" -ge 1 && echo V1-PASS || echo V1-FAIL
```

V2 (6 sub-headings):
```bash
test "$(rg -c '^### (Reference Capability Table|Function Coverage Map|Live Capability Table|Diff Table|Library Hygiene Report|Performance Tier Audit)' "blog/docs/pages/tools/generators/${ID}/feature-parity.md")" -ge 6 && echo V2-PASS || echo V2-FAIL
```

V3 (system-map sections):
```bash
test "$(rg -c '^## (Reference \(v4|Live \(v4|Architectural Divergence)' "blog/docs/pages/tools/generators/${ID}/system-map.md")" -ge 3 && echo V3-PASS || echo V3-FAIL
```

V4 (no unmapped Coverage rows):
```bash
# Find any pipe row with empty 5th column in the Coverage Map block
# Manual: scan agent's Coverage Map section. Forbidden: rows ending "| |" or "|  |"
echo "V4: manual scan — every Coverage Map row has non-empty mapped_to"
```

V5 (row count match):
```bash
# Manual: confirm Diff Table row count == Reference Capability Table row count
echo "V5: manual — Diff rows == Reference Capability rows"
```

V6 (decisions present):
```bash
# Manual: every Diff row with status absent/partial/diverged has decision != none OR queued Q
echo "V6: manual — non-present rows have decision or queued Q"
```

V7 (closed vocabularies):
```bash
# rg for any forbidden value in Diff Table status column
rg "\| (?!present|partial|absent|diverged|intentionally-dropped)\w+ \| —? \|" "blog/docs/pages/tools/generators/${ID}/feature-parity.md" && echo V7-FAIL || echo V7-PASS
# (Approximate. Manual cross-check vocabularies in System Map sub-guide.)
```

V8 (no placeholders):
```bash
rg "(TODO|FIXME|\(populated|\?\?\?)" "blog/docs/pages/tools/generators/${ID}/feature-parity.md" "blog/docs/pages/tools/generators/${ID}/system-map.md" && echo V8-FAIL || echo V8-PASS
```

V9 (issue id consistency):
```bash
# For each issue id allocated this turn (agent has list in context):
# rg "$ISSUE_ID" "blog/docs/pages/tools/generators/${ID}/issues-and-conflicts.md" && rg "$ISSUE_ID" blog/docs/pages/tools/generators/issues.md
# manual loop per id
echo "V9: manual — every new issue_id in both per-gen and central issues files"
```

V10 (progress block):
```bash
TURN_ID=<turn id from v4-state.md>
rg "^## ${TURN_ID}" blog/docs/pages/tools/generators/phase-1-progress.md && echo V10-PASS || echo V10-FAIL
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| V1 FAIL (no v4 heading) | Re-run Stage F: append the `## v4 Review` section. |
| V2 FAIL (sub-heading count < 6) | Re-run Stage F: identify the missing sub-section, append. |
| V3 FAIL (system-map.md sections missing) | Re-run Stage B.5 or C.5 depending on which section is missing. |
| V4 FAIL (unmapped Coverage rows) | Re-run Stage B step 5-6. |
| V5 FAIL (row count mismatch) | Re-run Stage D step 8 verification. |
| V6 FAIL (decision missing for non-present row) | Re-run Stage D decision rules; ensure every absent/partial/diverged has decision OR queued Q. |
| V7 FAIL (forbidden vocabulary value) | Identify offending row, replace value with a closed-set value. If genuinely doesn't fit, queue BLOCK Q-vocabulary-extension. |
| V8 FAIL (placeholder text remains) | Locate the placeholder, replace with real content. Re-run Stage C.5 if `(populated in Stage C.5)` remains. |
| V9 FAIL (issue id not in both files) | Add the missing row to whichever file lacks it. |
| V10 FAIL (no progress block) | Re-run Stage F step 8. |

After any failed validation: re-run that single validation command. Only when ALL pass may the agent advance.

## Exit criteria

- [ ] All 10 validations PASS
- [ ] Turn marked `completed` in TodoWrite
- [ ] v4-state.md points at next turn's first card
- [ ] One-line resume statement printed

## Next card

Determined dynamically by step 14:
- If next turn is another generator → `guides/v4/stages/05-p1-stage-A.md`
- If next is HOST → `guides/v4/stages/16-p1-host.md`
- If next is spot audit → `guides/v4/stages/17-p1-spot-audit.md`
- If all Phase 1 turns complete → `guides/v4/stages/18-p1-questionnaire.md`
