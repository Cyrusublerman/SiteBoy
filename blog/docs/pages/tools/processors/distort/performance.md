# DISTORT Performance Law

Host-level performance law for the DISTORT tool. For module-level cost classification, see `blog/docs/components/distort/performance.md`.

## Execution Model

Pipeline execution is fully off-thread. The main thread owns:
- UI event handling (param changes, node reorder, add/remove)
- Display-mode transforms (zoom, pan, FIT/FILL/ACTUAL viewport recalc)
- Transport strip control (play/pause/scrub)
- File I/O (load source image, export results)

The Worker thread owns:
- All pipeline computation
- All per-pixel operations
- Buffer allocation (from a pool), composite, and cache
- Expression evaluation
- Frame sequencing when rendering a sequence

Consequence: a frame dropped in UI is never caused by a slow module. A module that is slow causes render queue depth to grow, not frame drops.

## Request Management

WorkerBridge maintains one pending render slot per quality level.
- Issuing a new PREVIEW render cancels any queued PREVIEW render
- Issuing a new FULL render does not cancel any queued FULL render (sequential)

An unresponsive Worker (no response within 5s for PREVIEW, 60s for FULL) triggers a Worker restart and re-queues the current render.

## Quality Tiers

| Tier | Max dimension | Use |
| --- | --- | --- |
| PREVIEW | 800px longest side | Interactive feedback |
| FULL | Source resolution | Export, final render |

All interactive param changes trigger PREVIEW re-render. FULL is triggered only on export or explicit user request.

## Buffer Pool

The Worker maintains a typed-array pool. Allocations within `apply()` must go through `ctx.pool.acquire(size)` / `ctx.pool.release(buffer)`.

**Rules:**
- A buffer acquired in `apply()` must be released before `apply()` returns, or it leaks
- A module must never hold a buffer reference between renders
- A module may allocate small scratch arrays outside the pool only when size < 1KB and lifetime is sub-frame

## Cache

Each node caches its output buffer. Cache is keyed by `(nodeId, paramHash, inputBufferHash, quality)`.

- Cache hit — output buffer returned without executing `apply()`
- Cache miss — `apply()` is executed; output is stored in cache
- Cache eviction — LRU; ceiling 128MB total

A node is invalidated when any param changes or upstream output changes. See `rules.md §8` for full invalidation matrix.

## Animation Pacing

Animation playback is at PREVIEW quality. The pacing rule:

- Target: `requestedFPS` from CANVAS tab
- Actual: `min(requestedFPS, 1000 / renderTime)` where `renderTime` is measured per frame

If actual FPS < requested FPS, no dropped frames — playback simply runs slower. The render is always complete before display.

## Loading Feedback

Progress feedback is required when:
- Source image load exceeds 200ms
- Full-quality render exceeds 500ms
- Render sequence export exceeds 1s total

Progress is displayed in the transport strip (render) or status bar (file I/O). No modal blocking.

## Render Cost Classification

Published in `blog/docs/components/distort/performance.md`. Required for all modules at documentation time.

| Class | Wall time per frame (PREVIEW, typical hardware) |
| --- | --- |
| A | < 16ms |
| B | 16–100ms |
| C | 100–500ms |
| D | > 500ms |

Class D modules must implement PREVIEW caps. Class C modules should implement PREVIEW caps. See `rules.md §9`.

## Host-Level Constraints

- Canvas resize must not trigger a pipeline re-render unless the pipeline output dimension changes
- Zoom and pan are viewport transforms only — no re-render
- Param drag must throttle to one PREVIEW render per frame; intermediate values do not each trigger a render
- Adding a node must only invalidate that node and downstream; it must not reset the entire cache
- Source image loaded into memory in its original resolution; PREVIEW-size copy is derived in Worker, not on load
