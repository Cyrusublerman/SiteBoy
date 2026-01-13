# Font Size Comparison Tool

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Tools/Font/font-size-comparison-tool/dist/script.js`
**Related docs found:** None

### Purpose
Compare visual metrics across 3 fonts simultaneously. Shows how different fonts at the same font-size render differently due to varying x-height, cap height, and character widths. Calculates character ratio for text length planning.

### Output Type
- [ ] Static image
- [ ] Animation
- [x] Interactive visualization (live 3-font comparison)
- [x] Data/calculation result (ratios and percentages)
- [ ] Audio
- [ ] Downloadable file

### Current Implementation
1. Displays 3 hardcoded fonts: Rubik Mono One, Space Mono, Syne Mono
2. User sets font size (shared across all)
3. User enters custom text
4. Each font column shows:
   - Display mode (block/inline/etc)
   - Scale X/Y percentage
   - Letter spacing
   - Word spacing
   - Line height
5. Text preview updates in real-time
6. Comparison panel shows metrics relative to first font

---

## 2. Tool Classification

**Is this a tool?** Yes

**Input:** Font size, custom text, per-font transforms
**Processing:** Metrics calculation with CSS transforms
**Output:** Side-by-side comparison with ratios

**Frame-based?** No
**Looping?** No
**Duration:** N/A

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| fontSize | number | any | Shared font size (px) |
| customText | string | any | Text to display |
| displayN | select | block/inline/etc | CSS display mode |
| scaleXN | number | 0-200 | Horizontal scale % |
| scaleYN | number | 0-200 | Vertical scale % |
| letterSpacingN | number | -10 to 50 | Letter spacing (px) |
| wordSpacingN | number | -10 to 50 | Word spacing (px) |
| lineHeightN | number | 0.5-3 | Line height ratio |

### Computed Outputs
| Variable | Type | Purpose |
|----------|------|---------|
| capitalHeight | number | Height of 'H' |
| xHeight | number | Height of 'x' |
| emBoxWidth | number | Width of 'M' |
| avgCharWidth | number | Average character width |
| charRatio | number | Characters per base font char |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Font Size | slider | 8-144, step 1 |
| Custom Text | textarea | multiline |
| Display Mode | dropdown | block/inline/inline-block/flex |
| Scale X | slider | 0-200, step 1 |
| Scale Y | slider | 0-200, step 1 |
| Letter Spacing | slider | -10 to 50, step 0.1 |
| Word Spacing | slider | -10 to 50, step 0.1 |
| Line Height | slider | 0.5-3, step 0.05 |

### Missing Controls (not in source, should add)
- [ ] Font selection (currently hardcoded)
- [ ] Add/remove font columns
- [ ] Export comparison as image
- [ ] Copy ratios to clipboard

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Dynamic font selection (dropdown with Google Fonts)
- Clipboard copy for ratios
- Canvas/image export

### Source features requiring new components:
- Multi-column layout (3+ independent control sets)
- Live text preview with CSS transforms

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| fontSize | number | 48 | 8 | 144 | 1 | Shared across fonts |
| customText | textarea | "The quick..." | - | - | - | Test string |
| font1 | dropdown | Rubik Mono One | - | - | - | First font |
| font2 | dropdown | Space Mono | - | - | - | Second font |
| font3 | dropdown | Syne Mono | - | - | - | Third font |
| scaleX[1-3] | number | 100 | 0 | 200 | 1 | Horizontal % |
| scaleY[1-3] | number | 100 | 0 | 200 | 1 | Vertical % |
| letterSpacing[1-3] | number | 0 | -10 | 50 | 0.1 | px |
| wordSpacing[1-3] | number | 0 | -10 | 50 | 0.1 | px |
| lineHeight[1-3] | number | 1 | 0.5 | 3 | 0.05 | ratio |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Text Previews | DOM | styled text | Auto on input |
| Comparison Data | table | percentages | Auto on input |
| Character Ratios | numbers | font-to-font | Auto on input |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'FONT SIZE COMPARISON',
    
    sidebar: [
        ['SHARED', [
            ['Settings', [
                ['slider', 'Font Size', 8, 144, 1, { value: 48, withNumber: true, key: 'fontSize' }],
                ['textarea', 'Custom Text', { value: 'The quick brown fox jumps over the lazy dog', key: 'customText' }],
            ]],
        ]],
        ['FONT 1', [
            ['Rubik Mono One', [
                ['dropdown', 'Display', ['block', 'inline', 'inline-block', 'flex'], { key: 'display1' }],
                ['slider', 'Scale X', 0, 200, 1, { value: 100, key: 'scaleX1' }],
                ['slider', 'Scale Y', 0, 200, 1, { value: 100, key: 'scaleY1' }],
                ['slider', 'Letter Spacing', -10, 50, 0.1, { value: 0, key: 'letterSpacing1' }],
                ['slider', 'Word Spacing', -10, 50, 0.1, { value: 0, key: 'wordSpacing1' }],
                ['slider', 'Line Height', 0.5, 3, 0.05, { value: 1, key: 'lineHeight1' }],
            ]],
        ]],
        ['FONT 2', [
            ['Space Mono', [
                ['dropdown', 'Display', ['block', 'inline', 'inline-block', 'flex'], { key: 'display2' }],
                ['slider', 'Scale X', 0, 200, 1, { value: 100, key: 'scaleX2' }],
                ['slider', 'Scale Y', 0, 200, 1, { value: 100, key: 'scaleY2' }],
                ['slider', 'Letter Spacing', -10, 50, 0.1, { value: 0, key: 'letterSpacing2' }],
                ['slider', 'Word Spacing', -10, 50, 0.1, { value: 0, key: 'wordSpacing2' }],
                ['slider', 'Line Height', 0.5, 3, 0.05, { value: 1, key: 'lineHeight2' }],
            ]],
        ]],
        ['FONT 3', [
            ['Syne Mono', [
                ['dropdown', 'Display', ['block', 'inline', 'inline-block', 'flex'], { key: 'display3' }],
                ['slider', 'Scale X', 0, 200, 1, { value: 100, key: 'scaleX3' }],
                ['slider', 'Scale Y', 0, 200, 1, { value: 100, key: 'scaleY3' }],
                ['slider', 'Letter Spacing', -10, 50, 0.1, { value: 0, key: 'letterSpacing3' }],
                ['slider', 'Word Spacing', -10, 50, 0.1, { value: 0, key: 'wordSpacing3' }],
                ['slider', 'Line Height', 0.5, 3, 0.05, { value: 1, key: 'lineHeight3' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.fonts = ['Rubik Mono One', 'Space Mono', 'Syne Mono'];
        this.updateAllFonts(values);
    },
    
    onUpdate: function(key, value, allValues) {
        this.updateAllFonts(allValues);
        this.draw();
    },
    
    onDraw: function(ctx, canvas, values) {
        // Draw comparison visualization
        this.drawComparison(ctx, canvas, values);
    },
};
```

---

## 7. Implementation Notes

- **Google Fonts:** Hardcoded fonts (Rubik Mono One, Space Mono, Syne Mono) must be loaded via Google Fonts link
- **CSS Transforms:** Uses `transform: scale(x, y)` for non-destructive sizing
- **Character Ratio:** `baseAvgWidth / fontAvgWidth` shows how many chars in font N equal 1 char in base font
- **DOM vs Canvas:** Original uses DOM text elements. ToolBase would need hybrid approach for accurate CSS rendering.
- **Debounce:** Uses 100ms debounce on updates for performance

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| measureFont | 30 | typography | font-dimension-finder | High |
| updateComparison | 20 | typography | - | Medium |
| debounce | 10 | utility | font-dimension-finder | High |

**Shared Utility Candidates:**
- `FontMetrics.measure(font, size, letter)` - Already identified in font-dimension-finder
- `FontComparison.ratios(fonts, size, text)` - Calculate character ratios across fonts

