# Defecated Tool - Phase 1: Technique Extraction

## Techniques with Roles

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| Power Easing Curve | Transformer | Linear time (0-1) | Non-linear morphT | "Power curve for more time at edges" - gives morph more dwell time at start/end |
| Sine Remapping | Transformer | morphT (0-1) | intensity (0-1, clamped) | "rawSine * 1.1 - 0.1" - creates negative dip for sharp edges |
| Gaussian Blur Shader | Renderer | gfx1/gfx2 textures | Blurred composite | "blur(sampler2D tex, vec2 uv, float amount)" - spatial convolution |
| Threshold Filter | Transformer | Blurred alpha | Sharp alpha | "smoothstep(threshold - 0.1, threshold + 0.1, alpha)" - gooey effect |
| Dynamic Text Sizing | Generator | Font metrics | sizes[], heights[] | "baseSize * targetWidth / textWidth(line)" - fit text to screen |
| Font Queue Rotation | Generator | fontQueue state | Next font index | "do { n = random } while (fontQueue.includes(n))" - avoid repeats |
| WebGL Shader Renderer | Renderer | tex0, tex1, uniforms | Final pixels | "shader(thresholdShader); rect()" - composite via GPU |

## Dependency Graph

```
Font Queue → Dynamic Text Sizing → Text Rendering → gfx1, gfx2
                                                         ↓
Animation Timer → Power Easing → Sine Remapping → intensity
                                                         ↓
                                    intensity → Blur Amount, Threshold
                                                         ↓
                                    gfx1, gfx2 + uniforms → Gaussian Blur Shader
                                                         ↓
                                                    Threshold Filter
                                                         ↓
                                                    Final Display
```

## Reusable Algorithms (for extraction to library)

### 1. Power Easing Function
**Category:** Math/Easing
**Pure function:** YES
```javascript
function powerEaseInOut(t, power = 6) {
    if (t < 0.5) {
        return Math.pow(t * 2, power) / 2;
    } else {
        return 1 - Math.pow((1 - t) * 2, power) / 2;
    }
}
```
**Use case:** Any animation needing slow-start, slow-end easing

### 2. Sine Wave Remapper
**Category:** Math/Mapping
**Pure function:** YES
```javascript
function sineRemap(t, scale = 1.1, offset = -0.1, clampNegative = true) {
    const raw = Math.sin(t * Math.PI);
    const remapped = raw * scale + offset;
    return clampNegative ? Math.max(0, remapped) : remapped;
}
```
**Use case:** Create dips/peaks in 0-1 curves

### 3. Gaussian Blur Kernel (GLSL)
**Category:** Graphics/Filters
**Pure function:** YES (shader)
```glsl
vec4 blur(sampler2D tex, vec2 uv, float amount) {
    vec4 sum = vec4(0.0);
    float total = 0.0;
    for(int x = -15; x <= 15; x++) {
        for(int y = -15; y <= 15; y++) {
            if(abs(float(x)) > amount || abs(float(y)) > amount) continue;
            float weight = exp(-(float(x*x + y*y)) / (2.0 * amount * amount + 0.001));
            sum += texture2D(tex, uv + vec2(float(x), float(y)) * texelSize) * weight;
            total += weight;
        }
    }
    return sum / total;
}
```
**Use case:** Any p5.js tool needing blur effects

### 4. Dynamic Text Fitting
**Category:** Layout/Typography
**Pure function:** NO (uses p5.js context)
```javascript
function fitTextToWidth(lines, targetWidth, maxHeight, gap, graphics) {
    const baseSize = 300;
    let sizes = [];
    let heights = [];
    
    graphics.textStyle(BOLD);
    
    for (const line of lines) {
        graphics.textSize(baseSize);
        const w = graphics.textWidth(line);
        const s = baseSize * targetWidth / w;
        sizes.push(s);
        
        graphics.textSize(s);
        heights.push(graphics.textAscent() + graphics.textDescent());
    }
    
    // Scale down if total exceeds max
    const totalGap = gap * (lines.length - 1);
    const total = heights.reduce((a, b) => a + b) + totalGap;
    
    if (total > maxHeight) {
        const scale = (maxHeight - totalGap) / (total - totalGap);
        sizes = sizes.map(s => s * scale);
        heights = heights.map(h => h * scale);
    }
    
    return { sizes, heights };
}
```
**Use case:** Any text-based generative art needing responsive sizing

## GATE 1: Technique Integration Verification

❓ **For EACH technique, can you name what data structure it reads/writes?**
- ✓ YES — All connect to DefecatedState core structure

❓ **Can you trace a path from Generator to Renderer through transformers?**
- ✓ YES — Font Queue → Text Sizing → Text Render → Shader Render → Display

❓ **If idea doc says "X determined by Y", is Y before X in dependency graph?**
- ✓ YES — intensity determines blur/threshold, and intensity comes from animation timer

**Passing score: 100% YES ✓**


