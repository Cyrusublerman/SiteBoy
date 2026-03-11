# Image Adjustment Component Bundle — Specification

**Purpose:** Reusable image preprocessing component for tool pages requiring sophisticated image preparation.

**Target:** Tools like ASCII Art Generator, Colour Quantizer, MFP, future image processors.

**Constraint:** Must comply with SiteBoy architecture (BaseComponent, VGA palette, F-system, algorithms library).

---

## 1. ANALYSIS: WHAT EXISTS

### Reference Tools Analysis

**colour3 (reference/tools/New folder/colour3/src/script.js):**
- ✅ Gamma (0.1-3.0, float precision)
- ✅ Contrast (0-200%, float)
- ✅ Saturation (0-200%, float)
- ✅ Combined adjustment pipeline (saturation → contrast → gamma)
- ✅ ITU-R BT.709 luma coefficients
- ✅ Eyedropper color picker
- ✅ Custom palette builder
- ❌ No brightness
- ❌ No hue rotation
- ❌ No curves/levels
- ❌ No resize

**dithermark (reference/tools/New folder/dithermark-master/):**
- Directory contains image-filters.js model (not accessible)
- Vue-based UI with extensive controls
- WebGL filters for performance
- Histogram visualisation
- Batch processing
- Multiple dithering algorithms

### Current Implementation

**Algorithms Library:**
- ✅ `applyGamma()`, `applyContrast()`, `applySaturation()` — image-adjustments.js
- ✅ 4 resize methods — image-resize.js (nearestNeighbor, blockAverage, blockMode, blockMedian)
- ✅ Posterization (11 variants) — posterization.js
- ✅ RGB/XYZ/LAB conversions — color-space.js
- ❌ Brightness — exists only as custom impl in ASCII tool
- ❌ Hue rotation — not implemented
- ❌ Temperature/tint — not implemented
- ❌ Curves/levels — not implemented
- ❌ Exposure — not implemented
- ❌ Vibrance — not implemented
- ❌ White balance — not implemented

**Tool Implementations:**
- ASCII Art: gamma, contrast, brightness (custom), saturation, edge detect, invert
- Colour Quantizer: gamma, contrast, saturation
- Both: Inconsistent UI patterns, duplicated logic

---

## 2. INDUSTRY STANDARD FEATURES

### Tier 1 — Essential (Must Have)

| Feature | Use Case | Precision | Range |
|---------|----------|-----------|-------|
| **Brightness** | Shift all tones up/down | Float | -100 to +100 (additive offset) |
| **Contrast** | Expand/compress tonal range | Float | 0 to 2.0 (1.0 = neutral) |
| **Gamma** | Mid-tone adjustment | Float | 0.2 to 3.0 (1.0 = neutral) |
| **Saturation** | Color intensity | Float | 0 to 2.0 (1.0 = neutral, 0 = grayscale) |
| **Hue Rotation** | Shift colors around wheel | Float | -180° to +180° (0° = neutral) |

### Tier 2 — Professional (Should Have)

| Feature | Use Case | Precision | Range |
|---------|----------|-----------|-------|
| **Exposure** | EV stops (photographic) | Float | -3 to +3 stops |
| **Curves** | Custom tonal mapping | Bezier curve | Input/output 0-255 |
| **Levels** | Black/white/mid points | Float | Black: 0-255, White: 0-255, Mid: 0.1-9.9 |
| **Vibrance** | Saturation without skin tones | Float | 0 to 2.0 |
| **Temperature** | Warm/cool color cast | Float | 2000K to 10000K (or -100 to +100) |
| **Tint** | Magenta/green shift | Float | -100 to +100 |

### Tier 3 — Advanced (Nice to Have)

| Feature | Use Case | Precision | Range |
|---------|----------|-----------|-------|
| **Shadows** | Lift/crush shadow detail | Float | -100 to +100 |
| **Highlights** | Recover/clip highlights | Float | -100 to +100 |
| **Clarity** | Mid-tone contrast | Float | -100 to +100 |
| **Sharpen** | Edge enhancement | Float | 0 to 100 (amount) |
| **Denoise** | Remove sensor/compression noise | Float | 0 to 100 (strength) |

### Geometric Operations

