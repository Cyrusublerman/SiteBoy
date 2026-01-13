# Polygon Calculator

## 1. Source Analysis

**Source file(s):** `reference/QuickToolRebuildReference/Tools/polygon-calculator/dist/script.js`
**Related docs found:** None

### Purpose
Interactive regular polygon geometry calculator. Computes all measurements for concentric inner/outer polygons with configurable wall thickness. Real-time SVG visualization.

### Output Type
- [x] Static image (SVG visualization)
- [ ] Animation
- [x] Interactive visualization (live calculation)
- [x] Data/calculation result (all measurements)
- [ ] Audio
- [x] Downloadable file (SVG, PNG)

### Current Implementation
1. User sets number of sides (n ≥ 3)
2. User sets outer polygon dimension (any of: apothem, circumradius, side, perimeter, area)
3. User sets wall thickness
4. Inner polygon auto-calculated
5. SVG renders both polygons with grid
6. All measurements update bidirectionally

---

## 2. Tool Classification

**Is this a tool?** Yes

**Input:** Polygon sides, one dimension, wall thickness
**Processing:** Geometry calculation (all measurements from apothem)
**Output:** Complete polygon measurements, SVG visualization

**Frame-based?** No
**Looping?** No
**Duration:** N/A

---

## 3. Variable Analysis

### Exposed Parameters (from source)
| Variable | Current Type | Range/Options | Purpose |
|----------|--------------|---------------|---------|
| state.sides | number | 3-∞ | Number of polygon sides |
| state.wallWidth | number | 0-apothem | Wall thickness in meters |
| state.outer.apothem | number | >0 | Outer polygon apothem |
| state.outer.circumradius | number | computed | Outer circumradius |
| state.outer.sideLength | number | computed | Outer side length |
| state.outer.perimeter | number | computed | Outer perimeter |
| state.outer.area | number | computed | Outer area |
| state.inner.* | number | computed | Inner polygon measurements |

### Recommended UI Components
| Parameter | Component Type | Config |
|-----------|----------------|--------|
| Sides | number | min: 3, step: 1 |
| Wall Width | number | min: 0, step: 0.001, precision: 3 |
| Outer Apothem | number | min: 0, step: 0.001, precision: 3 |
| Outer Circumradius | number | min: 0, step: 0.001, precision: 3 |
| Outer Side Length | number | min: 0, step: 0.001, precision: 3 |
| Outer Perimeter | number | min: 0, step: 0.001, precision: 3 |
| Outer Area | number | min: 0, step: 0.001, precision: 3 |
| Inner values | value (readonly) | display only |

### Missing Controls (not in source, should add)
- [ ] Play/Pause - N/A
- [ ] Frame export - N/A
- [ ] Video/GIF export - N/A
- [x] Canvas width/height - SVG viewBox handles this
- [ ] Frame count / duration - N/A
- [ ] Loop toggle - N/A
- [ ] Playback speed - N/A
- [x] Export PNG (exists)
- [x] Export SVG (exists)
- [ ] Copy measurements to clipboard

---

## 4. Gap Analysis

### Available in our library but missing in source:
- Copy to clipboard for measurements
- Preset polygons (triangle, square, hex, etc.)
- Unit conversion (m, cm, mm, ft, in)

### Source features requiring new components:
- Bidirectional number inputs (any input updates all others)
- SVG rendering (canvas alternative)

---

## 5. Input/Output Specification

### Inputs
| Name | Type | Default | Min | Max | Step | Notes |
|------|------|---------|-----|-----|------|-------|
| sides | number | 6 | 3 | 100 | 1 | Integer only |
| wallWidth | number | 0.2 | 0 | <apothem | 0.001 | Meters |
| outerApothem | number | 2.5 | 0.001 | - | 0.001 | Any input works |
| outerCircumradius | number | - | 0.001 | - | 0.001 | Calculated |
| outerSideLength | number | - | 0.001 | - | 0.001 | Calculated |
| outerPerimeter | number | - | 0.001 | - | 0.001 | Calculated |
| outerArea | number | - | 0.001 | - | 0.001 | Calculated |

