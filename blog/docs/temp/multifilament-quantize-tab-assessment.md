# Multifilament Print Tool - QUANTIZE Tab Assessment

**Date:** 2026-01-29

## Current State

### Sidebar Structure (Line 699-733)

```javascript
_getQuantizeSidebar() {
    return [['CONTROLS', [
        ['PALETTE', [
            ['label', paletteStatusText],
            ['palettePreview', { colours: paletteColours }],
        ]],
        ['IMAGE', [
            ['file', 'Source Image'],
            ['number', 'Print Width (mm)', 170],
        ]],
        ['RESOLUTION', [
            ['number', 'Max Detail (mm)', 0.4],
            ['button', 'Downscale to Detail'],
        ]],
        ['DITHER', [
            ['dropdown', 'Algorithm', ['None', 'Floyd-Steinberg', 'Bayer 4×4', 'Blue Noise']],
            ['number', 'Min Detail (mm)', 0.8],
        ]],
        ['ACTIONS', [
            ['button', 'Quantize Image'],
        ]],
    ]]];
}
```

## Issues Identified

### 1. ❌ Missing Professional Image Adjustments

**Problem:** Users upload raw images with:
- Wrong brightness/contrast
- Color casts
- Need for cropping/rotation
- Exposure issues

**Current:** Only has basic file upload + print width

**Should have:** AdjustmentBundle component like in `colour-quantizer-toolbase.js`:

```javascript
['Image Adjustments', [
    ['adjustment-bundle', 'professional', null, {
        key: 'imageAdjust',
        onChange: (adjustedImageData) => {
            // Update canvas preview
            this.sourceImageData = adjustedImageData;
            this.toolBase.draw();
        }
    }],
]],
```

**ProfessionalBundle provides:**
- Brightness/Contrast
- Exposure
- Gamma
- Saturation
- Hue Rotation
- Levels (black/white points)
- Curves editor
- Resize/Crop
- Rotate/Flip
- Reset/Apply controls

### 2. ❌ Only 4 Dither Algorithms (Missing 10+ Options)

**Current algorithms:** None, Floyd-Steinberg, Bayer 4×4, Blue Noise

**Available in codebase but not exposed:**
- Atkinson
- Jarvis-Judice-Ninke
- Stucki
- Burkes
- Sierra-3
- Sierra-2
- Sierra-Lite
- False Floyd-Steinberg
- Simple 2D

**Reference:** See `colour-quantizer-toolbase.js` lines 309-330 for full list

### 3. ⚠️ Confusing "Min Detail (mm)" Label

**Current name:** "Min Detail (mm)" in DITHER block

**What it actually does:** Spatial filter that removes isolated pixels smaller than this size

**From algorithm (quantization.js:78-157):**
```javascript
/**
 * Apply spatial filter to remove small isolated regions
 * 
 * Filters out pixels that don't have enough similar-colored neighbors within
 * a given radius. This prevents unprintable small details in 3D prints.
 */
export function applyMinDetailFilter(imageData, palette, minDetailMM, printWidth)
```

**Better labels:**
- "Detail Filter (mm)" or
- "Min Feature Size (mm)" or
- "Spatial Filter (mm)"

**With caption:** "Removes isolated pixels smaller than this size (prevents unprintable details)"

### 4. ⚠️ "Max Detail" vs "Min Detail" Confusion

**Current:**
- RESOLUTION block: "Max Detail (mm)" = 0.4mm (downscaling)
- DITHER block: "Min Detail (mm)" = 0.8mm (filtering)

**Naming issue:** "Max Detail" sounds like it should be larger than "Min Detail", but it's inverted:
- Max Detail = smallest detail you WANT (0.4mm)
- Min Detail = smallest detail you ALLOW (0.8mm = larger!)

**Suggested rename:**
- "Max Detail (mm)" → "Target Resolution (mm)" or "Pixel Size (mm)"
- "Min Detail (mm)" → "Filter Threshold (mm)" or "Min Feature Size (mm)"

## Recommended Changes

### Priority 1: Add Image Adjustments (High Impact)

**Add before IMAGE block:**

```javascript
['IMAGE ADJUSTMENTS', [
    ['adjustment-bundle', 'professional', null, {
        key: 'imageAdjust',
        onChange: (adjustedImageData) => {
            this.sourceImageData = adjustedImageData;
            this.toolBase.draw();
        }
    }],
]],
```

