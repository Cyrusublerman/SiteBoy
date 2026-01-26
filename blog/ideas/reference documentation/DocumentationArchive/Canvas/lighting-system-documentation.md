# Tile Mosaic 3D Lighting System

## Overview

Parametric lighting system for creating raised/embossed tile effects with full control over:
- Tile height (depth intensity)
- Light direction (0-360°)
- Edge softness (shadow/highlight falloff)

## Parameters

### 1. Tile Height (0-1)
**Default:** 0.6  
**Effect:** Controls how "tall" the tiles appear

- **0.0:** Flat (no shading)
- **0.3:** Subtle embossing
- **0.6:** Medium depth (default, matches reference images)
- **1.0:** Maximum 3D effect

**Formula:** `intensity = lighting * height`

### 2. Light Angle (0-360°)
**Default:** 315° (top-left)  
**Effect:** Direction light source comes from

- **0°:** Light from top (highlights on top edge, shadows on bottom)
- **90°:** Light from right (highlights on right, shadows on left)
- **180°:** Light from bottom (inverted - shadows on top)
- **270°:** Light from left
- **315°:** Light from top-left (classic raised effect)

**Reference Points:**
```
      0° (top)
      ↑
270° ←+→ 90°
      ↓
    180° (bottom)
```

**Conversion:** `angleRad = (lightAngle - 90) * π / 180`

### 3. Edge Softness (0.1-2.0)
**Default:** 0.5  
**Effect:** Controls width and smoothness of shadow/highlight gradients

- **0.1:** Sharp, thin edges (hard shadows)
- **0.5:** Medium softness (default)
- **1.0:** Soft, wide gradients
- **2.0:** Very soft, diffuse lighting

**Formula:** `edgeWidth = baseWidth * softness * 5`  
**Falloff:** `falloff = edgeFactor^(1.5 / softness)`

## Algorithm

### Step 1: Surface Normal Calculation

For each pixel, calculate how the tile surface tilts based on edge proximity:

```javascript
// Edge distances
distLeft, distTop, distRight, distBottom

// Edge factor (0 at center, 1 at edge)
edgeFactor = 1 - (minDist / edgeWidth)

// Normal vector components
normalX = influence from left/right edges
normalY = influence from top/bottom edges
normalZ = 1.0 (base upward component)

// Normalize
normal = [normalX, normalY, normalZ] / length
```

**Result:** Center of tile = flat surface (0,0,1), edges = tilted surface

### Step 2: Lighting Calculation

```javascript
// Light direction from angle parameter
lightX = cos(angleRad)
lightY = sin(angleRad)
lightZ = 0.5  // Slightly from above

// Dot product = surface lighting
lighting = normalX * lightX + normalY * lightY + normalZ * lightZ

// Apply height scaling
intensity = lighting * height
```

**Lighting value:**
- Positive = surface faces light (highlight)
- Negative = surface faces away (shadow)
- Zero = perpendicular (no change)

### Step 3: Brightness Adjustment

```javascript
if (intensity > 0) {
    // Highlight (brighten by up to 60%)
    factor = 1 + intensity * 0.6
} else {
    // Shadow (darken by up to 70%)
    factor = 1 + intensity * 0.7
}
```

### Step 4: Smooth Falloff

```javascript
// Power function for smooth edge-to-center transition
falloff = edgeFactor^(1.5 / softness)

// Blend factor based on distance from edge
finalFactor = 1 + (factor - 1) * falloff
```

### Step 5: Apply to RGB

```javascript
data[idx] = clamp(data[idx] * finalFactor, 0, 255)
data[idx+1] = clamp(data[idx+1] * finalFactor, 0, 255)
data[idx+2] = clamp(data[idx+2] * finalFactor, 0, 255)
```

## Examples

### Classic Raised Effect (Default)
```
Tile Height: 0.6
Light Angle: 315° (top-left)
Edge Softness: 0.5
```
**Result:** Clean embossed tiles with highlights on top-left, shadows on bottom-right

### Dramatic Depth
```
Tile Height: 1.0
Light Angle: 300°
Edge Softness: 0.3
```
**Result:** Strong 3D effect with sharp shadows

### Subtle Embossing
```
Tile Height: 0.3
Light Angle: 0°
Edge Softness: 1.0
```
**Result:** Gentle relief with soft gradients

### Inverted/Inset Look
```
Tile Height: 0.6
Light Angle: 135° (bottom-right)
Edge Softness: 0.5
```
**Result:** Tiles appear pressed in (shadows on top-left)

## Edge Width Calculation

```javascript
baseEdgeWidth = min(width, height) * 0.08  // 8% of tile size
edgeWidth = max(2, floor(baseEdgeWidth * softness * 5))
```

- Minimum 2px (prevents disappearing on small tiles)
- Scales with softness parameter
- Proportional to tile size

## Performance

- **Per-pixel operation:** O(w * h) per tile
- **Cached sprites:** Only regenerated when parameters change
- **Optimized:** Only processes edge pixels (minDist < edgeWidth)

## Mathematical Foundation

### Surface Normal from Edge Distance

A raised tile has a flat top and sloped edges. The normal vector represents surface orientation:

```
Center (flat):     n = (0, 0, 1)
Top edge (slope):  n = (0, -s, 1-s²) normalized
Left edge:         n = (-s, 0, 1-s²) normalized
```

Where `s = edgeFactor` (0 to 1)

### Lambertian Reflectance

Brightness proportional to `cos(θ)` where θ = angle between normal and light:

```
cos(θ) = n · L = nx*Lx + ny*Ly + nz*Lz
```

This gives physically-based lighting that varies smoothly across the surface.

## Integration

The shading is applied **after** pattern rendering:

```javascript
1. Render pattern (concentric/wedge/stripe/etc)
2. Get pixel data
3. For each edge pixel:
   - Calculate surface normal
   - Compute lighting
   - Adjust brightness
4. Put pixel data back
```

This preserves pattern colors while adding depth.

## Tuning Guide

**For reference image match:**
- Tile Height: 0.5-0.7
- Light Angle: 300-330° (top-left-ish)
- Edge Softness: 0.4-0.6

**For maximum drama:**
- Tile Height: 0.8-1.0
- Light Angle: Any
- Edge Softness: 0.1-0.3

**For subtle effect:**
- Tile Height: 0.2-0.4
- Light Angle: Any
- Edge Softness: 0.8-1.5






