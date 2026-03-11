# ASCII Art Generator - Display & Batch Features

**Date:** 2026-01-27  
**File:** `assets/js/tools/processors/ascii-art-generator.js`

## New Features Implemented

### 1. ASCII Over Image Display Mode ✅

**Location:** DISPLAY tab → View section

**UI Controls:**
- Toggle: "ASCII Over Image" checkbox
- Slider: "ASCII Opacity %" (0-100%, default 50%)

**Functionality:**
- Renders ASCII art semi-transparently over the original processed image
- Allows visual comparison of ASCII output quality against source
- Opacity control enables fine-tuning visibility balance

**Implementation:**
- Added `overlayOptions` toggle with two options
- Added `asciiOpacity` slider
- Updated `onDraw()` to check overlay flags and apply `ctx.globalAlpha`
- Draws adjusted image first, then ASCII with transparency

### 2. Edge Detection Visualization ✅

**Location:** DISPLAY tab → View section

**UI Controls:**
- Toggle: "Show Edge Detection" checkbox (part of overlayOptions)

**Functionality:**
- Displays raw edge detection data used in ASCII conversion
- Useful for debugging edge-based processing modes
- Shows Sobel operator output visualization

**Implementation:**
- Added `instance.state.edgeDetectionData` to store edge ImageData
- Updated `processImage()` to capture edge data when edgeMode !== 'Off'
- Added `drawEdgeDetection()` helper function
- Updated `onDraw()` to check "Show Edge Detection" flag

### 3. Batch Processing System ✅

**Location:** DISPLAY tab → Batch Process section

**UI Controls:**
- **File Input:** "Upload Folder" (multiple images) ⭐ NEW
- **Button:** "Add Current to Batch" - adds currently displayed ASCII
- **Label:** "Batch: N images" - shows queue count
- **Button:** "Process Batch" - confirms batch ready
- **Button:** "Export All" - exports all batch items
- **Button:** "Clear Batch" - empties queue

**Functionality:**
- **FOLDER UPLOAD:** Select multiple images at once (Ctrl+Click / Cmd+Click)
- Auto-processes entire folder and adds to batch queue
- Queue multiple ASCII art results with settings
- Export entire batch at once in selected format
- Each batch item stores: sourceImage, asciiGrid, glyphAtlas, settings, name, timestamp

**Implementation:**
- Added `instance.state.batchQueue` array
- Added file input with `multiple: true` attribute
- Added `loadBatchFolder()` - processes multiple images sequentially
- Added `processImageForBatch()` - simplified batch processing
- Added 6 helper functions:
  - `updateBatchStatus()` - updates count label
  - `addToBatch()` - adds current result to queue
  - `processBatch()` - validates batch ready
  - `exportBatch()` - exports all items
  - `clearBatch()` - empties queue
  - `exportPlainTextWithName()`, `exportHTMLWithName()`, `exportSVGWithName()` - named exports

## State Changes

### New State Properties:
```javascript
this.state = {
    // ... existing properties
    edgeDetectionData: null,    // NEW: ImageData for edge visualization
    batchQueue: []              // NEW: Array of batch items
}
```

### Batch Item Structure:
```javascript
{
    sourceImage: Image,
    asciiGrid: Array,
    glyphAtlas: Object,
    settings: {
        font, fontSize, lineHeight, letterSpacing,
        textColor, bgMode
    },
    name: String,              // Filename or timestamp-based
    timestamp: Number
}
```

## UI Organization

**DISPLAY Tab now has 3 sections:**
1. **View** - Display modes, colors, overlay options (expanded)
2. **Export** - Single file export (unchanged)
3. **Batch Process** - Multi-file batch operations (NEW with folder upload)

## User Workflows

### ASCII Over Image:
1. Generate ASCII art
2. Enable "ASCII Over Image" toggle
3. Adjust "ASCII Opacity %" slider
4. Compare ASCII quality against source

### Edge Detection View:
1. Set Edge Detection mode (not "Off")
2. Generate ASCII art
3. Enable "Show Edge Detection" toggle
4. Review edge data quality

### Batch Export (Manual):
1. Generate ASCII art for first image
2. Click "Add Current to Batch"
3. Load new image and generate
4. Click "Add Current to Batch" again
5. Repeat for all images
6. Select export format
7. Click "Export All"
8. All images export with sequential names

### Batch Export (Folder Upload): ⭐ NEW
1. Click "Upload Folder" file input
2. Select multiple images (Ctrl+Click / Cmd+Click or Select All)
3. Tool auto-processes all images (10ms delay between each)
4. Batch counter updates in real-time
5. Select export format
6. Click "Export All"
7. All images export with original filenames

## Technical Notes

### Folder Upload Processing:
- Sequential processing with 10ms delays prevents UI freeze
- Uses `FileList` from file input with `multiple` attribute
- Filters for image MIME types only
- Preserves original filenames (minus extension)
- Progress shown via batch counter
- Each image processed independently with current atlas/settings

### Performance:
- Batch processing uses simplified `processImageForBatch()`
- No UI updates during batch (faster processing)
- Small async delays prevent browser hang
- Suitable for 10-100 images depending on resolution

### Limitations:
- Browser file selection (no actual folder API in all browsers)
- Sequential processing (not parallel)
- All images use same atlas/settings from time of upload
- No progress bar (only counter updates at end)

### Other Notes:
- Overlay modes are mutually exclusive (split view, edge view, ascii-over-image, normal)
- Edge detection data only captured when edgeMode !== 'Off'
- Batch queue persists until tool destroyed or manually cleared
- Batch export creates separate files per item (no zip)
- ASCII opacity applies via `ctx.globalAlpha` (hardware-accelerated)

## Testing Checklist

- [ ] Upload image and generate ASCII
- [ ] Enable "ASCII Over Image" and adjust opacity
- [ ] Test with different backgrounds (black/white/transparent)
- [ ] Enable edge detection mode and view edge data
- [ ] **Upload folder with 5-10 images** ⭐
- [ ] **Verify all images added to batch** ⭐
- [ ] **Check filenames preserved** ⭐
- [ ] Add single item manually with "Add Current to Batch"
- [ ] Verify batch counter updates
- [ ] Export batch as Plain Text
- [ ] Export batch as HTML
- [ ] Export batch as SVG
- [ ] Clear batch and verify empty
- [ ] Verify destroy() clears batch queue

