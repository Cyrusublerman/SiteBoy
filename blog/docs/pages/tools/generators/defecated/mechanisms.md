# Defecated — Mechanisms

## Runtime Architecture (Legacy)

```
defecated-tool.js (ToolBase)
  ├── buildP5Config(values) → CONFIG object
  ├── generateHTML(CONFIG) → HTML string with embedded P5 sketch + GLSL
  └── iframe (WebGL context)
        ├── preload()  — inject Google Fonts CSS
        ├── setup()    — createCanvas(WebGL), createGraphics×2, createShader
        └── draw()     — morph cycle, shader dispatch
```

## GLSL Shader

Fragment shader performs:
1. **Gaussian blur** (`blur()` function): 31×31 kernel clamped by `amount` parameter. Gaussian weight `exp(−(x²+y²) / (2×amount²))`. Samples both `tex0` (current font) and `tex1` (next font).
2. **Mix**: `mixed = mix(c1, c2, intensity)` — linear crossfade.
3. **Threshold**: `alpha = smoothstep(threshold − 0.1, threshold + 0.1, mixed.a)`. The threshold decreases from 0.5 to 0.3 as `intensity` increases, allowing more pixels to pass during peak blur.

Vertex shader maps UV coordinates to canvas space with Y-flip.

## Morphology Curve

```
t      = elapsed / morphTime         // linear [0,1]
power  = CONFIG.power                // int 2–10
morphT = symmetric power ease:
  t < 0.5: pow(t×2, power) / 2
  t ≥ 0.5: 1 − pow((1−t)×2, power) / 2
rawSine   = sin(morphT × π)          // bell curve peak at morphT=0.5
intensity = max(0, rawSine×1.1 − 0.1)  // remapped: zero for first/last ~10%
blurAmount = intensity × blurMax
threshold  = lerp(0.5, 0.3, intensity)
```

## Text Size Calculation (`calculateSizes`)

For each line:
1. Measure `textWidth(line)` at `baseSize = 300`.
2. Scale: `s = 300 × (canvas.width × targetWidth) / textWidth`.
3. Measure height at `s`.

After all lines: if `totalHeight > canvas.height × maxTotalHeight`, scale all sizes down by `(maxTotalHeight − gaps) / (totalHeight − gaps)`.

## Font Queue

Array of indices into shuffled `FONT_NAMES[40]`. `advanceFont()`: `shift()` + append random non-duplicate. Queue always holds 3 entries: current, next, pre-loaded.

## Draw Cycle

```
if intensity == 0:
  draw gfx1 or gfx2 directly (no shader)
else:
  shader(thresholdShader)
  setUniforms(tex0=gfx1, tex1=gfx2, blurAmount, threshold, intensity, texelSize)
  rect(-w/2, -h/2, w, h)
  resetShader()

if t >= 1:
  advanceFont()
  swap gfx1 ↔ gfx2
  redraw gfx2 with next font
  reset startTime
```

## Live Stub

```js
draw: (ctx, canvas, params) => {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

Fills black every frame. `param` is not read.
