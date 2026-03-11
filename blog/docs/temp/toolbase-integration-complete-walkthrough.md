# ToolBase Integration - Complete Walkthrough

## The Problem

User reported error:
```
❌ ColourQuantizerTool error: TypeError: Cannot read properties of null (reading 'mode')
    at ToolBase._buildBlock (tool-base.js:535:38)
```

This occurred because ToolBase couldn't recognize `['adjustment-bundle', 'standard']` component type.

## The Root Cause

ToolBase uses a hardcoded `COMPONENT_TYPES` map to route config strings to ComponentLibrary classes:

```javascript
const COMPONENT_TYPES = {
    'slider': 'NumericInput',
    'dropdown': 'Dropdown',
    'button': 'Button',
    // ... but no 'adjustment-bundle'
};
```

When ToolBase encountered `['adjustment-bundle', 'standard', null, {...}]`, it:
1. Looked up `'adjustment-bundle'` in `COMPONENT_TYPES` → **not found**
2. Returned `null` from `_resolveComponentClass()`
3. Tried to read `null.mode` → **TypeError**

## The Solution - 3-Layer Integration

### Layer 1: ToolBase Registration

**File**: `assets/js/tools/core/tool-base.js`

**Change 1** - Add to `COMPONENT_TYPES` map:
```javascript
// Image Adjustment Bundles
'adjustment-bundle': 'AdjustmentBundle',
```

**Change 2** - Add case in `_parseComponentOptions`:
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

### Layer 2: ComponentLibrary Registration

**File**: `assets/js/shared/component-library.js`

**Change 1** - Import bundles:
```javascript
import {
    MinimalBundle,
    StandardBundle,
    ProfessionalBundle
} from './image-adjustments/index.js';
```

**Change 2** - Create factory class:
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

**Change 3** - Export to ComponentLibrary:
```javascript
// Image Adjustment Bundles
AdjustmentBundle,
MinimalBundle,
StandardBundle,
ProfessionalBundle
```

### Layer 3: Bundle Architecture (Already Complete)

**Files**:
- `assets/js/shared/image-adjustments/AdjustmentBundleBase.js`
- `assets/js/shared/image-adjustments/MinimalBundle.js`
- `assets/js/shared/image-adjustments/StandardBundle.js`
- `assets/js/shared/image-adjustments/ProfessionalBundle.js`
- `assets/js/shared/image-adjustments/SimpleCurveEditor.js`
- `assets/js/shared/image-adjustments/index.js`

All properly:
- Extend `BaseComponent`
- Call `super({ ...options, componentType: '...' }, deps)`
- Import from correct relative paths
- Use callbacks instead of `BaseComponent.emit()`

## The Flow - Config to Render

### Step 1: Tool Config
```javascript
// In colour-quantizer-toolbase.js sidebar config
['ADJUSTMENTS', [
    ['adjustment-bundle', 'standard', null, {
        key: 'imageAdjust',
        onChange: (adjustedImage, settings) => { ... },
        onTransform: (transformedImage, settings) => { ... }
    }]
]],
```

### Step 2: ToolBase Parsing
```javascript
// tool-base.js _buildComponent()
const [type, ...args] = def;  // type = 'adjustment-bundle'
const ComponentClass = this._resolveComponentClass(type);
```

### Step 3: Type Resolution
```javascript
// tool-base.js _resolveComponentClass()
const className = COMPONENT_TYPES['adjustment-bundle'];  // → 'AdjustmentBundle'
return getComponentClass('AdjustmentBundle', this.deps);
```

### Step 4: ComponentLibrary Lookup
```javascript
// tool-base.js getComponentClass()
const lib = deps.ComponentLibrary;
const result = lib['AdjustmentBundle'];  // → AdjustmentBundle class
return result;
```

### Step 5: Options Parsing
```javascript
// tool-base.js _parseComponentOptions()
switch (typeLower) {
    case 'adjustment-bundle':
        options = {
            bundleType: 'standard',       // args[0]
            key: 'imageAdjust',            // extraOptions.key
            onChange: (img, s) => {...},   // extraOptions.onChange
            onTransform: (img, s) => {...} // extraOptions.onTransform
        };
        break;
}
```

