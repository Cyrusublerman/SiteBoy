### Why measure rather than compute

A font's metrics are stored in the OpenType `head`, `OS/2`, and `hhea` tables. CSS exposes some of these via `font-size`, `line-height`, and the computed `ex` unit. However, none of these sources reflect what the browser actually renders:

- `font-size` sets the *em square*, which is a design-space unit that has no fixed relationship to the visual cap height or x-height — fonts at the same `font-size` can look dramatically different in optical size.
- `line-height` uses the font's UPM (units per em) to determine spacing, but the actual painted pixel extent can be smaller or larger than the line box.
- CSS does not expose cap height, x-height, or actual glyph extents from the layout engine.

The Canvas `TextMetrics` object, returned by `ctx.measureText(text)`, reports values in the *device pixels at the current transform scale* that the 2D renderer computes after applying all hinting and rounding. It is the only accessible interface that reflects the true rendering geometry.

### TextMetrics fields used

```javascript
const ctx = canvas.getContext('2d');
ctx.font = `${fontSize}px "${fontFamily}"`;
const m = ctx.measureText(letter);

const metrics = {
    // Font-wide (same for all glyphs at this font/size):
    fontBoundingBoxAscent:  m.fontBoundingBoxAscent,   // baseline to top of line box
    fontBoundingBoxDescent: m.fontBoundingBoxDescent,  // baseline to bottom of line box

    // Glyph-specific (tight ink bounds):
    actualBoundingBoxAscent:  m.actualBoundingBoxAscent,   // baseline to ink top
    actualBoundingBoxDescent: m.actualBoundingBoxDescent,  // baseline to ink bottom
    actualBoundingBoxLeft:    m.actualBoundingBoxLeft,     // from anchor to left ink
    actualBoundingBoxRight:   m.actualBoundingBoxRight,    // from anchor to right ink

    // Advance:
    width: m.width    // total advance width (includes side bearings)
};
```

Derived metrics computed from these fields:

- **Cap height** = `measureText('H').actualBoundingBoxAscent`
- **x-height** = `measureText('x').actualBoundingBoxAscent`
- **Ascent** = `fontBoundingBoxAscent` (full typographic ascender)
- **Descent** = `fontBoundingBoxDescent` (full typographic descender)
- **Line height** = `fontBoundingBoxAscent + fontBoundingBoxDescent`
- **Glyph height** = `actualBoundingBoxAscent + actualBoundingBoxDescent`
- **Advance width** = `width`

### Anchor letter choice

Cap height is measured on 'H' (flat-topped capital, no overshoot) and x-height on 'x' (flat-topped lower case). Both avoid the optical overshoot that round glyphs ('O', 'o', 'c') have — they sit slightly above and below the grid lines to appear optically aligned to them. Using 'H' and 'x' gives the grid-based values that designers use when specifying type scale.
