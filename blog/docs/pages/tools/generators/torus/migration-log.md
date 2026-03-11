# Torus — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/parametric/torus.gen.js` v1.0.0
Legacy docs: `torus.md` (mixed bundle), `torus-audit.md` (audit only)

## Summary of Migration State

Generator is **fully implemented** and functional. The live script is an enhancement over the original reference — all core features are present and several recommended additions (adjustable spiral count, winds, view angles, cycle speed) have been implemented.

Primary issues: module-level mutable state, raw colour strings, non-standard projection matrix, locked major/minor radii, inert canvas parameters.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | ToolBase class with `window.TorusTool` | SCRIPT_CONFIG ES module export |
| Parameters | All hardcoded | 7 configurable parameters |
| Animation | AnimationFoundation.AnimationLoop | `type: 'loop'`, frame-driven |
| Projection | Same non-standard sequential rotation | Same (inherited) |

## Open Items (Ordered by Priority)

1. Remove module-level `majorRadius`/`minorRadius`; compute locally in `draw`.
2. Replace raw colour strings with VGA CSS variables.
3. Fix `project3D` to implement a standard Ry × Rx rotation matrix.
4. Add separate `minorRatio` (or `majorFactor`/`minorFactor`) parameters to decouple major and minor radii.
5. Change `showTorusMesh` type from `toggle` to `radio`.
6. Remove inert `canvasWidth`/`canvasHeight` parameters.
7. Remove `console.log` at line 324.
8. Add `animatableParams: []` or equivalent to acknowledge frame-driven animation model.
9. Consider play/pause support (medium priority — depends on host capabilities).
