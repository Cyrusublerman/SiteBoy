# Colour Quantizer — Remaining Work Assessment

**Date:** 2026-01-19  
**Current Status:** Core functionality complete, major features pending  
**File Size:** 792 lines  

---

## ✅ Completed Work

### Core Tool Structure
- [x] ToolBase integration with proper `mount()` pattern
- [x] 4-tab sidebar structure (IMAGE/PALETTE/PROCESS/CANVAS)
- [x] Display mode system (Fit/Fill/Actual) - working correctly
- [x] Canvas auto-resize to match uploaded image dimensions
- [x] Clean canvas area (no extra divs/status bars)
- [x] Australian English spelling throughout
- [x] Image adjustment bundle integration (gamma/contrast/saturation/etc)

### Image Handling
- [x] File upload (PNG/JPG/WebP)
- [x] Canvas resolution matches image resolution (1:1 pixels)
- [x] Image adjustments via professional adjustment bundle
- [x] Real-time preview updates
- [x] ImageData storage (original/preview/processed)

### Basic Quantization
- [x] 9 predefined palettes (1-bit, 2-bit, 3-bit, NES, Game Boy, etc.)
- [x] Custom palette builder (add/clear colours)
- [x] LAB colour space conversion (perceptually accurate)
- [x] Blue noise dithering (single algorithm)
- [x] Nearest-color quantization (no dither)
- [x] Process button with timing display

### Export & Workflow
- [x] PNG export with descriptive filename
- [x] Undo functionality (revert to preview)
- [x] Status messages via `setStatus()`

---

## 🚧 Critical Missing Features (MUST DO)

### 1. **More Dithering Algorithms** 🔴 HIGH PRIORITY
**Current:** Only "Blue Noise" toggle (2 states: on/off)  
**Required:** 12+ algorithms as per original spec

**Reference:** `dithermark-master/js/shared/models/dither-algorithms.js`

**Algorithms to Add:**

#### Error Diffusion (from Dithermark)
- [ ] Floyd-Steinberg (most common)
- [ ] Atkinson (Apple II style, high contrast)
- [ ] Jarvis-Judice-Ninke (wide diffusion)
- [ ] Stucki (smooth gradients)
- [ ] Burkes (fast, balanced)
- [ ] Sierra-3 / Sierra-2 / Sierra-1 (three-row diffusion)
- [ ] Reduced Atkinson (less bleed)

#### Ordered Dithering (from Dithermark)
- [ ] Bayer 2×2 (checkerboard)
- [ ] Bayer 4×4 (classic crosshatch)
- [ ] Bayer 8×8 (fine pattern)
- [ ] Halftone (newspaper dots)
- [ ] Other ordered patterns (cluster, hatch, zigzag, etc.)

**Implementation Plan:**
1. Extract algorithm definitions from `dithermark-master/js/worker/dither/error-prop-model.js`
2. Convert to SiteBoy standards (no inline implementations)
3. Move to `assets/js/shared/algorithms/dither/` directory
4. Create:
   - `error-diffusion.js` - all error diffusion algorithms
   - `ordered.js` - all ordered dithering matrices
   - `index.js` - export all
5. Update PROCESS tab:
   ```javascript
   ['Dithering', [
       ['dropdown', 'Algorithm', [
           'None',
           'Blue Noise',
           '---',
           'Floyd-Steinberg',
           'Atkinson',
           // ... etc
       ], { key: 'ditherAlgorithm', value: 'Blue Noise' }]
   ]]
   ```

**Files to Reference:**
- `reference/tools/New folder/dithermark-master/js/worker/dither/error-prop-model.js`
- `reference/tools/New folder/dithermark-master/js/worker/dither/ordered-matrix.js`
- `reference/tools/New folder/colour3/src/script.js` (your original implementation)

**Estimated Work:** 4-6 hours
- 2 hours: Extract and convert algorithms
- 1 hour: Create algorithm library files
- 1 hour: Wire into tool UI
- 1 hour: Testing all algorithms

---

