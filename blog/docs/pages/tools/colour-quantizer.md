# Colour Quantizer

**Type:** Tool (Image Processing)  
**Category:** Image Manipulation  
**Status:** Converted (ToolBase)  
**Source:** `assets/js/tools/colour-quantizer-toolbase.js`  
**Original:** `reference/QuickToolRebuildReference/Tools/colourquantiser/dist/script.js`

---

## 1. Overview

Image color quantization tool that reduces images to limited color palettes with perceptually accurate color matching using LAB color space. Supports optional blue noise dithering for smooth gradient representation.

### Key Features
- LAB color space for perceptual accuracy
- Delta E 76 color distance calculation
- Blue noise dithering (spatial distribution)
- Image adjustments (gamma, contrast, saturation)
- Predefined palettes (1-bit through 17-color)
- Custom palette builder
- PNG export with descriptive filename

### Use Cases
- Retro/pixel art style conversion
- Limited palette optimization
- Dithered image effects
- Color reduction for compression
- Artistic palette exploration

---

## 2. User Controls

### Image Source
| Control | Type | Config | Description |
|---------|------|--------|-------------|
| Upload Image | file | accept: image/* | Load source image |

### Adjustments
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Gamma | slider | 0.1-3.0 | 1.0 | Gamma correction |
| Contrast | slider | 0-200 | 100 | Contrast percentage |
| Saturation | slider | 0-200 | 100 | Saturation percentage |
| Reset Adjustments | button | - | - | Reset to defaults |

### Palette Selection
| Control | Type | Options | Description |
|---------|------|---------|-------------|
| Palette | dropdown | 1-bit, 2-bit, 3-bit, 3-bit-gray, NES, GameBoy, Primaries, Pastel, GGost, Custom | Preset or custom |

### Custom Palette
| Control | Type | Description |
|---------|------|-------------|
| New Color | color | Color to add |
| Add Color | button | Add to custom palette |
| Clear Custom | button | Reset to black/white |
| Custom Count | label | Shows current color count |

### Processing
| Control | Type | Description |
|---------|------|-------------|
| Dithering | toggle | Enable blue noise dithering |
| Process Image | button | Apply quantization |
| Undo to Preview | button | Revert to pre-processed |

### Canvas & Export
| Control | Type | Range | Default | Description |
|---------|------|-------|---------|-------------|
| Width | slider | 14-2048 | 420 | Canvas width |
| Height | slider | 14-2048 | 420 | Canvas height |
| Export PNG | button | - | - | Download result |

---

## 3. Functional Requirements

### Core Behavior
1. **Image Loading:** Accept uploaded image, store original data
2. **Preview Generation:** Apply adjustments without quantization
3. **Quantization:** Map pixels to nearest palette color (LAB space)
4. **Dithering:** Optional blue noise spatial distribution
5. **Export:** Download quantized image as PNG

### Color Space Conversion
```javascript
// sRGB to LAB pipeline
ColorSpaceConverter.rgbToLab(r, g, b)
  → _srgbToLinear([r, g, b])
  → _linearToXyz(linear)
  → _xyzToLab(X, Y, Z)
```

### Quantization Algorithm
```javascript
function quantizeNoDither(imageData, palette, paletteLabs) {
    for (let i = 0; i < data.length; i += 4) {
        const pixelLab = ColorSpaceConverter.rgbToLab(r, g, b);
        const nearestIdx = findNearestColor(pixelLab, paletteLabs);
        // Map to nearest palette color
    }
}
```

### Blue Noise Dithering
```javascript
function quantizeWithDither(imageData, palette, paletteLabs, noiseData) {
    // Get threshold from blue noise texture
    const threshold = noiseData.data[noiseIdx] / 255.0;
    
    // Find nearest and opposite colors
    const nearestIdx = findNearestColor(pixelLab, paletteLabs);
    const oppositeIdx = findOppositeColor(nearestLab, paletteLabs);
    
    // Blend factor based on distance
    const blendFactor = distNearest / (distNearest + distOpposite);
    
    // Choose color based on threshold
    const chosenIdx = (threshold < blendFactor) ? oppositeIdx : nearestIdx;
}
```

### Image Adjustments
Applied to original image before quantization:
- **Gamma:** `pow(v, 1/gamma)`
- **Contrast:** `((v - 0.5) * factor + 0.5)`
- **Saturation:** `gray + factor * (v - gray)`

---

## 4. Technical Architecture

### Source Analysis
```javascript
// ColorSpaceConverter (static utility)
const ColorSpaceConverter = {
    cache: new Map(),  // Memoization
    WHITE_REFERENCE: { X: 0.95047, Y: 1.0, Z: 1.08883 },  // D65
    
    hexToRgb(hex) { /* ... */ },
    rgbToLab(r, g, b) { /* ... */ },
    _srgbToLinear(rgbArray) { /* ... */ },
    _linearToXyz(linear) { /* ... */ },
    _xyzToLab(X, Y, Z) { /* ... */ }
};

// Predefined palettes
const PALETTES = {
    '1-bit': ['#000000', '#FFFFFF'],
    '2-bit': ['#000000', '#555555', '#AAAAAA', '#FFFFFF'],
    'gameboy': ['#0F380F', '#306230', '#8BAC0F', '#9BBC0F'],
    // ... more palettes
};

