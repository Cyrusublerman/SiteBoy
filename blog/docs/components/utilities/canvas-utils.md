# Canvas Utilities

**Location**: `assets/js/shared/utils/canvas-utils.js`  
**Type**: Utility Module  
**Purpose**: Helper functions for canvas/ImageData operations

## Overview

Isolated utility functions for canvas and ImageData processing. Creates temporary canvases when needed for data conversion/export operations.

## Functions

### imageDataToCanvas(imageData)

Convert ImageData to HTMLCanvasElement.

**Parameters**:
- `imageData` (ImageData): Source image data

**Returns**: HTMLCanvasElement

**Use case**: Export ImageData as image file

```javascript
import { imageDataToCanvas } from './utils/canvas-utils.js';

const canvas = imageDataToCanvas(processedImageData);
const blob = await canvas.toBlob();
downloadBlob(blob, 'output.png');
```

---

### imageToImageData(img)

Convert Image element to ImageData.

**Parameters**:
- `img` (HTMLImageElement): Source image element

**Returns**: ImageData

**Use case**: Load images into processing pipeline

```javascript
import { imageToImageData } from './utils/canvas-utils.js';

const img = new Image();
img.onload = () => {
    const imageData = imageToImageData(img);
    processImage(imageData);
};
img.src = 'path/to/image.png';
```

---

### canvasToBlob(canvas, type, quality)

Convert canvas to Blob asynchronously.

**Parameters**:
- `canvas` (HTMLCanvasElement): Source canvas
- `type` (string, optional): MIME type (default: 'image/png')
- `quality` (number, optional): Quality 0-1 for JPEG (default: 1)

**Returns**: Promise<Blob>

**Use case**: File export

```javascript
import { canvasToBlob } from './utils/canvas-utils.js';

const blob = await canvasToBlob(canvas, 'image/jpeg', 0.9);
downloadBlob(blob, 'output.jpg');
```

---

### loadImageFromFile(file)

Load image file and return ImageData.

**Parameters**:
- `file` (File): Image file from input

**Returns**: Promise<ImageData>

**Use case**: File upload handling

```javascript
import { loadImageFromFile } from './utils/canvas-utils.js';

fileInput.addEventListener('change', async (e) => {
    try {
        const imageData = await loadImageFromFile(e.target.files[0]);
        viewport.setImageData(imageData);
    } catch (err) {
        console.error('Failed to load:', err);
    }
});
```

---

### createImageData(width, height, fillColor)

Create empty ImageData with optional fill colour.

**Parameters**:
- `width` (number): Width in pixels
- `height` (number): Height in pixels
- `fillColor` (string, optional): Fill colour hex or 'transparent' (default: 'transparent')

**Returns**: ImageData

**Use case**: Create blank canvas for drawing

```javascript
import { createImageData } from './utils/canvas-utils.js';

const blank = createImageData(800, 600, '#FFFFFF');
```

---

### cloneImageData(imageData)

Create deep copy of ImageData.

**Parameters**:
- `imageData` (ImageData): Source image data

**Returns**: ImageData (new instance)

**Use case**: Create backup before destructive operations

```javascript
import { cloneImageData } from './utils/canvas-utils.js';

const backup = cloneImageData(originalImageData);
processImage(originalImageData);
if (error) {
    imageData = backup; // Restore from backup
}
```

---

## Usage Patterns

### Image Upload Pipeline

```javascript
import { loadImageFromFile } from './utils/canvas-utils.js';
import { ImageViewport } from './components/output/ImageViewport.js';

const viewport = new ImageViewport({ width: 800, height: 600 }, deps);

fileInput.addEventListener('change', async (e) => {
    const imageData = await loadImageFromFile(e.target.files[0]);
    viewport.setImageData(imageData);
});
```

### Image Export Pipeline

```javascript
import { imageDataToCanvas, canvasToBlob } from './utils/canvas-utils.js';
import { downloadBlob } from './utils/download.js';

async function exportImage(imageData, filename) {
    const canvas = imageDataToCanvas(imageData);
    const blob = await canvasToBlob(canvas, 'image/png');
    downloadBlob(blob, filename);
}
```

### Undo/Redo System

```javascript
import { cloneImageData } from './utils/canvas-utils.js';

const history = [];
const maxHistory = 10;

function saveState(imageData) {
    if (history.length >= maxHistory) {
        history.shift(); // Remove oldest
    }
    history.push(cloneImageData(imageData));
}

function undo() {
    if (history.length > 0) {
        return history.pop();
    }
    return null;
}
```

## Architecture Notes

### Why Utilities Module?

These functions create temporary DOM elements (`document.createElement('canvas')`), which violates the "no raw DOM" rule for components/tools. By isolating them in a utility module, we:

1. **Centralize**: Single location for canvas operations
2. **Reuse**: Available across all tools
3. **Test**: Easy to unit test in isolation
4. **Document**: Clear API for data conversion

### Temporary Canvases

All canvas creation in this module is for **data processing only**, not UI display:

```javascript
// ✓ ACCEPTABLE: Temporary canvas for data conversion
function imageDataToCanvas(imageData) {
    const temp = document.createElement('canvas'); // OK here
    // ... process and return
}
```

```javascript
// ❌ NOT ACCEPTABLE: Canvas for UI display
function MyTool() {
    const canvas = document.createElement('canvas'); // NO! Use component
}
```

### Promise-Based Async

Functions that involve async operations (file loading, blob conversion) return Promises:

```javascript
// Async/await friendly
const imageData = await loadImageFromFile(file);
const blob = await canvasToBlob(canvas);
```

## Performance

- **Small images** (<1MB): Instant
- **Large images** (10MB+): <500ms
- **Memory**: Temporary canvases garbage-collected immediately

## Error Handling

```javascript
try {
    const imageData = await loadImageFromFile(file);
    viewport.setImageData(imageData);
} catch (err) {
    if (err.message === 'Failed to load image') {
        alert('Invalid image file');
    } else {
        alert('Upload failed: ' + err.message);
    }
}
```

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires:
  - Canvas 2D context
  - FileReader API
  - Blob API
  - Promises

## Related Modules

- **download.js**: File download utilities
- **ImageViewport**: Image display component
- **Algorithm libraries**: Image processing functions
