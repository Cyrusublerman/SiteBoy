# Generative Pattern — Performance

**[DOC-022 DEFERRED — 2026-04-30]** Live script is v1.0.0 (fully implemented — Gray-Scott + SDF pipeline). This file analyses stub/spec intent only. Do not use as implementation reference. Full rewrite deferred; see `issues.md` DOC-022.

## Expected Complexity (when implemented)

| Phase | Algorithm | Complexity |
|---|---|---|
| Point distribution | Grid + Poisson sampling | O(N) where N = density × canvas_area |
| Proximity graph | Naive: O(N²); with spatial hash: O(N × maxDegree) | O(N²) worst case |
| Gray-Scott solver | Per-edge Laplacian | O(E × iterations) where E = edges in graph |
| Distance transform | Jump Flood Algorithm | O(W × H × log₂(max(W,H))) |
| Rendering (Truchet/contour) | Pixel iteration + SDF lookup | O(W × H) |

## Dominant Cost

At `iterations = 5000` and N = ~1000 points: Gray-Scott solver is O(5000 × E) — potentially 5–50M operations per keyframe. This is a **rebuild-phase cost**, not a per-animation-frame cost.

Per-animation-frame cost (flow advection only): O(N) — acceptable.

## Frame Budget Implications

Gray-Scott with `iterations = 5000` at N = 1000 should be pre-computed or run in a Web Worker, not on the animation frame path. The spec lists it under `onInit`, not `onDraw`, implying pre-computation at parameter change, not every frame. At default `iterations = 0`, the RD phase is skipped entirely.

## Worker Feasibility

**High** for the Gray-Scott solver — no DOM dependencies. Point data and graph structure are serialisable. JFA distance transform is also Worker-safe.

## Memory Requirements (estimated)

| Data Structure | Size |
|---|---|
| Point set (N = 1000) | ~24 KB (3 floats × 2 coords + weight) |
| Proximity graph (N = 1000, maxDeg = 8) | ~64 KB |
| Gray-Scott u/v arrays | 2 × N × 4 bytes = ~8 KB |
| SDF field (800×800 floats) | ~2.5 MB |
| ImageData (800×800) | ~2.6 MB |