**Wire in _onInit (QUANTIZE case):**
```javascript
case 'QUANTIZE':
    this._wireFileInput('sourceImage', (file) => this._loadSourceImage(file));
    
    // Wire adjustment bundle
    const adjustBundle = this.toolBase.components.get('imageAdjust');
    if (adjustBundle) {
        adjustBundle.onTransform = (transformedImageData) => {
            this.sourceImageData = transformedImageData;
            this.toolBase.draw();
        };
    }
    
    this._wireButton('downscale', () => this._downscaleAction());
    this._wireButton('quantize', () => this._quantizeAction());
    // ... rest
```

### Priority 2: Expand Dither Algorithm List

**Replace dropdown line 726:**

```javascript
['dropdown', 'Algorithm', [
    'None',
    '─── NOISE ───',
    'Blue Noise',
    '─── ERROR DIFFUSION ───',
    'Floyd-Steinberg',
    'Atkinson',
    'Jarvis-Judice-Ninke',
    'Stucki',
    'Burkes',
    'Sierra-3',
    'Sierra-2',
    'Sierra-Lite',
    'False Floyd-Steinberg',
    'Simple 2D',
    '─── ORDERED ───',
    'Bayer 4×4',
    'Bayer 8×8',
], { key: 'ditherAlgorithm', value: 'Floyd-Steinberg' }],
```

**Update _quantizeAction() to handle new algorithms:**
```javascript
// Import additional dithers
import { 
    atkinson, 
    jarvisJudiceNinke, 
    stucki, 
    burkes, 
    sierra3, 
    sierra2, 
    sierraLite,
    falseFloydSteinberg,
    simple2D,
    bayer8x8
} from '../../shared/algorithms/dither/...';

// Add cases in switch statement
```

### Priority 3: Clarify Min/Max Detail Naming

**Update sidebar:**

```javascript
['RESOLUTION', [
    ['number', 'Target Resolution (mm)', 0.4, { key: 'maxDetail', min: 0.1, max: 2, step: 0.1 }],
    ['label', 'Downscale image to this pixel size', { variant: 'caption' }],
    ['button', 'Apply Downscale', null, { key: 'downscale' }],
    ['label', '', { key: 'resolutionStatus', variant: 'caption' }],
]],
['POST-PROCESS', [  // Renamed from DITHER
    ['dropdown', 'Dither Algorithm', [/* ... */]],
    ['number', 'Min Feature Size (mm)', 0.8, { key: 'minDetail', min: 0, max: 2, step: 0.1 }],
    ['label', 'Remove isolated details smaller than this', { variant: 'caption' }],
]],
```

## Implementation Checklist

- [ ] Import dither algorithms not currently imported
- [ ] Add AdjustmentBundle to QUANTIZE sidebar
- [ ] Wire AdjustmentBundle onChange/onTransform
- [ ] Expand dither algorithm dropdown to 15+ options
- [ ] Add switch cases for new algorithms in _quantizeAction()
- [ ] Rename "Max Detail" → "Target Resolution"
- [ ] Rename "Min Detail" → "Min Feature Size"
- [ ] Rename "DITHER" block → "POST-PROCESS"
- [ ] Add explanatory caption labels
- [ ] Test all dither algorithms render correctly
- [ ] Test adjustment bundle integrates with quantization workflow

## File Modifications Required

1. `assets/js/tools/fabrication/multifilament-print-tool.js`
   - _getQuantizeSidebar() (lines 699-733)
   - _onInit() QUANTIZE case (lines 832-839)
   - _quantizeAction() (lines 2280-2370)
   - Import statements (top of file)

## Reference Implementation

See `assets/js/tools/processors/colour-quantizer-toolbase.js` lines 250-340 for proven pattern.

## Benefits

1. **Better image quality:** Users can fix exposure/color before quantization
2. **More dither options:** Artists can choose aesthetic that fits their art
3. **Clearer UI:** Less confusion about what controls do
4. **Consistent with other tools:** Uses same AdjustmentBundle as color quantizer
5. **No architectural changes:** Only adds features via existing components

## Impact: MEDIUM

- User-facing improvement
- No breaking changes
- Uses existing components
- ~50 lines of changes total

