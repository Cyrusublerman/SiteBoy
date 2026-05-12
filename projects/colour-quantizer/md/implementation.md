### Source location

`assets/js/tools/colour-quantizer-toolbase.js` (~520 lines). The original reference implementation lived at `reference/QuickToolRebuildReference/Tools/colourquantiser/dist/script.js`; the ToolBase port restructures state, replaces direct DOM manipulation with the framework's sidebar declaration, and integrates the tool into the router and URL model.

### ColorSpaceConverter

A static utility object at module scope. All methods are pure functions; the only state is a `Map`-based cache keyed on hex strings (palette entries) and 24-bit packed integers (pixel colours). The cache trades memory for compute: on photographic images with millions of unique colours the miss rate is high, but on already-quantised or synthetic images with few unique values the hit rate is near 100%.

```javascript
const ColorSpaceConverter = {
    cache: new Map(),
    WHITE_REFERENCE: { X: 0.95047, Y: 1.0, Z: 1.08883 }, // CIE D65

    rgbToLab(r, g, b) {
        const key = (r << 16) | (g << 8) | b;
        if (this.cache.has(key)) return this.cache.get(key);
        const lab = this._xyzToLab(...this._linearToXyz(this._srgbToLinear([r/255, g/255, b/255])));
        this.cache.set(key, lab);
        return lab;
    },

    _srgbToLinear([r, g, b]) {
        return [r, g, b].map(c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    },

    _linearToXyz([R, G, B]) {
        return [
            R*0.4124564 + G*0.3575761 + B*0.1804375,
            R*0.2126729 + G*0.7151522 + B*0.0721750,
            R*0.0193339 + G*0.1191920 + B*0.9503041
        ];
    },

    _xyzToLab(X, Y, Z) {
        const f = t => t > 0.008856 ? t ** (1/3) : (7.787 * t) + (16/116);
        const fx = f(X / 0.95047), fy = f(Y / 1.0), fz = f(Z / 1.08883);
        return { L: 116*fy - 16, a: 500*(fx - fy), b: 200*(fy - fz) };
    }
};
```

Note that `0.008856 = (6/29)^3` and `7.787 = (29/6)^2 / 3 = 1 / (3 × (6/29)^2)`, which is the slope of the linear portion of the f function (see *Colour Science Background*).

### ToolBase wiring

The tool declares its sidebar in a `TOOL_CONFIG` object consumed by the ToolBase host. The four tabs (IMAGE, PALETTE, PROCESS, EXPORT) map directly to logical pipeline stages. State is a plain object (`state`) rather than a class instance; the ToolBase `onUpdate` callback dispatches on `key` to trigger the correct pipeline stage.

The `onInit` callback fires once when the tool's canvas is mounted. It loads the blue-noise texture (`HDR_L_0.png`, 512×512, sourced from CodePen assets) into `state.blueNoiseTextureData` by drawing the image to a temporary off-screen canvas and reading its `ImageData`. This is done asynchronously; attempting to process before the texture loads degrades silently to no dithering.

### Performance characteristics

On a 1 MP (1000×1000) image with a 56-entry NES palette and no dithering:
- LAB conversion: ~180 ms on a mid-range M1 Mac (single-threaded JS)
- Nearest-colour scan (56 entries × 1M pixels = 56M distance computations): ~320 ms
- Total: ~500 ms

The memoisation cache reduces this significantly on images with limited unique colours. A structured worker-based split (e.g., 8 row bands processed in parallel via `Worker` pool) would bring the NES 56-colour run to under 100 ms; this is noted as a future improvement.

With blue-noise dithering the per-pixel cost increases by roughly 1.5× due to the nearest-opposite pass and the noise texture lookup.

### Blue-noise texture loading

```javascript
function loadBlueNoise() {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        const c = document.createElement('canvas');
        [c.width, c.height] = [img.width, img.height];
        c.getContext('2d').drawImage(img, 0, 0);
        state.blueNoiseTextureData = c.getContext('2d').getImageData(0, 0, img.width, img.height);
    };
    img.src = 'https://assets.codepen.io/3457130/HDR_L_0.png';
}
```

The texture is tiled by taking `(x % 512)` and `(y % 512)` as the lookup coordinates, which works correctly for any image size.
