# Adjustment Bundles ToolBase Integration

## Complete Integration Flow

### 1. **ToolBase Configuration Layer**
Location: `assets/js/tools/core/tool-base.js`

Added to `COMPONENT_TYPES` map:
```javascript
// Image Adjustment Bundles
'adjustment-bundle': 'AdjustmentBundle',
```

Added case in `_parseComponentOptions`:
```javascript
case 'adjustment-bundle':
    // args[0] is bundle type: 'minimal', 'standard', 'professional'
    // args[1] is unused (null placeholder)
    // extraOptions contains: key, onChange, onTransform
    options = {
        bundleType: args[0] ?? 'standard',
        key: extraOptions.key ?? 'adjustmentBundle',
        onChange: extraOptions.onChange ?? null,
        onTransform: extraOptions.onTransform ?? null,
    };
    break;
```

### 2. **ComponentLibrary Layer**
Location: `assets/js/shared/component-library.js`

**Import bundles:**
```javascript
import {
    MinimalBundle,
    StandardBundle,
    ProfessionalBundle
} from './image-adjustments/index.js';
```

**Factory class for routing:**
```javascript
class AdjustmentBundle {
    constructor(options = {}, deps = {}) {
        const { bundleType = 'standard' } = options;
        
        const bundles = {
            'minimal': MinimalBundle,
            'standard': StandardBundle,
            'professional': ProfessionalBundle
        };
        
        const BundleClass = bundles[bundleType.toLowerCase()];
        if (!BundleClass) {
            console.error(`Unknown adjustment bundle type: ${bundleType}`);
            return null;
        }
        
        return new BundleClass(options, deps);
    }
}
```

**Export to ComponentLibrary:**
```javascript
// Image Adjustment Bundles
AdjustmentBundle,
MinimalBundle,
StandardBundle,
ProfessionalBundle
```

### 3. **Bundle Base Layer**
Location: `assets/js/shared/image-adjustments/AdjustmentBundleBase.js`

- Extends `BaseComponent`
- Constructor properly calls `super(options, deps)` with `componentType`
- Imports algorithms from `../algorithms/image/`
- Provides shared logic for all bundles

### 4. **Individual Bundle Layer**
Locations:
- `assets/js/shared/image-adjustments/MinimalBundle.js`
- `assets/js/shared/image-adjustments/StandardBundle.js`
- `assets/js/shared/image-adjustments/ProfessionalBundle.js`

Each extends `AdjustmentBundleBase` and defines:
- `getBundleName()` - Display name
- `getControls()` - UI control definitions
- `processImage(imageData, settings)` - Adjustment algorithms

### 5. **Tool Integration**
Location: `assets/js/tools/processors/colour-quantizer-toolbase.js`

**Sidebar config:**
```javascript
['ADJUSTMENTS', [
    ['adjustment-bundle', 'standard', null, {
        key: 'imageAdjust',
        onChange: (adjustedImage, settings) => {
            state.previewImageData = adjustedImage;
            state.currentImageData = adjustedImage;
            tool.draw();
        },
        onTransform: (transformedImage, settings) => {
            state.originalImageData = transformedImage;
            state.previewImageData = transformedImage;
            state.currentImageData = transformedImage;
            tool.canvas.width = transformedImage.width;
            tool.canvas.height = transformedImage.height;
            applyDisplayMode(tool, tool.getValues().displayMode || 'Fit');
            tool.draw();
        }
    }]
]],
```

**Load image wiring:**
```javascript
// In onInit
const adjustmentBundle = tool.components.get('imageAdjust');
if (adjustmentBundle) {
    state.adjustmentBundle = adjustmentBundle;
}

// In loadImage after successful load
if (state.adjustmentBundle) {
    state.adjustmentBundle.setImage(state.originalImageData);
}
```

## Architecture Fixes Applied

### ✅ BaseComponent Pattern
- All bundles properly extend `BaseComponent`
- Constructor signature: `constructor(options = {}, deps = {})`
- Super call: `super({ ...options, componentType: 'type' }, deps)`

### ✅ Import Paths
- Relative imports from `assets/js/shared/image-adjustments/`
- Algorithms: `../algorithms/image/`
- Foundation: `../../foundation.js`

### ✅ Event System
- No `this.emit()` calls
- Uses callback functions passed in options
- `onChange(adjustedImage, settings)` - for adjustments
- `onTransform(transformedImage, settings)` - for transforms

### ✅ Modular Design
- Algorithms layer: Pure functions in `algorithms/`
- Bundle layer: Stateful components in `image-adjustments/`
- Integration layer: Declarative config in tool files

## Usage Patterns

### Minimal Bundle
```javascript
['adjustment-bundle', 'minimal', null, {
    key: 'imageAdjust',
    onChange: (img, settings) => { ... }
}]
```

### Standard Bundle (recommended)
```javascript
['adjustment-bundle', 'standard', null, {
    key: 'imageAdjust',
    onChange: (img, settings) => { ... },
    onTransform: (img, settings) => { ... }
}]
```

### Professional Bundle
```javascript
['adjustment-bundle', 'professional', null, {
    key: 'imageAdjust',
    onChange: (img, settings) => { ... },
    onTransform: (img, settings) => { ... }
}]
```

## Benefits

1. **Declarative** - Single config line in sidebar
2. **Type-safe** - ToolBase validates component type
3. **Lazy-loaded** - Bundles only load when needed
4. **Consistent** - Follows ToolBase/ComponentLibrary patterns
5. **Maintainable** - Changes to bundles don't affect tools
6. **Reusable** - Any tool can use any bundle
7. **Modular** - Each layer has single responsibility

## Testing

Check browser console for:
- ✅ No "Unknown component type" warnings
- ✅ No import errors (500 server errors)
- ✅ No BaseComponent method errors
- ✅ Bundle UI renders in sidebar
- ✅ Image adjustments apply on slider changes
- ✅ Transforms apply correctly

## Next Steps

1. Link `adjustment-bundles.css` in main stylesheet
2. Test all three bundle types
3. Integrate into other image tools
4. Add documentation to tool standards

