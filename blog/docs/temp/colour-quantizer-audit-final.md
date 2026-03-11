# Colour Quantizer — Final Audit Summary

**Status**: Complete audit finished  
**Date**: 2026-01-21

---

## Executive Summary

### Current State
- **Functional**: ✅ Tool works correctly
- **Architectural**: ❌ **27 violations** of site standards
- **Maintainable**: ❌ Cannot reuse components/algorithms

### Audit Results

**Already in algorithms library** ✅:
- Color space conversions (LAB, RGB, hex)
- Palette extraction (3 algorithms)
- All dithering algorithms (11 types)
- Image adjustments (gamma, contrast, saturation)
- Nearest color matching (LAB space)

**Missing from algorithms library** ⚠️:
- Complete quantization orchestrator (exists but incomplete)
- Blue noise texture loading utility

**Missing from components library** ❌:
- ImageViewport (canvas with proper zoom/pan)
- PalettePreview (color swatch display)

**Code violations in tool file** ❌:
- 11× `document.createElement()`
- 2× `.innerHTML`
- 1× inline ColorSpaceConverter (98 lines)
- 1× inline applyImageAdjustments (42 lines)
- 1× inline quantization logic (78 lines)
- Canvas zoom/pan/display mode logic (165 lines)
- Palette preview HTML generation

---

## Detailed Findings

### ✅ ALGORITHMS LIBRARY — What Exists

#### 1. `algorithms/color/color-space.js` — COMPLETE ✓
```javascript
export {
    hexToRgb,      // Hex → RGB
    rgbToLab,      // RGB → LAB
    labToRgb,      // LAB → RGB
    deltaE76,      // Perceptual distance
    // + vector math helpers
}
```
**Status**: Fully functional, cached, battle-tested

#### 2. `algorithms/color/palette-extraction.js` — COMPLETE ✓
```javascript
export {
    extractMedianCut,    // Median cut quantization
    extractKMeans,       // K-means clustering
    extractHistogram,    // Histogram popularity
}
```
**Status**: Fully functional, matches tool needs exactly

#### 3. `algorithms/dither/` — COMPLETE ✓
- `error-diffusion.js`: Floyd-Steinberg, Atkinson, JJN, Stucki, Burkes, Sierra (6 variants)
- `ordered.js`: Bayer, Blue Noise, Cluster Dot
- `nearest-color.js`: LAB-space nearest color (no dither)

**Status**: Fully functional, all 11 algorithms present

#### 4. `algorithms/image/image-adjustments.js` — COMPLETE ✓
```javascript
export {
    applyGamma,           // Individual adjustments
    applyContrast,
    applySaturation,
    applyAllAdjustments,  // Combined (efficient)
}
```
**Status**: Fully functional, ITU-R BT.709 standard

#### 5. `algorithms/color/quantization.js` — INCOMPLETE ⚠️
```javascript
export {
    quantizeImage,          // Basic Floyd-Steinberg only
    applyMinDetailFilter,   // 3D print specific
    expandToLayers,         // 3D print specific
}
```
**Status**: Basic quantization present but...
- ⚠️ Only supports Floyd-Steinberg dithering
- ⚠️ Doesn't support other dithering algorithms
- ⚠️ Doesn't support image adjustments
- ⚠️ Doesn't use LAB color space
- ⚠️ Uses RGB distance (not perceptual)

**Conclusion**: This file is for 3D printing tool, NOT color quantizer. We need different approach.

---

### ❌ MISSING FROM ALGORITHMS — What to Create

#### 1. Complete Quantization Orchestrator

**Current situation**:
- Tool has inline `quantizeNoDither()` (L212-228)
- Tool has inline `quantizeWithDither()` (L230-286)
- These orchestrate: adjustments → LAB conversion → dithering

**Decision**: DON'T create in algorithms library

**Reason**: This is orchestration logic, not pure algorithm. It belongs in tool file but should CALL algorithms, not duplicate them.

