# ASCII Art Generator — Universal Font Support Design

## Problem Analysis

### Current System (Monospace Only)
```
Image divided into fixed grid:
┌───┬───┬───┬───┐
│ A │ B │ C │ D │  Each tile = 8×16px (constant)
├───┼───┼───┼───┤
│ E │ F │ G │ H │
└───┴───┴───┴───┘
```

### Proportional Font Challenge
```
Same character count, different widths:

aaaaaaaaaaaa          = 12 chars × 6px = 72px
iiiiiiiiiiiiiiiiiiiiii = 24 chars × 3px = 72px

Cannot use fixed grid!
```

## Core Methodology for Proportional Fonts

### Approach: **Character-by-Character Adaptive Tiling**

#### Phase 1: Character Width Measurement
```javascript
function measureAllCharacterWidths(font, fontSize, charset) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px "${font}"`;
    
    const widths = {};
    for (const char of charset) {
        const metrics = ctx.measureText(char);
        widths[char] = {
            width: Math.ceil(metrics.width),
            height: Math.ceil(fontSize * 1.2), // Approximate
            advanceWidth: metrics.width,
            actualBoundingBox: {
                left: metrics.actualBoundingBoxLeft,
                right: metrics.actualBoundingBoxRight,
                ascent: metrics.actualBoundingBoxAscent,
                descent: metrics.actualBoundingBoxDescent
            }
        };
    }
    return widths;
}
```

#### Phase 2: Greedy Line Filling
```javascript
function fillLineWithCharacters(imageWidth, charWidths, availableChars) {
    const line = [];
    let currentX = 0;
    
    while (currentX < imageWidth) {
        const remainingWidth = imageWidth - currentX;
        
        // Find best character that fits remaining space
        let bestChar = null;
        let bestScore = -Infinity;
        
        for (const char of availableChars) {
            const charWidth = charWidths[char].width;
            
            if (charWidth > remainingWidth) continue; // Won't fit
            
            // Extract image tile at current position
            const tile = extractTile(image, currentX, rowY, charWidth, charHeight);
            
            // Score this character against this tile
            const score = matchCharacterToTile(char, tile);
            
            if (score > bestScore) {
                bestScore = score;
                bestChar = char;
            }
        }
        
        if (!bestChar) break; // No more characters fit
        
        line.push({
            char: bestChar,
            x: currentX,
            width: charWidths[bestChar].width
        });
        
        currentX += charWidths[bestChar].width;
    }
    
    return line;
}
```

#### Phase 3: Tile Extraction with Variable Width
```javascript
function extractTile(imageData, x, y, width, height) {
    // Extract rectangular region from image
    const tile = {
        data: new Uint8Array(width * height * 4),
        width: width,
        height: height
    };
    
    for (let dy = 0; dy < height; dy++) {
        for (let dx = 0; dx < width; dx++) {
            const srcIdx = ((y + dy) * imageData.width + (x + dx)) * 4;
            const dstIdx = (dy * width + dx) * 4;
            
            tile.data[dstIdx] = imageData.data[srcIdx];       // R
            tile.data[dstIdx + 1] = imageData.data[srcIdx + 1]; // G
            tile.data[dstIdx + 2] = imageData.data[srcIdx + 2]; // B
            tile.data[dstIdx + 3] = imageData.data[srcIdx + 3]; // A
        }
    }
    
    return tile;
}
```

#### Phase 4: Glyph Atlas with Variable Widths
```javascript
function buildProportionalGlyphAtlas(font, fontSize, charset, charWidths) {
    const atlas = [];
    
    for (const char of charset) {
        const width = charWidths[char].width;
        const height = charWidths[char].height;
        
        // Render character at its actual width
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `${fontSize}px "${font}"`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText(char, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        
        atlas.push({
            char: char,
            width: width,
            height: height,
            density: calculateDensity(imageData.data, width, height),
            quadrants: calculateQuadrants(imageData.data, width, height),
            // ... other metrics
            pixelData: imageData.data
        });
    }
    
    return atlas;
}
```

## Font Loading System

### Option 1: System Font Enumeration
```javascript
// Modern browsers support font access API (experimental)
async function getSystemFonts() {
    if ('queryLocalFonts' in window) {
        const fonts = await window.queryLocalFonts();
        return fonts.map(f => f.family);
    }
    
    // Fallback: Test common fonts
    return testFontAvailability([
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New',
        'Georgia', 'Verdana', 'Comic Sans MS', 'Impact',
        'Trebuchet MS', 'Arial Black', 'Palatino', 'Garamond'
    ]);
}

function testFontAvailability(fontList) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const available = [];
    
    for (const font of fontList) {
        ctx.font = `12px "${font}", sans-serif`;
        const withFont = ctx.measureText('mmmmmmmmmmlli').width;
        
        ctx.font = '12px sans-serif';
        const withoutFont = ctx.measureText('mmmmmmmmmmlli').width;
        
        if (withFont !== withoutFont) {
            available.push(font);
        }
    }
    
    return available;
}
```

### Option 2: Web Font Upload
```javascript
async function loadCustomFont(fontFile) {
    const fontFace = new FontFace(
        fontFile.name.replace(/\.(ttf|otf|woff|woff2)$/, ''),
        await fontFile.arrayBuffer()
    );
    
    await fontFace.load();
    document.fonts.add(fontFace);
    
    return fontFace.family;
}
```

### Option 3: Google Fonts Integration
```javascript
async function loadGoogleFont(fontName) {
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}`;
    link.rel = 'stylesheet';
    
    return new Promise((resolve) => {
        link.onload = () => resolve(fontName);
        document.head.appendChild(link);
    });
}
```

