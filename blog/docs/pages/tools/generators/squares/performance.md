# Squares — Performance

## Complexity

### Per-Frame Work

- Outer loop: `GRID²` tiles (default 2500; max 6400 at gridSize=80).
- Per tile:
  - `getCurrentState`: O(15) linear scan — constant.
  - Pattern fn: O(1).
  - Transition fn: `spiralUnwind` scans `spiralPath` (O(N²) worst-case linear scan per tile). All others O(1).
  - Effect fn: O(1).
  - `drawCard`: 1 fill + 1 stroke per tile.

**Overall: O(GRID²)** for pattern/effect phases.  
**spiralUnwind transition: O(GRID⁴)** — O(N²) inner scan per O(N²) tiles.

### spiralUnwind Hot Path

At `gridSize = 50`: 2500 tiles × 2500 linear scan = 6.25 M iterations per frame. At `gridSize = 80`: 6400 × 6400 = ~41 M iterations. At 60 fps this exceeds frame budget (16 ms) for large grids during the spiralUnwind transition (198–210 s in the timeline).

**Mitigation candidate:** Precompute a reverse-lookup map `spiralIndex[col][row]` once at spiral generation. O(GRID²) storage, O(1) lookup, reduces to O(GRID²) per frame.

### Canvas Draw Cost

At `gridSize = 80`: 6400 individual `save/translate/rotate/restore` + fill + stroke calls. Rotation and `roundRect` paths are the dominant per-tile costs during effect phases. At `gridSize = 50` (default), well within 16 ms budget.

## Memory

- `spiralPath`: GRID² entries × 2 integers. At gridSize=80: 6400 × 8 bytes ≈ 51 KB.
- No ImageData allocation; direct vector drawing.
- No frame-to-frame retained buffers beyond `spiralPath`.

## Extreme Parameter Analysis

| Condition | Effect |
|---|---|
| `gridSize = 80` during `spiralUnwind` | O(GRID⁴) ≈ 41 M iterations/frame. High risk of frame drops. |
| `speed = 3` | Timeline advances 3× faster; no computational difference per frame. |
| `speed = 0.5`, `canPrerender = true` | 14400/0.5 = 28800 frames to pre-render. Memory intensive for GIF/WebM. |

## Worker Feasibility

**Low.** The generator uses `ctx` (2D Canvas API) directly for per-tile draw calls with `ctx.save`/`restore`/`rotate`. Canvas 2D is not transferable to a Worker. Would require rearchitecting to ImageData + CPU rendering, losing the vector quality of rounded rects and strokes.

Primary optimization target is the `spiralUnwind` reverse-lookup fix.