### 2. **Algorithm Library Migration** 🔴 HIGH PRIORITY
**Current:** All algorithms inline in tool file (792 lines)  
**Required:** Extract to `assets/js/shared/algorithms/`

**Why Critical:**
- Tool file is getting large (792 lines)
- Algorithms should be reusable across tools
- Violates SiteBoy architecture (file ownership)

**Files to Create:**

```
assets/js/shared/algorithms/
├── color/
│   ├── color-space.js        ← sRGB↔LAB, deltaE, hexToRgb
│   └── index.js
├── dither/
│   ├── blue-noise-bracketing.js   ← Current implementation
│   ├── error-diffusion.js          ← NEW (Floyd-Steinberg, etc.)
│   ├── ordered.js                  ← NEW (Bayer matrices, etc.)
│   ├── nearest-color.js            ← Simple quantization
│   └── index.js
├── image/
│   ├── image-adjustments.js       ← Gamma/contrast/saturation (if not using bundle)
│   ├── image-resize.js             ← NEW (nearest neighbor, block avg)
│   └── index.js
└── index.js
```

**Migration Steps:**
1. Extract `ColorSpaceConverter` → `algorithms/color/color-space.js`
2. Extract quantization functions → `algorithms/dither/`
3. Extract adjustment functions (if not fully handled by bundle)
4. Add JSDoc comments with formulas and references
5. Update tool to import: `import { ColorSpace, Dither } from '../../shared/algorithms/index.js';`
6. Update `asset-loader.js` dependencies: `dependencies: ['algorithms']`

**Estimated Work:** 3-4 hours

---

### 3. **Image Resizing** 🟡 MEDIUM PRIORITY
**Current:** Canvas resizes to match image, but no pixel-level resizing  
**Required:** Ability to downscale large images with pixel-perfect methods

**User Story:**
- User uploads 4000×3000px image
- Tool is slow to process
- User wants to resize to 800×600px for faster processing

**Methods to Implement:**
1. **Nearest Neighbor** - Remove every Nth pixel (perfect for pixel art)
2. **Block Average** - Average 2×2 or 4×4 blocks into single pixel
3. **Block Mode** - Most common color in block
4. **Block Median** - Median color in block

**UI Integration:**
Add to IMAGE tab:
```javascript
['Image Transforms', [
    ['dropdown', 'Resize Mode', ['None', 'Nearest Neighbor', 'Block Average'], 
        { key: 'resizeMode', value: 'None' }],
    ['slider', 'Scale Factor', 0.1, 1.0, 0.1, 
        { value: 1.0, key: 'scaleFactor', withNumber: true }],
    ['button', 'Apply Resize', null, { key: 'applyResize' }]
]]
```

**Reference:**
- `reference/tools/New folder/colour3/` - check if it has resize logic
- Pixel-tiler tool has block operations that can be adapted

**Estimated Work:** 2-3 hours

---

### 4. **Palette Extraction** 🟡 MEDIUM PRIORITY
**Current:** Only manual custom palette building  
**Required:** Extract palette from image automatically

**Algorithms:**
- **K-means** - Cluster colors, find centroids
- **Median Cut** - Split color space recursively
- **Octree** - Build tree, reduce to N colors
- **Histogram** - Find N most common colors
- **NeuQuant** - Neural network quantization

**UI Integration:**
Add to PALETTE tab:
```javascript
['Extract from Image', [
    ['dropdown', 'Method', ['K-means', 'Median Cut', 'Histogram'], 
        { key: 'extractMethod', value: 'Median Cut' }],
    ['stepper', 'Colours', 2, 256, 1, 
        { value: 16, key: 'extractCount' }],
    ['button', 'Extract Palette', null, { key: 'extractPalette' }]
]]
```

**Estimated Work:** 4-5 hours (algorithms are complex)

---

### 5. **Palette Import/Export** 🟢 LOW PRIORITY
**Current:** No persistence  
**Required:** Save/load custom palettes

**Formats:**
- `.gpl` (GIMP Palette)
- `.ase` (Adobe Swatch Exchange)
- `.hex` (plain text hex values)
- `.json` (SiteBoy custom format)

