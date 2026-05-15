# Defecated — Description

Defecated is a p5 WebGL text-morph generator. It cycles through a shuffled Google Font set and morphs between consecutive font renders using a blur-plus-threshold GLSL shader.

Each cycle (`morphTime`) interpolates from current to next font:
1. Text is rasterised into two offscreen 2D buffers.
2. Mid-cycle frames run through a fragment shader with Gaussian blur + alpha threshold.
3. Endpoint frames bypass shader and render the source texture directly.

Timing is wall-clock (`p.millis()`), not frame-index.  
`power` shapes endpoint dwell versus transition speed.  
`blurMax` controls peak blur radius.

Font system:
- 40 Google Fonts loaded via a single CSS link.
- Initial Fisher-Yates shuffle.
- Queue advances one font per completed cycle.

Text layout:
- Three dropdown-selected lines.
- Per-line scale targets width fraction (`targetWidth`).
- Global cap by height fraction (`maxHeight`).
- Gap controlled by `lineGap`.

Current live architecture:
- `SCRIPT_CONFIG` p5 generator (`context: 'p5'`).
- `p5Setup` recreates canvas in `WEBGL` mode.
- No iframe host bridge.
- Shader uniforms: `tex0`, `tex1`, `blurAmount`, `threshold`, `intensity`, `texelSize`.
- Export: PNG only (`gif/webm` disabled).
