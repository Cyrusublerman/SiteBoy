# Card 10 — Phase 1 Stage D — DIFF (Capability Diff Table)

## What this stage does
Joins the Reference Capability Table and Live Capability Table into a single Diff Table. Every reference cap_id gets a status (`present` / `partial` / `absent` / `diverged` / `intentionally-dropped`). Adds `flow_divergence` column from Architectural Divergence Notes. Each non-`present` row gets a decision (`log GEN` / `log UI` / etc.) and severity. This drives Stage F issue logging.

## Applicable rules
Operating: R6 (queue, don't decide for ambiguous cases). Anti-Fab: F.2 (live_match must cite real Live Capability row). Anti-pattern numbers: 3 (no DOC drift logging yet — that's Stage E), 6 (no prose).

## Inputs
- Reference Capability Table (in context from Stage B)
- Live Capability Table (in context from Stage C)
- Architectural Divergence Notes (in context from Stage C.5)
- `feature-parity.md` (in context from Stage A — read existing rationales for any `intentionally-dropped` claims)

## Outputs
- Diff Table — held in agent context; written in Stage F

## Procedure

- [ ] 1. Update v4-state.md: `stage: D`, append checkpoint.
- [ ] 2. **Build Diff Table.** For every `cap_id` in Reference Capability Table, add one row with:
  - `cap_id`: copy from reference (e.g. R-04)
  - `ref_name`: copy from reference's `name` column
  - `live_match`: the live cap_id (L-NN) that satisfies it, or `—` if none
  - `status`: per the decision rules below
  - `live_evidence`: file:line in live source if matched
  - `flow_divergence`: cross-reference to Architectural Divergence bullet if applicable, or `—`
  - `decision`: from decision rules below
  - `severity`: P0/P1/P2/P3 (only if logging an issue)
- [ ] 3. **Match each reference cap_id to a live cap_id** by name + kind. If multiple plausible matches, pick the closest match. If no match → `live_match: —`, `status: absent`.
- [ ] 4. **For each match**, compare evidence to determine `status`:
  - Same behaviour, same param signature → `present`
  - Behaviour exists but with reduced functionality (e.g. fewer modes, smaller range) → `partial`
  - Behaviour exists but with different output → `diverged`
  - No live match → `absent`
  - No live match BUT existing `feature-parity.md` documents the drop with rationale → `intentionally-dropped`
- [ ] 5. **Apply Decision Rules table** below to set `decision` and `severity`.
- [ ] 6. **Populate `flow_divergence` column.** For each row where the capability is implemented but its data pathway differs from reference (per the Divergence Notes), reference the relevant Divergence Note bullet by short phrase. Otherwise `—`.
- [ ] 7. **Apply Anti-pattern check 13**: do not reuse v3 status assignments. Re-derive from current source state.
- [ ] 8. **Verify row count.** Diff Table row count MUST equal Reference Capability Table row count. Off-by-one is forbidden — every ref cap_id appears exactly once.
- [ ] 9. **Live-only capabilities**: list any Live Capability Table rows whose name+kind does NOT correspond to a reference row. For each: queue DEFER Q-v4-extension-<id>-<L-NN> with default `v4-extension, no GEN` per the Default Assumptions Catalogue. (These do NOT get a row in the Diff Table — that table is reference-driven. Live-only items are tracked separately in the Diff Table footer or queued only.)
- [ ] 10. Update v4-state.md: `stage: E`, `last_action: diff table built (<N> rows; <X> absent, <Y> partial, <Z> diverged)`, `next_action: spec verification`, append checkpoint.
- [ ] 11. Read card `11-p1-stage-E.md` — auto-advance.

## Decision rules

| Status | Default decision | Default severity | Notes |
|---|---|---|---|
| `present` | none | — | no issue |
| `partial` | log GEN | P2 | unless `feature-parity.md` documents the partial as intentional |
| `absent` | log GEN | P1 | unless status is `intentionally-dropped` |
| `diverged` | log GEN | P2 | unless `feature-parity.md` documents the divergence |
| `intentionally-dropped` | none | — | BUT verify `feature-parity.md` records the rationale; if not, log DOC P2 |

If `kind == 'export'` instead of `behaviour`/`render-mode` → use `EXP` prefix (log EXP P1/P2).
If `kind == 'interaction'` and the missing element is keyboard/mouse-driven → still GEN (we don't have separate UI prefix unless it's a layout/styling concern; UI prefix is for host-level UI issues).
If `kind == 'param'` and the param is missing in live → GEN.
If `kind == 'audio'` → use `EXP` (audio output is conceptually an export hook).

## Templates

### Diff Table

```markdown
| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | density (slider 0-1) | L-01 | present | cymatics.gen.js:34 | — | none | — |
| R-04 | Click to add source | — | absent | — | div bullet "mousePressed → param dispatch" | log GEN | P1 |
| R-07 | preset library | L-04 | partial | cymatics.gen.js:78 | — | log GEN | P2 |
| R-09 | export PNG | — | absent | — | — | log EXP | P1 |
```

### Live-only capabilities footer (if any exist)

```markdown
### Live-only capabilities (v4-extensions, queued for user confirmation)

| L-id | kind | name | evidence | Q-id |
|---|---|---|---|---|
| L-09 | param | colourway | cymatics.gen.js:42 | Q-v4-extension-cymatics-L-09 |
```

## Validation

```bash
# Diff Table is in agent context, not file — manual checks only
echo "Verify: Diff Table row count == Reference Capability Table row count"
echo "Verify: every live_match cap_id appears in Live Capability Table"
echo "Verify: every status is one of {present, partial, absent, diverged, intentionally-dropped}"
echo "Verify: every absent/partial/diverged row has either decision != none OR a queued Q with intentionally-dropped justification"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| Diff Table row count ≠ Reference Capability Table row count | Re-derive: every ref cap_id must appear once. Find the missing rows. |
| `live_match` cap_id doesn't exist in Live Capability Table | Either fix the typo or set `live_match: —` and re-classify status. |
| Capability genuinely could be `present` OR `partial` (subjective call) | Default to `partial` (more conservative — flags for review). Queue DEFER Q-status-<id>-<R-NN>. |
| `feature-parity.md` already documents `intentionally-dropped` for a row | Use status `intentionally-dropped`, decision `none`. Confirm the documented rationale is still valid. |
| Reference cap is a render-mode that live implements but with different visual output | `diverged` is correct. Queue OBSERVE Q if the difference might be intentional. |

## Exit criteria

- [ ] Diff Table built; row count = Reference Capability Table row count
- [ ] Every row has a status from the closed set
- [ ] Every non-`present` row has either a decision OR a queued Q
- [ ] `flow_divergence` column populated where applicable
- [ ] Live-only capabilities listed in footer with queued Qs
- [ ] v4-state.md updated; `stage: E`

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/11-p1-stage-E.md`