**UI Integration:**
```javascript
['Custom Colors', [
    // ... existing controls ...
    ['file', 'Import Palette', '.gpl,.ase,.hex,.json', 
        { key: 'importPalette' }],
    ['button', 'Export Palette', null, 
        { key: 'exportPalette' }]
]]
```

**Estimated Work:** 2-3 hours

---

### 6. **Batch Processing** 🟢 LOW PRIORITY
**Current:** One image at a time  
**Required:** Process multiple images with same settings

**Flow:**
1. User uploads multiple files
2. Select palette + dithering settings
3. Click "Process All"
4. Progress bar shows N/M complete
5. Download ZIP of results

**UI Integration:**
New tab or separate mode:
```javascript
['BATCH', [
    ['Files', [
        ['file', 'Upload Multiple', 'image/*', 
            { key: 'batchFiles', multiple: true }],
        ['label', '0 files selected', 
            { key: 'batchCount', variant: 'caption' }]
    ]],
    ['Progress', [
        ['progress', 'Processing', 0, 
            { key: 'batchProgress' }]
    ]],
    ['Actions', [
        ['button', 'Process All', null, 
            { key: 'batchProcess' }],
        ['button', 'Download ZIP', null, 
            { key: 'batchDownload' }]
    ]]
]]
```

**Dependencies:**
- JSZip library for ZIP creation
- Web Workers for parallel processing (optional)

**Estimated Work:** 4-6 hours

---

### 7. **Video Support** 🔵 FUTURE / PHASE 5
**Current:** Images only  
**Required:** Convert video frames

**Not implementing now** - too complex, needs:
- FFmpeg.wasm integration
- Frame extraction
- Per-frame processing
- Video reassembly
- Large file handling

**Estimated Work:** 10-15 hours (separate project)

---

## 🐛 Known Issues to Fix

### 1. **Display Mode on Upload**
**Issue:** When image is uploaded, display mode may not apply correctly  
**Fix:** Ensure `applyDisplayMode()` is called after canvas resize in `loadImage()`  
**Status:** ✅ Should be fixed in current version

### 2. **Blue Noise Texture Loading**
**Issue:** Uses external CDN URL (CodePen)  
**Risk:** If CDN fails, dithering breaks  
**Fix:** Host blue noise texture locally in `/assets/images/blue-noise.png`  
**Estimated Work:** 15 minutes

### 3. **Custom Palette Persistence**
**Issue:** Custom palette resets on page reload  
**Fix:** Save to localStorage  
**Estimated Work:** 30 minutes

### 4. **Process Button During Processing**
**Issue:** User can click "Process" multiple times  
**Fix:** Disable button while `state.isProcessing === true`  
**Estimated Work:** 10 minutes

### 5. **Large Image Performance**
**Issue:** 4000×3000px images take 2-3s with dithering, UI freezes  
**Fix Options:**
- Add Web Worker for processing (complex)
- Show loading overlay with AnimationFoundation spinner (simple)
- Add "Reduce before processing" suggestion (user-facing)  
**Estimated Work:** 1-2 hours (depending on approach)

---

## 📋 Testing Checklist (Before "Complete")

### Functional Tests
- [ ] Upload PNG/JPG/WebP images
- [ ] All 9 predefined palettes work
- [ ] Custom palette: add/clear/persist colors
- [ ] All dithering algorithms produce correct output
- [ ] Fit/Fill/Actual display modes work
- [ ] Canvas resizes to match image
- [ ] Adjustment bundle updates preview in real-time
- [ ] Process button quantizes image
- [ ] Undo button reverts correctly
- [ ] Export PNG downloads correct file
- [ ] Status messages appear correctly

### Edge Cases
- [ ] Upload tiny image (10×10px)
- [ ] Upload huge image (8000×6000px)
- [ ] Upload image, process, upload new image
- [ ] Process same image multiple times
- [ ] Change palette mid-process
- [ ] Undo without processing
- [ ] Export without processing
- [ ] Rapid slider movements (debouncing)

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Performance
- [ ] 1920×1080 image processes in <3s (with dither)
- [ ] UI doesn't freeze during processing
- [ ] Canvas display is responsive
- [ ] No memory leaks on repeated use

