# Card 00 — Phase 0 state init — set up state machine

## What this stage does
Initialises the v4-state.md turn pointer and creates empty Phase 0 register/log files. No analysis happens here. Single turn.

## Applicable rules
Operating: R1 (session start), R2 (state file), R10 (update at transitions). Anti-Fab: F.1 (cite paths). Anti-pattern numbers: 19 (do not modify shell), 22 (no exploration).

## Inputs (must already exist)
- The shell file `C:/Users/Einod/.cursor/plans/generator_review_fix_and_maintenance_v4.plan.md` (already read at session start)
- `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc`

## Outputs (must exist after this stage)
- `blog/docs/pages/tools/generators/v4-state.md`
- `blog/docs/pages/tools/generators/phase-0-questions.md` (empty register with header)
- `blog/docs/pages/tools/generators/phase-0-progress.md` (title only)

## Procedure (tick boxes in order)

- [ ] 1. Read `c:/Users/Einod/Documents/GitHub/SiteBoy/.cursor/rules/rules.mdc` — confirm workspace conventions before any work.
- [ ] 2. Confirm `Read`, `Glob`, `Grep`, `Write`, `Shell` (with `rg`) tools are available. Run a one-line `rg --version` Shell call to verify ripgrep. If `rg` is missing → queue BLOCK Q-tooling-rg-missing.
- [ ] 3. Confirm directory `blog/docs/pages/tools/generators/` exists by `Glob blog/docs/pages/tools/generators/*.md`. If missing → queue BLOCK Q-paths-missing.
- [ ] 4. Confirm `assets/js/tools/generators/scripts/` exists by `Glob assets/js/tools/generators/scripts/**/*.gen.js`. If empty → queue BLOCK.
- [ ] 5. Write `blog/docs/pages/tools/generators/v4-state.md` from template below. Fill in current ISO timestamp. Set `session_count: 1`.
- [ ] 6. Write `blog/docs/pages/tools/generators/phase-0-questions.md` from template below.
- [ ] 7. Write `blog/docs/pages/tools/generators/phase-0-progress.md` from template below.
- [ ] 8. If any BLOCK Qs were queued in steps 2-4, append them to phase-0-questions.md now using the schema in the shell.
- [ ] 9. Update v4-state.md: set `last_action: state files created`, `next_action: begin manifest discovery`, `stage: pre-execute`, append checkpoint.
- [ ] 10. Print resume line: `Phase 0 state-init complete. Next: read card 01-p0-execute.md.`
- [ ] 11. Read card `blog/docs/pages/tools/generators/guides/v4/stages/01-p0-execute.md` — auto-advance.

## Templates (copy and fill)

### v4-state.md

```markdown
# v4 Generator Review — State Pointer

**phase:** 0
**turn:** p0-execute
**stage:** pre-execute
**card:** blog/docs/pages/tools/generators/guides/v4/stages/01-p0-execute.md
**last_action:** state files created
**next_action:** begin manifest discovery
**updated:** <ISO timestamp>
**session_count:** 1
**checkpoints:**
- <ISO timestamp> — pre — state file initialised
- <ISO timestamp> — pre-execute — phase-0 register and progress files created
```

### phase-0-questions.md

```markdown
# Phase 0 — Questions Register

| q_id | phase | turn | severity | category | summary | agent_default | impact_if_wrong | files_affected | status |
|---|---|---|---|---|---|---|---|---|---|
```

### phase-0-progress.md

```markdown
# Phase 0 — Progress Log
```

## Validation (run before exit)

```bash
test -f blog/docs/pages/tools/generators/v4-state.md && \
test -f blog/docs/pages/tools/generators/phase-0-questions.md && \
test -f blog/docs/pages/tools/generators/phase-0-progress.md && \
echo "OK"
```

Expect: `OK`. Otherwise: rerun the failed Write.

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| `rg` missing | Queue BLOCK Q-tooling-rg-missing. Cannot proceed without rg. STOP and present BLOCK at next user touchpoint. |
| `blog/docs/pages/tools/generators/` missing | Queue BLOCK Q-paths-missing. STOP. |
| `Write` fails (permissions) | Queue BLOCK Q-write-permissions. STOP. |

## Exit criteria

- [ ] All three files exist
- [ ] v4-state.md has `phase:` `turn:` `stage:` `card:` set correctly
- [ ] At least one checkpoint line in v4-state.md

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/01-p0-execute.md`