## Character Set Detection

### Comprehensive Character Set Builder
```javascript
function buildCharacterSetForFont(font, fontSize) {
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext('2d');
    ctx.font = `${fontSize}px "${font}"`;
    
    const availableChars = [];
    
    // Test ranges
    const ranges = [
        [0x0020, 0x007E], // Basic Latin (ASCII printable)
        [0x00A0, 0x00FF], // Latin-1 Supplement
        [0x2000, 0x206F], // General Punctuation
        [0x2190, 0x21FF], // Arrows
        [0x2200, 0x22FF], // Mathematical Operators
        [0x2500, 0x257F], // Box Drawing
        [0x2580, 0x259F], // Block Elements
        [0xF000, 0xF0FF], // Wingdings private use area
    ];
    
    for (const [start, end] of ranges) {
        for (let codepoint = start; codepoint <= end; codepoint++) {
            const char = String.fromCodePoint(codepoint);
            
            // Test if character renders (not just blank)
            ctx.clearRect(0, 0, 100, 100);
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 100, 100);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(char, 10, 50);
            
            const imageData = ctx.getImageData(0, 0, 100, 100);
            const hasPixels = imageData.data.some((v, i) => i % 4 === 0 && v > 0);
            
            if (hasPixels) {
                availableChars.push(char);
            }
        }
    }
    
    return availableChars;
}
```

### Wingdings Specific Handling
```javascript
const WINGDINGS_MAP = {
    // Map ASCII to Wingdings symbols
    'A': '👍', 'B': '👎', 'C': '✌', 'D': '☝',
    'E': '☺', 'F': '😐', 'G': '☹', 'H': '💀',
    // ... complete mapping
};

function isSymbolFont(fontName) {
    const symbolFonts = ['Wingdings', 'Webdings', 'Symbol', 'Zapf Dingbats'];
    return symbolFonts.some(sf => fontName.includes(sf));
}

function getCharacterSetForFont(fontName, fontSize) {
    if (isSymbolFont(fontName)) {
        return buildCharacterSetForFont(fontName, fontSize);
    } else {
        return CHAR_SETS['Extended']; // Default
    }
}
```

## Matching Algorithm for Variable Width

### Adjusted Matching Function
```javascript
function matchVariableWidthTile(tile, glyphAtlas) {
    const tileWidth = tile.width;
    const tileHeight = tile.height;
    
    let bestChar = null;
    let bestCost = Infinity;
    
    for (const glyph of glyphAtlas) {
        // Only consider glyphs of similar width
        const widthDiff = Math.abs(glyph.width - tileWidth) / tileWidth;
        if (widthDiff > 0.2) continue; // Skip if width differs by >20%
        
        // Resize tile to match glyph dimensions if needed
        const normalizedTile = resizeTile(tile, glyph.width, glyph.height);
        
        // Calculate costs as before
        const toneCost = Math.abs(glyph.density - normalizedTile.density);
        const quadCost = calculateQuadrantCost(glyph, normalizedTile);
        // ... etc
        
        const cost = weights.tone * toneCost + weights.quad * quadCost;
        
        if (cost < bestCost) {
            bestCost = cost;
            bestChar = glyph.char;
        }
    }
    
    return bestChar;
}
```

## Rendering Proportional Text

