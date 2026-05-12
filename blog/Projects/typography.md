# Typography System (Font Metrics)

The typography project describes a measurable approach to selecting and validating typefaces by extracting font metrics from the rendering engine itself and comparing those metrics as ratios.

## Technical Domain

Canvas text measurement, glyph bounding boxes, typographic scale validation (ascent/descent/cap height/x-height), font-to-font ratio computation, and multi-font comparative visualisation.

## Architecture

### 1. Measurement authority: Canvas TextMetrics
Font metrics are extracted using the Canvas 2D `measureText()` API and related bounding-box fields:
- `fontBoundingBoxAscent`
- `fontBoundingBoxDescent`
- glyph width via `metrics.width`
- bounding extents (e.g. `actualBoundingBoxLeft/Right`) to compute glyph width precisely

Letter-specific metrics are anchored on chosen sample letters:
- x-height uses the `x` glyph (lowercase ‘x’)
- cap height uses the `H` glyph (uppercase ‘H’)

This ties the system to the actual browser text rendering rather than approximations.

### 2. Multi-font comparison layout (up to 3 fonts)
The tool supports side-by-side comparisons:
- three independent font selectors
- a single sample text value and a single “detail letter” value
- per-font font size control

Outputs are:
- a visual metrics overlay (baseline + ascent/descent lines + labelled measurement markers)
- computed ratios between fonts (expressed as percentages relative to a chosen baseline font)

### 3. Ratio model as scale validation
The comparison is not only qualitative. It computes explicit ratios such as:
- cap height ratio
- x-height ratio
- advance/width ratio

These ratios allow a “visual scale planning” interpretation:
- if font B’s cap height is 103% of font A’s cap height at the same nominal size, downstream spacing rules can be adjusted using that ratio

### 4. Loading contract: dynamic font availability
The tool integrates with a Google Fonts loading path to support runtime font selection and consistent measurement.
If a font is unavailable, the system falls back to a safe default path and preserves measurement meaning through the actual rendered font.

## Skills Demonstrated (competency tags)

- Building a font-metrics pipeline grounded in Canvas TextMetrics authority.
- Defining typographic scale quantities as explicit named metrics.
- Computing cross-font ratios to convert “same px size” into “equivalent typographic scale”.
- Visual diagnostics: metric-line overlays and glyph boundary visualisation.
- Font loading integration as a precondition for deterministic measurement.

## Stack

- Font analysis tool spec: `blog/docs/pages/tools/font-analysis-tool.md`
- Measurement source: `assets/js/tools/font-analysis-tool.js` (implementation layer)

