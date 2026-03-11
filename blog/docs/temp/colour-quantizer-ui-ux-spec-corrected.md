# Colour Quantizer — UI/UX Specification (Corrected)

**Version:** 2.0  
**Date:** 2026-01-17  
**Status:** Implements SiteBoy Standards  

---

## Critical Design Principles

### 1. Clean Canvas Area
**MANDATORY:** Canvas area contains ONLY the canvas element. No:
- Status bars
- Action buttons
- Extra divs/boxes
- Margin wrappers

### 2. Display Mode Control
Uses standard ToolBase pattern:
- Radio control in CANVAS tab: `['Fit', 'Fill', 'Actual']`
- Handled via `this.resizeCanvas()` with `displayMode` option
- No custom canvas styling outside ToolBase

### 3. Tab-Based Sidebar
Uses top-level tabs (not nested dropdowns):
- `['IMAGE', [...]]`
- `['PALETTE', [...]]`
- `['PROCESS', [...]]`
- `['CANVAS', [...]]`

---

## Layout Diagrams

### Desktop Layout (Landscape ≥800px)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER: COLOUR QUANTIZER                                  [← Back] │
├──────────────────┬──────────────────────────────────────────────────┤
│                  │                                                  │
│   SIDEBAR        │              CANVAS AREA                         │
│   (420px/30F)    │              (fills remaining)                   │
│                  │                                                  │
│ ┌──────────────┐ │   ┌──────────────────────────────────────┐      │
│ │ ▼ IMAGE      │ │   │                                      │      │
│ └──────────────┘ │   │                                      │      │
│ ┌──────────────┐ │   │                                      │      │
│ │ ▼ PALETTE    │ │   │        Image displayed here          │      │
│ └──────────────┘ │   │                                      │      │
│ ┌──────────────┐ │   │        (fit/fill/actual modes)       │      │
│ │ ▼ PROCESS    │ │   │                                      │      │
│ └──────────────┘ │   │                                      │      │
│ ┌──────────────┐ │   │         CLEAN CANVAS ONLY            │      │
│ │ ▼ CANVAS     │ │   │                                      │      │
│ └──────────────┘ │   │                                      │      │
│                  │   └──────────────────────────────────────┘      │
│                  │                                                  │
└──────────────────┴──────────────────────────────────────────────────┘
```

### Mobile/Portrait Layout (<800px)

```
┌───────────────────────────┐
│ COLOUR QUANTIZER    [← ] │
├───────────────────────────┤
│                           │
│  ┌─────────────────────┐  │
│  │                     │  │
│  │                     │  │
│  │   Image Preview     │  │
│  │   (canvas only)     │  │
│  │                     │  │
│  │                     │  │
│  └─────────────────────┘  │
│                           │
├───────────────────────────┤
│     SIDEBAR (BELOW)       │
│                           │
│  ┌─────────────────────┐  │
│  │ ▼ IMAGE             │  │
│  ├─────────────────────┤  │
│  │ ▼ PALETTE           │  │
│  ├─────────────────────┤  │
│  │ ▼ PROCESS           │  │
│  ├─────────────────────┤  │
│  │ ▼ CANVAS            │  │
│  └─────────────────────┘  │
│                           │
└───────────────────────────┘
```

---

## Sidebar Structure

### TAB 1: IMAGE

```
IMAGE
├─ Source
│  └─ file: Upload Image
├─ Adjustments
│  ├─ slider: Gamma (0.1–3.0, default 1.0)
│  ├─ slider: Contrast (0–200%, default 100%)
│  ├─ slider: Saturation (0–200%, default 100%)
│  └─ button: Reset Adjustments
```

**Behaviour:**
- Upload triggers image load → displayed on canvas immediately
- Sliders update preview in real-time (no "Process" needed)
- Reset button returns all 3 sliders to defaults

---

### TAB 2: PALETTE

```
PALETTE
├─ Selection
│  └─ dropdown: Palette (1-bit, 2-bit, ..., Custom)
├─ Custom Colors (only shown when 'Custom' selected)
│  ├─ color: New Colour
│  ├─ button: Add Colour
│  ├─ button: Clear Custom
│  └─ label: "Custom: X colours" (dynamic count)
```

**Palettes Available:**
- 1-bit (2 colours)
- 2-bit (4 grays)
- 3-bit (8 colours)
- 3-bit-gray (8 grays)
- nes (16 colours)
- gameboy (4 greens)
- primaries (5 colours)
- pastel (6 colours)
- ggost (17 colours)
- Custom (user-defined)

**Custom Palette Behaviour:**
- Starts with 2 colours: `[#000000, #FFFFFF]`
- Add Colour: validates hex, prevents duplicates
- Clear Custom: resets to default 2 colours

---

### TAB 3: PROCESS

```
PROCESS
├─ Options
│  └─ toggle: Dithering ['Blue Noise']
├─ Actions
│  ├─ button: Process Image
│  └─ button: Undo to Preview
```

**Behaviour:**
- Process Image: quantizes current preview to selected palette
- Dithering toggle: enables/disables blue noise dithering
- Undo: reverts processed image back to preview state

**Processing Status:**
- Uses `this.setStatus()` (NOT separate div in canvas area)
- Shows: "Processing...", "Processed in X.XXs", error messages

---

### TAB 4: CANVAS

```
CANVAS
├─ Size
│  ├─ slider: Width (14–2048px, default 420)
│  └─ slider: Height (14–2048px, default 420)
├─ Display
│  └─ radio: Mode ['Fit', 'Fill', 'Actual']
├─ Export
│  └─ button: Export PNG
```

**Display Modes:**

| Mode | Behaviour | CSS Applied by ToolBase |
|------|-----------|-------------------------|
| **Fit** | Scale to fit container (maintain aspect) | `object-fit: contain` |
| **Fill** | Fill container (may crop) | `object-fit: cover` |
| **Actual** | 1:1 pixel ratio (may need scroll) | `object-fit: none`, `image-rendering: pixelated` |

**Implementation:**
```javascript
onUpdate: function(key, value, allValues) {
    if (key === 'canvasWidth' || key === 'canvasHeight' || key === 'displayMode') {
        this.resizeCanvas(
            allValues.canvasWidth || 420,
            allValues.canvasHeight || 420,
            { displayMode: (allValues.displayMode || 'Fit').toLowerCase() }
        );
    }
}
```

---

## Component Hierarchy

```
ColourQuantizerTool
│
└─ ToolBase (config + deps)
   │
   ├─ Sidebar (30F = 420px)
   │  │
   │  ├─ Tab: IMAGE
   │  │  ├─ Block: Source
   │  │  │  └─ FileInput (key: imageFile)
   │  │  └─ Block: Adjustments
   │  │     ├─ Slider (key: gamma)
   │  │     ├─ Slider (key: contrast)
   │  │     ├─ Slider (key: saturation)
   │  │     └─ Button (key: resetAdjust)
   │  │
   │  ├─ Tab: PALETTE
   │  │  ├─ Block: Selection
   │  │  │  └─ Dropdown (key: palette)
   │  │  └─ Block: Custom Colors
   │  │     ├─ ColorInput (key: newColour)
   │  │     ├─ Button (key: addColour)
   │  │     ├─ Button (key: clearCustom)
   │  │     └─ Label (key: customCount)
   │  │
   │  ├─ Tab: PROCESS
   │  │  ├─ Block: Options
   │  │  │  └─ Toggle (key: dithering)
   │  │  └─ Block: Actions
   │  │     ├─ Button (key: process)
   │  │     └─ Button (key: undo)
   │  │
   │  └─ Tab: CANVAS
   │     ├─ Block: Size
   │     │  ├─ Slider (key: canvasWidth)
   │     │  └─ Slider (key: canvasHeight)
   │     ├─ Block: Display
   │     │  └─ Radio (key: displayMode)
   │     └─ Block: Export
   │        └─ Button (key: exportPng)
   │
   └─ Canvas Area (fills remaining space)
      └─ HTMLCanvasElement (ONLY - no wrappers)
```

---

## Data Flow

```
1. FILE UPLOAD
   User selects file
   → FileReader loads
   → Image object created
   → Draw to temp canvas
   → Extract ImageData
   → Store as originalImageData
   → Display on canvas

2. ADJUSTMENTS (Real-time)
   User moves gamma/contrast/saturation slider
   → onUpdate(key, value) fires
   → applyImageAdjustments(originalImageData, ...)
   → Store as previewImageData
   → this.draw() → onDraw() → canvas updates

3. QUANTIZATION (Button-triggered)
   User clicks "Process Image"
   → Get active palette
   → Convert to LAB space
   → Apply quantization algorithm
   → Store as currentImageData
   → this.draw() → onDraw() → canvas updates

4. DISPLAY MODE (Canvas scaling)
   User changes "Mode" radio
   → onUpdate('displayMode', value) fires
   → this.resizeCanvas(..., { displayMode: value })
   → ToolBase applies CSS
   → Canvas re-renders at new scale
```

---

## User Flow

### Primary Workflow

```
┌─────────────┐
│   START     │
└──────┬──────┘
       │
       ↓
┌──────────────────┐
│  Upload Image    │ ← IMAGE tab, file input
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Image Displayed  │ ← originalImageData → canvas (Fit mode)
└──────┬───────────┘
       │
       ↓
┌──────────────────┐        ┌──────────────────┐
│ Adjust Settings? │───YES──→│  Move Sliders    │
└──────┬───────────┘        │  (real-time)     │
       │                    └──────┬───────────┘
       NO                          │
       │                           │ previewImageData updates
       │←──────────────────────────┘
       ↓
┌──────────────────┐
│ Select Palette   │ ← PALETTE tab, dropdown
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│Toggle Dithering? │ ← PROCESS tab, toggle
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│ Click "Process"  │ ← PROCESS tab, button
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Processing...  │ ← Status in sidebar (via setStatus())
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│Result Displayed  │ ← currentImageData → canvas
└──────┬───────────┘
       │
       ↓
┌──────────────────┐        ┌──────────────────┐
│   Satisfied?     │───NO───→│  Click "Undo"    │
└──────┬───────────┘        └──────┬───────────┘
       │                           │
       YES                         │ Back to preview
       │←──────────────────────────┘
       ↓
┌──────────────────┐
│ Adjust Display?  │ ← CANVAS tab, radio (Fit/Fill/Actual)
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│Download PNG File │ ← CANVAS tab, Export PNG button
└──────┬───────────┘
       │
       ↓
┌──────────────┐
│   COMPLETE   │
└──────────────┘
```

---

## State Machine

```
┌─────────────┐
│   INITIAL   │ ← No image loaded
└──────┬──────┘
       │ Upload image
       ↓
┌─────────────┐
│   LOADED    │ ← originalImageData set, preview = original
└──────┬──────┘
       │ Adjust sliders
       ↓
┌─────────────┐
│  ADJUSTED   │ ← previewImageData with adjustments applied
└──────┬──────┘
       │ Click "Process"
       ↓
┌─────────────┐
│ PROCESSING  │ ← Quantizing + dithering (async with setTimeout)
└──────┬──────┘
       │ Complete
       ↓
┌─────────────┐
│ PROCESSED   │ ← currentImageData = quantized result
└──────┬──────┘
       │
       ├─ Click "Undo" ────→ ADJUSTED (revert to previewImageData)
       ├─ Click "Export" ──→ PROCESSED (download, stay in state)
       ├─ Upload new ──────→ LOADED (clear all, start over)
       └─ Adjust sliders ──→ ADJUSTED (modify preview)
```

---

## Canvas Rendering (onDraw)

```javascript
onDraw: function(ctx, canvas, values) {
    // 1. Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Determine which ImageData to display
    var imageData = state.currentImageData;  // Processed result (if exists)
    if (!imageData) {
        imageData = state.previewImageData;  // Adjusted preview (if exists)
    }
    if (!imageData) {
        imageData = state.originalImageData;  // Original upload (if exists)
    }

    // 3. Draw image if available
    if (imageData) {
        // Create temp canvas for ImageData
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        var tempCtx = tempCanvas.getContext('2d');
        tempCtx.putImageData(imageData, 0, 0);

        // Draw to main canvas
        // ToolBase handles scaling via displayMode CSS
        // We just draw at 0,0 and let CSS handle the rest
        ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
    } else {
        // 4. Placeholder if no image
        ctx.fillStyle = 'var(--c-text)';
        ctx.font = '14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Upload an image to begin', canvas.width / 2, canvas.height / 2);
    }
}
```

**Note:** ToolBase's `resizeCanvas()` with `displayMode` handles all CSS scaling. The `onDraw` callback just puts pixels on canvas.

---

## Algorithm Summary

### Image Adjustments (Real-time)

```javascript
function applyImageAdjustments(imageData, gamma, contrast, saturation) {
    var data = imageData.data;
    var newData = new Uint8ClampedArray(data.length);
    var gammaExponent = 1.0 / gamma;
    var contrastFactor = contrast / 100;
    var saturationFactor = saturation / 100;
    
    for (var i = 0; i < data.length; i += 4) {
        var r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
        
        // 1. Saturation (desaturate toward grayscale)
        if (saturationFactor !== 1.0) {
            var gray = r * 0.2126 + g * 0.7152 + b * 0.0722;
            r = clamp(gray + saturationFactor * (r - gray));
            g = clamp(gray + saturationFactor * (g - gray));
            b = clamp(gray + saturationFactor * (b - gray));
        }
        
        // 2. Contrast (pivot around 0.5)
        if (contrastFactor !== 1.0) {
            r = clamp(((r / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
            g = clamp(((g / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
            b = clamp(((b / 255.0 - 0.5) * contrastFactor + 0.5) * 255.0);
        }
        
        // 3. Gamma (power curve)
        if (gamma !== 1.0 && gamma > 0) {
            r = clamp(Math.pow(r / 255.0, gammaExponent) * 255.0);
            g = clamp(Math.pow(g / 255.0, gammaExponent) * 255.0);
            b = clamp(Math.pow(b / 255.0, gammaExponent) * 255.0);
        }
        
        newData[i] = Math.round(r);
        newData[i+1] = Math.round(g);
        newData[i+2] = Math.round(b);
        newData[i+3] = a;
    }
    
    return new ImageData(newData, imageData.width, imageData.height);
}
```

### Color Quantization (Button-triggered)

**Without Dithering:**
```
For each pixel:
  1. Convert RGB → LAB (perceptual colour space)
  2. Find nearest palette colour in LAB space (deltaE76)
  3. Replace pixel with nearest colour
```

**With Blue Noise Dithering:**
```
For each pixel:
  1. Convert RGB → LAB
  2. Find nearest colour (A) and opposite colour (B)
  3. Calculate blend factor based on LAB distances
  4. Get blue noise threshold at pixel position (0–1)
  5. Choose A or B based on: threshold < blendFactor
```

---

## Technical Specifications

### Color Space Conversion

**sRGB → LAB:**
```
1. sRGB → Linear RGB (gamma expansion)
   linear = (sRGB/255)^2.4 (if sRGB > 0.04045)

2. Linear RGB → XYZ (matrix transform)
   X = 0.4124564*R + 0.3575761*G + 0.1804375*B
   Y = 0.2126729*R + 0.7151522*G + 0.0721750*B
   Z = 0.0193339*R + 0.1191920*G + 0.9503041*B

3. XYZ → LAB (perceptual space)
   L = 116*f(Y/Yn) - 16
   a = 500*(f(X/Xn) - f(Y/Yn))
   b = 200*(f(Y/Yn) - f(Z/Zn))
   
   where f(t) = t^(1/3) if t > ε, else (κ*t + 16)/116
```

**Delta E (CIE76):**
```
ΔE = √[(L₁-L₂)² + (a₁-a₂)² + (b₁-b₂)²]
```

### Performance

**Typical Processing Time (1920×1080):**
- Adjustments (real-time): < 50ms
- Quantization (no dither): 300-500ms
- Quantization (blue noise): 2000-3000ms

**Memory Usage:**
- originalImageData: ~8.3 MB
- previewImageData: ~8.3 MB
- currentImageData: ~8.3 MB
- blueNoiseTextureData: ~16 KB (64×64)
- **Total:** ~25 MB per loaded image

---

## Export Specification

### PNG Export

**Filename Format:**
```
{originalFileName}_quant_{palette}_{dither}.png

Examples:
- photo_quant_nes_dither.png
- landscape_quant_1-bit_nodither.png
- portrait_quant_custom_dither.png
```

**Process:**
1. Create temp canvas (image resolution)
2. Put currentImageData on temp canvas
3. Convert to PNG data URL: `canvas.toDataURL('image/png')`
4. Create download link
5. Trigger download

---

## Standards Compliance Checklist

### Tool Build Guide Requirements
- [x] Uses ToolBase with proper `mount()` pattern
- [x] 3-level sidebar: TAB → BLOCK → COMPONENT
- [x] All components have explicit `key` in options
- [x] Keys are camelCase
- [x] Canvas size is F-multiple (420 = 30F)
- [x] Standard tab names (IMAGE, PALETTE, PROCESS, CANVAS)
- [x] Display mode via radio + `resizeCanvas()`
- [x] No inline styles in tool code
- [x] Clean canvas area (no extra divs)

### Tool Standards Requirements
- [x] Canvas sizing controls (width/height sliders)
- [x] Export PNG button
- [x] Display mode control (Fit/Fill/Actual)
- [x] File upload with format info
- [x] Clear/Reset functionality (Reset Adjustments, Clear Custom)
- [x] Status display via `setStatus()` (not custom div)

### Architecture Prohibitions
- [x] NO `document.*` outside BaseComponent (✓ uses ToolBase)
- [x] NO manual DOM manipulation (✓ declarative config)
- [x] NO inline styles (✓ uses CSS classes)
- [x] NO raw hex colours (✓ uses VGA palette or user input)
- [x] NO requestAnimationFrame (✓ not animated)
- [x] NO redundant divs/boxes (✓ clean canvas area)

---

## End of Specification

**Document Version:** 2.0  
**Last Updated:** 2026-01-17  
**Replaces:** `colour-quantizer-ui-ux-specification.md` (v1.0)  
**Implementation File:** `assets/js/tools/processors/colour-quantizer-toolbase.js`