**Action**: Refactor tool to call algorithms directly:
```javascript
// Tool file (orchestration - OK here)
function processImage(imageData, settings) {
    // 1. Apply adjustments (from algorithm library)
    let adjusted = ImageAdjustments.applyAllAdjustments(imageData, {
        gamma: settings.gamma,
        contrast: settings.contrast,
        saturation: settings.saturation
    });
    
    // 2. Convert palette to LAB (from algorithm library)
    const paletteLabs = settings.palette.map(hex => {
        const rgb = ColorSpace.hexToRgb(hex);
        return ColorSpace.rgbToLab(rgb.r, rgb.g, rgb.b);
    });
    
    // 3. Apply dithering (from algorithm library)
    if (settings.ditherAlgo === 'none') {
        return Dither.nearestColorQuantize(adjusted, settings.palette, paletteLabs, ColorSpace);
    } else {
        return Dither[settings.ditherAlgo](adjusted, settings.palette, paletteLabs, settings.ditherStrength);
    }
}
```

#### 2. Blue Noise Texture Loading

**Current**: L387-396 loads blue noise image into ImageData

**Action**: Move to `algorithms/dither/blue-noise-bracketing.js` or create utility

---

### ❌ MISSING FROM COMPONENTS — What to Create

#### 1. ImageViewport Component ← **CRITICAL**

**Purpose**: Display ImageData with zoom/pan/display modes

**Why needed**:
- Current Canvas component uses context transform (wrong)
- Need CSS-based zoom/pan
- Need fit/fill/actual modes
- Need coordinate transforms (eyedropper)
- Reusable across all image tools

**API**:
```javascript
new ImageViewport({
    width: 400,
    height: 400,
    displayMode: 'fit',     // 'fit' | 'fill' | 'actual'
    enableZoom: true,
    enablePan: true,
    showPixelGrid: false,
    onPixelClick: (x, y) => {},
}, deps)

// Methods
.setImageData(imageData)
.getImageData()
.setDisplayMode(mode)
.screenToImage(x, y)  // Coordinate transform
.resetView()
```

**Implementation notes**:
- CSS `transform: scale() translate()` NOT ctx.setTransform()
- Canvas resolution = image size (constant, never changes)
- Display size controlled by CSS
- object-fit for fit/fill modes

#### 2. PalettePreview Component

**Purpose**: Display color swatches

**Why needed**:
- Currently uses `.innerHTML` (violation)
- Need proper BaseComponent
- Reusable in other tools

**API**:
```javascript
new PalettePreview({
    colours: ['#000000', '#FFFFFF'],
    onClick: (colour, index) => {},
}, deps)

// Methods
.setColours(colourArray)
.getColours()
```

**Implementation**: Grid of divs with CSS background colors

---

## Refactor Strategy

### Phase 1: Remove Algorithm Duplication ✓ LOW RISK

**Remove from tool file**:
- L24-98: ColorSpaceConverter (98 lines) → Use `ColorSpace` import
- L144-166: Inline helper functions → Use algorithm imports
- L168-209: applyImageAdjustments → Use `ImageAdjustments.applyAllAdjustments()`

**Estimated**: 2 hours

### Phase 2: Create Components ✓ MEDIUM RISK

**Create**:
1. `ImageViewport.js` (6 hours)
   - Most complex
   - Coordinate transform tricky
   - Test independently first

2. `PalettePreview.js` (2 hours)
   - Simple component
   - Low risk

**Estimated**: 8 hours total

### Phase 3: Integrate Components ⚠️ HIGH RISK

**Refactor tool canvas**:
- Remove L752-957 (canvas management, 205 lines)
- Replace with ImageViewport component
- Update all canvas access to use viewport API
- Test eyedropper coordinate accuracy

**Refactor palette preview**:
- Remove L959-1005 (HTML generation)
- Replace with PalettePreview component

**Estimated**: 6 hours

### Phase 4: Extract Utilities ✓ LOW RISK

**Create**:
- `canvas-utils.js`: temp canvas helpers
- `download.js`: download helpers

**Estimated**: 2 hours

### Phase 5: Testing & Validation ⚠️ CRITICAL

**Test**:
- Visual regression (output identical)
- Eyedropper accuracy
- All 11 dithering algorithms
- All 3 palette extraction methods
- Batch processing
- Import/export

**Estimated**: 4 hours

---

## Implementation Order