| Feature | Use Case | Options |
|---------|----------|---------|
| **Resize** | Proportional scaling | 2×, 4×, 8×, ½, ¼, ⅛, custom (lock aspect) |
| **Resampling** | Quality control | Nearest, Bilinear, Bicubic, Lanczos |
| **Crop** | Remove unwanted areas | Freeform, aspect ratios (1:1, 4:3, 16:9, A4) |
| **Rotate** | Straighten/orient | 90° CW/CCW, 180°, arbitrary angle |
| **Flip** | Mirror | Horizontal, Vertical |

---

## 3. PROPOSED COMPONENT BUNDLE

### 3.1 Architecture

**Two-Part System:**

1. **Algorithms Library** (`assets/js/shared/algorithms/image/`)
   - Pure functions
   - High precision (Float32Array intermediate values)
   - Proper source citations
   - Tested mathematical implementations

2. **UI Component** (`assets/js/shared/component-library.js` or new module)
   - Extends BaseComponent
   - Uses ToolBase controls (sliders, toggles, buttons)
   - Declarative configuration
   - Real-time preview
   - Non-destructive (undo stack)

### 3.2 Component: ImageAdjustmentPanel

**Props:**
```javascript
{
    imageData: ImageData,           // Source image
    onChange: (adjustedImage, settings) => {},  // Callback with result
    collapsed: false,               // Start collapsed/expanded
    showPreview: true,             // Side-by-side preview
    enabledAdjustments: [          // Which features to show
        'brightness', 'contrast', 'gamma', 'saturation', 'hue',
        'exposure', 'curves', 'levels', 'vibrance', 'temperature',
        'resize', 'crop', 'rotate', 'flip'
    ]
}
```

**UI Structure:**
```
┌─ IMAGE ADJUSTMENTS ────────────────────────┐
│ ┌─ TONE ─────────────────────────────────┐ │
│ │ [Brightness] ●────────● -100 to +100   │ │
│ │ [Contrast]   ●────────● 0 to 2.0       │ │
│ │ [Gamma]      ●────────● 0.2 to 3.0     │ │
│ │ [Exposure]   ●────────● -3 to +3 EV    │ │
│ └────────────────────────────────────────┘ │
│ ┌─ COLOR ────────────────────────────────┐ │
│ │ [Saturation] ●────────● 0 to 2.0       │ │
│ │ [Vibrance]   ●────────● 0 to 2.0       │ │
│ │ [Hue]        ●────────● -180° to +180° │ │
│ │ [Temp]       ●────────● 2000K to 10000K│ │
│ │ [Tint]       ●────────● -100 to +100   │ │
│ └────────────────────────────────────────┘ │
│ ┌─ CURVES ───────────────────────────────┐ │
│ │ [RGB ▼] [Reset Curve]                  │ │
│ │ ┌─────────────────────────────────┐    │ │
│ │ │   Output                        │    │ │
│ │ │ 255├─────────────────╱          │    │ │
│ │ │    │               ╱            │    │ │
│ │ │    │             ╱              │    │ │
│ │ │  0 └───────────╱────────► Input │    │ │
│ │ │     0                      255  │    │ │
│ │ └─────────────────────────────────┘    │ │
│ └────────────────────────────────────────┘ │
│ ┌─ LEVELS ───────────────────────────────┐ │
│ │ Black Point:  [▸─────────] 0           │ │
│ │ Mid Point:    [────▸─────] 1.0         │ │
│ │ White Point:  [─────────◂] 255         │ │
│ │ [Histogram]                            │ │
│ └────────────────────────────────────────┘ │
│ ┌─ TRANSFORM ────────────────────────────┐ │
│ │ Resize: [2× ▼] [Lock Aspect ☑]        │ │
│ │ Method: [Bicubic ▼]                    │ │
│ │ Rotate: [⟲ 90°] [⟳ 90°] [180°]        │ │
│ │ Flip:   [↔ H] [↕ V]                    │ │
│ └────────────────────────────────────────┘ │
│ [Reset All] [Undo] [Apply]                 │
└────────────────────────────────────────────┘
```

### 3.3 Algorithm Library Extensions

**New functions to implement in `assets/js/shared/algorithms/image/image-adjustments.js`:**