### Accurate Text Layout
```javascript
function renderProportionalAscii(ctx, asciiGrid, font, fontSize, lineHeight) {
    ctx.font = `${fontSize}px "${font}"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    let y = 0;
    
    for (const row of asciiGrid) {
        for (const cell of row) {
            ctx.fillText(cell.char, cell.x, y);
        }
        y += lineHeight;
    }
}
```

## UI Changes for Universal Font Support

### New Controls
```javascript
['Font Selection', [
    ['radio', 'Font Type', ['Monospace', 'Proportional', 'Symbol'], { 
        key: 'fontType', 
        selectedValue: 'Monospace' 
    }],
    ['dropdown', 'System Font', [], { 
        key: 'systemFont', 
        dynamic: true 
    }],
    ['file', 'Upload Font File', '.ttf,.otf,.woff,.woff2', { 
        key: 'fontFile' 
    }],
    ['text', 'Google Font Name', { 
        key: 'googleFont',
        placeholder: 'e.g., Roboto'
    }],
    ['button', 'Load Font', null, { key: 'loadFont' }],
]],

['Character Set', [
    ['radio', 'Source', ['Auto-Detect', 'Manual'], { 
        key: 'charsetSource',
        selectedValue: 'Auto-Detect'
    }],
    ['label', 'Detected: 95 chars', { 
        key: 'charsetInfo',
        variant: 'caption'
    }],
    ['textarea', 'Custom Characters', { 
        key: 'customCharset',
        placeholder: 'Paste characters here...'
    }],
]]
```

## Performance Considerations

### Challenges
- Variable width = more complex matching
- Need to test all chars for all positions
- O(width × height × charset_size²)

### Optimizations
1. **Width Buckets**: Group glyphs by width ranges
2. **Cache Tiles**: Don't re-extract same regions
3. **Progressive Rendering**: Show results line-by-line
4. **WebWorkers**: Offload processing to background thread

```javascript
// Width bucketing
const glyphsByWidth = {
    narrow: glyphs.filter(g => g.width < 5),   // i, l, j
    medium: glyphs.filter(g => g.width < 10),  // a, e, o
    wide: glyphs.filter(g => g.width >= 10)    // W, M, @
};

function matchWithWidthHint(tile, glyphs) {
    const bucket = tile.width < 5 ? 'narrow' :
                   tile.width < 10 ? 'medium' : 'wide';
    return matchTile(tile, glyphsByWidth[bucket]);
}
```

## Implementation Phases

### Phase 1: Monospace Foundation (✅ COMPLETE)
- Fixed character dimensions
- Grid-based tile extraction
- Simple matching

### Phase 2: System Font Support (2-3 hours)
- Font enumeration/detection
- Dynamic font loading
- Character set detection

### Phase 3: Proportional Font Algorithm (8-12 hours)
- Variable width measurement
- Greedy line filling
- Adaptive tile extraction
- Width-aware matching

### Phase 4: Symbol Font Support (2-3 hours)
- Unicode range detection
- Symbol mapping
- Wingdings/Webdings handling

### Phase 5: Performance Optimization (4-6 hours)
- Width bucketing
- Tile caching
- WebWorker implementation
- Progressive rendering

**Total Estimate: 16-26 hours**

## Edge Cases

### 1. Ligatures (fi, fl, ffi)
Some fonts combine characters. Solution:
- Disable ligatures via CSS: `font-feature-settings: "liga" 0`
- Or: Detect and handle as single glyph

### 2. Zero-Width Characters
Some Unicode chars have no width. Solution:
- Filter during character set detection
- Skip if measureText().width === 0

### 3. Right-to-Left (RTL) Text
Arabic, Hebrew reverse direction. Solution:
- Add direction control
- Reverse line filling algorithm

### 4. Emoji
May render as color images. Solution:
- Detect emoji range (U+1F600-1F64F, etc.)
- Option to include/exclude
- May need larger tiles

## Conclusion

**Is it possible?** Yes, absolutely!

**Methodology:**
1. Measure each character's actual width
2. Fill lines greedily, character by character
3. Extract variable-width tiles from image
4. Match based on both width AND content
5. Render with exact character positioning

**Font Loading:**
- System font enumeration
- Upload custom fonts
- Google Fonts integration

**Character Set:**
- Auto-detect available glyphs
- Test rendering for each codepoint
- Handle symbol fonts specially

**Wingdings:** Will work! Just detect which glyphs render.

**Complexity:** Significantly more complex than monospace, but entirely feasible with the greedy character-by-character approach.

**Recommendation:** 
- Keep monospace as default (fast, predictable)
- Add proportional as "Advanced" option
- Warn user about processing time
- Show progress bar during processing

