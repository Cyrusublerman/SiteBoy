# Plan: Add Professional Image Adjustments to QUANTIZE Tab

## Goal
Add AdjustmentBundle ('professional' tier) to allow users to adjust source images before quantization/downscaling.

## Current Understanding

### Workflow (Correct)
1. User uploads source image
2. **[NEW]** User adjusts image (brightness, contrast, exposure, curves, etc.)
3. User sets Print Width (mm) - default 170mm
4. User sets Max Detail (mm) - pixel size in print (0.4mm = each pixel is 0.4×0.4mm)
5. User clicks "Downscale to Detail" → calculates targetPixels = printWidth / maxDetail
6. User clicks "Quantize Image" → applies dither algorithm
7. Min Detail (mm) - spatial filter removes isolated features smaller than this

### Why Professional Adjustments Matter
- Raw photos often have wrong exposure/contrast
- Colors may need correction before quantization
- Crop/rotate needed to frame subject
- Brightness/gamma affects dither quality
- Better input = better quantized output

## Implementation

### 1. Update Sidebar Structure

**File:** `assets/js/tools/fabrication/multifilament-print-tool.js`
**Method:** `_getQuantizeSidebar()` (lines 699-733)

**Change:**

```javascript
_getQuantizeSidebar() {
    // ... palette status calc ...
    
    return [['CONTROLS', [
        ['PALETTE', [
            ['label', paletteStatusText, { key: 'paletteStatus', variant: 'caption' }],
            ['palettePreview', { colours: paletteColours, key: 'palettePreview' }],
        ]],
        ['IMAGE', [
            ['file', 'Source Image', null, { key: 'sourceImage', accept: 'image/*' }],
            ['number', 'Print Width (mm)', 170, { key: 'printWidth', min: 50, max: 300 }],
        ]],
        // NEW BLOCK
        ['IMAGE ADJUSTMENTS', [
            ['adjustment-bundle', 'professional', null, {
                key: 'imageAdjust'
            }],
        ]],
        ['RESOLUTION', [
            ['number', 'Max Detail (mm)', 0.4, { key: 'maxDetail', min: 0.1, max: 2, step: 0.1 }],
            ['button', 'Downscale to Detail', null, { key: 'downscale' }],
            ['label', '', { key: 'resolutionStatus', variant: 'caption' }],
        ]],
        ['DITHER', [
            ['dropdown', 'Algorithm', ['None', 'Floyd-Steinberg', 'Bayer 4×4', 'Blue Noise'], { key: 'ditherAlgorithm', value: 'Floyd-Steinberg' }],
            ['number', 'Min Detail (mm)', 0.8, { key: 'minDetail', min: 0, max: 2, step: 0.1 }],
        ]],
        ['ACTIONS', [
            ['button', 'Quantize Image', null, { key: 'quantize' }],
            ['label', '', { key: 'quantizeStatus', variant: 'caption' }],
        ]],
    ]]];
}
```

### 2. Wire AdjustmentBundle in _onInit

**Method:** `_onInit()` case 'QUANTIZE' (lines 832-839)

**Change:**

```javascript
case 'QUANTIZE':
    this._wireFileInput('sourceImage', (file) => this._loadSourceImage(file));
    this._wireButton('downscale', () => this._downscaleAction());
    this._wireButton('quantize', () => this._quantizeAction());
    this._loadBlueNoise();
    this._updatePalettePreview();
    this._setStatus('quantizeStatus', 'Upload source image to quantize');
    
    // Wire adjustment bundle to feed adjusted image into workflow
    const adjustBundle = this.toolBase.components.get('imageAdjust');
    if (adjustBundle) {
        // When user clicks "Apply" in adjustment bundle
        adjustBundle.onTransform = (adjustedImageData) => {
            // Store adjusted image as the source for downscaling/quantization
            this.sourceImageData = adjustedImageData;
            
            // Update canvas to show adjusted result
            this.toolBase.draw();
            
            console.log('✅ Image adjustments applied, canvas updated');
        };
    }
    break;
```

### 3. Update _loadSourceImage to Feed AdjustmentBundle

**Method:** `_loadSourceImage()` (around line 3518)

**Current flow:** Image loads → sourceImageElement → canvas draws it

**New flow:** Image loads → sourceImageElement → **feed to AdjustmentBundle** → canvas draws it

**Find and update:**

```javascript
_loadSourceImage(file) {
    const img = new Image();
    img.onload = () => {
        this.sourceImageElement = img;
        
        // Resize canvas to match natural dimensions
        const canvas = this.toolBase.canvas;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // NEW: Feed image to adjustment bundle
        const adjustBundle = this.toolBase.components.get('imageAdjust');
        if (adjustBundle && typeof adjustBundle.setSourceImage === 'function') {
            // Get ImageData from loaded image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = img.naturalWidth;
            tempCanvas.height = img.naturalHeight;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(img, 0, 0);
            const imageData = tempCtx.getImageData(0, 0, img.naturalWidth, img.naturalHeight);
            
            // Pass to adjustment bundle
            adjustBundle.setSourceImage(imageData);
            
            console.log('✅ Source image loaded into adjustment bundle');
        }
        
        this.toolBase.draw();
        this._setStatus('quantizeStatus', `Image loaded: ${img.naturalWidth}×${img.naturalHeight}`);
        this._setStatus('resolutionStatus', '');
    };
    img.src = URL.createObjectURL(file);
}
```

