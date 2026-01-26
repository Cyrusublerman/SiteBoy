# Color Quantizer — Feature Specification

## Purpose
Convert full-color images to limited palettes using perceptually accurate color matching (LAB color space) and advanced dithering techniques.

## Feature Categories

### 1. IMAGE INPUT ✅ Essential

**Upload Image**
- File picker supporting: PNG, JPEG, WebP, BMP
- File name display showing selected file
- Preview on canvas immediately after load
- Drag-and-drop support (optional enhancement)

**Image Information**
- Display dimensions (e.g., "1920×1080")
- Display file size (optional)
- Canvas auto-resizes to image dimensions

---

### 2. COLOR PALETTE SYSTEM ✅ Essential

#### 2A. Predefined Palettes
Must include these standard palettes:

| Palette | Colors | Description |
|---------|--------|-------------|
| **1-bit** | 2 | Black & White |
| **2-bit** | 4 | 4 grayscale levels |
| **3-bit** | 8 | RGB corners (8 colors) |
| **3-bit Gray** | 8 | 8 grayscale levels |
| **NES** | 16 | NES console palette |
| **Game Boy** | 4 | Original Game Boy palette |
| **Primaries** | 5 | Black/White/R/G/B |
| **Pastel** | 6 | Soft pastel colors |
| **Ggost** | 17 | Custom artistic palette |

**UI:**
- Dropdown to select palette
- Visual swatch display showing all colors in active palette
- Clicking palette name switches immediately (no "apply" button needed)

#### 2B. Custom Palette ✅ Essential
When "Custom" palette selected, show tools:

