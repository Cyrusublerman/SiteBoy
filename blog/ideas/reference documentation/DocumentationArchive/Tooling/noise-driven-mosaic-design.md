# Noise-Driven Adaptive Tile Mosaic System

## Overview

Transform from static grid → **Dynamic noise-driven adaptive subdivision** where ALL parameters flow from time-modulated noise layers.

## Core Concept

```
Multi-dimensional Perlin Noise Field (5D)
    ↓
Sample at (x, y, frequency₁, frequency₂, time)
    ↓
Different noise dimensions control different aspects:
    - Dimension 1 (low freq) → Tile size/subdivision depth
    - Dimension 2 (mid freq) → Pattern type selection
    - Dimension 3 (mid freq) → Height/depth parameters
    - Dimension 4 (high freq) → Color palette index
    - Dimension 5 (very high freq) → Texture modulation
    ↓
Adaptive Quadtree Subdivision samples noise
    ↓
Bin Packing fills remaining gaps
    ↓
Animated by modulating noise time parameter
```

## Architecture

### Phase 1: Noise Field Generation
**Multi-layered Perlin noise** with different frequencies:

```javascript
noiseField = {
    size: fbm(x, y, time * 0.1, octaves=3, lacunarity=2),      // Low freq
    pattern: fbm(x, y, time * 0.05, octaves=4, lacunarity=2.5), // Mid freq
    height: fbm(x, y, time * 0.08, octaves=3, lacunarity=2),    // Mid freq
    palette: fbm(x, y, time * 0.03, octaves=2, lacunarity=3),   // Slow drift
    texture: fbm(x, y, time * 0.2, octaves=5, lacunarity=2.2)   // High freq
}
```

### Phase 2: Adaptive Quadtree Subdivision

**Algorithm:**
```
1. Start with canvas as root node
2. Sample noise at center of region
3. Determine subdivision depth from noise value:
   depth = floor(map(noise.size, -1, 1, 0, maxDepth))
4. If depth > 0: subdivide into 4 quadrants
5. Recursively apply to children
6. Stop when:
   - Reached target depth
   - Cell below minimum size
   - Subdivision budget exhausted
```

**Key insight:** Noise variance determines subdivision - high variance areas get more detail.

**Pseudocode:**
```javascript
function subdivideAdaptive(region, depth, noiseField, time) {
    // Sample noise at region center
    cx = region.x + region.w / 2
    cy = region.y + region.h / 2
    
    sizeNoise = fbm(cx * 0.01, cy * 0.01, time * 0.1, 3, 2, 0.5)
    
    // Map noise to subdivision decision
    shouldSubdivide = sizeNoise > threshold
    tooSmall = region.w < minSize || region.h < minSize
    tooDeep = depth >= maxDepth
    
    if (!shouldSubdivide || tooSmall || tooDeep) {
        // Create tile from region
        return makeTile(region, noiseField, time)
    }
    
    // Subdivide into quadrants
    w2 = region.w / 2
    h2 = region.h / 2
    
    return [
        subdivideAdaptive({x: region.x,      y: region.y,      w: w2, h: h2}, depth+1, ...),
        subdivideAdaptive({x: region.x + w2, y: region.y,      w: w2, h: h2}, depth+1, ...),
        subdivideAdaptive({x: region.x,      y: region.y + h2, w: w2, h: h2}, depth+1, ...),
        subdivideAdaptive({x: region.x + w2, y: region.y + h2, w: w2, h: h2}, depth+1, ...)
    ].flat()
}
```

### Phase 3: Noise-Driven Tile Parameters

When creating a tile from a region:

```javascript
function makeTile(region, noiseField, time) {
    // Sample average noise across region
    cx = region.x + region.w / 2
    cy = region.y + region.h / 2
    
    // Different noise dimensions for different parameters
    sizeNoise = fbm(cx * 0.01, cy * 0.01, time * 0.1, 3, 2, 0.5)
    patternNoise = fbm(cx * 0.02, cy * 0.02, time * 0.05, 4, 2.5, 0.5)
    heightNoise = fbm(cx * 0.015, cy * 0.015, time * 0.08, 3, 2, 0.5)
    paletteNoise = fbm(cx * 0.005, cy * 0.005, time * 0.03, 2, 3, 0.5)
    textureNoise = fbm(cx * 0.05, cy * 0.05, time * 0.2, 5, 2.2, 0.5)
    
    return {
        bounds: region,
        grammar: selectGrammar(patternNoise),      // Map [-1,1] to grammar index
        height: map(heightNoise, -1, 1, 0, 1),     // Tile depth
        paletteIndex: floor(map(paletteNoise, -1, 1, 0, 4)),
        textureAmount: map(textureNoise, -1, 1, 0, 0.5),
        seed: hashRegion(region)  // Deterministic from position
    }
}
```

### Phase 4: Gap Filling with Bin Packing

