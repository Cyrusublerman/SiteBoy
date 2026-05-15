# E4 — WU-6: G12 worker offload + bilateral fix

**Status**: TODO
**Priority**: P1
**Owner file(s)**: `RenderWorker.js`, `Pipeline.js`, `BilateralFilterNode.js`, + every heavy node file
**Blockers**: none
**Blocks**: E7
**Last touched**: 2026-05-12

## Goal

No heavy module blocks the main thread >50ms. `bilateral` no longer hangs at high radius.

## Done when

`bilateral` completes at radius=10 on a 4K image in <2s. `forceWorkerPreview: true` confirmed on every heavy node. `previewMax` caps added to CA, RD, stipple, delaunay.

## Sub-tasks

- [ ] Audit which modules' `apply()` runs on main thread vs worker.
- [ ] Set `forceWorkerPreview: true` on all expensive modules (list inferred from the audit).
- [ ] Diagnose bilateral hang (algorithm bug vs timeout vs worker setup).
- [ ] Fix bilateral.
- [ ] Add `previewMax` caps to:
  - `CellularAutomataNode`
  - `ReactionDiffusionNode`
  - `StippleNode`
  - `DelaunayMeshNode`
- [ ] Add a perf-regression harness (timing per module on a fixed input).

## Notes / decisions

(append-only)

## References

- `blog/docs/temp/distort-next-steps.md` §WU-6
- `blog/docs/temp/distort-worker-audit.md`