```javascript
/**
 * Apply brightness adjustment (additive offset)
 * @param {ImageData} imageData
 * @param {number} brightness - Offset value (-100 to +100)
 * @returns {ImageData}
 * @formula output = clamp(input + brightness)
 */
export function applyBrightness(imageData, brightness) { ... }

/**
 * Apply exposure adjustment (EV stops, multiplicative)
 * @param {ImageData} imageData
 * @param {number} exposure - EV stops (-3 to +3)
 * @returns {ImageData}
 * @formula output = input × 2^exposure
 */
export function applyExposure(imageData, exposure) { ... }

/**
 * Apply hue rotation
 * @param {ImageData} imageData
 * @param {number} hue - Degrees (-180 to +180)
 * @returns {ImageData}
 * @formula HSL rotation
 */
export function applyHueRotation(imageData, hue) { ... }

/**
 * Apply vibrance (saturation without oversaturating)
 * @param {ImageData} imageData
 * @param {number} vibrance - Multiplier (0 to 2)
 * @returns {ImageData}
 * @formula Selective saturation boost
 */
export function applyVibrance(imageData, vibrance) { ... }

/**
 * Apply color temperature adjustment
 * @param {ImageData} imageData
 * @param {number} temperature - Kelvin (2000-10000) or normalized (-1 to +1)
 * @returns {ImageData}
 * @formula Color temperature LUT or channel shift
 */
export function applyTemperature(imageData, temperature) { ... }

/**
 * Apply tint adjustment (magenta/green shift)
 * @param {ImageData} imageData
 * @param {number} tint - Shift amount (-100 to +100)
 * @returns {ImageData}
 */
export function applyTint(imageData, tint) { ... }

/**
 * Invert colors
 * @param {ImageData} imageData
 * @returns {ImageData}
 * @formula output = 255 - input
 */
export function invertImage(imageData) { ... }

/**
 * Apply tone curve mapping
 * @param {ImageData} imageData
 * @param {number[]} curve - 256-entry LUT or control points
 * @param {string} channel - 'rgb', 'r', 'g', 'b', 'luminance'
 * @returns {ImageData}
 */
export function applyCurve(imageData, curve, channel = 'rgb') { ... }

/**
 * Apply levels adjustment
 * @param {ImageData} imageData
 * @param {Object} levels - {black, mid, white}
 * @returns {ImageData}
 * @formula Map [black, white] → [0, 255] with gamma mid-point
 */
export function applyLevels(imageData, levels) { ... }

/**
 * Apply shadows/highlights adjustment
 * @param {ImageData} imageData
 * @param {number} shadows - Amount (-100 to +100)
 * @param {number} highlights - Amount (-100 to +100)
 * @returns {ImageData}
 */
export function applyShadowsHighlights(imageData, shadows, highlights) { ... }

/**
 * Combined pipeline with all adjustments
 * @param {ImageData} imageData
 * @param {Object} adjustments - All adjustment parameters
 * @returns {ImageData}
 */
export function applyAllAdjustments(imageData, adjustments) {
    // Order: levels → exposure → brightness → contrast → gamma →
    //        temperature → tint → hue → saturation → vibrance →
    //        shadows/highlights → curves
    // (Order matters for quality/clipping)
}
```

**New file: `assets/js/shared/algorithms/image/image-resize-advanced.js`:**

```javascript
/**
 * Bilinear interpolation resize
 * @source Standard interpolation algorithms
 */
export function bilinearResize(imageData, targetWidth, targetHeight) { ... }

/**
 * Bicubic interpolation resize
 * @source Catmull-Rom or Mitchell-Netravali filters
 */
export function bicubicResize(imageData, targetWidth, targetHeight) { ... }

/**
 * Lanczos-3 resize (high quality)
 * @source Lanczos resampling
 */
export function lanczosResize(imageData, targetWidth, targetHeight, a = 3) { ... }

/**
 * Proportional resize with aspect ratio lock
 * @param {ImageData} imageData
 * @param {Object} options - {scale?, width?, height?, method, lockAspect}
 * @returns {ImageData}
 */
export function proportionalResize(imageData, options) {
    const { scale, width, height, method = 'bicubic', lockAspect = true } = options;
    // Calculate target dimensions
    // Call appropriate resize method
}
```

**New file: `assets/js/shared/algorithms/image/image-transforms.js`:**

