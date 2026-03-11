# Colour Quantizer — Palette System Architecture

**Date:** 2026-01-19  
**Status:** Planning  

---

## Current State

### Current Storage
Palettes are **hardcoded inline** in three locations:
1. `assets/js/tools/processors/colour-quantizer-toolbase.js` (lines 99-109) - **PRIMARY**
2. `assets/js/tools/processors/color-quantizer.js` (lines 23-34) - old version
3. `assets/js/tools/generators/unified-pattern.js` (lines 50-60) - duplicated for reuse

**Problem:** Duplicate definitions violate SSoT (Single Source of Truth)

### Current Palettes (9 total)
1. **1-bit** - Black/White (2 colours)
2. **2-bit** - 4 greys (4 colours)
3. **3-bit** - RGB primaries (8 colours)
4. **3-bit-gray** - 8 grey shades (8 colours)
5. **nes** - NES console (16 colours)
6. **gameboy** - Game Boy LCD (4 colours)
7. **primaries** - Pure RGB + B/W (5 colours)
8. **pastel** - Soft pastels (6 colours)
9. **ggost** - Custom artistic (17 colours)

---

## Proposed Architecture

### Folder Structure
```
assets/js/shared/data/
├── palettes/
│   ├── technical.js          ← Quantized/algorithmic palettes
│   ├── artistic.js            ← Dithermark's 30 palettes
│   ├── retro.js               ← Hardware palettes (NES, GB, etc.)
│   ├── generators.js          ← Functions to generate palettes
│   └── index.js               ← Central export
└── index.js                   ← Export all data modules
```

### Why `assets/js/shared/data/`?
- **Shared across tools** - Multiple tools can use palettes
- **Not algorithms** - Data, not processing logic
- **Parallel to algorithms/** - Clean separation
- **Follows SiteBoy architecture** - Data vs logic separation

---

## Technical Palettes — Expanded List

### 1. **Bit-Depth Quantized** (Current)
Already implemented:
- 1-bit (2 colours)
- 2-bit (4 colours)
- 3-bit (8 colours)

### 2. **RGB Quantized** (NEW)
Uniform quantization of RGB cube:

**RGB 5-bit (32 colours)**
```javascript
// 2 levels per channel: 2³ = 8 colours
['#000000', '#0000FF', '#00FF00', '#00FFFF', '#FF0000', '#FF00FF', '#FFFF00', '#FFFFFF']
```

**RGB 6-bit (64 colours)**
```javascript
// 4 levels per channel: 4³ = 64 colours
// R: [0, 85, 170, 255]
// G: [0, 85, 170, 255]
// B: [0, 85, 170, 255]
// Generated algorithmically
```

**RGB 8-bit Web Safe (216 colours)**
```javascript
// 6 levels per channel: 6³ = 216 colours
// R: [0, 51, 102, 153, 204, 255]
// G: [0, 51, 102, 153, 204, 255]
// B: [0, 51, 102, 153, 204, 255]
// Classic "web safe" palette from 256-colour era
```

### 3. **HSL/HSV Quantized** (NEW)
Uniform quantization in perceptual space:

**HSL 8-colour**
```javascript
// 8 hues at 100% saturation, 50% lightness
// H: [0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°]
// Plus black/white
```

**HSL 12-colour (Colour Wheel)**
```javascript
// 12 hues (30° intervals)
// Classic artist's colour wheel
// H: [0°, 30°, 60°, ..., 330°]
```

**HSL Grayscale Ramps**
```javascript
// N steps from black to white in HSL space
// More perceptually uniform than RGB grayscale
```

### 4. **LAB Quantized** (NEW)
Most perceptually uniform:

**LAB 8-colour**
```javascript
// Octahedral sampling of LAB space
// Ensures equal perceptual distance
```

**LAB 16-colour**
```javascript
// 16 evenly-spaced colours in LAB
// Maximum perceptual distinction
```

### 5. **Grayscale Variations** (NEW)
Different grayscale generation methods:

**Linear Grayscale (N steps)**
```javascript
// Equal RGB steps: [0, 36, 73, 109, 146, 182, 219, 255]
```

**Perceptual Grayscale (N steps)**
```javascript
// Equal perceived brightness steps (gamma-corrected)
// Uses luminance formula: 0.2126*R + 0.7152*G + 0.0722*B
```

**Logarithmic Grayscale (N steps)**
```javascript
// Logarithmic spacing (more darks, fewer lights)
// Better for low-light images
```

### 6. **Temperature Ramps** (NEW)
Colour temperature palettes:

**Warm to Cool (8 colours)**
```javascript
// Orange → Yellow → Green → Cyan → Blue
```

**Blackbody Radiation (6 colours)**
```javascript
// Red-hot → White-hot → Blue-hot
// Based on Planck's law
```

### 7. **Scientific Palettes** (NEW)
Common in data visualization:

**Viridis (8 colours)**
```javascript
// Perceptually uniform, colourblind-safe
['#440154', '#31688e', '#35b779', '#fde724', ...]
```

**Plasma (8 colours)**
```javascript
// High-contrast, vibrant
['#0d0887', '#7e03a8', '#cc4778', '#f89540', '#f0f921']
```

**Inferno (8 colours)**
```javascript
// Dark to bright, warm palette
['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4']
```

### 8. **Monochrome Tints** (NEW)
Single-hue variations:

**Red Tints (8)**
```javascript
// Black → Dark Red → Bright Red → Pink → White
```

**Blue Tints (8)**
```javascript
// Black → Navy → Royal Blue → Sky Blue → White
```

**Green Tints (8)**
```javascript
// Black → Dark Green → Lime → Mint → White
```

---

## Palette Generators

### Dynamic Generation Functions

```javascript
// assets/js/shared/data/palettes/generators.js

/**
 * Generate uniformly quantized RGB palette
 * @param {number} bitsPerChannel - 1-8 bits per channel
 * @returns {string[]} Array of hex colours
 */
