# SiteBoy Tools Documentation

Reference documentation for all interactive tool pages.

## Tool Categories

### Generator Host
- **[Generators](./generators/index.md)** - Unified host for registered generator scripts, host rules, and per-generator packs

### Image Processing
- **[Colour Quantizer](./colour-quantizer.md)** - Image quantization with dithering using LAB color space
- **[Pixel Tiler](./pixel-tiler.md)** - 2×2 pixel mosaic combinations from 4 source images
- **[Dither Algorithms](./dither-algorithms.md)** - Comprehensive dithering algorithm library

### Geometry & Math
- **[Polygon Calculator](./polygon-calculator.md)** - Interactive polygon geometry calculator with canvas visualization

### Typography
- **[Font Analysis](./font-analysis.md)** - Multi-font comparison with metrics visualization

### Astronomy
- **[Asteroid Belt](./asteroid-belt.md)** - Procedural asteroid belt visualization

### Privacy & Analytics
- **[About You](./about-you.md)** - Browser fingerprinting demonstration

---

## Tool Architecture

All tools follow the **ToolBase declarative format**:

```javascript
const TOOL_CONFIG = {
    title: 'Tool Name',
    sidebar: [
        ['Tab Name', [
            ['Block Title', [
                ['component', 'Label', ...params, { key: 'uniqueKey' }],
            ]],
        ]],
    ],
    canvas: { width: 800, height: 600 },
    onInit: (values, tool) => {},
    onUpdate: (key, value, values, tool) => {},
    onDraw: (ctx, canvas, values) => {}
};
```

### Component Types
- `slider`, `number`, `stepper` - Numeric inputs
- `text`, `textarea` - Text inputs
- `dropdown`, `select` - Selection dropdowns
- `toggle`, `radio` - Toggle groups
- `color` - Color picker
- `file` - File upload
- `button` - Action buttons

See [Tool Build Guide](/blog/docs/guides/tools/tool-build-guide.md) for full specification.

---

## Source Reference

Original CodePen/reference implementations:
- `reference/QuickToolRebuildReference/Tools/`

