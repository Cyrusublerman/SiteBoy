# Image Adjustment Bundles — Quick Start

## Installation

```javascript
// Import in your tool
import { MinimalBundle, StandardBundle, ProfessionalBundle } from '../shared/image-adjustments/index.js';
```

## Usage

### Minimal Bundle (5 controls)

```javascript
// In your tool initialization
const adjustmentBundle = new MinimalBundle({
    onChange: (adjustedImage, settings) => {
        // adjustedImage is the processed ImageData
        // settings contains all adjustment values
        this.processedImage = adjustedImage;
        this.draw();
    }
});

// Set the source image
adjustmentBundle.setImage(myImageData);

// Add to your UI
const bundleElement = adjustmentBundle.render();
sidebar.appendChild(bundleElement);
```

### Standard Bundle (10 controls + transforms)

```javascript
const adjustmentBundle = new StandardBundle({
    onChange: (adjustedImage, settings) => {
        this.processedImage = adjustedImage;
        this.draw();
    },
    onTransform: (transformedImage, transform) => {
        // Handle resize/rotate/flip
        if (transform.type === 'resize') {
            this.canvas.width = transformedImage.width;
            this.canvas.height = transformedImage.height;
        }
        this.sourceImage = transformedImage;
    }
});

adjustmentBundle.setImage(myImageData);
```

### Professional Bundle (with curves)

```javascript
const adjustmentBundle = new ProfessionalBundle({
    onChange: (adjustedImage, settings) => {
        this.processedImage = adjustedImage;
        this.draw();
    },
    onTransform: (transformedImage, transform) => {
        this.sourceImage = transformedImage;
        this.updateCanvas(transformedImage);
    }
});

adjustmentBundle.setImage(myImageData);
```

## Features by Bundle

| Feature | Minimal | Standard | Professional |
|---------|---------|----------|--------------|
| Brightness | ✅ | ✅ | ✅ |
| Contrast | ✅ | ✅ | ✅ |
| Gamma | ✅ | ✅ | ✅ |
| Saturation | ✅ | ✅ | ✅ |
| Hue | ✅ | ✅ | ✅ |
| Exposure | ❌ | ✅ | ✅ |
| Levels | ❌ | ✅ | ✅ |
| Curves | ❌ | ❌ | ✅ |
| Resize | ❌ | ✅ | ✅ |
| Rotate/Flip | ❌ | ✅ | ✅ |
| Undo/Redo | ❌ | Undo only | ✅ |

## Curve Editor

The Professional Bundle includes a simple curve editor:
- Click to add control points (up to 16)
- Drag points to adjust curve
- Right-click to remove points
- Start and end points are locked
- Linear interpolation between points

## API Reference

### Methods

```javascript
// Set or update source image
bundle.setImage(imageData);

// Reset all adjustments to defaults
bundle.reset();

// Undo last change (Standard/Professional only)
bundle.undo();

// Redo last undone change (Professional only)
bundle.redo();

// Clean up
bundle.destroy();
```

### Settings Object

```javascript
{
    brightness: 0,        // -100 to 100
    contrast: 1.0,        // 0 to 2
    gamma: 1.0,           // 0.2 to 3
    saturation: 1.0,      // 0 to 2
    hue: 0,               // -180 to 180 degrees
    exposure: 0,          // -3 to 3 EV (Standard/Professional)
    levels: {             // Standard/Professional
        black: 0,         // 0 to 255
        mid: 1.0,         // 0.1 to 9.9
        white: 255        // 0 to 255
    },
    curveLUT: null        // Uint8Array[256] (Professional)
}
```

## Integration Example

```javascript
// Complete tool integration
class MyImageTool {
    constructor() {
        this.sourceImage = null;
        this.processedImage = null;
        
        this.adjustmentBundle = new StandardBundle({
            onChange: (adjusted, settings) => {
                this.processedImage = adjusted;
                this.renderToCanvas();
            },
            onTransform: (transformed, transform) => {
                if (transform.type === 'resize') {
                    this.updateCanvasSize(transformed.width, transformed.height);
                }
                this.sourceImage = transformed;
            }
        });
    }
    
    loadImage(file) {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            this.sourceImage = ctx.getImageData(0, 0, img.width, img.height);
            this.adjustmentBundle.setImage(this.sourceImage);
        };
        img.src = URL.createObjectURL(file);
    }
    
    renderToCanvas() {
        if (!this.processedImage) return;
        this.ctx.putImageData(this.processedImage, 0, 0);
    }
}
```

## CSS

Add to your main CSS or import `adjustment-bundles.css`:

```html
<link rel="stylesheet" href="assets/css/adjustment-bundles.css">
```

## Performance

- Debounced updates (100ms) for real-time sliders
- Curve editor uses 50ms debounce
- Undo stack limited to 20 steps
- All adjustments run on main thread (fast enough for images up to 2048×2048)

## Browser Support

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- Mobile: ✅ (touch-friendly)