### Outputs
| Output | Type | Format | Trigger |
|--------|------|--------|---------|
| Measurements | object | {outer, inner} | Auto on input |
| SVG Visualization | SVG | vector | Auto on input |
| SVG File | download | .svg | Export button |
| PNG File | download | .png | Export button |

---

## 6. ToolBase Configuration

```javascript
const TOOL_CONFIG = {
    title: 'POLYGON CALCULATOR',
    
    sidebar: [
        ['GEOMETRY', [
            ['Primary', [
                ['number', 'Sides', { value: 6, min: 3, step: 1, key: 'sides' }],
                ['number', 'Wall Width (m)', { value: 0.200, min: 0, step: 0.001, precision: 3, key: 'wallWidth' }],
            ]],
            ['Outer Polygon', [
                ['number', 'Apothem', { value: 2.500, min: 0.001, step: 0.001, precision: 3, key: 'outerApothem' }],
                ['number', 'Circumradius', { value: 0, min: 0.001, step: 0.001, precision: 3, key: 'outerCircumradius' }],
                ['number', 'Side Length', { value: 0, min: 0.001, step: 0.001, precision: 3, key: 'outerSideLength' }],
                ['number', 'Perimeter', { value: 0, min: 0.001, step: 0.001, precision: 3, key: 'outerPerimeter' }],
                ['number', 'Area', { value: 0, min: 0.001, step: 0.001, precision: 3, key: 'outerArea' }],
            ]],
            ['Inner Polygon (calculated)', [
                ['value', 'Apothem', { key: 'innerApothem' }],
                ['value', 'Circumradius', { key: 'innerCircumradius' }],
                ['value', 'Side Length', { key: 'innerSideLength' }],
                ['value', 'Perimeter', { key: 'innerPerimeter' }],
                ['value', 'Area', { key: 'innerArea' }],
            ]],
        ]],
        ['EXPORT', [
            ['Download', [
                ['button', 'Export SVG', { key: 'exportSvg' }],
                ['button', 'Export PNG', { key: 'exportPng' }],
            ]],
        ]],
    ],
    
    canvas: { size: 420 },
    
    onInit: function(values) {
        this.lastChange = { polygon: 'outer', measure: 'apothem' };
    },
    
    onUpdate: function(key, value, allValues) {
        // Recalculate all values from changed input
        this.recalculateFromInput(key, value, allValues);
        this.draw();
    },
    
    onDraw: function(ctx, canvas, values) {
        // Draw polygon visualization
        this.drawGrid(ctx, canvas);
        this.drawPolygons(ctx, canvas, values);
    },
};
```

---

## 7. Implementation Notes

- **Bidirectional Input:** Any measurement input recalculates all others. Track `lastChange` to know which input to preserve.
- **Apothem as Base:** All calculations derive from apothem. Convert any input to apothem first.
- **Wall Width Constraint:** Inner apothem = outer apothem - wall width. Wall cannot exceed outer apothem.
- **SVG vs Canvas:** Original uses SVG. ToolBase uses canvas. Must port SVG generation for export.
- **Precision:** Use 3 decimal places for all measurements (millimeter precision in meters).

---

## 8. Reusable Code Candidates

| Code Block | Lines | Category | Similar To | Reuse Potential |
|------------|-------|----------|------------|-----------------|
| getApothemFrom | 25 | math | - | High |
| getFromApothem | 15 | math | - | High |
| generatePolygonPoints | 12 | geometry | lissajous | High |
| pointsToPath (SVG) | 5 | svg | - | Medium |
| getSVGContent | 30 | export | wave-interference | High |
| downloadSVG | 10 | export | wave-interference | High |
| downloadPNG from SVG | 25 | export | wave-interference | High |

**Shared Utility Candidates:**
- `PolygonMath.fromApothem(apothem, sides)` - Get all measurements from apothem
- `PolygonMath.toApothem(value, type, sides)` - Convert any measurement to apothem
- `SVGExporter.download(svg, filename)` - SVG blob download helper
- `SVGExporter.toPNG(svg, scale)` - Convert SVG to PNG canvas