1. **Phase 1 first** (2h) — Lowest risk, provides clean imports
2. **Phase 2 parallel** (8h) — ImageViewport + PalettePreview can develop simultaneously
3. **Phase 4 parallel** (2h) — Utilities can develop in parallel with Phase 2
4. **Phase 3** (6h) — Integration (requires Phase 1, 2, 4 complete)
5. **Phase 5** (4h) — Testing (requires Phase 3 complete)

**Total: 22 hours**

---

## File Manifest

### New Files to Create
```
assets/js/shared/
├─ components/output/
│   ├─ ImageViewport.js        ← NEW (main viewport component)
│   └─ PalettePreview.js        ← NEW (swatch display)
└─ utils/
    ├─ canvas-utils.js          ← NEW (temp canvas helpers)
    └─ download.js              ← NEW (download helpers)
```

### Files to Modify
```
assets/js/shared/
└─ component-library.js         ← Register new components

assets/js/tools/processors/
└─ colour-quantizer-toolbase.js ← Remove 463 lines, add component usage
```

### Files Already Available (No Changes Needed)
```
assets/js/shared/algorithms/
├─ color/
│   ├─ color-space.js           ✅ Use as-is
│   └─ palette-extraction.js    ✅ Use as-is
├─ image/
│   └─ image-adjustments.js     ✅ Use as-is
└─ dither/
    ├─ error-diffusion.js       ✅ Use as-is
    ├─ ordered.js               ✅ Use as-is
    └─ nearest-color.js         ✅ Use as-is
```

---

## Key Decisions Made

### ✅ DO NOT create orchestration algorithm
**Reason**: Quantization orchestration (adjustments → LAB → dither) is tool-specific logic. Keep in tool but use algorithm library functions.

### ✅ CREATE ImageViewport component
**Reason**: Canvas with viewport is reusable pattern. Every image tool needs this. Investment pays off immediately.

### ✅ SEPARATE from existing Canvas component
**Reason**: Canvas.js is general-purpose (procedural, animations). ImageViewport is image-specific (static ImageData). Different use cases.

### ✅ CSS transform, NOT context transform
**Reason**: Canvas resolution should equal image resolution (constant). Display zoom/pan should be CSS only. This is standard practice.

---

## Success Metrics

**Before**:
- 463 lines of misplaced code
- 27 architecture violations
- 0 reusable components
- Complex tool file

**After**:
- ~200 lines in tool file (orchestration only)
- 0 architecture violations
- 2 reusable components (ImageViewport, PalettePreview)
- Clean separation of concerns

**ROI**:
- ImageViewport unlocks entire image tool category
- PalettePreview reusable in pattern/texture tools
- Algorithm library already complete (no work needed)
- 463 lines removed from tool = 70% reduction

---

## Next Actions

### Immediate (Start Now)
1. ✅ Read existing Canvas.js to understand current approach
2. ✅ Design ImageViewport API
3. ✅ Create ImageViewport skeleton
4. ✅ Implement CSS-based zoom/pan
5. ✅ Test coordinate transforms independently

### Sequential (After Above)
6. Create PalettePreview component
7. Create utils modules
8. Refactor tool to use components
9. Comprehensive testing
10. Documentation

---

## Risk Mitigation

### Eyedropper Accuracy
**Risk**: Coordinate transform math error breaks eyedropper  
**Mitigation**: 
- Unit test coordinate transform with known values
- Visual test: click canvas, verify picked color matches cursor
- Test all display modes (fit/fill/actual)

### Performance Regression
**Risk**: CSS transform slower than context transform  
**Mitigation**:
- Profile before/after with 4K images
- CSS transforms are GPU-accelerated (should be faster)
- Quantization is bottleneck, not display

### Breaking Existing Features
**Risk**: Refactor breaks batch processing, export, etc.  
**Mitigation**:
- Keep ImageData operations identical
- Test export checksums before/after
- Parallel development (old code stays until validated)

---

## Conclusion

**Audit complete. Path forward clear.**

**Architecture violations**: All identified and solvable  
**Algorithm library**: Already complete (95% done)  
**Component library**: 2 components needed (ImageViewport critical)  
**Estimated effort**: 22 hours for full compliance  
**ROI**: High (unlocks image tool category)

**Recommendation**: Proceed with Phase 1-5 in order. ImageViewport is highest priority and can be developed/tested independently before integration.

**Blocking issues**: None. All dependencies available.  
**Ready to start**: ✅ Yes, immediately.
