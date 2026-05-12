### Google Fonts dynamic loading

The tools load fonts from the Google Fonts API on demand. Loading injects a `<link rel="stylesheet">` element pointing to the Fonts CSS v2 endpoint:

```javascript
async function loadGoogleFont(fontFamily, weights = '400;700') {
    const url = `https://fonts.googleapis.com/css2?family=${
        encodeURIComponent(fontFamily)
    }:wght@${weights}&display=swap`;

    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);

    // Wait for the font face to be available
    await document.fonts.load(`16px "${fontFamily}"`);
}
```

`document.fonts.load()` returns a promise that resolves once the font is downloaded, parsed, and available to `canvas.measureText`. Without this await, `measureText` on the first call may fall back to the system default font, producing incorrect metrics.

### System font detection

For system fonts, two detection methods are used depending on browser capability:

**Modern (Chrome 103+):** `window.queryLocalFonts()` returns an array of `FontData` objects for all installed fonts. The family names are de-duplicated and sorted.

**Universal fallback:** For each candidate font family from a list of ~100 common typefaces, a render-width comparison detects availability:

```javascript
function isFontAvailable(family) {
    const ctx = new OffscreenCanvas(200, 1).getContext('2d');
    const probe = 'mmmmmmmmmmlli';

    ctx.font = `14px "${family}", serif`;
    const withFont = ctx.measureText(probe).width;

    ctx.font = `14px serif`;
    const withSerif = ctx.measureText(probe).width;

    return Math.abs(withFont - withSerif) > 0.1;
}
```

If the named font is present, the rendered width differs from the `serif` fallback by more than the floating-point noise threshold.

### Monospace classification

After detection, each font is classified as monospace or proportional by testing whether a set of characters with varied visual widths (`i`, `l`, `m`, `W`, `@`) all produce the same advance width:

```javascript
function isMonospace(family, size = 14) {
    const ctx = new OffscreenCanvas(200, 1).getContext('2d');
    ctx.font = `${size}px "${family}"`;
    const widths = ['i','l','m','W','@'].map(c => ctx.measureText(c).width);
    return Math.max(...widths) - Math.min(...widths) <= 1.0;
}
```

The 1.0 px tolerance accounts for subpixel rounding without misclassifying proportional fonts. The Font Analysis tool provides a toggle to show only monospace fonts, which is used when the intended application is terminal or code rendering.

### Fallback semantics

`ctx.font` accepts a CSS font-family string, so fallback chains work normally. Setting `ctx.font = '14px "Nonexistent", monospace'` will silently use the browser's default monospace if the named font is unavailable. The tools detect this case by comparing the rendered width of the family against the monospace fallback and warning if they match.
