# Defecated — Feature Parity

## Source Reference

- Live gen script: `assets/js/tools/generators/scripts/other/defecated.gen.js` — stub
- Reference gen script: `reference/generators/defecated/source/defecated.gen.js` — identical stub
- Legacy tool: `assets/js/tools/generators/defecated-tool.js` — full implementation (ToolBase)

## Feature Status

All features of the intended implementation are absent from the live generator script.

| Feature | Status | Notes |
|---|---|---|
| Google Fonts cycling | FAIL | Not in generator system |
| WebGL gooey blur shader | FAIL | Generator host uses 2D/P5 context only |
| Configurable text lines (1–3) | FAIL | `text` input type not supported by SCRIPT_CONFIG |
| Power-curve morphology timing | FAIL | |
| Blur/threshold animation | FAIL | |
| Offscreen buffer double-buffering | FAIL | |
| Canvas size modes (fit/fill/actual) | FAIL | |
| Debug overlay | FAIL | |
| `param` slider | FAIL | Inert in live stub |

## Architectural Barriers to Migration

| Barrier | Description |
|---|---|
| WebGL requirement | Generator host dispatches `2d` or `p5` (P5.js 2D) contexts; WebGL requires `context: 'webgl'` support |
| Iframe isolation | ToolBase runs P5 in an iframe; generator host expects `draw(ctx, canvas, params, frame)` |
| `text` input type | Line content requires free-text input; SCRIPT_CONFIG parameter types only include `slider`/`dropdown`/`toggle` |
| Non-deterministic | Font shuffling and `millis()` timing are random; pre-render and frame-based replay are not possible |
| Google Fonts CDN | External network dependency; violates offline-capable design |
