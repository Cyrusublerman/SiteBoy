# Advanced ASCII Art Generator — Specification

## 1. Overview
- Purpose: ASCII rendering via glyph-image structural matching
- Output Type: Text/HTML ASCII output

## 2. Module Dependencies
| Category | Module ID | Import From |
|----------|-----------|-------------|
| Math | MATH-002 | shared/math-utils.js |
| Img | IMG-011..017 | shared/image-utils.js |
| Canvas | CANVAS-011, CANVAS-012 | shared/canvas-utils.js |

## 3. Sidebar Structure
TAB: INPUT
  BLOCK: Image
    - fileInput: sourceImage
  BLOCK: Font
    - dropdown: fontFamily [Courier, Monaco, Consolas, Custom]
    - number: renderResolution [8, 32]
  BLOCK: Characters
    - text: characterSet [default: " .:-=+*#%@"]

TAB: MATCHING
  BLOCK: Cost Weights
    - slider: toneWeight [0, 2]
    - slider: quadrantWeight [0, 2]
    - slider: orientationWeight [0, 2]
    - slider: signatureWeight [0, 2]
  BLOCK: Thresholds
    - slider: densityThreshold [0, 0.5]
    - slider: orientationThreshold [0, 0.5]
  BLOCK: Coherence
    - toggle: enableCoherence
    - slider: coherenceStrength [0, 1]

TAB: OUTPUT
  BLOCK: Tiles
    - slider: tileWidth [4, 16]
    - slider: tileHeight [8, 24]
  BLOCK: Format
    - dropdown: outputFormat [Plain Text, HTML Pre, ANSI Color]
  BLOCK: Export
    - button: Copy to Clipboard
    - button: Download TXT
    - button: Download HTML

## 4. Implementation Skeleton
```javascript
var TOOL_CONFIG = {
    title: 'ASCII ART GENERATOR',
    sidebar: [/* tabs/blocks as above */],
    canvas: { width: 800, height: 600 },
    onInit: function(ctx, canvas, values) {
        this.glyphDB = new GlyphFeatureDB();
        this.buildGlyphDB(values.fontFamily, values.characterSet);
    },
    onDraw: function(ctx, canvas, values) {
        if (!this.sourceImage) return;
        var tiles = this.preprocessor.slice(this.sourceImage, values);
        var matches = tiles.map(t => this.matcher.match(t, this.glyphDB, values));
        if (values.enableCoherence) {
            matches = this.coherenceEngine.refine(matches);
        }
        this.renderer.render(ctx, matches, values);
    }
};
```

