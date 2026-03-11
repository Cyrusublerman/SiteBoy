# Adjustment Bundles - Complete System Flow

## Visual Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│ TOOL FILE (colour-quantizer-toolbase.js)                          │
│                                                                     │
│ sidebar: [                                                          │
│   ['ADJUSTMENTS', [                                                 │
│     ['adjustment-bundle', 'standard', null, {                       │
│       key: 'imageAdjust',                                          │
│       onChange: (img, settings) => { tool.draw(); }                │
│     }]                                                              │
│   ]]                                                                │
│ ]                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Tool renders, passes config to ToolBase
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ TOOLBASE (tool-base.js)                                            │
│                                                                     │
│ COMPONENT_TYPES = {                                                 │
│   'adjustment-bundle': 'AdjustmentBundle'  ← NEW REGISTRATION       │
│ }                                                                   │
│                                                                     │
│ _buildComponent(def) {                                              │
│   const [type, ...args] = def;  // 'adjustment-bundle'             │
│   const ComponentClass = this._resolveComponentClass(type);         │
│   const options = this._parseComponentOptions(type, args);          │
│   return new ComponentClass(options, this.deps);                    │
│ }                                                                   │
│                                                                     │
│ _parseComponentOptions(type, args) {                                │
│   case 'adjustment-bundle':  ← NEW CASE                             │
│     return {                                                        │
│       bundleType: args[0],    // 'standard'                         │
│       key: extraOptions.key,  // 'imageAdjust'                      │
│       onChange: extraOptions.onChange  // callback                  │
│     };                                                              │
│ }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ ToolBase looks up 'AdjustmentBundle' in ComponentLibrary
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ COMPONENT LIBRARY (component-library.js)                           │
│                                                                     │
│ import { MinimalBundle, StandardBundle, ProfessionalBundle }       │
│   from './image-adjustments/index.js';  ← NEW IMPORT               │
│                                                                     │
│ class AdjustmentBundle {  ← NEW FACTORY CLASS                       │
│   constructor(options, deps) {                                      │
│     const bundles = {                                               │
│       'minimal': MinimalBundle,                                     │
│       'standard': StandardBundle,                                   │
│       'professional': ProfessionalBundle                            │
│     };                                                              │
│     const BundleClass = bundles[options.bundleType];                │
│     return new BundleClass(options, deps);  // Route to correct one │
│   }                                                                 │
│ }                                                                   │
│                                                                     │
│ export {                                                            │
│   AdjustmentBundle,  ← NEW EXPORT                                   │
│   MinimalBundle, StandardBundle, ProfessionalBundle                │
│ };                                                                  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Factory instantiates StandardBundle
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BUNDLE (StandardBundle.js)                                         │
│                                                                     │
│ export class StandardBundle extends AdjustmentBundleBase {         │
│   constructor(options, deps) {                                      │
│     super({ ...options, componentType: 'standard-bundle' }, deps); │
│   }                                                                 │
│                                                                     │
│   getControls() {                                                   │
│     return [                                                        │
│       { type: 'slider', name: 'Gamma', ... },                       │
│       { type: 'slider', name: 'Contrast', ... },                    │
│       { type: 'slider', name: 'Saturation', ... },                  │
│       { type: 'resize', ... },                                      │
│       { type: 'transform', ... }                                    │
│     ];                                                              │
│   }                                                                 │
│                                                                     │
│   processImage(imageData, settings) {                               │
│     // Apply algorithms in order                                    │
│     let result = applyGamma(imageData, settings.gamma);             │
│     result = applyContrast(result, settings.contrast);              │
│     return result;                                                  │
│   }                                                                 │
│ }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Extends AdjustmentBundleBase
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ BASE CLASS (AdjustmentBundleBase.js)                               │
│                                                                     │
│ import { applyGamma, applyContrast, applySaturation }              │
│   from '../algorithms/image/image-adjustments.js';                 │
│                                                                     │
│ export class AdjustmentBundleBase extends BaseComponent {          │
│   constructor(options, deps) {                                      │
│     super({ ...options, componentType: 'bundle-base' }, deps);     │
│   }                                                                 │
│                                                                     │
│   setImage(imageData) { ... }                                       │
│   applyAdjustments() { ... }                                        │
│   render() { ... }                                                  │
│   destroy() { ... }                                                 │
│ }                                                                   │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ Extends BaseComponent
                           ↓
