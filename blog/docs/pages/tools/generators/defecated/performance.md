# Defecated — Performance

## Current Live Stub

O(1) per frame — single `fillRect`. No performance concern.

## Intended Implementation (from `defecated-tool.js`)

### GLSL Shader

The fragment shader runs a 31×31 Gaussian blur kernel. Maximum samples per pixel: 961. For an 800×600 canvas at 1 pixel density: `800 × 600 × 961 = 460,800,000` texture lookups per frame. At high `blurMax` values, the inner loop's `if(abs(x) > amount || abs(y) > amount) continue` reduces this, but worst-case is near full 31×31.

This is a GPU operation. Modern GPUs can execute this in well under 16 ms at 800×600 resolution. At higher canvas resolutions or pixel densities, performance degrades quadratically.

### Text Rendering

`drawTextToGraphics` is called once per cycle completion (not every frame). P5 `createGraphics` offscreen buffers are reused between cycles. Text measurement and drawing cost is negligible relative to the shader.

### Font Loading

40 Google Fonts are loaded via CSS injection on initialisation. Network request, not per-frame. Fonts may not be available immediately; the sketch uses whatever is cached.

### Memory

Two `createGraphics` buffers of canvas size. At 800×600: ~1.8 MB each in RGBA. Plus WebGL framebuffers for shader output. Total: ~10–15 MB.

## Worker Feasibility

**Not feasible.** WebGL shaders require a GPU context; this cannot be transferred to a Worker. The entire architecture depends on P5.js WebGL within an iframe.