**Manual Color Addition:**
- Color picker widget (HTML `<input type="color">`)
- Hex input field (validates format: #RRGGBB or #RGB)
- "Add" button to add current color to palette
- Duplicate detection (don't add same color twice)

**Color Removal:**
- Each swatch in custom palette shows "×" button on hover
- Click "×" to remove color from palette
- Minimum 1 color required (prevent empty palette)

**Eyedropper Tool:**
- "Eyedropper" button to activate
- Click on image preview to sample pixel color
- Sampled color populates color picker + hex field
- Auto-deactivates after sampling
- Works on current preview (post-adjustments, pre-quantization)

**Palette File Import:**
- File picker for `.txt`, `.gpl`, `.hex` files
- Parser supports:
  - **Plain text:** One hex per line (#RRGGBB)
  - **GIMP Palette (.gpl):** Standard GIMP format
  - **Comma/space separated:** Multiple hex codes per line
- Replaces entire custom palette on import
- Display count of colors loaded (e.g., "Loaded 18 colors from palette.gpl")

**Palette File Export (Optional Enhancement):**
- Download custom palette as `.txt` or `.gpl`
- Useful for saving/sharing custom palettes

---

### 3. IMAGE ADJUSTMENTS ✅ Essential

Pre-process image before quantization to optimize results.

**Gamma Correction**
- Range: 0.2 to 2.2
- Default: 1.0 (no correction)
- Step: 0.1
- Live preview: Updates canvas as slider moves
- Purpose: Brighten/darken before quantization

**Contrast**
- Range: 0% to 200%
- Default: 100% (no change)
- Step: 5%
- Live preview
- Purpose: Increase/decrease contrast before quantization

**Saturation**
- Range: 0% to 200%
- Default: 100% (no change)
- Step: 5%
- Live preview
- Purpose: Make colors more/less vivid (0% = grayscale)

**Reset Button**
- Resets all three adjustments to defaults
- Updates preview immediately

**Technical:**
- Adjustments apply to `originalImageData` → produce `previewImageData`
- Adjustments are NON-DESTRUCTIVE (can reset/change anytime)
- Live preview means canvas updates on slider `input` event (not just `change`)
- Preview shows adjusted image BEFORE quantization

---

### 4. DITHERING ALGORITHMS ✅ Essential + Enhancements

#### 4A. Essential Algorithms (Phase 1)

**None (Nearest Color)**
- Simple quantization: each pixel → nearest palette color
- Fast, crisp, can show banding
- Good for: Large palettes, pixel art aesthetic

**Blue Noise**
- Uses external texture (128×128 or 256×256 PNG)
- LAB geometric bracketing strategy:
  1. Find nearest palette color (C)
  2. Find most opposite color (I) relative to original
  3. Project original onto C–I segment in LAB space
  4. If projection is closer than C alone, dither C and I
  5. Use blue noise texture value as threshold for mixing
- Result: Smooth gradients, organic appearance
- Best quality for photographs

**Technical Requirements:**
- Blue noise texture loads on tool initialization
- Use: `https://assets.codepen.io/3457130/HDR_L_0.png` or bundle locally
- Handle loading errors gracefully (disable blue noise if texture fails)

#### 4B. Enhanced Algorithms (Phase 2 - Optional)

**Floyd-Steinberg (Error Diffusion)**
- Classic dithering: propagate quantization error to neighbors
- Pattern: 7/16 right, 3/16 left-down, 5/16 down, 1/16 right-down
- Result: Good detail preservation, slight directional bias
- Fast, industry standard

**Bayer 4×4 (Ordered)**
- Threshold matrix dithering
- Result: Retro crosshatch pattern, tiles seamlessly
- Very fast, deterministic

**Atkinson (Reduced Bleed)**
- Error diffusion with 75% propagation (not 100%)
- Result: HyperCard/early Mac aesthetic, high contrast
- Good for: Artistic effects, limited palettes

**Random Noise**
- Add random noise before quantization
- Simple alternative to blue noise
- Fast, less smooth than blue noise

**Dropdown UI:**
```
Dithering: [Dropdown ▼]
Options:
  - None (Nearest Color)
  - Blue Noise ⭐
  - Floyd-Steinberg
  - Bayer 4×4
  - Atkinson
  - Random Noise
```

---

### 5. CANVAS VIEWER ✅ Essential

**Display**
- Canvas shows current image state:
  - Before processing: Adjusted preview
  - After processing: Quantized + dithered result
- `image-rendering: pixelated` for crisp pixels
- Canvas auto-sizes to image dimensions (respects aspect ratio)

**Pan & Zoom**
- Zoom: 10% to 1600%
- Mouse wheel zoom (optional but nice)
- Zoom input field + stepper buttons (+/−)
- Pan: Click-drag to move image when zoomed
- Cursor changes: `grab` → `grabbing` when panning
- Reset view button (optional)

**Status Display**
- Below canvas or in status block
- Format: "{width}×{height} @ {zoom}%"
- Show processing state: "Processing..." during quantization
- Show errors: "Error: {message}" in red

---

### 6. PROCESSING WORKFLOW ✅ Essential

**Three-Button System:**

**PROCESS Button**
- Primary action (styled bold/inverted)
- Applies quantization + dithering to current preview
- Uses current settings: palette, dither algorithm, adjustments
- Updates canvas with result
- Disabled when:
  - No image loaded
  - Blue noise texture not loaded (if blue noise selected)
  - Already processing (prevent double-click)
- Processing time display (optional): "Processed in 1.23s"

**UNDO Button**
- Reverts to preview (adjusted but not quantized)
- Allows changing settings and re-processing
- Disabled when: No image loaded
- Does NOT undo adjustments (use Reset button for that)

**DOWNLOAD PNG Button**
- Exports current canvas as PNG file
- Filename format: `{original-name}_quant_{palette}_{dither}.png`
  - Example: `photo_quant_nes_blue-noise.png`
- Disabled when: No processed image
- Uses canvas.toDataURL() or canvas.toBlob()

**Workflow:**
```
1. Upload image → Preview shows on canvas
2. Adjust sliders → Preview updates live
3. Select palette → Swatches update
4. Select dither algorithm → Dropdown changes
5. Click PROCESS → Quantization runs → Result shows on canvas
6. Click UNDO → Back to preview
7. Change settings, click PROCESS again
8. Click DOWNLOAD → Save PNG
```

---

### 7. TECHNICAL REQUIREMENTS ✅ Essential

**Color Space:**
- All quantization uses LAB color space (perceptually accurate)
- Delta E (CIE76) for color distance: `√((L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²)`
- D65 white point reference
- Cached conversions for performance

**Performance:**
- Process 1920×1080 image in <2 seconds (single-threaded)
- Live preview adjustments: <100ms response time
- Blue noise dithering: ~500-1000ms per megapixel

**Memory:**
- Keep 3 ImageData instances: original, preview, current
- Each ~8MB for 1920×1080 (width × height × 4 bytes)
- Blue noise texture: ~256KB (256×256 RGBA)
- Total memory: <30MB for typical use

**Error Handling:**
- Invalid image file → Show error message, disable processing
- Blue noise texture fails to load → Disable blue noise option, show warning
- Invalid palette file → Show error, keep current palette
- Invalid hex input → Red border on input field, don't add color

---

### 8. OPTIONAL ENHANCEMENTS (Future Phases)

#### 8A. Histogram (Phase 3)
- Color distribution graph
- Shows before/after color counts
- Helps judge palette effectiveness

#### 8B. Batch Processing (Phase 3)
- Multi-file upload
- Queue view with thumbnails
- Shared settings across batch
- Progress tracking per file
- ZIP export for all results

#### 8C. Palette Optimization (Phase 4)
- Generate optimal palette from image
- Algorithms: K-means, Median Cut, Octree
- Color count slider (2-256 colors)
- "Extract Palette from Image" button

#### 8D. Comparison View (Phase 4)
- Side-by-side: Original vs Quantized
- Slider to reveal/hide
- Useful for quality assessment

#### 8E. Preset System (Phase 4)
- Save favorite settings combinations
- Dropdown to load presets
- Format: JSON with palette + dither + adjustments

---

## Feature Priority Matrix

| Feature | Status | Priority | Phase |
|---------|--------|----------|-------|
| **Image upload** | Shell exists | P0 | 1 |
| **Predefined palettes** | Shell exists | P0 | 1 |
| **Custom palette (manual add)** | Shell exists | P0 | 1 |
| **Custom palette (remove)** | Shell exists | P0 | 1 |
| **Image adjustments (gamma/contrast/sat)** | Shell exists | P0 | 1 |
| **Dither: None** | Missing impl | P0 | 1 |
| **Dither: Blue Noise** | Missing impl | P0 | 1 |
| **LAB color space** | Partial (converter exists) | P0 | 1 |
| **Canvas viewer** | Shell exists | P0 | 1 |
| **Pan/zoom** | Partial (events only) | P0 | 1 |
| **Process/Undo/Download** | Shell exists | P0 | 1 |
| **Eyedropper** | Shell exists | P1 | 1 |
| **Palette file import** | Shell exists | P1 | 1 |
| **Dither: Floyd-Steinberg** | Missing | P1 | 2 |
| **Dither: Bayer** | Missing | P1 | 2 |
| **Dither: Atkinson** | Missing | P2 | 2 |
| **Histogram** | Missing | P2 | 3 |
| **Batch processing** | Missing | P2 | 3 |
| **Palette optimization** | Missing | P3 | 4 |
| **Comparison view** | Missing | P3 | 4 |
| **Preset system** | Missing | P3 | 4 |

---

## Minimum Viable Tool (Phase 1)

To be considered **functional**, tool must have:

✅ **Core Processing:**
- [ ] Upload image → loads to ImageData
- [ ] Image adjustments apply to pixels (gamma/contrast/saturation)
- [ ] Quantization using LAB nearest-color
- [ ] At least 2 dither algorithms (None + Blue Noise)
- [ ] Process button executes pipeline
- [ ] Download exports PNG

✅ **Palette Management:**
- [ ] 9 predefined palettes work
- [ ] Custom palette: add colors manually
- [ ] Custom palette: remove colors
- [ ] Visual swatches display
- [ ] Palette file import (.txt minimum)

✅ **UI/UX:**
- [ ] Canvas displays result
- [ ] Pan/zoom functional
- [ ] Status messages show state
- [ ] Undo reverts to preview
- [ ] Adjustments update preview live

✅ **Architecture:**
- [ ] Extends ToolBase or BaseComponent
- [ ] No manual DOM (ComponentLibrary only)
- [ ] Algorithms in shared/algorithms/
- [ ] CSS classes (no inline styles)
- [ ] debugLog instead of console.log

---

## Features NOT Included (Explicit Exclusions)

❌ **Video Processing**
- Reason: Too complex (30MB FFmpeg bundle, CORS issues, memory intensive)
- Alternative: Document external FFmpeg workflow

❌ **GIF Export**
- Reason: Single-frame tool, not animation
- Alternative: Use batch processing for frame sequences

❌ **Real-time Preview of Quantization**
- Reason: Too slow (>100ms for large images)
- Keep: Live preview of adjustments only

❌ **Multi-algorithm Comparison**
- Reason: Too complex for initial release
- Alternative: User can process multiple times with different settings

❌ **Color Reduction (Posterization)**
- Reason: Different tool purpose (reduces bits per channel, not palette-based)

❌ **Image Filters (blur, sharpen, edge detect)**
- Reason: Scope creep, belongs in separate tool
- Keep: Only gamma/contrast/saturation (color adjustments)

---

## Summary

**Phase 1 (Essential):** 23 features  
**Phase 2 (Enhanced):** 3 dither algorithms  
**Phase 3 (Quality of Life):** Batch + histogram  
**Phase 4 (Advanced):** Optimization + presets  

**Current state:** UI shell complete, processing logic missing  
**Next step:** Implement Phase 1 core processing (LAB conversion + dithering)

Does this feature set align with your vision? Any features to add, remove, or reprioritize?

