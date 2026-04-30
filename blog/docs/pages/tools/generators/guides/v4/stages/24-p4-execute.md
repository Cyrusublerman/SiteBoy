# Card 24 — Phase 4 execute — produce maintenance docs

## What this stage does
Produces ongoing maintenance documentation: `drift-detection.md` (how to detect future doc/source drift), `single-gen-review.md` (the procedure for reviewing one new generator post-v4), and updates `issues.md` schema header to make the v4 conventions discoverable. Promotes `system-map-authoring.md` and the relevant cards into permanent guides location if requested. Single turn.

## Applicable rules
Operating: R5, R10. Anti-pattern numbers: 6 (no prose dumps — concise specs).

## Inputs
- `phase-3-progress.md` (lessons from fix execution)
- `phase-1-summary.md` (statistics)
- `phase-2-summary.md` (statistics)
- `blog/docs/pages/tools/generators/guides/v4/system-map-authoring.md` (already exists; will be promoted in step 5 if user wants)

## Outputs
- `blog/docs/pages/tools/generators/drift-detection.md`
- `blog/docs/pages/tools/generators/single-gen-review.md`
- Updated `issues.md` schema header
- Optionally `blog/docs/guides/standards/system-map-authoring.md` (promoted copy)

## Procedure

- [ ] 1. Update v4-state.md: `phase: 4`, `turn: p4-execute`, `stage: pre-execute`, `card: 24-p4-execute.md`, append checkpoint.
- [ ] 2. Write `phase-4-questions.md` (empty register with header).
- [ ] 3. **Write `drift-detection.md`** from template below. It documents:
  - How to detect when a generator's live source diverges from its v4 Review extracts
  - When to trigger a re-review (full vs partial)
  - Greppable canaries (e.g. new public function in live source)
  - CI/agent hooks for periodic scans
- [ ] 4. **Write `single-gen-review.md`** from template below. It documents:
  - The procedure for adding a new generator post-v4 (which cards apply)
  - The minimal subset: state-init excerpt + cards A-G + Stage F write
  - How to merge new generator results into central artefacts
- [ ] 5. **Update `issues.md` schema header** to document the v4 conventions: type prefixes (GEN/EXP/UI/VIEW/MOB/PERF/ARCH/DOC/HOST), severity (P0/P1/P2/P3), Layer/Direction columns, status vocabulary (open/in-progress/fixed/skipped-phase-3/wontfix). Use StrReplace on the existing header section.
- [ ] 6. **Capture lessons from Phase 3** as a "what to do differently next time" appendix to drift-detection.md. Items to consider:
  - Which BLOCK Q categories were most common (suggests cards to refine)
  - Which generators had highest mid-fix surprise rate (suggests deeper architectural review needed for those)
  - Which automated validations (V1-V10) caught the most issues (suggests usefulness)
  - Which validations never fired (suggests they may be redundant or untriggered)
- [ ] 7. **Optional: promote sub-guides.** `AskQuestion`: "Promote system-map-authoring.md to `blog/docs/guides/standards/`?". If yes: copy file to new location; add OBSERVE Q-card-update to phase-4-questions.md noting the cards still reference the v4 path (path update is a future maintenance task). If no: leave as-is.
- [ ] 8. Update v4-state.md: `turn: p4-questionnaire`, `card: 25-p4-questionnaire-reconcile.md`, append checkpoint.
- [ ] 9. Read card 25 — auto-advance.

## Templates

### drift-detection.md

```markdown
# Generator Drift Detection

**Purpose:** Detect when a generator's live source has diverged from its v4 Review extracts (Capability Tables, Coverage Map, System Map). Trigger re-review when divergence exceeds threshold.

## Indicators of drift

### Greppable canaries (per generator, run weekly via CI or agent prompt)

```bash
ID=<generator-id>
LIVE=assets/js/tools/generators/scripts/<category>/${ID}.gen.js
PARITY=blog/docs/pages/tools/generators/${ID}/feature-parity.md

# Canary 1: live source line count delta
LIVE_LINES=$(wc -l < $LIVE)
DOCD_LINES=$(rg "Source:.*lines" $PARITY | rg -o "\d+ lines" | rg -o "\d+")
echo "Lines: live=$LIVE_LINES; documented=$DOCD_LINES; delta=$((LIVE_LINES - DOCD_LINES))"

# Canary 2: SCRIPT_CONFIG parameter count delta
LIVE_PARAMS=$(rg -c "^\s*\{ id: '" $LIVE)
DOCD_PARAMS=$(rg -c "^\| L-\d+ \| param" $PARITY)
echo "Params: live=$LIVE_PARAMS; documented=$DOCD_PARAMS"

# Canary 3: new top-level functions
rg "^(function |const \w+\s*=\s*\(|export (function|const|class))" $LIVE | sort > /tmp/now.txt
# diff against feature-parity.md Function Coverage Map function names
```

### Severity thresholds

| Drift level | Indicator | Action |
|---|---|---|
| Minor | < 5% line delta, no new params, no new functions | No action |
| Moderate | 5-15% line delta, 1-2 new params, 1-3 new functions | Single-generator partial re-review (re-run Stage C → C.5 → D for that generator) |
| Major | > 15% line delta, > 2 new params, > 3 new functions, OR mode change (canvas2d ↔ p5 ↔ webgl) | Full single-gen review (cards A → G) |

## Re-review triggers

- Manual: user runs `single-gen-review.md` procedure
- Periodic: monthly cron-style agent prompt running canaries; if any generator hits Moderate or Major → log alert
- Post-fix: every Phase 3 batch should re-extract Capability Table at end of batch (lightweight check that fix didn't break v4 ground truth)

## Lessons from v4 Phase 3 (appended after Phase 3 completes)

- Most common BLOCK Q category: <to be filled>
- Generators with highest mid-fix surprise rate: <to be filled>
- Most useful validation: <to be filled>
- Least useful (never fired) validation: <to be filled>
- Recommended card refinements: <list>

## Cards reference

The v4 stage cards in `blog/docs/pages/tools/generators/guides/v4/stages/` are the authoritative procedure for re-reviews. Always start by reading `blog/docs/pages/tools/generators/v4-state.md` to understand current state (or initialise per card 00 if no state file exists).
```

