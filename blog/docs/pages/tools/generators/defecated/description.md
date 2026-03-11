# Defecated — Description

Defecated is a text morphing animation that cycles through Google Fonts, rendering 1–3 configurable text lines that dissolve between fonts using a WebGL gooey blur-threshold shader. The tool uses an iframe to host a P5.js WebGL sketch, as the shader requires a full WebGL context.

## Morphology Effect

Each morph cycle (`morphTime` ms) transitions from the current font to the next:
1. Text is pre-rendered to two offscreen P5 graphics buffers (`gfx1`, `gfx2`), white on transparent.
2. A GLSL fragment shader blends the two buffers using a Gaussian blur kernel (`blurAmount`) and a smoothstep threshold (`threshold`).
3. The blur causes alpha "halos" around letters that merge and separate as `intensity` sweeps 0→1→0 — producing the liquid gooey morph.
4. When `intensity = 0` (start/end of cycle), the sharp texture is drawn directly without the shader.

## Timing Model

```
t = elapsed / morphTime  ∈ [0, 1]
morphT = power_eased(t)   // symmetric S-curve: slow at endpoints, fast in middle
intensity = max(0, sin(morphT × π) × 1.1 − 0.1)   // shaped bell
blurAmount = intensity × blurMax
threshold = map(intensity, 0, 1, 0.5, 0.3)
```

The `power` parameter (2–10) controls how much time is spent at each font before morphing begins; higher values = sharper, faster transitions.

## Font System

40 Google Fonts are pre-loaded via a CSS `<link>` tag. Fonts are shuffled randomly on initialisation, then advanced in queue order. Fonts cycle: on each completion, the queue shifts and a new font is appended.

## Text Layout

Each text line is independently scaled to fit `targetWidth × canvas.width`. If the combined height exceeds `maxTotalHeight × canvas.height`, all sizes are uniformly scaled down. Text is bold, horizontally centred.

## Architecture (Legacy ToolBase)

The implementation in `defecated-tool.js` uses an iframe containing a full P5.js sketch injected as an HTML string. This approach is necessary for WebGL shader access. The host tool passes CONFIG via `window.postMessage` to the iframe's script. The current SCRIPT_CONFIG system does not support WebGL shaders or iframe embedding — migration requires extending the host.

## Current Live State

The live `defecated.gen.js` is a placeholder stub that fills the canvas black. `param` is a non-functional slider.
