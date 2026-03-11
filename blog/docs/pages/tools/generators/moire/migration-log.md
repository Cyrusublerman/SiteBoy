# Moiré — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/wave/moire.gen.js` v2.0.0
Legacy docs: `moire-generator-spec.md` (mixed bundle), `moire-generator-audit.md` (audit only)

## Summary of Migration State

The live script is a complete v2 implementation of the moiré generator. Core grating computation (radial, angular, multi-centre, combination modes, mask, threshold) is fully functional. The generator is stateless with a single ImageData render pass.

Key divergences from the legacy spec:
1. **Triangle mask SDF** — broken due to `const` in switch case (syntax issue) and an incomplete/no-op formula.
2. **Three non-standard parameter types** — `color`, `toggle`, `dropdown` used without host support guarantees.
3. **WebGL not implemented** — CPU-only rendering.
4. **Two parameters missing from spec** — `angularModAmplitude`, `maskRotation`.
5. **No animatableParams declaration** — animation parameters not machine-discoverable.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | TOOL_CONFIG (vanilla JS) | SCRIPT_CONFIG ES module export |
| Rendering | WebGL primary | CPU ImageData only |
| State | External state management | Fully stateless |
| Presets | Not in spec | 3 full-parameter presets |

## Open Items (Ordered by Priority)

1. Fix triangle mask: add braces around case body to scope `const ax`; implement correct 3-half-plane equilateral triangle SDF.
2. Verify host support for `type: 'color'` and `type: 'dropdown'`; replace with `radio` if unsupported.
3. Replace `type: 'toggle'` on `invert` with `type: 'radio'` options `['on', 'off']` or equivalent supported type.
4. Add `animatableParams: ['phaseOffset']` to `animation` object.
5. Add `angularModAmplitude` slider to Gratings group.
6. Add `maskRotation` slider to Mask group.
7. Implement polygon mask SDF or document square as intentional replacement.
8. Remove inert `canvasWidth`/`canvasHeight` parameters.
9. Remove `console.log` at line 514.
10. Cache `parseColor` results per-frame to avoid redundant string parsing.
