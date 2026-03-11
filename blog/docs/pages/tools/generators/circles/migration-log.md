# Circles — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/other/circles.gen.js` v1.0.0
Legacy docs: `circles.md` (mixed bundle), `circles-audit.md` (audit only)

## Summary of Migration State

Generator is **implemented and functional**. Core rendering (3 modes, hierarchical transforms, frame-based animation) is complete. No critical bugs affecting visual output under default parameters, but the orbit model does not implement true rolling/epicyclic motion.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | ToolBase class (`window.CirclesTool`) | SCRIPT_CONFIG ES module export |
| Animation | AnimationFoundation.AnimationLoop | `type: 'loop'`, frame-driven |
| Sizing | Responsive (from ToolBase) | Responsive (from canvas.width/height) |
| Import | None | `TWO_PI` from shared evaluation.js |

## Open Items (Ordered by Priority)

1. Remove module-level `circles`, `largestRadius`, `radiusDecrement`; manage via closure or local state.
2. Replace raw colour strings with VGA CSS variables.
3. Fix orbit formula to implement true rolling motion: `orbitAngle_i = frame × (largestRadius / radius_i) × (2π / cycleFrames)`.
4. Add canvas-size change detection to rebuild trigger.
5. Fix `displayMode.toLowerCase()` null guard.
6. Add `animatableParams: []` to animation block.
7. Fix `loopFrames` to match the configurable `cycleFrames` default.
8. Remove `console.log` at line 206.
9. Expose `largestRadius`, line width, and colour as parameters.
