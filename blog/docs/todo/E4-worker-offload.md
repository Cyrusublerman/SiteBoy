# E4 — WU-6: G12 worker offload + bilateral fix

**Status**: DONE
**Priority**: P1
**Owner file(s)**: `RenderWorker.js`, `Pipeline.js`, `BilateralFilterNode.js`, + every heavy node file
**Blockers**: none
**Blocks**: E7
**Last touched**: 2026-06-18

## Goal

No heavy module blocks the main thread >50ms. `bilateral` no longer hangs at high radius.

## Done when

`bilateral` completes at radius=10 on a 4K image in <2s. `forceWorkerPreview: true` confirmed on every heavy node. `previewMax` caps added to CA, RD, stipple, delaunay.

## Sub-tasks

- [x] Audit which modules' `apply()` runs on main thread vs worker.
- [x] Set `forceWorkerPreview: true` on all expensive modules (list inferred from the audit).
- [x] Diagnose bilateral hang (algorithm bug vs timeout vs worker setup).
- [x] Fix bilateral.
- [x] Add `previewMax` caps to:
  - `CellularAutomataNode`
  - `ReactionDiffusionNode`
  - `StippleNode`
  - `DelaunayMeshNode`
- [x] Add a perf-regression harness (timing per module on a fixed input).

## Notes / decisions

2026-06-18: Bilateral fixed via `BILATERAL_MAX_RADIUS=10` + range LUT precompute. Added `forceWorkerPreview` to boxblur, gaussblur, motionblur, dilateerode, domainwarp, flowfield, advection, serpentine, lumflow, tileblend. Audit: `distort-worker-audit.md`.

## References

- `blog/docs/pages/tools/processors/distort/distort-next-steps.md` §WU-6
- `blog/docs/pages/tools/processors/distort/distort-worker-audit.md`
