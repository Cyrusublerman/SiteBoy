# Colour Quantizer Tool Fixes

## Changes Made

### 1. Palette Preview
**Location**: `assets/js/tools/processors/colour-quantizer-toolbase.js`

- Added `updatePalettePreview()` function that displays up to 16 colour swatches inline
- Preview shows colour squares (14×14px) with VGA border
- Shows "+N" indicator if palette has >16 colours
- Wired to update on:
  - Tool initialization
  - Palette dropdown change
  - Custom colour add/clear
  - Palette extraction
  - Palette import

### 2. Default Collapsed Subsections
**Location**: `assets/js/tools/core/tool-base.js`, `colour-quantizer-toolbase.js`

**ToolBase Enhancement:**
- Modified `_buildBlock()` to support `defaultCollapsed` option in block config
- Reads `options.defaultCollapsed` (defaults to `false` if not specified)
- Sets initial toggle icon (`+` collapsed, `−` expanded)
- Sets initial content display (`none` or `flex`)
- Sets initial border state (no bottom border when collapsed)

**Applied to Quantizer:**
- "Extract from Image" → collapsed by default
- "Custom Colors" → collapsed by default  
- "Import/Export" → collapsed by default
- "Selection" → remains expanded

### 3. Canvas Zoom/Pan Clipping Fix
**Location**: `assets/js/tools/processors/colour-quantizer-toolbase.js`

**Problem**: Canvas resolution matched image size exactly, causing early clipping when zoomed/panned.

**Solution**:
- Canvas internal resolution now 2× image dimensions (provides pan room)
- Added `centerImageInCanvas()` function to calculate center offset
- Image starts centered in canvas: `offset = (canvasSize - imageSize) / 2`
- Applied on image load and canvas resize
- Zoom/pan now works smoothly with room to move in all directions

### 4. Collapsed Header Border Fix
**Location**: `assets/js/tools/core/tool-base.js`

- Added initial border state setting: `header.style.borderBottom = collapsed ? 'none' : '1px solid var(--c-border)'`
- Applied immediately after content is appended
- Fixes missing bottom border on collapsed headers (e.g., Import/Export)

## Technical Details

### Palette Preview Implementation
```javascript
function updatePalettePreview(tool) {
    var palette = getCurrentPalette(values);
    var previewHTML = palette.slice(0, 16).map(hex =>
        '<span style="display:inline-block;width:14px;height:14px;background:' + 
        hex + ';border:1px solid var(--c-border);"></span>'
    ).join('');
    if (palette.length > 16) previewHTML += ' +' + (palette.length - 16);
    previewLabel.element.innerHTML = previewHTML;
}
```

### Canvas Scaling Strategy
- Canvas resolution: `2.0 × image dimensions`
- Display size: CSS controlled via `applyDisplayMode()` (Fit/Fill/Actual)
- Transform origin: Centered at `(canvasWidth/2, canvasHeight/2)`
- Initial offset: `(canvasSize - imageSize) / 2`

### Block Configuration Schema
```javascript
['Block Title', [
    // components...
], { defaultCollapsed: true }]
```

## Files Modified
1. `assets/js/tools/core/tool-base.js` — default collapse support
2. `assets/js/tools/processors/colour-quantizer-toolbase.js` — palette preview, canvas scaling, collapse config

## Testing Checklist
- [x] Palette preview displays on load
- [x] Preview updates when palette changes
- [x] Subsections start collapsed as specified
- [x] Toggle icons correct (+ collapsed, − expanded)
- [x] Border displays correctly on collapsed headers
- [x] Canvas zoom/pan works smoothly
- [x] Image remains visible when zoomed in
- [x] No early clipping at canvas edges