---

## 📊 Priority Matrix

| Feature | Priority | Complexity | Time | Impact |
|---------|----------|------------|------|--------|
| **More Dithering Algorithms** | 🔴 CRITICAL | Medium | 4-6h | High - core feature |
| **Algorithm Library Migration** | 🔴 CRITICAL | Low | 3-4h | High - architecture |
| **Fix Blue Noise Hosting** | 🟡 HIGH | Low | 15m | Medium - reliability |
| **Disable Process While Processing** | 🟡 HIGH | Low | 10m | Medium - UX |
| **Image Resizing** | 🟡 MEDIUM | Medium | 2-3h | Medium - performance |
| **Palette Extraction** | 🟡 MEDIUM | High | 4-5h | Medium - feature |
| **Custom Palette Persistence** | 🟢 LOW | Low | 30m | Low - convenience |
| **Palette Import/Export** | 🟢 LOW | Medium | 2-3h | Low - pro feature |
| **Batch Processing** | 🟢 LOW | High | 4-6h | Low - pro feature |
| **Video Support** | 🔵 FUTURE | Very High | 10-15h | Low - niche |

---

## 🎯 Recommended Next Steps

### Immediate (Do Now)
1. **Add remaining dithering algorithms** (4-6 hours)
   - This was the primary user request
   - Reference code exists in Dithermark
   - Critical for tool completeness

2. **Migrate algorithms to library** (3-4 hours)
   - Prevents file bloat
   - Enables reuse across tools
   - Follows SiteBoy architecture

3. **Fix blue noise hosting** (15 minutes)
   - Quick win
   - Improves reliability

### Short Term (Next Session)
4. **Image resizing feature** (2-3 hours)
   - Improves performance for large images
   - User-requested feature

5. **Palette extraction** (4-5 hours)
   - Major feature enhancement
   - Separates tool from competitors

### Medium Term (Future Sessions)
6. **Batch processing** (4-6 hours)
   - Professional feature
   - Significant UX improvement

7. **Palette import/export** (2-3 hours)
   - Completes palette workflow
   - Inter-tool compatibility

### Long Term (Phase 5+)
8. **Video support** (10-15 hours)
   - Separate major project
   - Requires FFmpeg integration

---

## 📝 Documentation Needs

### Code Documentation
- [ ] JSDoc for all algorithm functions
- [ ] Formula references in comments
- [ ] Example usage in algorithm files

### User Documentation
- [ ] Tool description for Tools TOC
- [ ] Palette format specifications
- [ ] Dithering algorithm comparisons
- [ ] Performance tips (resize large images first)

### Developer Documentation
- [ ] Algorithm library API reference
- [ ] How to add new dithering algorithms
- [ ] How to add new palettes
- [ ] Testing procedures

---

## 🔢 Summary Statistics

**Current State:**
- ✅ Complete: 15 features
- 🚧 In Progress: 0 features
- ❌ Missing: 8 major features
- 🐛 Known Issues: 5

**Estimated Remaining Work:**
- Critical: 7-10 hours
- High: 3-4 hours
- Medium: 6-8 hours
- Low: 4-6 hours
- **Total: 20-28 hours**

**File Organization:**
- Main tool: 792 lines (will reduce to ~400 after algorithm extraction)
- Algorithm library: ~400 lines (to be created)
- Total codebase: ~800 lines

**Completion Status:** ~60% (core done, features pending)

---

## 🎬 Conclusion

The Colour Quantizer has a **solid foundation** with working image upload, display, basic quantization, and export. The critical missing piece is **more dithering algorithms** - this was the user's primary request and should be the immediate focus.

After adding the 12+ dithering algorithms and migrating to the algorithm library, the tool will be **80% complete** and fully usable. The remaining features (resizing, palette extraction, batch processing) are enhancements that can be added incrementally.

**Next action:** Start with dithering algorithm implementation from Dithermark reference code.

