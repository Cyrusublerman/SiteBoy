# Card 04 — Phase 1 reset — archive v3, prep registers

## What this stage does
Archives v3's DOC entries (the misdirected 57 issues) to `issues-archive-v3.md`. Resets central `issues.md` for v4 to repopulate. Creates Phase 1 register and progress files. Single turn.

## Applicable rules
Operating: R3 (StrReplace for surgical changes), R10 (state). Anti-pattern numbers: 18 (v4 is additive — but this card is the explicit, user-confirmed exception that archives v3 DOC content).

## Inputs
- `blog/docs/pages/tools/generators/issues.md` (current v3 state, with DOC entries 001-057)

## Outputs
- `blog/docs/pages/tools/generators/issues-archive-v3.md` (new — archive of pre-v4 DOC entries)
- Updated `issues.md` (v3 DOC table archived; v4 ready to populate from DOC-001)
- `blog/docs/pages/tools/generators/phase-1-questions.md` (empty register with header)
- `blog/docs/pages/tools/generators/phase-1-progress.md` (title only)

## Procedure

- [ ] 1. Update v4-state.md: `phase: 1`, `turn: p1-reset`, `stage: pre-execute`, `card: guides/v4/stages/04-p1-reset.md`, `last_action: phase 1 reset begin`, append checkpoint.
- [ ] 2. Read `issues.md` in full. Identify all sections containing DOC entries from v3 (typically a `## DOC issues` table or DOC rows in a unified table).
- [ ] 3. Write `issues-archive-v3.md` from template below. Copy the v3 DOC content verbatim (including the entry numbering DOC-001 through DOC-057). Add a header noting the archive context.
- [ ] 4. Use StrReplace on `issues.md`:
  - Locate the DOC entry table/section
  - Replace with a brief note: `(v3 DOC entries archived to issues-archive-v3.md; v4 DOC rows below start at DOC-001)`
  - Add a fresh DOC table heading with empty rows ready for Stage F populates
- [ ] 5. Verify by re-Reading `issues.md`: no DOC-001..DOC-057 rows remain in the live table.
- [ ] 6. Write `phase-1-questions.md` (template below).
- [ ] 7. Write `phase-1-progress.md` (template below).
- [ ] 8. Update v4-state.md: `turn: p1-gen-01-harmonics`, `stage: pre-A`, `card: guides/v4/stages/05-p1-stage-A.md`, `last_action: phase 1 reset complete`, `next_action: begin first generator turn (harmonics)`, append checkpoint.
- [ ] 9. Print: `Phase 1 reset complete. v3 DOC entries archived. Beginning generator review with harmonics.`
- [ ] 10. Read card `05-p1-stage-A.md` — auto-advance.

## Templates

### issues-archive-v3.md

```markdown
# Issues — Archive v3

**Archived:** <YYYY-MM-DD> by Phase 1 reset (Card 04)
**Reason:** v3 review was docs-driven, not reference-driven. Of 57 DOC issues logged, an unknown subset are valid; subset is established by v4 Stage E. Archive preserves them for cross-reference; live `issues.md` is reset for v4 to populate without v3 contamination.

| issue_id | type | severity | summary | evidence | first_seen | status |
|---|---|---|---|---|---|---|
| DOC-001 | DOC | <severity from v3> | <summary from v3> | <evidence from v3> | v3 | archived |
| ... | ... | ... | ... | ... | ... | archived |
```

### issues.md DOC section after reset

```markdown
## DOC issues

(v3 DOC entries archived to issues-archive-v3.md; v4 DOC rows below start at DOC-001)

| issue_id | type | severity | summary | evidence | first_seen | status |
|---|---|---|---|---|---|---|
```

### phase-1-questions.md

```markdown
# Phase 1 — Questions Register

| q_id | phase | turn | severity | category | summary | agent_default | impact_if_wrong | files_affected | status |
|---|---|---|---|---|---|---|---|---|---|
```

### phase-1-progress.md

```markdown
# Phase 1 — Progress Log
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/issues-archive-v3.md && \
test -f blog/docs/pages/tools/generators/phase-1-questions.md && \
test -f blog/docs/pages/tools/generators/phase-1-progress.md && \
echo "OK files exist"

rg "^\| DOC-0[0-5][0-9] \|" blog/docs/pages/tools/generators/issues.md && \
echo "FAIL — v3 DOC entries still in live issues.md" || \
echo "OK — v3 DOC entries removed from live issues.md"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| `issues.md` doesn't have DOC entries (already reset, re-running) | Skip steps 2-5; just create register and progress files. Note in v4-state.md `last_action: idempotent re-run of p1-reset`. |
| StrReplace can't locate the DOC table (file structure differs) | Read entire issues.md. Identify the DOC content by content scan. Use exact block as old_string. |
| Archive Write fails | Queue BLOCK Q-archive-write-failed. STOP. |

## Exit criteria

- [ ] `issues-archive-v3.md` exists with v3 DOC content
- [ ] `issues.md` DOC table has zero v3 entries (DOC-001..057 not present in live table)
- [ ] `phase-1-questions.md` and `phase-1-progress.md` exist with headers
- [ ] v4-state.md points at first generator turn (harmonics) with card 05

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/05-p1-stage-A.md`
