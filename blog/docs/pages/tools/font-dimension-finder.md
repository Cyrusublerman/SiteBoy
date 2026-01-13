# Font Dimension Finder

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Tools/Font/font-dimension-finder/dist/script.js`
**Related docs found:** None

### Purpose
Measure and visualize individual font metrics. Shows precise pixel measurements for ascent, descent, x-height, cap height, bearings, width, and advance for any character. Enables reverse lookup: find font size that produces specific metric value.

### Output Type
- [x] Static image (metrics visualization)
- [ ] Animation
- [x] Interactive visualization (live measurement)
- [x] Data/calculation result (all metrics + ratios)
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. User selects font from dropdown
2. User sets font size (px)
3. User enters letter to measure
4. Canvas draws letter with metric lines
5. Metrics panel shows all measurements + ratios
6. User can input target metric value → finds required font size
7. Comparison chart plots metric ratio across font sizes

---

## 2. Tool Classification

**Is this a tool?** Yes

**Input:** Font name, font size, character
**Processing:** Canvas TextMetrics API measurement
**Output:** All typographic metrics with visualization

**Frame-based?** No
**Looping?** No
**Duration:** N/A

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| fontSelect | string | font names | Selected font |
| fontSize | number | 1-1000 | Font size in px |
| letterInput | string | single char | Character to measure |

### Computed Outputs
| Variable | Type | Purpose |
|----------|------|---------|
| ascent | number | Font bounding box ascent |
| descent | number | Font bounding box descent |
| xHeight | number | Height of lowercase 'x' |
| capHeight | number | Height of uppercase 'H' |
| leftBearing | number | Space before glyph |
| rightBearing | number | Space after glyph |
| width | number | Actual glyph width |
| advance | number | Full character advance |
| ratios | object | All metrics / fontSize |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Font | dropdown | system fonts list |
| Font Size | slider + number | 1-1000, step 0.1 |
| Letter | text | maxLength: 1 |
| Target Metric | dropdown | ascent/descent/etc |
| Target Value | number | for reverse lookup |

### Missing Controls (not in source, should add)
- [ ] Copy metrics to clipboard
- [ ] Export measurements as JSON
- [ ] Save/load font comparison sets
- [ ] Google Fonts integration

---

## 4. Gap Analysis

### Available in our library but missing in source:
- JSON export for metrics
- Clipboard copy
- Canvas export as PNG

### Source features requiring new components:
- Reverse font size lookup (binary search for target metric)
- Multi-font comparison chart
- Metric input fields that trigger recalculation

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| font | dropdown | Arial | - | - | - | System fonts |
| fontSize | number | 16 | 1 | 1000 | 0.1 | Pixels |
| letter | text | A | - | - | - | Single character |
| targetMetric | dropdown | ascent | - | - | - | For reverse lookup |
| targetValue | number | - | 0.001 | - | 0.1 | Desired px value |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Metrics Object | object | {measurements, ratios} | Auto on input |
| Visualization | canvas | annotated glyph | Auto on input |
| Comparison Chart | canvas | line chart | On tab switch |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'FONT DIMENSION FINDER',
    
    sidebar: [
        ['MEASUREMENT', [
            ['Font Selection', [
                ['dropdown', 'Font', [
                    'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
                    'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
                    'Palatino Linotype', 'Space Mono', 'Tahoma', 'Times New Roman',
                    'Trebuchet MS', 'Verdana', 'monospace', 'sans-serif', 'serif'
                ], { key: 'font' }],
                ['slider', 'Font Size', 1, 200, 0.1, { value: 16, withNumber: true, precision: 1, key: 'fontSize' }],
                ['text', 'Letter', { value: 'A', key: 'letter' }],
            ]],
            ['Metrics (px)', [
                ['value', 'Ascent', { key: 'ascent' }],
                ['value', 'Descent', { key: 'descent' }],
                ['value', 'Cap Height', { key: 'capHeight' }],
                ['value', 'x-Height', { key: 'xHeight' }],
                ['value', 'Width', { key: 'width' }],
                ['value', 'Advance', { key: 'advance' }],
                ['value', 'Left Bearing', { key: 'leftBearing' }],
                ['value', 'Right Bearing', { key: 'rightBearing' }],
            ]],
        ]],
        ['REVERSE LOOKUP', [
            ['Find Size', [
                ['dropdown', 'Target Metric', ['ascent', 'descent', 'capHeight', 'xHeight', 'width', 'advance'], { key: 'targetMetric' }],
                ['number', 'Target Value (px)', { value: 100, min: 0.1, step: 0.1, key: 'targetValue' }],
                ['button', 'Find Font Size', { key: 'findSize' }],
                ['value', 'Result Size', { key: 'resultSize' }],
            ]],
        ]],
        ['COMPARISON', [
            ['Chart', [
                ['dropdown', 'Metric', ['ascent', 'descent', 'capHeight', 'xHeight'], { key: 'chartMetric' }],
                ['label', 'Shows ratio vs font size for all fonts'],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.measureFont(values.font, values.fontSize, values.letter);
    },
    
    onUpdate: function(key, value, allValues) {
        if (['font', 'fontSize', 'letter'].includes(key)) {
            this.measureFont(allValues.font, allValues.fontSize, allValues.letter);
            this.draw();
        }
    },
    
    onDraw: function(ctx, canvas, values) {
        this.drawMetrics(ctx, canvas, this.currentMetrics, values);
    },
};
```

---

## 7. Implementation Notes

- **TextMetrics API:** Uses `ctx.measureText(letter)` with extended properties (fontBoundingBoxAscent, etc.)
- **Browser Support:** Extended TextMetrics requires modern browsers (Chrome 87+, Firefox 74+, Safari 11.1+)
- **Binary Search:** Reverse lookup uses binary search (low=1, high=1000) to find font size producing target metric
- **Ratio Stability:** Ratios should be constant across sizes but may vary slightly due to hinting
- **Canvas Sizing:** Canvas dynamically resizes based on measured advance × 2 and ascent + descent × 2

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| measureFont | 25 | typography | font-size-comparison | High |
| findFontSizeForMeasurement | 25 | math/search | - | Medium |
| Drawing.line | 5 | canvas | - | High |
| Drawing.label | 5 | canvas | - | High |
| Drawing.horizontalLineWithLabel | 8 | canvas | - | High |
| Drawing.bracketWithLabel | 15 | canvas | - | Medium |
| Drawing.metrics | 50 | typography | - | High |
| Drawing.comparisonChart | 40 | chart | - | High |
| debounce | 8 | utility | polygon-calculator | High |

**Shared Utility Candidates:**
- `FontMetrics.measure(font, size, letter)` - Get all metrics for a glyph
- `FontMetrics.findSizeForValue(font, metric, targetValue)` - Binary search for font size
- `CanvasHelpers.labeledLine(ctx, x1, y1, x2, y2, label, color)` - Draw line with label

