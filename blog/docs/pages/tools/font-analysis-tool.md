# Font Analysis Tool

## 1. Source Analysis

**Source file(s):** `assets/js/tools/font-analysis-tool.js`
**Related docs found:** Combines features from font-dimension-finder and font-size-comparison

### Purpose
Multi-font comparison tool with canvas-rendered metrics visualization. Compares up to 3 fonts side by side with detailed measurements including ascent, descent, x-height, cap height, bearings, and width.

### Output Type
- [x] Static image (metrics visualization)
- [ ] Animation
- [x] Interactive visualization (3-font comparison)
- [x] Data/calculation result (all metrics per font)
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. User selects 3 fonts from Google Fonts dropdown
2. User sets font size per font (8-120px)
3. User enters sample text and single letter for measurement
4. Canvas renders all 3 fonts with metric lines
5. Metrics displayed for each font

---

## 2. Tool Classification

**Is this a tool?** Yes

**Input:** 3 font selections, 3 font sizes, sample text, single letter
**Processing:** Canvas TextMetrics API measurement per font
**Output:** Side-by-side visualization with all metrics

**Frame-based?** No
**Looping?** No
**Duration:** N/A

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| sampleText | string | any | Full text sample |
| letter | string | single char | Character for detailed metrics |
| font1Family | dropdown | Google Fonts | First font |
| font1Size | number | 8-120 | First font size |
| font2Family | dropdown | Google Fonts | Second font |
| font2Size | number | 8-120 | Second font size |
| font3Family | dropdown | Google Fonts | Third font |
| font3Size | number | 8-120 | Third font size |

### Computed Outputs (per font)
| Variable | Type | Purpose |
|----------|------|---------|
| ascent | number | Font bounding box ascent |
| descent | number | Font bounding box descent |
| xHeight | number | Height of lowercase 'x' |
| capitalHeight | number | Height of uppercase 'H' |
| leftBearing | number | Space before glyph |
| rightBearing | number | Space after glyph |
| width | number | Actual glyph width |
| advance | number | Full character advance |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Sample Text | text | full width |
| Letter | text | maxLength: 1 |
| Font Family (×3) | dropdown | Google Fonts list |
| Font Size (×3) | slider | 8-120, withNumber |

### Missing Controls (not in source, should add)
- [ ] Export comparison as PNG
- [ ] Copy metrics to clipboard
- [ ] Add/remove font columns
- [ ] Font weight selection
- [ ] Google Fonts search

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Export PNG
- Clipboard copy for metrics
- Font weight control

### Source features requiring new components:
- Google Fonts loader integration (external dependency)
- Dynamic font loading

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| sampleText | text | "The quick..." | - | - | - | Full sample |
| letter | text | A | - | - | - | Single char |
| font1Family | dropdown | Space Mono | - | - | - | Google Font |
| font1Size | number | 48 | 8 | 120 | 1 | px |
| font2Family | dropdown | Roboto | - | - | - | Google Font |
| font2Size | number | 48 | 8 | 120 | 1 | px |
| font3Family | dropdown | Roboto Mono | - | - | - | Google Font |
| font3Size | number | 48 | 8 | 120 | 1 | px |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Metrics (×3) | object | {ascent, descent, ...} | Auto on input |
| Visualization | canvas | 3-column comparison | Auto on input |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'FONT ANALYSIS',
    
    sidebar: [
        ['Global', [
            ['Sample Text', [
                ['text', 'Sample', 'The quick brown fox jumps over the lazy dog', { key: 'sampleText' }],
                ['text', 'Letter', 'A', { key: 'letter', maxLength: 1 }],
            ]],
        ]],
        ['Font 1', [
            ['Font Selection', [
                ['dropdown', 'Font Family', fontOptions, { key: 'font1Family', defaultValue: 'Space Mono' }],
                ['slider', 'Font Size', 8, 120, 1, { key: 'font1Size', defaultValue: 48, withNumber: true }],
            ]],
        ]],
        ['Font 2', [
            ['Font Selection', [
                ['dropdown', 'Font Family', fontOptions, { key: 'font2Family', defaultValue: 'Roboto' }],
                ['slider', 'Font Size', 8, 120, 1, { key: 'font2Size', defaultValue: 48, withNumber: true }],
            ]],
        ]],
        ['Font 3', [
            ['Font Selection', [
                ['dropdown', 'Font Family', fontOptions, { key: 'font3Family', defaultValue: 'Roboto Mono' }],
                ['slider', 'Font Size', 8, 120, 1, { key: 'font3Size', defaultValue: 48, withNumber: true }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        // Load Google Fonts for initial selection
        this.loadFonts(values);
    },
    
    onUpdate: function(key, value, allValues) {
        if (key.includes('Family')) {
            this.loadFont(value);
        }
        this.draw();
    },
    
    onDraw: function(ctx, canvas, values) {
        // Draw 3-column comparison
        this.drawFontComparison(ctx, canvas, values);
    },
};
```

---

## 7. Implementation Notes

- **Google Fonts:** Uses external `googleFontsLoader` utility for dynamic font loading
- **Fallback:** If font unavailable, uses system fallback with warning
- **TextMetrics API:** Requires modern browser for extended metrics
- **Canvas Layout:** 3-column layout with equal width per font
- **Status:** Already converted to ToolBase format

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| measureFont | 30 | typography | font-dimension-finder | High |
| fontLoader wrapper | 10 | fonts | - | High |
| drawMetricLines | 25 | canvas | font-dimension-finder | High |

**Shared Utility Candidates:**
- `FontMetrics.measure(font, size, letter)` - Already identified
- `GoogleFontsLoader.load(fontName)` - Dynamic font loading

