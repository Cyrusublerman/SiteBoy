# PalettePreview Component

**Location**: `assets/js/shared/components/output/PalettePreview.js`  
**Type**: Output Component  
**Extends**: BaseComponent

## Purpose

Display a colour palette as a grid of visual swatches. Supports click interaction for colour selection.

## Key Features

- **Visual Display**: Colour swatches in flexible grid layout
- **Interactive**: Click callback for colour selection
- **Dynamic Updates**: setColours() method for real-time updates
- **F-System Sizing**: Automatic sizing based on F value
- **Hover Effects**: Scale animation on hover (if clickable)

## Constructor Options

```javascript
new PalettePreview({
    colours: ['#000000', '#FFFFFF'],  // Hex colour array
    swatchSize: null,                  // Auto: F × 1, or custom px
    gap: null,                         // Auto: F × 0.5, or custom px
    maxPerRow: null,                   // Auto-wrap, or fixed count
    onClick: (colour, index) => {},    // Click callback
}, deps)
```

## Public API

### setColours(colours)
Update displayed colours. Clears existing swatches and renders new ones.

```javascript
const palette = ['#FF0000', '#00FF00', '#0000FF'];
preview.setColours(palette);
```

### getColours()
Get current colour array.

```javascript
const colours = preview.getColours(); // ['#FF0000', '#00FF00', '#0000FF']
```

### addColour(colour)
Append a colour to the palette.

```javascript
preview.addColour('#FFFF00');
```

### removeColour(index)
Remove a colour at specific index.

```javascript
preview.removeColour(2); // Remove 3rd colour
```

### clear()
Remove all colours.

```javascript
preview.clear();
```

## Usage in ToolBase

```javascript
['Palette', [
    ['dropdown', 'Select Palette', paletteNames, { key: 'palette' }],
    ['palettePreview', {
        colours: [],
        onClick: (colour, index) => {
            console.log(`Selected: ${colour} at index ${index}`);
            // Could trigger colour editor, removal, etc.
        }
    }, { key: 'palettePreview' }]
]]
```

## Usage Examples

### Basic Display

```javascript
const preview = new PalettePreview({
    colours: ['#000000', '#808080', '#FFFFFF']
}, deps);

document.body.appendChild(preview.render());
```

### Interactive Palette Editor

```javascript
const preview = new PalettePreview({
    colours: customPalette,
    onClick: (colour, index) => {
        // Remove colour on click
        preview.removeColour(index);
    }
}, deps);
```

### Dynamic Update from Dropdown

```javascript
// In tool onUpdate handler
if (key === 'palette') {
    const previewComponent = tool.getComponent('palettePreview');
    const newPalette = getPaletteByName(value);
    previewComponent.setColours(newPalette);
}
```

### Palette Extraction Preview

```javascript
const preview = new PalettePreview({ colours: [] }, deps);

// Extract colours from image
const extractedPalette = extractMedianCut(imageData, 16);

// Display
preview.setColours(extractedPalette);
```

## Styling

### Swatch Styling

```css
.palette-swatch {
    width: 14px;              /* Default: F × 1 */
    height: 14px;
    background: [colour];
    border: 1px solid var(--c-border);
    cursor: pointer;
    transition: transform 0.1s ease;
}

.palette-swatch:hover {
    transform: scale(1.1);
    z-index: 10;
}
```

### Container Styling

```css
.palette-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;                 /* Default: F × 0.5 */
}
```

## Size Calculations

```javascript
// Auto-sizing based on F
const F = deps.MF?.F ?? 14;
const swatchSize = this.swatchSize ?? F;        // 14px
const gap = this.gap ?? Math.round(F * 0.5);    // 7px
```

## Integration with Colour Quantizer

```javascript
// Palette selection preview
function updatePalettePreview(tool) {
    const preview = tool.getComponent('palettePreview');
    const paletteKey = tool.getValue('palette');
    const palette = getPalette(paletteKey);
    
    if (preview && preview.setColours) {
        preview.setColours(palette);
    }
}

// Extracted palette preview
function onExtractPalette(tool) {
    const imageData = tool.getImageData();
    const method = tool.getValue('extractMethod');
    const count = tool.getValue('extractCount');
    
    let extracted;
    if (method === 'Median Cut') {
        extracted = PaletteExtraction.extractMedianCut(imageData, count);
    } else if (method === 'K-means') {
        extracted = PaletteExtraction.extractKMeans(imageData, count);
    } else {
        extracted = PaletteExtraction.extractHistogram(imageData, count);
    }
    
    const preview = tool.getComponent('extractedPalettePreview');
    preview.setColours(extracted);
}
```

## Click Handler Patterns

### Colour Selection
```javascript
onClick: (colour, index) => {
    tool.setValue('selectedColour', colour);
    console.log(`Selected: ${colour}`);
}
```

### Colour Removal
```javascript
onClick: (colour, index) => {
    if (confirm(`Remove ${colour}?`)) {
        preview.removeColour(index);
    }
}
```

### Colour Editing
```javascript
onClick: (colour, index) => {
    const newColour = prompt('Enter new colour:', colour);
    if (newColour) {
        const colours = preview.getColours();
        colours[index] = newColour;
        preview.setColours(colours);
    }
}
```

## Architecture Notes

### No Raw DOM
All DOM creation via BaseComponent methods:
```javascript
const swatch = this.createElement('div', 'palette-swatch');
swatch.style.cssText = '...';
this.element.appendChild(swatch);
```

### Dynamic Updates
setColours() clears and rebuilds DOM:
```javascript
setColours(colours) {
    // Clear
    while (this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }
    
    // Rebuild
    colours.forEach((colour, index) => {
        const swatch = this._createSwatch(colour, index, swatchSize);
        this.element.appendChild(swatch);
    });
}
```

### Event Delegation
Each swatch gets its own click listener (not event delegation). Acceptable because palette size is typically small (2-256 colours).

## Performance

- **Small palettes** (<32): Instant render
- **Large palettes** (256): <10ms render
- **Memory**: Minimal (divs + event listeners)

## Accessibility

- Swatches are clickable divs (keyboard accessible if tabindex added)
- Could add aria-label with colour value
- Could add tooltip on hover with hex value

## Future Enhancements

- Drag-to-reorder swatches
- Right-click context menu (edit/remove)
- Colour name tooltips
- Export palette button
- Swatch size slider
- Grid vs list layout option

## Related Components

- **ColorInput**: Single colour picker
- **ImageViewport**: Image display (pairs well for eyedropper)
- **Dropdown**: Palette selection

## Browser Compatibility

- All modern browsers
- No special requirements
- Flexbox layout (IE11+)
