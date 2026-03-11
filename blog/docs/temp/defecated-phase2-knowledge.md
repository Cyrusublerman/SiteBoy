# Defecated Tool - Phase 2: Knowledge Sourcing & Architecture Check

## Reference Match Analysis

| Technique | Design Needs | Library Has | Match? | Action |
|-----------|-------------|-------------|--------|--------|
| Power Easing | `powerEaseInOut(t, power)` | Easing.easeInQuad/Cubic/Quart | ❌ Partial | **ADD** to animation-utils.js |
| Sine Remapping | `sineRemap(t, scale, offset)` | MathUtils.remap exists | ❌ No | **ADD** to animation-utils.js |
| Gaussian Blur | GLSL shader function | N/A (p5.js context) | ✓ Keep in tool | N/A |
| Smoothstep Threshold | GLSL shader function | MathUtils.smoothstep exists | ✓ YES | Could extract logic if needed |
| Dynamic Text Fit | p5.js textWidth-based | N/A (p5.js context) | ✓ Keep in tool | N/A |
| Font Queue | Shuffle + rotation logic | N/A (tool-specific) | ✓ Keep in tool | N/A |

## Architecture Match Report

### 1. Power Easing Function
**Design needs:** Easing function with configurable power parameter  
**Reference provides:** Quad (power=2), Cubic (power=3), Quart (power=4)  
**Match?** ❌ NO - Need parametric version  
**Gap Action:** Add `powerEase()` to `animation-utils.js` as general-purpose function

```javascript
/**
 * Power easing with configurable exponent
 * Creates ease-in-out curve with adjustable "sharpness"
 * 
 * @source reference/defecated.html:227-234
 * @formula For t < 0.5: (2t)^p / 2, For t >= 0.5: 1 - (2(1-t))^p / 2
 * 
 * @param {number} t - Time (0-1)
 * @param {number} power - Exponent (higher = more time at edges)
 * @returns {number} Eased value (0-1)
 */
export function powerEase(t, power = 6) {
    if (t < 0.5) {
        return Math.pow(t * 2, power) / 2;
    } else {
        return 1 - Math.pow((1 - t) * 2, power) / 2;
    }
}
```

### 2. Sine Remapping
**Design needs:** Sine wave with scale/offset and clamping  
**Reference provides:** `MathUtils.remap()` for linear remapping  
**Match?** ❌ NO - Need sine-based version  
**Gap Action:** Add `sineRemap()` to `animation-utils.js`

```javascript
/**
 * Remap time through sine wave with scale/offset
 * Creates smooth bulge/dip in 0-1 curve
 * 
 * @source reference/defecated.html:236-239
 * @formula y = max(0, sin(t·π) · scale + offset)
 * 
 * @param {number} t - Time (0-1)
 * @param {number} scale - Scale factor (1.1 = slight over-swing)
 * @param {number} offset - Offset (-0.1 creates dip for sharp edges)
 * @param {boolean} clampNegative - Clamp negative values to 0
 * @returns {number} Remapped value
 */
export function sineRemap(t, scale = 1.1, offset = -0.1, clampNegative = true) {
    const raw = Math.sin(t * Math.PI);
    const remapped = raw * scale + offset;
    return clampNegative ? Math.max(0, remapped) : remapped;
}
```

### 3. Gaussian Blur Shader
**Design needs:** GLSL shader for p5.js WebGL  
**Reference provides:** N/A (shaders are context-specific)  
**Match?** ✓ YES - Keep in tool (not extractable to pure JS)  
**Note:** Shader code is tied to p5.js WEBGL mode, not reusable in general algorithms library

### 4. Dynamic Text Fitting
**Design needs:** Fit multi-line text to target width/height  
**Reference provides:** N/A (requires p5.js graphics context)  
**Match?** ✓ YES - Keep in tool (p5.js-specific)  
**Note:** Uses `textWidth()`, `textAscent()`, etc. which are p5.js APIs

## GATE 2: Reference Adequacy

❓ **For techniques marked NO in "Match?" column, have you identified the gap?**
- ✓ YES — Need to add `powerEase()` and `sineRemap()` to animation-utils.js

❓ **For matched references, do they contain the formula/algorithm you need?**
- ✓ YES — MathUtils.smoothstep can be referenced for threshold logic
- ✓ YES — Shader and text fitting are tool-specific, correctly identified

**Passing score: 100% YES ✓**

## Extraction Plan

### New functions for `assets/js/shared/algorithms/animation/animation-utils.js`:

1. **powerEase(t, power)** - Parametric power easing
2. **sineRemap(t, scale, offset, clampNegative)** - Sine-based curve remapping

### Keep in tool (not extractable):
- Gaussian blur shader (GLSL, p5.js-specific)
- Threshold shader (GLSL, p5.js-specific)
- Dynamic text fitting (p5.js graphics API-specific)
- Font queue rotation (tool state management)

## Website Integration Points

### 1. Algorithms Library Enhancement
**File:** `assets/js/shared/algorithms/animation/animation-utils.js`  
**Add:** Two new easing/mapping functions  
**Benefit:** Other tools can use these for animation timing

### 2. Tool Structure
**File:** `assets/js/tools/generators/defecated-tool.js`  
**Pattern:** ToolBase with iframe-embedded p5.js sketch  
**Benefit:** Clean separation, no p5.js pollution of main page

### 3. Art Section Integration
**File:** `assets/js/sections/art_section.js`  
**Add:** Gallery entry with link to tool  
**Benefit:** Discoverable from art gallery

### 4. Tools Section Integration  
**File:** `assets/js/sections/tools_section.js`  
**Add:** Full interactive tool listing  
**Benefit:** Accessible for experimentation

### 5. Navigation Symbiosis
**Pattern:** Art gallery thumbnail → Tools full experience  
**Flow:** Browse (#art/generative) → Click → Interact (#tools/defecated)  
**Benefit:** Art and tools complement each other


