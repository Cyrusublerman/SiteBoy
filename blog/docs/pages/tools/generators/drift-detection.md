# Generator Drift Detection

**Purpose:** detect when live generator source has diverged from v4 review artefacts.

## Drift Indicators

Run for one generator:

```bash
ID=<generator-id>
LIVE=assets/js/tools/generators/scripts/<category>/${ID}.gen.js
PARITY=blog/docs/pages/tools/generators/${ID}/feature-parity.md
rg "export const SCRIPT_CONFIG|parameters:|animation:|export:" "$LIVE"
rg "^### Live Capability Table|^### Diff Table|^### Performance Tier Audit" "$PARITY"
```

## Thresholds

| Level | Indicator | Action |
|---|---|---|
| Minor | docs typo, no source contract change | patch affected doc only |
| Moderate | new params, export flag, animation metadata, or helper function | partial re-review: Stage C → C.5 → D → E |
| Major | render mode change, new lifecycle, new compute path, or many functions | full single-generator review: cards A → G |

## Canaries

- New or removed `SCRIPT_CONFIG.parameters` keys.
- Changed `canvas.context`.
- Changed `animation.type`, `loopFrames`, `animatableParams`, `sequencer`, or `animationExport`.
- Changed `export` flags.
- New top-level helper functions.
- New state scope (`let`, cache, WeakMap, closure, SCRIPT_CONFIG property).
- New worker/GPU/audio/network side effect.

## Re-Review Triggers

- Manual user report.
- Any Moderate/Major canary.
- After a fix batch that changes source code.
- Before declaring docs current after more than one generator source changed.

## Phase 3 Lessons

- Common decision class: placeholder-reference parity should usually be `WONTFIX`, not remade to match a stub.
- Common performance outcome: p5 worker/GPU conversion is a later remake task unless the script already has a compute path.
- Most useful validation: issue-register scans for remaining `OPEN` rows.
- Most useful doc check: compare `ui-layout.md` and `migration-log.md` against live `SCRIPT_CONFIG`.
- Card refinement: Phase 3 should allow user-confirmed `WONTFIX` for procedural generator/BaseComponent and frame-start behaviour without repeated questionnaires.

## Authoritative Cards

Use `blog/docs/pages/tools/generators/guides/v4/stages/` for re-review procedure. Start by reading `v4-state.md`.