### Step 6: Component Instantiation
```javascript
// tool-base.js _buildComponent()
const component = new ComponentClass(options, this.deps);
// → new AdjustmentBundle({ bundleType: 'standard', ... }, deps)
```

### Step 7: Factory Routing
```javascript
// component-library.js AdjustmentBundle constructor
const BundleClass = bundles['standard'];  // → StandardBundle
return new BundleClass(options, deps);
```

### Step 8: Bundle Creation
```javascript
// StandardBundle.js constructor
super({ ...options, componentType: 'standard-bundle' }, deps);
// → Extends AdjustmentBundleBase → Extends BaseComponent
```

### Step 9: Render & Mount
```javascript
// tool-base.js _buildBlock()
const rendered = component.render();  // → Bundle renders UI
content.appendChild(rendered);        // → Added to sidebar
this.componentInstances.push(component);  // → Tracked for cleanup
```

### Step 10: Storage & Access
```javascript
// tool-base.js _buildComponent()
if (options.key) {
    this.components.set('imageAdjust', component);  // → Keyed storage
}

// Later in tool:
const bundle = tool.components.get('imageAdjust');
bundle.setImage(imageData);
```

## Lazy Loading

The system is lazy-loaded:
1. **ToolBase** loads on first tool page visit
2. **ComponentLibrary** loads with ToolBase
3. **Adjustment bundles** load when ComponentLibrary imports them
4. **Algorithms** load when bundles import them

No bundle code loads until a tool that uses `['adjustment-bundle']` is rendered.

## Following Site Standards

### ✅ BaseComponent Pattern
- All components extend `BaseComponent`
- Constructor: `constructor(options, deps)`
- Super: `super({ ...options, componentType }, deps)`

### ✅ Import Paths
- ES modules with relative paths
- No absolute paths
- Foundation: `../../foundation.js` from shared/image-adjustments/

### ✅ File Ownership
- Algorithms: `assets/js/shared/algorithms/image/`
- Components: `assets/js/shared/image-adjustments/`
- Tool integration: `assets/js/tools/processors/`

### ✅ No DOM Outside BaseComponent
- Bundles use `document.createElement` (allowed in BaseComponent subclasses)
- Tools use declarative config only

### ✅ Event System
- No `BaseComponent.emit()` calls
- Bundles use callbacks from options
- SimpleCurveEditor has internal event emitter

### ✅ Modular Architecture
- Algorithms: Pure functions
- Bundles: Stateful components
- Tools: Declarative config

## Testing Checklist

Open browser console and navigate to Colour Quantizer tool:

- [ ] No "Unknown component type: adjustment-bundle" warning
- [ ] No 500 server errors for bundle files
- [ ] No "Cannot read properties of null" errors
- [ ] Bundle UI renders in ADJUSTMENTS tab
- [ ] Sliders appear and are interactive
- [ ] Adjusting sliders updates preview
- [ ] Resize/rotate/flip apply correctly
- [ ] Reset button works
- [ ] No console errors on image load

## What Changed vs. What Stayed

### Changed (This Integration)
- ToolBase now recognizes `'adjustment-bundle'` type
- ComponentLibrary exports `AdjustmentBundle` factory
- Factory routes `bundleType` to correct bundle class

### Stayed the Same (Already Working)
- Bundle implementations (MinimalBundle, StandardBundle, ProfessionalBundle)
- Algorithm implementations
- BaseComponent architecture
- SimpleCurveEditor
- Tool configuration syntax (just added new type)

## Key Insight

**The bundles were already properly built following all site standards.**

The ONLY issue was that ToolBase didn't know about them - they weren't registered in the component routing system.

This is analogous to:
- Writing a function but not exporting it
- Creating a class but not importing it
- Building a tool but not adding it to `tools.json`

The fix was simple: **Register the type in ToolBase's routing map.**