function generateRGBQuantized(bitsPerChannel) {
    const levels = Math.pow(2, bitsPerChannel);
    const step = 255 / (levels - 1);
    const colours = [];
    
    for (let r = 0; r < levels; r++) {
        for (let g = 0; g < levels; g++) {
            for (let b = 0; b < levels; b++) {
                const rVal = Math.round(r * step);
                const gVal = Math.round(g * step);
                const bVal = Math.round(b * step);
                colours.push(rgbToHex(rVal, gVal, bVal));
            }
        }
    }
    
    return colours;
}

/**
 * Generate HSL palette with N hues
 * @param {number} numHues - Number of hues (3-360)
 * @param {number} saturation - 0-100
 * @param {number} lightness - 0-100
 * @returns {string[]} Array of hex colours
 */
function generateHSLWheel(numHues, saturation = 100, lightness = 50) {
    const colours = [];
    const hueStep = 360 / numHues;
    
    for (let i = 0; i < numHues; i++) {
        const hue = i * hueStep;
        colours.push(hslToHex(hue, saturation, lightness));
    }
    
    return colours;
}

/**
 * Generate perceptually uniform grayscale
 * @param {number} steps - Number of grey levels (2-256)
 * @returns {string[]} Array of hex colours
 */
function generatePerceptualGrayscale(steps) {
    const colours = [];
    
    for (let i = 0; i < steps; i++) {
        // Gamma-corrected luminance
        const linear = i / (steps - 1);
        const gamma = Math.pow(linear, 1 / 2.2);
        const value = Math.round(gamma * 255);
        colours.push(rgbToHex(value, value, value));
    }
    
    return colours;
}

/**
 * Generate LAB-space quantized palette
 * @param {number} numColours - Target number of colours
 * @returns {string[]} Array of hex colours
 */
function generateLABQuantized(numColours) {
    // Octahedral or cubic sampling of LAB space
    // Ensures maximum perceptual distinction
    // ... complex algorithm ...
}

/**
 * Generate temperature ramp palette
 * @param {number} steps - Number of temperature steps
 * @returns {string[]} Array of hex colours
 */
