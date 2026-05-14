# E8 — Add new distort effects

**Status**: TODO
**Priority**: P2
**Owner file(s)**: `assets/js/tools/processors/distort/nodes/`, `shaders/`, `nodes/registry.js`
**Blockers**: → E1
**Blocks**: —
**Last touched**: 2026-05-12

## Goal

Effects beyond the current 58 — every effect that has a build guide but no shipped Node + shader pair (and any new candidates).

## Done when

For every new effect: shader + Node + registry entry + review doc exist; module passes audit; modulation works (post-E1).

## Queue (to be populated)

| Effect | Category | Spec | Shader | Node | Status |
| --- | --- | --- | --- | --- | --- |
| _TBD_ |  |  |  |  |  |

(Populate by enumerating `blog/docs/temp/*-build-guide.md` entries without a matching `<Effect>Node.js`. Per current scan, all 58 build guides have matching nodes — extend with new candidate effects when raised.)

## Sub-tasks

- [ ] Run the cross-reference scan to confirm the queue is empty.
- [ ] When new effects are proposed, add a row and follow the build-guide template.

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/*-build-guide.md`
- `assets/js/tools/processors/distort/nodes/registry.js`
