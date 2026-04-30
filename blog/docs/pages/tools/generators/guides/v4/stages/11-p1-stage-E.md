# Card 11 — Phase 1 Stage E — SPEC VERIFICATION

## What this stage does
Compares the per-generator docs (`description.md`, `ui-layout.md`, `mechanisms.md`, `feature-parity.md`, `performance.md`) against the live source AND the Diff Table from Stage D. Logs DOC issues for documentation drift. This is the ONLY stage where DOC issues may be logged.

## Applicable rules
Operating: R5. Anti-Fab: F.1, F.4. Anti-pattern numbers: 3 (DOC drift only after Diff Table complete — that condition is now satisfied), 6 (no prose).

## Inputs
- Diff Table (in context from Stage D)
- Live Capability Table (in context from Stage C)
- Per-gen docs (in context from Stage A; some may be missing — that's a finding)

## Outputs
- DOC issues — held in agent context; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: E`, append checkpoint.
- [ ] 2. **For `description.md`**: read the description's claimed feature list. For each claim, verify it's covered by either (a) a present row in the Diff Table or (b) a Live-only capability that the agent already queued for v4-extension confirmation. Mismatches:
  - Description claims a feature, Diff Table shows `absent` → DOC P2 `description-overstates-features`
  - Description omits a present capability that's a primary user-facing feature → DOC P3 `description-undersells-features`
- [ ] 3. **For `ui-layout.md`**: read claimed parameter list, control placement, sidebar tab assignments. Compare to Live Capability Table `param` rows.
  - Param documented but absent in live → DOC P2 `ui-layout-stale-param`
  - Param in live but undocumented → DOC P3 `ui-layout-missing-param`
  - Tab assignment claim differs from `SCRIPT_CONFIG` → DOC P2 `ui-layout-tab-mismatch`
- [ ] 4. **For `mechanisms.md`** (if present): read claimed mechanism descriptions. Compare to Live source behaviours and Live System Map.
  - Mechanism claim contradicts live source → DOC P2 `mechanisms-incorrect`
  - Mechanism claim still describes reference behaviour after live diverged → DOC P2 `mechanisms-describes-reference-not-live`
  - Mechanism describes a nonexistent feature → DOC P2 `mechanisms-fictional`
- [ ] 5. **For `feature-parity.md`**: read existing parity claims (pre-v4 content). Compare to Diff Table.
  - Parity claim "complete" but Diff has `absent`/`partial` rows → DOC P1 `feature-parity-overclaims`
  - Parity claim documents `intentionally-dropped` for a row Diff Table also shows as absent → consistent; no issue
  - Parity claim cites reference path different from manifest → DOC P3 `feature-parity-stale-path`
- [ ] 6. **For `performance.md`** (if present): read claimed mitigations. Compare to Live source.
  - Performance.md claims a mitigation (e.g. "uses pixel cache") that does NOT appear in live source → DOC P2 `performance-claims-fictional-mitigation`
  - Performance.md describes a problem that no longer exists → DOC P3 `performance-stale-problem`
  - Performance.md absent for a generator with declared `compute.computePixels` workload → DOC P3 `performance-doc-missing`
- [ ] 7. **For docs ENTIRELY missing**: each absence is one DOC P3 row.
- [ ] 8. **Apply RULE F.1**: every DOC issue's evidence cites a real file:line in both the doc and the corresponding source mismatch.
- [ ] 9. Aggregate all DOC issues for this generator into a per-issue table to be written in Stage F.
- [ ] 10. Update v4-state.md: `stage: E.5`, `last_action: spec verification complete (<N> DOC issues)`, `next_action: library hygiene audit`, append checkpoint.
- [ ] 11. Read card `12-p1-stage-E5.md` — auto-advance.

## Templates

### DOC issue row schema (one per issue, written in Stage F)

```markdown
| issue_id | type | severity | sub_kind | description | doc_evidence | source_evidence | suggested_fix |
|---|---|---|---|---|---|---|---|
| DOC-NN | DOC | P2 | description-overstates-features | description claims interactive source placement; Diff Table R-04 shows absent (live has no mouse handler) | description.md:14 | cymatics.gen.js:onInit (no addEventListener for click) | edit description.md to remove "click to add" or restore interaction as GEN fix |
```

`issue_id` is allocated in Stage F (sequential). Use `DOC-???` placeholder during Stage E.

## Validation

(No file output yet — DOC issues are in context, written in Stage F.)

Manual: every DOC issue has both `doc_evidence` and `source_evidence` cited and Read this turn.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Doc file missing entirely | Log one DOC P3 issue `doc-skeleton-missing-<docname>`. CONTINUE — other docs still checked. |
| Doc claim is genuinely ambiguous (could be either current or stale interpretation) | Default to "doc is wrong, source is right" → log DOC. Queue OBSERVE Q if interpretation is critical. |
| `feature-parity.md` v3 content contradicts v4 Diff Table | This is THE expected case. Log DOC P1 `feature-parity-overclaims`. Note in `suggested_fix` that v4 Review section will supersede in Stage F. |
| `mechanisms.md` describes architecture that's neither reference nor live (some third state, e.g. an in-progress refactor) | Log DOC P2 `mechanisms-fictional`. Queue OBSERVE Q-mechanisms-source-<id>. |

## Exit criteria

- [ ] Every per-gen doc has been compared to source and Diff Table
- [ ] Every DOC issue has cited file:line in both doc and source
- [ ] Missing docs are logged as DOC P3
- [ ] DOC issues aggregated for Stage F
- [ ] v4-state.md updated; `stage: E.5`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/12-p1-stage-E5.md`