```javascript
/**
 * Rotate image by 90° increments
 */
export function rotate90(imageData, times = 1) { ... }

/**
 * Rotate image by arbitrary angle
 */
export function rotateArbitrary(imageData, angleDegrees, fillColor = [0,0,0,0]) { ... }

/**
 * Flip image horizontally
 */
export function flipHorizontal(imageData) { ... }

/**
 * Flip image vertically
 */
export function flipVertical(imageData) { ... }

/**
 * Crop image
 */
export function crop(imageData, x, y, width, height) { ... }
```

---

## 4. IMPLEMENTATION STRATEGY

### Phase 1: Core Algorithms (Priority)

**Implement missing Tier 1 features:**
1. ✅ Brightness (additive)
2. ✅ Hue rotation (HSL/HSV space)
3. ✅ Invert
4. ✅ Exposure (multiplicative, EV stops)

**Rationale:** These are essential and currently have custom implementations scattered across tools.

### Phase 2: Resize & Transform

**Implement geometric operations:**
1. ✅ Bilinear/bicubic resize
2. ✅ Proportional resize helpers (2×, ½, etc.)
3. ✅ Rotate (90°, arbitrary)
4. ✅ Flip (H/V)
5. ✅ Crop

**Rationale:** Frequently needed for image prep before processing.

### Phase 3: Professional Controls

**Implement Tier 2 features:**
1. ✅ Curves (tone mapping)
2. ✅ Levels (black/white/mid points)
3. ✅ Vibrance
4. ✅ Temperature & Tint
5. ✅ Shadows/Highlights

**Rationale:** Required for professional-grade color correction.

### Phase 4: UI Component

**Build reusable component:**
1. ✅ Create `ImageAdjustmentPanel` extending BaseComponent
2. ✅ Integrate with ToolBase control system
3. ✅ Real-time preview with debouncing
4. ✅ Non-destructive editing (undo stack)
5. ✅ Preset system (save/load adjustment settings)

### Phase 5: Integration & Refactor

**Update existing tools:**
1. ✅ Refactor ASCII Art Generator to use new component
2. ✅ Refactor Colour Quantizer to use new component
3. ✅ Remove custom implementations
4. ✅ Archive legacy code

---

## 5. UI/UX SPECIFICATIONS

### Control Types

| Adjustment | Control | Display Format |
|------------|---------|----------------|
| Brightness | Slider | -100 to +100 (integer) |
| Contrast | Slider | 0.00 to 2.00 (2 decimals) |
| Gamma | Slider | 0.20 to 3.00 (2 decimals) |
| Exposure | Slider | -3.0 to +3.0 EV (1 decimal) |
| Saturation | Slider | 0.00 to 2.00 (2 decimals) |
| Vibrance | Slider | 0.00 to 2.00 (2 decimals) |
| Hue | Slider | -180° to +180° (integer) |
| Temperature | Slider | 2000K to 10000K or -100 to +100 |
| Tint | Slider | -100 to +100 (integer) |
| Resize | Dropdown + Input | Presets (2×, ½, etc.) + Custom |
| Method | Dropdown | Nearest, Bilinear, Bicubic, Lanczos |
| Rotate | Button Group | 90° CW/CCW, 180°, Custom |
| Flip | Button Group | Horizontal, Vertical |
| Curves | Interactive Canvas | Click to add points, drag to adjust |
| Levels | Triple Slider + Histogram | Black/Mid/White points |

### Layout Principles

1. **Collapsible Sections** — Group related controls (Tone, Color, Transform)
2. **Live Preview** — Debounced real-time feedback (100-200ms delay)
3. **Reset Buttons** — Per-section and global reset
4. **Presets** — Save/load common adjustment combinations
5. **Before/After Toggle** — Quick comparison (spacebar to toggle)
6. **Histogram Overlay** — Show tonal distribution during adjustment
7. **VGA Styling** — Use var(--vga-*) colors, Space Mono/Atkinson font

### Performance Considerations

1. **Debouncing** — Don't reprocess on every slider tick
2. **Worker Threads** — Offload heavy computation (resize, curves) to Web Workers
3. **Progressive Rendering** — Show low-res preview first, then full quality
4. **Caching** — Cache intermediate results (e.g., after levels, before curves)
5. **Canvas Reuse** — Don't create new ImageData unless necessary

---

## 6. CONFIGURATION EXAMPLES

### Minimal Setup (Just Tone)

