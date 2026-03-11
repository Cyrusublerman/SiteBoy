# Squares — Migration Log

## Status

**Implemented.** Full port of all 7 patterns, 5 transitions, 6 effects, and 15-phase 240-second timeline. Version 2.0.0. Audit classification: complete.

## Architectural Changes from Reference

| Aspect | Reference | Live |
|---|---|---|
| Class wrapper | `SquaresTool` (ToolBase) | Bare SCRIPT_CONFIG module |
| Animation loop | `AnimationFoundation.AnimationLoop` | Host-driven via `frame` parameter |
| Time source | `16ms timestep` (reference) | `frame / 60 × speed` (deterministic) |
| Export | Not in reference | `canPrerender: true`; PNG/GIF/WebM/sequence |
| Play/Pause | Keyboard (Space) + button | Host transport only |
| Seek | Referenced | Declared but inert |

## Open Items (priority order)

1. **[HIGH] Fix `seek` parameter** — wire `params.seek` into time calculation: `t = ((frame / 60 × speed) + seek) % 240`.
2. **[HIGH] Fix `spiralUnwind` O(GRID⁴) scan** — precompute reverse-lookup map in `generateSpiral`; expected to fix frame drops at gridSize ≥ 60 during the 12-second spiralUnwind phase.
3. **[HIGH] Fix `loopFrames` for variable speed** — either declare `loopFrames` dynamically from `speed` default or document as speed=1 only.
4. **[MEDIUM] Replace raw hex colours** — `'#ffffff'`/`'#000000'` → `var(--vga-white)`/`var(--vga-black)`.
5. **[MEDIUM] Move state to per-draw scope** — eliminate `let GRID`, `let spiralPath`, `let time` at module level; pass as closure or derive from params each frame with a guard.
6. **[MEDIUM] `ctx.roundRect` polyfill or fallback** — add manual arc path for environments without native `roundRect` support.
7. **[LOW] Remove `console.log`** — line 547.
8. **[LOW] Remove or wire `canvasWidth`/`canvasHeight`** — host-level integration or remove inert params.
9. **[LOW] Keyboard controls** — Space/R/H if host provides a key-binding hook.
10. **[LOW] Info hide toggle** — add `showInfo` boolean param if host surfaces phase name display.