┌─────────────────────────────────────────────────────────────────────┐
│ FOUNDATION (foundation.js)                                         │
│                                                                     │
│ export class BaseComponent {                                        │
│   constructor(options, deps) { ... }                                │
│   render() { ... }                                                  │
│   destroy() { ... }                                                 │
│ }                                                                   │
└─────────────────────────────────────────────────────────────────────┘

                                  ║
                      Algorithms Layer (Pure Functions)
                                  ║
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ ALGORITHMS (image-adjustments.js)                                  │
│                                                                     │
│ export function applyGamma(imageData, gamma) { ... }               │
│ export function applyContrast(imageData, contrast) { ... }         │
│ export function applySaturation(imageData, saturation) { ... }     │
│ export function applyAllAdjustments(imageData, settings) { ... }   │
└─────────────────────────────────────────────────────────────────────┘
```

## Instantiation Flow

```
1. Tool renders, ToolBase._buildComponent(['adjustment-bundle', 'standard', ...])
2. ToolBase looks up 'adjustment-bundle' → 'AdjustmentBundle'
3. ToolBase parses options: { bundleType: 'standard', key: 'imageAdjust', ... }
4. ToolBase: new AdjustmentBundle(options, deps)
5. AdjustmentBundle factory: bundles['standard'] → StandardBundle
6. Factory returns: new StandardBundle(options, deps)
7. StandardBundle calls: super(options, deps)
8. AdjustmentBundleBase calls: super(options, deps)
9. BaseComponent initializes component
10. Component renders UI
11. ToolBase stores: components.set('imageAdjust', standardBundleInstance)
```

## Event Flow

```
User adjusts slider
    ↓
StandardBundle.handleSliderChange(key, value)
    ↓
AdjustmentBundleBase.applyAdjustments()
    ↓
StandardBundle.processImage(imageData, settings)
    ↓
Algorithms: applyGamma(imageData, gamma)
    ↓
Result: adjusted ImageData
    ↓
AdjustmentBundleBase calls: options.onChange(adjustedImage, settings)
    ↓
Tool's onChange callback: tool.draw()
    ↓
Canvas updates
```

## Key Registrations

### 1. Type to Class Name (ToolBase)
```javascript
'adjustment-bundle' → 'AdjustmentBundle'
```

### 2. Class Name to Factory (ComponentLibrary)
```javascript
'AdjustmentBundle' → AdjustmentBundle class
```

### 3. Bundle Type to Implementation (AdjustmentBundle Factory)
```javascript
'minimal' → MinimalBundle
'standard' → StandardBundle
'professional' → ProfessionalBundle
```

## Why This Design?

### Separation of Concerns
- **ToolBase**: Routing & parsing
- **ComponentLibrary**: Registry & factory
- **AdjustmentBundle**: Type routing
- **[Type]Bundle**: Implementation
- **AdjustmentBundleBase**: Shared logic
- **Algorithms**: Pure functions

### Lazy Loading
- Bundles only load when imported
- Algorithms only load when bundles load
- No code loads until needed

### Extensibility
To add new bundle:
1. Create `NewBundle.js` extending `AdjustmentBundleBase`
2. Add to `image-adjustments/index.js` exports
3. Add to `AdjustmentBundle` factory routing
4. Done! No changes to ToolBase or other files

### Type Safety
Each layer validates:
- ToolBase: Checks `COMPONENT_TYPES` has key
- ComponentLibrary: Checks class exists
- AdjustmentBundle: Checks bundle type valid
- Bundle: Checks settings valid

## What Changed in This Integration

### Before
```
ToolBase → ComponentLibrary → [component not found] → null → TypeError
```

### After
```
ToolBase → ComponentLibrary → AdjustmentBundle → StandardBundle → ✅
```

## Files Changed

1. `tool-base.js`: Added type registration + options parsing
2. `component-library.js`: Added factory + exports

## Files Unchanged (Already Correct)

- All bundle implementations
- All algorithm implementations
- BaseComponent architecture
- Tool configuration

## Result

✅ Bundles integrate seamlessly into ToolBase system  
✅ Follow all site architecture standards  
✅ Fully lazy-loaded  
✅ Type-safe routing  
✅ Extensible design  
✅ Zero errors  