// State management
var state = {
    originalImageData: null,
    previewImageData: null,
    currentImageData: null,
    blueNoiseTextureData: null,
    customPalette: ['#000000', '#FFFFFF'],
    originalFileName: 'image',
    isProcessing: false
};
```

### Dependencies
- ToolBase (UI framework)
- External: Blue noise texture from CDN

### Blue Noise Loading
```javascript
function loadBlueNoise() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        const tempCanvas = document.createElement('canvas');
        // ... extract ImageData
        state.blueNoiseTextureData = tempCtx.getImageData(0, 0, w, h);
    };
    img.src = 'https://assets.codepen.io/3457130/HDR_L_0.png';
}
```

---

## 5. ToolBase Configuration

### Current Implementation
```javascript
var TOOL_CONFIG = {
    title: 'COLOUR QUANTIZER',

    sidebar: [
        ['IMAGE', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile', buttonText: 'Choose...' }],
            ]],
            ['Adjustments', [
                ['slider', 'Gamma', 0.1, 3.0, 0.1, { value: 1.0, key: 'gamma', withNumber: true }],
                ['slider', 'Contrast', 0, 200, 1, { value: 100, key: 'contrast', withNumber: true }],
                ['slider', 'Saturation', 0, 200, 1, { value: 100, key: 'saturation', withNumber: true }],
                ['button', 'Reset Adjustments', null, { key: 'resetAdjust' }],
            ]],
        ]],
        ['PALETTE', [
            ['Selection', [
                ['dropdown', 'Palette', [
                    '1-bit', '2-bit', '3-bit', '3-bit-gray',
                    'nes', 'gameboy', 'primaries', 'pastel', 'ggost', 'Custom'
                ], { key: 'palette', value: 'Custom' }],
            ]],
            ['Custom Colors', [
                ['color', 'New Color', '#FF0000', { key: 'newColor' }],
                ['button', 'Add Color', null, { key: 'addColor' }],
                ['button', 'Clear Custom', null, { key: 'clearCustom' }],
                ['label', 'Custom: 2 colors', { key: 'customCount', variant: 'caption' }],
            ]],
        ]],
        ['PROCESS', [
            ['Options', [
                ['toggle', 'Dithering', ['Blue Noise'], { key: 'dithering', selectedValues: [] }],
            ]],
            ['Actions', [
                ['button', 'Process Image', null, { key: 'process' }],
                ['button', 'Undo to Preview', null, { key: 'undo' }],
            ]],
        ]],
        ['EXPORT', [
            ['Canvas', [
                ['slider', 'Width', 14, 2048, 1, { value: 420, key: 'canvasWidth', withNumber: true }],
                ['slider', 'Height', 14, 2048, 1, { value: 420, key: 'canvasHeight', withNumber: true }],
            ]],
            ['Download', [
                ['button', 'Export PNG', null, { key: 'exportPng' }],
            ]],
        ]],
    ],

    canvas: { size: 420 },

    onInit: function(values) {
        loadBlueNoise();
        // Wire buttons
    },

    onUpdate: function(key, value, allValues) {
        if (key === 'imageFile') loadImage(this, value);
        if (key === 'gamma' || key === 'contrast' || key === 'saturation') {
            updatePreview(this);
        }
    },

    onDraw: function(ctx, canvas, values) {
        // Draw current image data scaled to canvas
    }
};
```

---

## 6. Visual Design

### Layout
- Four-tab sidebar (IMAGE, PALETTE, PROCESS, EXPORT)
- Large canvas area for image display
- Image scaled to fit canvas while maintaining aspect ratio

### Color Scheme
- Dark canvas background
- Standard ToolBase styling
- Custom palette colors displayed in UI

### Feedback
- Status messages via `setStatus()`
- Processing time reported
- Export filename shown

---

## 7. Testing Checklist

### Functional Tests
- [ ] Image upload loads and displays
- [ ] Gamma slider affects preview
- [ ] Contrast slider affects preview
- [ ] Saturation slider affects preview
- [ ] Reset button restores defaults
- [ ] All preset palettes work
- [ ] Custom palette add/clear works
- [ ] Process without dithering works
- [ ] Process with dithering works
- [ ] Undo reverts to preview
- [ ] Canvas resize works
- [ ] PNG export downloads

### Color Accuracy Tests
- [ ] LAB conversion matches reference values
- [ ] Delta E 76 calculation correct
- [ ] Nearest color selection accurate
- [ ] Dithering produces smooth gradients

### Edge Cases
- [ ] Very small images handled
- [ ] Very large images don't crash
- [ ] Empty custom palette handled
- [ ] Missing blue noise texture handled

---

## 8. References

### Color Science
- **LAB Color Space:** CIE 1976 L*a*b*
- **D65 White Reference:** Standard illuminant
- **Delta E 76:** Euclidean distance in LAB
- **Blue Noise:** Spatially uniform noise distribution

### Implementation References
- Source: `assets/js/tools/colour-quantizer-toolbase.js`
- Original: `reference/QuickToolRebuildReference/Tools/colourquantiser/dist/script.js`
- Blue Noise: https://assets.codepen.io/3457130/HDR_L_0.png

### Related Tools
- [Pixel Tiler](#pixel-tiler) - Image transformation
- [Font Analysis](#font-analysis-tool) - Different canvas visualization

### Palette Sources
- **GameBoy:** Nintendo Game Boy LCD palette
- **NES:** Nintendo Entertainment System palette
- **GGost:** Custom 17-color artistic palette