function generateTemperatureRamp(steps) {
    // Based on blackbody radiation curve
    // ... Planck's law implementation ...
}
```

---

## Proposed UI Structure

### Categorized Dropdown System

**Option A: Two-Level Dropdown**
```javascript
['PALETTE', [
    ['Category', [
        ['dropdown', 'Type', ['Technical', 'Artistic', 'Retro', 'Scientific'], 
            { key: 'paletteCategory', value: 'Technical' }]
    ]],
    ['Selection', [
        ['dropdown', 'Palette', dynamicPaletteList, 
            { key: 'palette', value: '1-bit' }]
    ]],
    ['Custom Colors', [
        // ... existing custom palette tools ...
    ]]
]]
```

**Option B: Grouped Dropdown (Single Select)**
```javascript
['dropdown', 'Palette', [
    '─── TECHNICAL ───',
    '1-bit', '2-bit', '3-bit', '3-bit-gray',
    'RGB 5-bit', 'RGB 6-bit', 'RGB Web Safe',
    'HSL 8-colour', 'HSL 12-colour',
    'LAB 8-colour', 'LAB 16-colour',
    'Grayscale Linear', 'Grayscale Perceptual',
    '─── RETRO ───',
    'NES', 'Game Boy', 'CGA', 'EGA', 'VGA',
    'Commodore 64', 'Apple II', 'ZX Spectrum',
    '─── ARTISTIC ───',
    'Elevate', 'Primaries', 'Imperial', // ... 30 from Dithermark
    '─── SCIENTIFIC ───',
    'Viridis', 'Plasma', 'Inferno', 'Cividis',
    '─── CUSTOM ───',
    'Custom'
], { key: 'palette', value: '1-bit' }]
```

**Option C: Tab-Based Categories**
```javascript
['PALETTE', [
    ['tabs', ['Technical', 'Artistic', 'Retro', 'Scientific'], 
        { key: 'paletteTab' }],
    // Conditional content based on active tab
]]
```

**Recommendation:** **Option B** (Grouped Dropdown)
- Simplest UX (single dropdown)
- Visual separators (`───`) group categories
- No extra clicks
- Standard pattern in design tools

---

## Retro Hardware Palettes

### Additional Hardware to Include

**Already Have:**
- NES (16 colours)
- Game Boy (4 colours)

**Should Add:**

**CGA (IBM, 1981) - 4 colours**
```javascript
// Cyan/Magenta/White palette
['#000000', '#00FFFF', '#FF00FF', '#FFFFFF']

