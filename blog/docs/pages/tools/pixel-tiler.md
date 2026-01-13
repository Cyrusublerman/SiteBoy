# Pixel Tiler

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Tools/pixel-tiler/dist/script.js`
**Related docs found:** None

### Purpose
Create 2x2 pixel tile combinations from 4 source images. Maps corresponding pixels from 4 images into a 2x2 grid pattern, doubling output resolution.

### Output Type
- [x] Static image
- [x] Animation (looping)
- [ ] Interactive visualization
- [ ] Data/calculation result
- [ ] Audio
- [x] Downloadable file (PNG, GIF)

### Current Implementation
1. User loads 4 images (A, B, C, D)
2. Images normalized to smallest common dimension
3. For each pixel position: A→TL, B→TR, C→BL, D→BR
4. Modes: single (ABCD), permutations (24), all combinations (256)
5. Animation cycles through frames
6. GIF export via gif.js library

---

## 2. Tool Classification

**Is this a tool?** Yes

**Input:** 4 source images (file upload)
**Processing:** Pixel-level 2x2 tiling with combination generation
**Output:** Tiled image(s), animation, GIF

**Frame-based?** Yes (24 or 256 frames)
**Looping?** Yes
**Duration:** Variable (FPS-controlled)

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| images | object | A/B/C/D | Source image storage |
| modeSelect | string | single/permutations/all | Combination mode |
| animationSpeed | number | 1000/fps | ms per frame |
| animationFpsSelect | number | 1-60 | Animation FPS |
| gifQuality | number | 1-20 | GIF quality |
| gifLoop | boolean | true/false | GIF looping |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Image A | file | accept: image/* |
| Image B | file | accept: image/* |
| Image C | file | accept: image/* |
| Image D | file | accept: image/* |
| Mode | dropdown | single/permutations/all |
| FPS | slider | 1-60, step 1, default 24 |
| GIF Quality | slider | 1-20, step 1, default 10 |
| GIF Loop | toggle | Enabled/Disabled |

### Missing Controls (not in source, should add)
- [x] Play/Pause (exists)
- [x] Frame export (exists as download current)
- [x] GIF export (exists)
- [ ] Canvas width/height - Fixed by input images
- [ ] Frame count - Determined by mode
- [ ] Loop toggle - Exists for GIF only
- [ ] Playback speed - Exists as FPS

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Stepper for frame navigation
- Progress indicator during GIF generation
- Preset image patterns

### Source features requiring new components:
- GIF generation requires gif.js external library
- File input with thumbnail preview (complex UI)

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| imageA | file | - | - | - | - | Required |
| imageB | file | - | - | - | - | Required |
| imageC | file | - | - | - | - | Required |
| imageD | file | - | - | - | - | Required |
| mode | dropdown | single | - | - | - | single/permutations/all |
| fps | number | 24 | 1 | 60 | 1 | Animation FPS |
| gifQuality | number | 10 | 1 | 20 | 1 | Lower = better |
| gifLoop | boolean | true | - | - | - | Loop GIF |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Tiled Image | canvas | 2x source | Auto on process |
| Animation | canvas | frame sequence | Play button |
| GIF | blob | image/gif | Export button |
| PNG Frame | download | image/png | Download button |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'PIXEL TILER',
    
    sidebar: [
        ['IMAGES', [
            ['Source Files', [
                ['file', 'Image A', { key: 'imageA', accept: 'image/*' }],
                ['file', 'Image B', { key: 'imageB', accept: 'image/*' }],
                ['file', 'Image C', { key: 'imageC', accept: 'image/*' }],
                ['file', 'Image D', { key: 'imageD', accept: 'image/*' }],
            ]],
        ]],
        ['CONTROLS', [
            ['Processing', [
                ['dropdown', 'Mode', ['Single ABCD', '24 Permutations', '256 Combinations'], { key: 'mode' }],
                ['button', 'Process', { key: 'process' }],
            ]],
            ['Animation', [
                ['slider', 'FPS', 1, 60, 1, { value: 24, key: 'fps' }],
                ['button', 'Play/Pause', { key: 'playPause' }],
                ['stepper', 'Frame', { key: 'frame' }],
            ]],
        ]],
        ['EXPORT', [
            ['Download', [
                ['slider', 'GIF Quality', 1, 20, 1, { value: 10, key: 'gifQuality' }],
                ['toggle', 'GIF Loop', ['Enabled'], { key: 'gifLoop', selectedValues: ['Enabled'] }],
                ['button', 'Export GIF', { key: 'exportGif' }],
                ['button', 'Export PNG', { key: 'exportPng' }],
                ['button', 'Export All PNGs', { key: 'exportAll' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.images = {};
        this.processedImages = {};
        this.allCombinations = [];
        this.currentFrame = 0;
        this.animator = null;
    },
    
    onUpdate: function(key, value, allValues) {
        if (['imageA','imageB','imageC','imageD'].includes(key)) {
            this.loadImage(key.replace('image',''), value);
        }
    },
    
    onDraw: function(ctx, canvas, values) {
        // Draw current frame from combination
    },
};
```

---

## 7. Implementation Notes

- **GIF Generation:** Requires gif.js web worker. Must handle worker script path.
- **Performance:** 256 combinations generates large data. Consider lazy generation.
- **Memory:** Large images (>2000px) may cause memory issues in GIF mode.
- **Browser Compatibility:** File API required. gif.js uses Web Workers.

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| generatePermutations | 12 | math | polygon-calculator | Medium |
| generateAllCombinations | 12 | math | - | Low |
| prepareImages (normalize size) | 15 | image | colour-quantizer | High |
| createTiledImage | 40 | image | - | Medium |
| GIF generation wrapper | 50 | export | - | High |

**Shared Utility Candidates:**
- `ImageNormalizer.normalizeToSmallest(images)` - Resize multiple images to common dimensions
- `GifExporter.create(frames, options)` - Wrapper for gif.js with progress callback