### single-gen-review.md

```markdown
# Single-Generator Review (post-v4)

**Purpose:** Add a new generator to the v4 review without running the full 26-turn Phase 1.

## When to use

- A new generator has been added to `assets/js/tools/generators/scripts/`
- An existing generator has triggered a Major drift indicator (per drift-detection.md)
- A user reports a generator-specific issue

## Procedure

### One-off setup (skip if already in v4 maintenance mode)

1. Confirm `v4-state.md` exists. If not, run card 00 (state init).
2. Confirm `reference-manifest.md` exists. If new generator: append a row for it.
3. Confirm `phase-1-questions.md` exists or create empty register.

### Review

1. Update `v4-state.md`: `phase: 1, turn: p1-gen-NN-<id>, stage: pre-A, card: guides/v4/stages/05-p1-stage-A.md`. (Pick `NN` as next free index; use append-only.)
2. Run cards A → B → B.5 → C → C.5 → D → E → E.5 → E.6 → F → G in sequence (per shell Routing Table).
3. Stage G validation must pass.
4. If Qs were queued: run a focused mini-questionnaire (just the new Qs); apply answers; patch artefacts.

### Integrate

- New generator's `feature-parity.md` and `system-map.md` are added directly under `blog/docs/pages/tools/generators/<id>/`.
- New issues are added to central `issues.md` with continuing sequential ids.
- If new ARCH issues `algorithm-shared-module-missing`: queue for next maintenance window's shared-module batch.

## Partial re-review (Moderate drift)

For Moderate drift detection alerts: re-run only Stage C → C.5 → D → E (skip B, B.5, E.5, E.6 unless those areas changed). The Reference Capability Table and reference System Map are stable; only the Live side needs updating.

## Output

- All seven artefacts under `blog/docs/pages/tools/generators/<id>/feature-parity.md` `## v4 Review (<date>)` section
- `system-map.md` updated
- `issues.md` updated
- One block in `phase-1-progress.md` (or a new `maintenance-progress.md` if Phase 1 is done)
```

### issues.md schema header (StrReplace target)

```markdown
# Issues — Generator Tool Suite

**Schema (v4):**

| Column | Meaning |
|---|---|
| `issue_id` | `<TYPE>-NN` zero-padded sequential per type |
| `type` | One of GEN (generator behaviour), EXP (export), UI (host UI), VIEW (viewport), MOB (mobile), ARCH (architecture/code-org), PERF (performance), DOC (documentation), HOST (host framework) |
| `severity` | P0 (broken/blocks user) / P1 (significant gap) / P2 (notable) / P3 (minor) |
| `Layer` | reference / live / spec / host (where the issue is located) |
| `Direction` | reference→live (live missing something) / live→reference (live has divergence) / spec↔live (doc drift) |
| `summary` | one-line description |
| `evidence` | file:line citation |
| `first_seen` | which review/turn first logged this; v3 / v4 / maintenance-<date> |
| `status` | open / in-progress / fixed / skipped-phase-3 / wontfix / wontfix-intentional-drop |

**Procedures:**

- v4 review cards: `blog/docs/pages/tools/generators/guides/v4/stages/`
- v4 state pointer: `blog/docs/pages/tools/generators/v4-state.md`
- Drift detection: `blog/docs/pages/tools/generators/drift-detection.md`
- Single-gen review: `blog/docs/pages/tools/generators/single-gen-review.md`

---
```

## Validation

```bash
test -f blog/docs/pages/tools/generators/drift-detection.md && \
test -f blog/docs/pages/tools/generators/single-gen-review.md && \
echo "OK maintenance docs created"

rg "^\*\*Schema \(v4\):\*\*" blog/docs/pages/tools/generators/issues.md && \
echo "OK issues.md schema header updated"
```

## Halt-and-recover

| Trigger | Recovery |
|---|---|
| StrReplace on issues.md schema header fails (no existing header to replace) | Insert at top of file using StrReplace with `# Issues — ` as old_string. If still fails, prepend by reading whole file and Writing with new header + body. |
| User declines promote-to-guides | OK — leave files in v4/ subdirectory. No action. |
| Phase 3 didn't produce phase-3-progress.md (Phase 3 was skipped or aborted) | Skip the "Lessons from Phase 3" section in drift-detection.md. Note "Phase 3 not completed for v4 cycle" in summary. |

## Exit criteria

- [ ] drift-detection.md exists with all sections
- [ ] single-gen-review.md exists with all sections
- [ ] issues.md has v4 schema header
- [ ] If user opted to promote sub-guides: copies exist at promoted path
- [ ] v4-state.md points at card 25

## Next card

`blog/docs/pages/tools/generators/guides/v4/stages/25-p4-questionnaire-reconcile.md`