// Red/Green/Yellow palette  
['#000000', '#FF0000', '#00FF00', '#FFFF00']
```

**EGA (IBM, 1984) - 16 colours**
```javascript
[
    '#000000', '#0000AA', '#00AA00', '#00AAAA',
    '#AA0000', '#AA00AA', '#AA5500', '#AAAAAA',
    '#555555', '#5555FF', '#55FF55', '#55FFFF',
    '#FF5555', '#FF55FF', '#FFFF55', '#FFFFFF'
]
```

**VGA (IBM, 1987) - 16 colours**
```javascript
[
    '#000000', '#800000', '#008000', '#808000',
    '#000080', '#800080', '#008080', '#C0C0C0',
    '#808080', '#FF0000', '#00FF00', '#FFFF00',
    '#0000FF', '#FF00FF', '#00FFFF', '#FFFFFF'
]
```

**Commodore 64 (1982) - 16 colours**
```javascript
[
    '#000000', '#FFFFFF', '#880000', '#AAFFEE',
    '#CC44CC', '#00CC55', '#0000AA', '#EEEE77',
    '#DD8855', '#664400', '#FF7777', '#333333',
    '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
]
```

**Apple II (1977) - 16 colours**
```javascript
[
    '#000000', '#901740', '#402CA5', '#D043E5',
    '#006940', '#808080', '#2F95E5', '#BFABF4',
    '#405400', '#D06A1A', '#808080', '#FFA8FA',
    '#1BD000', '#FFAF1A', '#6FE8BF', '#FFFFFF'
]
```

**ZX Spectrum (1982) - 16 colours**
```javascript
// 8 colours × 2 brightness levels
[
    '#000000', '#0000D7', '#D70000', '#D700D7',
    '#00D700', '#00D7D7', '#D7D700', '#D7D7D7',
    '#000000', '#0000FF', '#FF0000', '#FF00FF',
    '#00FF00', '#00FFFF', '#FFFF00', '#FFFFFF'
]
```

**Pico-8 (2015) - 16 colours**
```javascript
[
    '#000000', '#1D2B53', '#7E2553', '#008751',
    '#AB5236', '#5F574F', '#C2C3C7', '#FFF1E8',
    '#FF004D', '#FFA300', '#FFEC27', '#00E436',
    '#29ADFF', '#83769C', '#FF77A8', '#FFCCAA'
]
```

---

## Implementation Plan

### Phase 1: Create Data Structure (1-2 hours)
1. Create `assets/js/shared/data/palettes/` directory
2. Move current 9 palettes to `retro.js` and `technical.js`
3. Create `generators.js` with palette generation functions
4. Create `artistic.js` with Dithermark's 30 palettes
5. Create `index.js` to export all

### Phase 2: Generate Technical Palettes (2-3 hours)
1. Implement `generateRGBQuantized()`
2. Implement `generateHSLWheel()`
3. Implement `generatePerceptualGrayscale()`
4. Implement `generateLABQuantized()` (complex)
5. Implement temperature/scientific palettes
6. Test all generators

### Phase 3: Update Tool (1 hour)
1. Import from `assets/js/shared/data/palettes/`
2. Remove inline palette definitions
3. Update dropdown to use grouped format
4. Add category separators (`───`)

### Phase 4: Update Other Tools (30 min)
1. Update `unified-pattern.js` to import from shared data
2. Remove duplicate definitions
3. Verify no regressions

### Phase 5: Testing (1 hour)
1. Test all 60+ palettes in tool
2. Verify quantization works with each
3. Visual inspection of results
4. Performance testing (large palettes)

**Total Time:** 5-6 hours

---

## Palette Data Format

### Standard Format
```javascript
{
    id: 'palette-id',                  // Kebab-case identifier
    name: 'Display Name',              // User-facing title
    colours: ['#000000', '#FFFFFF'],   // Array of 6-digit hex
    category: 'technical',             // technical|artistic|retro|scientific
    description: 'Brief description',  // Optional tooltip text
    source: 'NES Hardware',            // Optional attribution
    colourCount: 2,                    // Auto-calculated
    tags: ['grayscale', '1-bit']       // Optional search tags
}
```

### Example
```javascript
{
    id: 'nes',
    name: 'NES',
    colours: [
        '#7C7C7C', '#0000FC', '#0000BC', '#4428BC', 
        '#940084', '#A80020', '#A81000', '#881400', 
        '#503000', '#007800', '#006800', '#005800', 
        '#004058', '#000000', '#F8F8F8', '#FFFFFF'
    ],
    category: 'retro',
    description: 'Nintendo Entertainment System (1983)',
    source: 'Hardware Palette',
    colourCount: 16,
    tags: ['retro', 'console', '8-bit']
}
```

---

## Australian Spelling Consistency

All palette names use Australian English:
- ✅ "colour" not "color"
- ✅ "grey" not "gray" (e.g. "3-bit-grey")
- ✅ "grayscale" not "greyscale" (technical term exception)

**Exception:** Historical hardware names unchanged:
- "Game Boy" (proper noun)
- "Commodore 64" (proper noun)

---

## Benefits of This Architecture

### 1. **Single Source of Truth**
- Palettes defined once
- Used by multiple tools
- No duplication

### 2. **Extensibility**
- Easy to add new palettes
- Generators create infinite variations
- User contributions possible

### 3. **Performance**
- Palettes loaded once
- Cached for reuse
- Lazy-loaded if needed

### 4. **Maintainability**
- Clear separation of data/logic
- Standard format
- Documentation embedded

### 5. **Discoverability**
- Categorized by purpose
- Searchable by tags
- Descriptive metadata

---

## Future Enhancements

### 1. **Palette Import/Export**
- Load `.gpl`, `.ase`, `.hex`, `.json`
- Save custom palettes
- Share between tools

### 2. **Palette Generation UI**
- Slider for "Number of Colours"
- Radio for "Quantization Method" (RGB/HSL/LAB)
- Live preview

### 3. **Palette Extraction**
- Auto-extract from uploaded image
- K-means, Median Cut, Octree algorithms
- Save extracted palette

### 4. **Palette History**
- Recently used palettes
- Favourite/star palettes
- LocalStorage persistence

### 5. **Palette Comparison**
- Side-by-side preview
- Colour histogram
- Coverage analysis

---

## File Structure Summary

```
assets/js/shared/data/
├── palettes/
│   ├── technical.js         ← 15 algorithmic palettes + generators
│   ├── artistic.js          ← 30 Dithermark palettes
│   ├── retro.js             ← 9 hardware palettes (NES, C64, etc.)
│   ├── scientific.js        ← 4 data viz palettes (Viridis, etc.)
│   ├── generators.js        ← Palette generation functions
│   ├── utils.js             ← Colour conversion, validation
│   └── index.js             ← Central export
└── index.js                 ← Export all data modules

Total Palettes: 58 (15 + 30 + 9 + 4) + infinite via generators
```

---

## Next Steps

1. **Create folder structure** - 10 minutes
2. **Migrate current palettes** - 20 minutes
3. **Add Dithermark palettes** - 30 minutes
4. **Implement generators** - 2-3 hours
5. **Update tool UI** - 1 hour
6. **Test all palettes** - 1 hour

**Ready to proceed?**

