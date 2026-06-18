# E8 — Add new distort effects

**Status**: DONE
**Priority**: P2
**Owner file(s)**: `assets/js/tools/processors/distort/nodes/`, `shaders/`, `nodes/registry.js`
**Blockers**: → E1
**Blocks**: —
**Last touched**: 2026-06-18

## Goal

Effects beyond the current 58 — every effect that has a build guide but no shipped Node + shader pair (and any new candidates).

## Done when

For every new effect: shader + Node + registry entry + review doc exist; module passes audit; modulation works (post-E1).

## Queue

| Effect | Category | Spec | Shader | Node | Status |
| --- | --- | --- | --- | --- | --- |
| _none_ | — | all 58 build guides have matching registry entries | — | — | DONE |

(`delaunaymesh` build guide maps to `mosaic` registry type.)

## Sub-tasks

- [x] Run the cross-reference scan to confirm the queue is empty.
- [ ] When new effects are proposed, add a row and follow the build-guide template.

## Notes / decisions

2026-06-18: Scan via `scripts/e-track-e8-scan.mjs` — 58 guides, 62 registry types, 0 missing.

## References

- `blog/docs/pages/tools/processors/distort/build-guides/archive/*-build-guide.md`
- `assets/js/tools/processors/distort/nodes/registry.js`