After quadtree subdivision, gaps exist. Use **MaxRects bin packing**:

```javascript
function fillGaps(tiles, canvas) {
    // Build occupancy map
    occupied = buildOccupancyMap(tiles, canvas)
    
    // Find all free rectangles
    freeRects = findFreeRectangles(occupied, canvas)
    
    // Pack remaining spaces using MaxRects
    while (freeRects.length > 0) {
        rect = freeRects[0]
        
        // Sample noise for this gap
        tile = makeTile(rect, noiseField, time)
        tiles.push(tile)
        
        // Update free rectangles
        splitAndMerge(freeRects, rect)
    }
    
    return tiles
}
```

**MaxRects splits:**
1. Place tile in free rectangle
2. Split remaining space into new free rectangles
3. Remove overlapping free rectangles
4. Merge adjacent free rectangles

### Phase 5: Animation Loop

```javascript
function animate(time) {
    // Regenerate tile structure from noise
    tiles = subdivideAdaptive(canvas, 0, noiseField, time)
    tiles = fillGaps(tiles, canvas)
    
    // Render all tiles
    for (tile of tiles) {
        sprite = renderTileWithParameters(tile)
        drawSprite(sprite, tile.bounds)
    }
    
    time += dt
    requestAnimationFrame(animate)
}
```

## Parameters

### Subdivision Control
- **Max Depth** (1-6): Maximum quadtree depth
- **Min Tile Size** (8-64px): Stop subdividing below this
- **Subdivision Threshold** (-1 to 1): Noise value required to subdivide
- **Noise Scale** (0.001-0.1): Frequency of size noise

### Noise Modulation
- **Time Scale** (0-1): Speed of animation
- **Size Octaves** (1-6): Detail in size variation
- **Pattern Octaves** (1-6): Detail in pattern changes
- **Height Octaves** (1-6): Detail in depth variation

### Noise Frequency Offsets
- **Size Freq** (0.005-0.05): Base frequency for size noise
- **Pattern Freq** (0.01-0.1): Base frequency for pattern noise
- **Height Freq** (0.005-0.05): Base frequency for height noise
- **Palette Freq** (0.001-0.01): Base frequency for color drift

## Benefits

### 1. **Smooth Animation**
- Continuous noise evolution = smooth parameter transitions
- No discrete jumps in tile structure
- Organic flow of patterns

### 2. **Deterministic**
- Same noise seed + time = same output
- Reproducible animations
- Scrubba

ble timeline

### 3. **Adaptive Detail**
- More subdivisions in "interesting" noise regions
- Efficient use of tiles
- Natural clustering

### 4. **Canvas Fitting**
- Quadtree naturally fits canvas bounds
- Bin packing fills remaining gaps
- 100% coverage guaranteed

## Implementation Notes

### Noise Sampling Strategy
**Don't sample per-pixel** - too expensive!
Sample at region centers:
```javascript
// Sample 9 points in region (corners + center + midpoints)
samples = [
    fbm(x, y),
    fbm(x+w, y),
    fbm(x, y+h),
    fbm(x+w, y+h),
    fbm(x+w/2, y),
    fbm(x+w, y+h/2),
    fbm(x, y+h/2),
    fbm(x+w/2, y+h),
    fbm(x+w/2, y+h/2)
]
avgNoise = mean(samples)
variance = stddev(samples)
```

### Optimization: Cached Sprites
- Generate sprite once per tile configuration
- Cache with key: `${grammar}_${height}_${palette}_${seed}`
- Reuse when parameters unchanged
- Only regenerate on noise-driven changes

### Performance Target
- 60fps for moderate tile counts (< 500 tiles)
- Pre-compute subdivision tree
- Only update changing tiles

## Comparison to Old System

| Aspect | Old (Static Grid) | New (Noise-Driven) |
|--------|------------------|-------------------|
| Structure | Fixed C×R grid | Adaptive quadtree |
| Sizes | Manual tile size | Noise-determined |
| Layout | L0/L1/L2 presets | Continuous subdivision |
| Animation | Tile breathing only | Full structure morphing |
| Canvas Fit | Sometimes gaps | Always 100% filled |
| Parameters | Manual sliders | Noise field sampling |
| Complexity | Simple | Sophisticated |

## References

**From provided docs:**
- @06_Polygon_Grid_Domain_Subdivision/Quadtree.md - Adaptive subdivision
- @06_Polygon_Grid_Domain_Subdivision/Bin_packing.md - MaxRects gap filling
- @06_Polygon_Grid_Domain_Subdivision/Binary_space_partitioning.md - BSP alternative
- @blog/ideas/reference documentation/17_Noise_Functions/Perlin_noise.md - fBm formula

**Key algorithms:**
- Quadtree (region subdivision)
- MaxRects bin packing (gap filling)
- Fractal Brownian Motion (multi-scale noise)
- Z-order curve (spatial hashing for cache keys)






