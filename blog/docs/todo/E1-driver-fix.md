# E1 — WU-3: G1 driver (+D) fix

**Status**: DONE
**Priority**: P0
**Owner file(s)**: `assets/js/tools/processors/distort/ui/NodePanel.js`, `core/Pipeline.js`, `core/EffectNode.js`, `ui/DriverPicker.js`, multiple node files
**Blockers**: none
**Blocks**: E2, E7, E8
**Last touched**: 2026-05-12

## Goal

End-to-end fix of the `+D` driver slot. 48+ modules currently have a non-functional `+D` button — affects all spatial modulation.

## Done when

(a) `+D` slot opens DriverPicker (runtime verified).
(b) `Pipeline._applyNodeModulation` correctly handles the `__opacity__` key (reads `node.opacity`, not `node.params`).
(c) `EffectNode.getModulated` handles `__opacity__` base value.
(d) Every `driveable: true` param's `apply()` calls `modulate(...)`.

## Sub-tasks

- [ ] `NodePanel._toggleDriverPicker` — confirm DriverPicker renders on +D click.
- [ ] `Pipeline._applyNodeModulation` — special-case `__opacity__`.
- [ ] `EffectNode.getModulated` — special-case `__opacity__` base value.
- [ ] Audit every node file for `driveable: true` params; verify each calls `modulate`. Known offenders: `dilateerode`, `openclose`, `contour`, `sdfshape`, `interference`. Per `distort-issue-register.md`, the violation set is essentially every module — confirm with grep.
- [ ] Add a regression test or harness page that flips each driver type for each module and visually confirms response.

## Notes / decisions

(append-only)

## References

- `blog/docs/pages/tools/processors/distort/distort-next-steps.md` §WU-3
- `blog/docs/pages/tools/processors/distort/distort-issue-register.md` (G1 rows)
