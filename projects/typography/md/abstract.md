The Typography toolkit is a set of three complementary font measurement and comparison tools that use the browser's Canvas `measureText` API as their single authoritative source of metric data. Rather than relying on CSS declarations, OpenType table values read from binary font files, or empirical visual estimation, all measurements are derived from the values the rendering engine reports after it has applied its own hinting, subpixel rounding, and platform-specific adjustments. This makes the measurements *operational*: they describe what the text will look like on screen, not what the font designer intended in theory.

The three tools are:

- **Font Analysis** — three-column simultaneous comparison of up to three typefaces, displaying sample text, annotated metric overlays on a letter canvas, and a character grid for the full glyph repertoire.
- **Font Size Comparison** — cross-font ratio computation: given two fonts at any two sizes, computes the factor by which size B must be adjusted to achieve the same visual cap height or x-height as size A.
- **Font Dimension Finder** — a single-font deep-dive that reports all Canvas TextMetrics fields for any character at any size, including the font bounding box (typographic line height), actual bounding box (tight glyph bounds), and advance width.

Together they answer the questions that arise in typographic system design: which fonts appear the same optical size at the same CSS `font-size`? What is the x-height to cap-height ratio of this typeface? How tight is the default line box? The tools are embedded in the site and use Google Fonts for remote loading, with a documented fallback to system fonts.