### 4. Update _downscaleAction to Use Adjusted Image

**Method:** `_downscaleAction()` (line 2207)

**Current:** Uses `this.sourceImageElement` directly

**New:** Use `this.sourceImageData` if available (from adjustments), else fall back to original

```javascript
_downscaleAction() {
    if (!this.sourceImageElement) {
        this._setStatus('resolutionStatus', '❌ Load image first');
        return;
    }
    
    const values = this.toolBase.getValues();
    const printWidth = parseFloat(values.printWidth) || 170;
    const maxDetail = parseFloat(values.maxDetail) || 0.4;
    const targetWidth = Math.ceil(printWidth / maxDetail);
    
    // Determine source dimensions
    let sourceWidth, sourceHeight, sourceImageData;
    
    if (this.sourceImageData) {
        // Use adjusted image data if available
        sourceWidth = this.sourceImageData.width;
        sourceHeight = this.sourceImageData.height;
        sourceImageData = this.sourceImageData;
        console.log('📐 Downscaling from adjusted image');
    } else {
        // Fall back to original image element
        sourceWidth = this.sourceImageElement.naturalWidth;
        sourceHeight = this.sourceImageElement.naturalHeight;
        console.log('📐 Downscaling from original image');
    }
    
    const aspectRatio = sourceHeight / sourceWidth;
    
    // Only downscale if image is larger than target
    if (sourceWidth <= targetWidth) {
        this._setStatus('resolutionStatus', `✅ Already ≤ ${targetWidth}px (no change)`);
        return;
    }
    
    const targetHeight = Math.ceil(targetWidth * aspectRatio);
    
    // Create downscaled canvas
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    
    if (sourceImageData) {
        // Downscale from ImageData
        const sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = sourceWidth;
        sourceCanvas.height = sourceHeight;
        const sourceCtx = sourceCanvas.getContext('2d');
        sourceCtx.putImageData(sourceImageData, 0, 0);
        tempCtx.drawImage(sourceCanvas, 0, 0, targetWidth, targetHeight);
    } else {
        // Downscale from image element
        tempCtx.drawImage(this.sourceImageElement, 0, 0, targetWidth, targetHeight);
    }
    
    // Store the downscaled image data
    this.sourceImageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight);
    
    // Update canvas size using ToolBase API (from our recent fix!)
    this.toolBase.resizeCanvas(targetWidth, targetHeight);
    
    // Redraw
    this.toolBase.draw();
    
    this._setStatus('resolutionStatus', `✅ ${sourceWidth}→${targetWidth}px (${maxDetail}mm detail)`);
}
```

### 5. Update _onDraw for QUANTIZE Tab

**Method:** `_onDraw()` case 'QUANTIZE' (around line 1050)

**Current:** Draws quantizedImage or sourceImageElement

**New:** Prioritize sourceImageData (adjusted) over sourceImageElement (raw)

```javascript
case 'QUANTIZE':
    if (this.quantizedImage) {
        // Show quantized result
        ctx.putImageData(this.quantizedImage, 0, 0);
    } else if (this.sourceImageData) {
        // Show adjusted image data (from adjustments or downscale)
        ctx.putImageData(this.sourceImageData, 0, 0);
    } else if (this.sourceImageElement) {
        // Show original image
        ctx.drawImage(this.sourceImageElement, 0, 0, canvas.width, canvas.height);
    } else {
        this._drawPlaceholder(ctx, canvas, 'Upload Source Image');
    }
    break;
```

## Testing Checklist

- [ ] Upload image → appears in canvas
- [ ] Image appears in adjustment bundle preview
- [ ] Adjust brightness → canvas updates
- [ ] Adjust contrast → canvas updates
- [ ] Rotate image → canvas updates
- [ ] Crop image → canvas updates
- [ ] Click "Apply" → sourceImageData updated
- [ ] Click "Downscale to Detail" → uses adjusted image
- [ ] Click "Quantize Image" → uses adjusted image
- [ ] Quantized result shows properly
- [ ] Can iterate: adjust → apply → quantize repeatedly

## Files Modified

1. `assets/js/tools/fabrication/multifilament-print-tool.js`
   - `_getQuantizeSidebar()` - add adjustment-bundle block
   - `_onInit()` QUANTIZE case - wire onTransform callback
   - `_loadSourceImage()` - feed image to bundle
   - `_downscaleAction()` - use sourceImageData if available
   - `_onDraw()` QUANTIZE case - prioritize sourceImageData

## No New Imports Needed

AdjustmentBundle already supported by ToolBase (line 73 of tool-base.js).

## Estimated Changes

~60 lines of code across 5 methods.

