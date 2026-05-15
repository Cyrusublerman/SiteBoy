# Card 17 — Phase 1 spot audit — random re-extraction quality control

## What this stage does
Re-extracts Capability Tables and the Function Coverage Map for 3 deterministically-chosen generators from scratch (without consulting the previously-logged tables). Compares to the logged v4 tables. If discrepancy > 10% on any generator, that generator's turn is re-run, and a 4th audit is added. Catches drift in extraction quality across the 25 turns.

## Applicable rules
Operating: R5 (don't peek at logged tables until comparison step), R7. Anti-Fab: F.1, F.2, F.3 (re-extract from source, not from feature-parity.md). Anti-pattern numbers: 13 (no v3/v4 reuse — re-derive).

## Inputs
- `reference-manifest.md` (canonical paths)
- Live source for each chosen generator
- `feature-parity.md` v4 tables for each chosen generator (held aside until comparison)

## Outputs
- `blog/docs/pages/tools/generators/spot-audit.md`

## Procedure

- [ ] 1. Update v4-state.md: `turn: p1-spot-audit`, `stage: pre-execute`, `card: 17-p1-spot-audit.md`, append checkpoint.
- [ ] 2. **Choose 3 generators deterministically.** Use indices 5, 13, 22 from the inventory.md ordering (i.e. the 5th, 13th, 22nd generator by inventory.md row order). If a chosen index is `WONTREVIEW`/`missing`/`external-cdn` per manifest, advance to the next valid index. Record the three chosen ids.
- [ ] 3. **For each chosen generator (loop 3 times):**
  - [ ] 3a. Read its reference source from manifest (full Read, fresh context — pretend you've never seen it).
  - [ ] 3b. Read its live source (fresh context).
  - [ ] 3c. Re-extract Reference Capability Table from scratch, NOT consulting feature-parity.md. Use Stage B procedure.
  - [ ] 3d. Re-extract Live Capability Table from scratch. Use Stage C procedure.
  - [ ] 3e. Re-extract Function Coverage Map from scratch. Use Stage B step 4-6.
  - [ ] 3f. NOW Read feature-parity.md `## v4 Review` section to get the originally-logged tables.
  - [ ] 3g. Compare row by row. Compute:
    - `cap_discrepancy_%` = (rows that differ in `kind`+`name`) / (total rows in original)
    - `flow_discrepancy_%` = (Coverage Map rows where `mapped_to` differs) / (total rows in original Coverage Map)
- [ ] 4. **Apply audit decision:**
  - PASS: `cap_discrepancy ≤ 10%` AND `flow_discrepancy ≤ 10%`
  - FAIL: either > 10%
- [ ] 5. **For each FAIL generator:** queue BLOCK Q-spot-audit-fail-<id>. Mark its original turn for re-run. Choose a 4th generator (next deterministic index, e.g. 7) and repeat steps 3-4 for it.
- [ ] 6. **Maximum 6 audits per spot-audit run.** If after 6 audits there are still FAILs → halt the spot-audit and queue BLOCK Q-spot-audit-systemic-failure (suggests Phase 1 needs full re-run, not just per-generator).
- [ ] 7. Write `spot-audit.md` from template below.
- [ ] 8. **If audit produced FAILs:** update v4-state.md to point at the first failed turn id (re-run that turn). The spot-audit re-runs after re-runs complete.
- [ ] 9. **If all PASS:** update v4-state.md: `turn: p1-questionnaire`, `card: 18-p1-questionnaire.md`, `last_action: spot audit PASS (3 audits)`, append checkpoint.
- [ ] 10. Read next card — auto-advance.

## Templates

### spot-audit.md

```markdown
# Phase 1 — Spot Audit

**Run:** <YYYY-MM-DD>
**Audits performed:** <3 / 4 / 5 / 6>
**Result:** <ALL PASS | <N> FAILED>

## Audit results

| audit_id | gen_id | cap_discrepancy_% | flow_discrepancy_% | result | notes |
|---|---|---|---|---|---|
| A-1 | <gen 5 from inventory> | 4% | 8% | PASS | 1 cap difference (renamed param "tone" vs "frequency"); 2 coverage differences (refactored helper) |
| A-2 | <gen 13> | 12% | 5% | FAIL | discrepancy in kind classification — original logged "behaviour" for what is render-mode; 4 rows affected |
| A-3 | <gen 22> | 6% | 4% | PASS | — |
| A-4 | <gen 7 — added because A-2 failed> | 2% | 1% | PASS | — |

## Failed turns

- p1-gen-13-<id>: see Q-spot-audit-fail-<id>; turn re-run scheduled

## Conclusion

<ALL PASS — proceed to questionnaire | <N> turns re-run before questionnaire>
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/spot-audit.md && \
test "$(rg -c '^\| A-' blog/docs/pages/tools/generators/spot-audit.md)" -ge 3 && \
echo "OK at least 3 audits recorded"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Chosen index falls on a WONTREVIEW gen | Use next valid index (e.g. 5 → 6 if 5 is WONTREVIEW). |
| Re-extraction differs slightly due to interpretation (kind ambiguity, evidence line range) | Count only distinct row identity (kind+name); accept evidence line range fuzz of ±5 lines. |
| All 3 audits PASS but agent is uncertain about quality elsewhere | One bonus audit at index 17 is allowed (queue OBSERVE Q if used). |
| 4 of 6 audits FAIL | Spot audit is unreliable; queue BLOCK Q-spot-audit-systemic-failure; recommend Phase 1 full re-run with strict adherence to plan. |

## Exit criteria

- [ ] `spot-audit.md` exists with ≥ 3 audit rows
- [ ] All audits resolved (PASS or re-run scheduled)
- [ ] If FAILs occurred and were re-run, the re-runs PASSED
- [ ] v4-state.md points at next card

## Next card

If all PASS: `guides/v4/stages/18-p1-questionnaire.md`
If re-runs scheduled: `guides/v4/stages/05-p1-stage-A.md` for the failed turn (then back to 17 after re-run completes)