```javascript
const adjuster = new ImageAdjustmentPanel({
    imageData: myImage,
    enabledAdjustments: ['brightness', 'contrast', 'gamma'],
    onChange: (adjusted, settings) => {
        renderToCanvas(adjusted);
    }
});
```

### Full-Featured Setup

```javascript
const adjuster = new ImageAdjustmentPanel({
    imageData: myImage,
    enabledAdjustments: [
        'brightness', 'contrast', 'gamma', 'exposure',
        'saturation', 'vibrance', 'hue',
        'temperature', 'tint',
        'curves', 'levels',
        'shadows', 'highlights',
        'resize', 'rotate', 'flip', 'crop'
    ],
    showPreview: true,
    collapsed: false,
    presets: [
        { name: 'High Contrast B&W', settings: { saturation: 0, contrast: 1.5, gamma: 1.2 } },
        { name: 'Warm Vintage', settings: { temperature: 7000, saturation: 0.8, gamma: 0.9 } }
    ],
    onChange: (adjusted, settings) => {
        currentImage = adjusted;
        saveSettings(settings);
    }
});
```

### Integration into Tool

```javascript
export const TOOL_CONFIG = {
    title: 'MY IMAGE TOOL',
    sidebar: [
        ['INPUT', [
            ['Source', [
                ['file', 'Upload Image', 'image/*', { key: 'imageFile' }],
            ]],
            // Use the component here
            ['image-adjuster', null, null, {
                key: 'imageAdjuster',
                enabled: ['brightness', 'contrast', 'gamma', 'saturation', 'hue']
            }],
        ]],
        // ... rest of tool config
    ],
    onUpdate: function(key, value, allValues) {
        if (key === 'imageAdjuster') {
            // value contains adjusted ImageData + settings
            processAdjustedImage(value.imageData);
        }
    }
};
```

---

## 7. TESTING REQUIREMENTS

### Unit Tests (Algorithms)

```javascript
describe('Image Adjustments', () => {
    test('applyBrightness(+50) increases all pixels by 50', () => { ... });
    test('applyBrightness clamps to [0, 255]', () => { ... });
    test('applyHueRotation(180°) inverts hue', () => { ... });
    test('applyExposure(+1) doubles brightness', () => { ... });
    test('applyLevels remaps black/white points', () => { ... });
    test('applyCurve maps values correctly', () => { ... });
    test('proportionalResize(2×) doubles dimensions', () => { ... });
    test('proportionalResize maintains aspect ratio', () => { ... });
});
```

### Integration Tests (Component)

```javascript
describe('ImageAdjustmentPanel', () => {
    test('renders enabled adjustments only', () => { ... });
    test('onChange fires with adjusted ImageData', () => { ... });
    test('reset button restores defaults', () => { ... });
    test('preset applies all settings', () => { ... });
    test('undo reverts to previous state', () => { ... });
});
```

### Visual Regression Tests

- Compare output of known adjustments against reference images
- Ensure VGA styling compliance
- Test on different canvas sizes

---

## 8. DOCUMENTATION REQUIREMENTS

### Algorithm Documentation

Each function must include:
- `@source` — Reference documentation file path
- `@wikipedia` — Link to Wikipedia article
- `@formula` — LaTeX formula
- `@example` — Usage example
- `@param` — Parameter descriptions with types/ranges
- `@returns` — Return value description

### Component Documentation

- Props table with types, defaults, descriptions
- Usage examples (minimal, typical, advanced)
- Performance notes
- Browser compatibility
- Known limitations

---

## 9. OPEN QUESTIONS

1. **Histogram Display:** Implement as separate component or integrate into ImageAdjustmentPanel?
2. **Undo Stack Size:** How many undo steps? (Suggest: 10-20)
3. **Preset Storage:** LocalStorage? JSON export/import? Both?
4. **Curve Editor:** Click-to-add points vs. predefined control points?
5. **Worker Threads:** Always use workers, or only for large images? (Threshold: 1024×1024?)
6. **Color Space:** All adjustments in RGB, or convert to LAB for perceptual operations?
7. **Bit Depth:** Work in Uint8ClampedArray or Float32Array internally? (Trade-off: precision vs. memory/speed)
8. **Non-destructive:** Store adjustment stack or only final settings?

---

## 10. PRIORITY MATRIX

