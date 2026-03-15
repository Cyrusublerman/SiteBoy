# Defecated — Feature Parity

## Source Reference

- Live gen script: `assets/js/tools/generators/scripts/other/defecated.gen.js` v1.0.0
- Legacy tool: `assets/js/tools/generators/defecated-tool.js` — full ToolBase implementation (reference)

## Feature Status

| Feature | Status | Notes |
|---|---|---|
| Google Fonts cycling | PASS | 40 families loaded from CDN; Fisher-Yates shuffle per session |
| WebGL gooey blur shader | PASS | GLSL via `p.createShader`; 31×31 Gaussian + smoothstep threshold |
| Configurable text lines (1–3) | PARTIAL | Dropdown options (5 per line); free-text input not supported by SCRIPT_CONFIG |
| Power-curve morphology timing | PASS | Symmetric power-curve ease; `power` param 2–10 |
| Blur/threshold animation | PASS | `blurAmount = intensity × blurMax`; `threshold` lerped 0.5→0.3 |
| Offscreen buffer double-buffering | PASS | `gfx1`/`gfx2` swap on cycle completion |
| Canvas size modes (fit/fill/actual) | PARTIAL | WEBGL canvas centred at native 800×600; host viewport controls ineffective (documented limitation) |
| Debug overlay | PASS | `displayOptions` toggle; 2D graphics buffer for reliable text in WEBGL context |
| Parameter set | PASS | Text (3), Layout (3), Timing (2), Effect (1), Display (1) = 10 params; 4 presets |

## Architectural Barriers (Resolved or Residual)

| Barrier | Status |
|---|---|
| WebGL requirement | RESOLVED — p5Setup recreates canvas in WEBGL mode |
| Iframe isolation | RESOLVED — standard p5Setup/p5Draw pattern used |
| `text` input type | RESIDUAL — dropdown substitution in place; free-text not available |
| Non-deterministic animation | RESIDUAL — Math.random() + millis(); GIF/WebM export disabled |
| Google Fonts CDN | RESIDUAL — external dependency; no offline fallback |
