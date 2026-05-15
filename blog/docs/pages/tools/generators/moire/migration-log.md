# Moiré — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/wave/moire.gen.js` v2.0.0
Legacy docs: `moire-generator-spec.md` (mixed bundle), `moire-generator-audit.md` (audit only)

## Summary of Migration State

The live script is a complete v2 implementation of the moire generator. Core grating computation (radial, angular, multi-centre, combination modes, mask, threshold) is functional. The generator is stateless with a single ImageData render pass.

Current unresolved divergences from the legacy spec:
1. WebGL not implemented (CPU ImageData path only).
2. `angularModAmplitude` not exposed.
3. `maskRotation` not implemented.
4. Polygon mask not implemented (square used instead).
5. SVG export not implemented.

## Architecture Changes from Legacy

| Aspect | Legacy | Live |
|---|---|---|
| Script format | TOOL_CONFIG (vanilla JS) | SCRIPT_CONFIG ES module export |
| Rendering | WebGL primary | CPU ImageData only |
| State | External state management | Fully stateless |
| Presets | Not in spec | 3 full-parameter presets |

## 2026-04-28 additions (MOI-01 – MOI-04)

- **MOI-01 Canvas size:** Canvas-size honour fixed via X-004/X-005; host now correctly passes width/height from SCRIPT_CONFIG canvas block.
- **MOI-02 Colour controls:** Per-grating colour controls moved to `canvas.colourway` via X-007 — `foreground` and `background` slots. Draw path resolves from colourway; hardcoded hex values removed.
- **MOI-03 Animatable params:** `AnimateParamControl` (X-002) wired to per-grating strength/rate channels; individual grating animation can run independently.
- **MOI-04 Polar grating positions:** `gratingA` and `gratingB` polar position params added — `polarR` (radial distance, 0–1 of half-canvas) and `polarTheta` (angle, 0–360°); grating centres computed from polar coords rather than hardcoded Cartesian offsets.

## 2026-04-30 additions (PERF-003)

- **PERF-003 Tier-3 worker offload:** `computePixels` method added to `SCRIPT_CONFIG` — self-contained (all helpers inlined: `radialGrating`, `angularGrating`, `combineMoire`, `smoothstep`, `computeGratings`, `computeMask`, `parseHex`). `compute.worker: true` set. Colourway colors injected into `params._fgColor`/`params._bgColor` by `draw()` fallback on idle restore, so worker renders pick up colour changes within one idle delay period. PERF-003 closed.

## Open Items (Ordered by Priority)

1. Add `angularModAmplitude`.
2. Add `maskRotation`.
3. Implement polygon mask or formalise square replacement.
4. Evaluate host handling of colour parameter type consistency.
