# Download Utilities

**Location**: `assets/js/shared/utils/download.js`  
**Type**: Utility Module  
**Purpose**: Trigger file downloads in the browser

## Overview

Helper functions for triggering file downloads. Creates temporary DOM elements to initiate browser downloads, then cleans up automatically.

## Functions

### downloadBlob(blob, filename)

Download a Blob as a file.

**Parameters**:
- `blob` (Blob): Blob to download
- `filename` (string): Filename for download

**Returns**: void

```javascript
import { downloadBlob } from './utils/download.js';

const blob = await canvas.toBlob();
downloadBlob(blob, 'output.png');
```

---

### downloadDataURL(dataURL, filename)

Download a data URL as a file.

**Parameters**:
- `dataURL` (string): Data URL string
- `filename` (string): Filename for download

**Returns**: void

```javascript
import { downloadDataURL } from './utils/download.js';

const dataURL = canvas.toDataURL('image/png');
downloadDataURL(dataURL, 'screenshot.png');
```

---

### downloadText(content, filename, mimeType)

Download text content as a file.

**Parameters**:
- `content` (string): Text content
- `filename` (string): Filename for download
- `mimeType` (string, optional): MIME type (default: 'text/plain')

**Returns**: void

```javascript
import { downloadText } from './utils/download.js';

const csv = 'name,value\nAlice,100\nBob,200';
downloadText(csv, 'data.csv', 'text/csv');
```

---

### downloadJSON(data, filename, pretty)

Download JSON data as a file.

**Parameters**:
- `data` (Object): Data to export
- `filename` (string): Filename for download
- `pretty` (boolean, optional): Pretty-print JSON (default: true)

**Returns**: void

```javascript
import { downloadJSON } from './utils/download.js';

const settings = {
    palette: ['#000000', '#FFFFFF'],
    dither: 'Floyd-Steinberg'
};
downloadJSON(settings, 'settings.json');
```

---

### downloadZIP(files, zipFilename)

Download multiple files as a ZIP archive.

**Note**: Requires JSZip library to be loaded.

**Parameters**:
- `files` (Array<{name: string, blob: Blob}>): Array of file objects
- `zipFilename` (string): Name for ZIP file

**Returns**: Promise<void>

```javascript
import { downloadZIP } from './utils/download.js';

const files = [
    { name: 'image1.png', blob: blob1 },
    { name: 'image2.png', blob: blob2 },
    { name: 'settings.json', blob: blob3 }
];

await downloadZIP(files, 'batch_export.zip');
```

---

## Usage Patterns

### Image Export

```javascript
import { imageDataToCanvas, canvasToBlob } from './utils/canvas-utils.js';
import { downloadBlob } from './utils/download.js';

async function exportImage(imageData, filename) {
    const canvas = imageDataToCanvas(imageData);
    const blob = await canvasToBlob(canvas);
    downloadBlob(blob, filename);
}

// Usage
exportImage(quantizedImageData, 'output.png');
```

### Settings Export

```javascript
import { downloadJSON } from './utils/download.js';

function exportSettings(tool) {
    const settings = {
        palette: tool.getValue('palette'),
        dither: tool.getValue('ditherAlgo'),
        strength: tool.getValue('ditherStrength'),
        gamma: tool.getValue('gamma'),
        contrast: tool.getValue('contrast'),
        saturation: tool.getValue('saturation')
    };
    
    downloadJSON(settings, 'colour_quantizer_settings.json');
}
```

### Batch Export

```javascript
import { downloadZIP } from './utils/download.js';
import { imageDataToCanvas, canvasToBlob } from './utils/canvas-utils.js';

async function exportBatch(imageDataArray, filenamesArray) {
    const files = [];
    
    for (let i = 0; i < imageDataArray.length; i++) {
        const canvas = imageDataToCanvas(imageDataArray[i]);
        const blob = await canvasToBlob(canvas);
        files.push({
            name: filenamesArray[i],
            blob: blob
        });
    }
    
    await downloadZIP(files, 'batch_export.zip');
}
```

### Palette Export (GPL Format)

```javascript
import { downloadText } from './utils/download.js';

function exportGPL(palette, paletteName) {
    let gpl = `GIMP Palette\nName: ${paletteName}\n#\n`;
    
    palette.forEach(hex => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        gpl += `${r.toString().padStart(3)} ${g.toString().padStart(3)} ${b.toString().padStart(3)} ${hex}\n`;
    });
    
    downloadText(gpl, `${paletteName}.gpl`, 'text/plain');
}
```

## Architecture Notes

### Temporary DOM Elements

These functions create temporary `<a>` elements to trigger downloads, which is acceptable in a utility module:

```javascript
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); // OK in utility
    link.download = filename;
    link.href = url;
    link.click();
    
    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 100);
}
```

### Why Temporary?

- Element never added to DOM
- click() triggers download immediately
- Element garbage-collected
- Object URL revoked after use

### Security

- Uses same-origin object URLs
- No external requests
- User-initiated downloads only
- Filenames sanitized by browser

## Batch Processing

For large batch exports, consider progress feedback:

```javascript
async function exportBatchWithProgress(imageDataArray, onProgress) {
    const files = [];
    
    for (let i = 0; i < imageDataArray.length; i++) {
        const canvas = imageDataToCanvas(imageDataArray[i]);
        const blob = await canvasToBlob(canvas);
        files.push({ name: `image_${i+1}.png`, blob });
        
        if (onProgress) {
            onProgress(i + 1, imageDataArray.length);
        }
    }
    
    await downloadZIP(files, 'batch.zip');
}

// Usage
exportBatchWithProgress(images, (current, total) => {
    console.log(`Processing: ${current}/${total}`);
    tool.setStatus(`Exporting: ${current}/${total}`);
});
```

## Performance

- **Single file**: Instant
- **ZIP (10 files)**: ~100ms
- **ZIP (100 files)**: ~1000ms
- **Memory**: Blobs held in memory until ZIP complete

## Error Handling

```javascript
try {
    await downloadZIP(files, 'export.zip');
    console.log('Export complete');
} catch (err) {
    if (err.message.includes('JSZip')) {
        alert('ZIP library not loaded');
    } else {
        alert('Export failed: ' + err.message);
    }
}
```

## Browser Compatibility

- All modern browsers
- IE11: Requires polyfill for Promises
- Mobile: Download location varies by browser

## Related Modules

- **canvas-utils.js**: Canvas/ImageData conversion
- **palette utils**: Palette format conversion (GPL, HEX, JSON)

## JSZip Integration

downloadZIP() requires JSZip library. Include in HTML:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
```

Or check at runtime:

```javascript
if (typeof JSZip === 'undefined') {
    console.error('JSZip library required for batch export');
    throw new Error('Please include JSZip library');
}
```