| Feature | Tier | Effort | Impact | Priority Score |
|---------|------|--------|--------|----------------|
| Brightness | 1 | Low | High | **9** |
| Hue Rotation | 1 | Low | High | **9** |
| Invert | 1 | Low | Medium | **7** |
| Exposure | 2 | Low | High | **8** |
| Proportional Resize | 1 | Medium | High | **8** |
| Curves | 2 | High | Very High | **8** |
| Levels | 2 | Medium | High | **7** |
| Vibrance | 2 | Medium | Medium | **6** |
| Temperature/Tint | 2 | Medium | Medium | **6** |
| Bicubic Resize | 2 | High | Medium | **5** |
| Shadows/Highlights | 3 | High | Medium | **5** |
| Crop Tool | 2 | Medium | Medium | **5** |
| Rotate Arbitrary | 3 | High | Low | **3** |
| Sharpen/Denoise | 3 | Very High | Low | **2** |

**Recommendation:** Implement in this order:
1. Brightness, Hue, Invert (Quick wins)
2. Exposure, Proportional Resize, Levels
3. Curves, Vibrance, Temperature/Tint
4. Advanced features as needed

---

## 11. SUCCESS CRITERIA

Component is successful if:
- ✅ All Tier 1 adjustments implemented with <5% error vs. reference
- ✅ Real-time preview at 30+ FPS for images up to 2048×2048
- ✅ Used in 3+ tools (ASCII, Colour Quantizer, MFP, +1 new tool)
- ✅ Zero inline styles (all VGA CSS variables)
- ✅ Zero manual DOM manipulation outside BaseComponent
- ✅ 100% test coverage for algorithms
- ✅ Complete JSDoc with @source citations
- ✅ User can save/load presets
- ✅ Non-destructive editing with undo (10+ steps)
- ✅ Works on mobile (touch-friendly sliders)

---

## APPENDIX A: MATHEMATICAL FORMULAS

### Brightness
```
output = clamp(input + brightness, 0, 255)
```

### Exposure (EV Stops)
```
output = clamp(input × 2^exposure, 0, 255)
```

### Contrast
```
output = clamp(((input/255 - 0.5) × contrast + 0.5) × 255, 0, 255)
```

### Gamma
```
output = clamp((input/255)^(1/γ) × 255, 0, 255)
```

### Saturation
```
gray = 0.2126×R + 0.7152×G + 0.0722×B  (ITU-R BT.709)
output = clamp(gray + saturation × (input - gray), 0, 255)
```

### Hue Rotation (HSL Space)
```
RGB → HSL
H' = (H + hue) mod 360°
HSL → RGB
```

### Levels
```
normalized = (input - black) / (white - black)
gamma_adjusted = normalized^(1/mid)
output = clamp(gamma_adjusted × 255, 0, 255)
```

### Vibrance (Selective Saturation)
```
// Boost low-saturation pixels more than high-saturation
current_sat = max(R,G,B) - min(R,G,B)
boost = vibrance × (1 - current_sat/255)
apply saturation boost
```

### Color Temperature (Simplified)
```
// Shift blue/orange balance
if temp > neutral:
    R *= temp_factor
    B /= temp_factor
else:
    R /= temp_factor
    B *= temp_factor
```

---

## APPENDIX B: REFERENCE IMPLEMENTATIONS

**Python (Pillow ImageEnhance):**
- Brightness: `PIL.ImageEnhance.Brightness(image).enhance(factor)`
- Contrast: `PIL.ImageEnhance.Contrast(image).enhance(factor)`
- Color (Saturation): `PIL.ImageEnhance.Color(image).enhance(factor)`

**OpenCV (cv2):**
- Brightness: `cv2.convertScaleAbs(img, alpha=1.0, beta=brightness)`
- Gamma: `img_corrected = 255 * (img / 255) ** (1/gamma)`
- Hue: `cv2.cvtColor(img, cv2.COLOR_BGR2HSV)` then shift H channel

**Web APIs:**
- Canvas Filters: `ctx.filter = 'brightness(1.2) contrast(1.5) saturate(1.3)'`
  - Note: Not pixel-perfect, browser-dependent, limited control

**Our Implementation Should:**
- Match Pillow/OpenCV precision (within 1-2 gray levels)
- Provide more control than canvas filters
- Work with Float32Array for intermediate precision
- Support chaining without cumulative rounding errors

