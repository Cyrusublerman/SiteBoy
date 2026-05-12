### Preset palettes

The tool ships nine preset palettes, each named and sized for a recognisable reference system or aesthetic:

| Key | Colours | Origin |
|---|---|---|
| `1-bit` | 2 | Pure black and white |
| `2-bit` | 4 | Four greys at equal luminance steps |
| `3-bit` | 8 | RGB cube corners |
| `3-bit-gray` | 8 | Eight greys |
| `gameboy` | 4 | Nintendo Game Boy LCD green palette |
| `nes` | 56 | Full Nintendo Entertainment System hardware palette |
| `primaries` | 8 | Red, green, blue, cyan, magenta, yellow, white, black |
| `pastel` | 12 | Soft desaturated mid-tones |
| `ggost` | 17 | Hand-curated artistic palette |

All palette colours are stored as CSS hex strings. At palette-selection time the entire array is converted to CIELAB and cached — no per-pixel hex parse occurs during quantisation.

### Palette LAB precomputation

```javascript
function preparePaletteLabs(paletteHexArray) {
    return paletteHexArray.map(hex => {
        const { r, g, b } = ColorSpaceConverter.hexToRgb(hex);
        return ColorSpaceConverter.rgbToLab(r, g, b);
    });
}
```

This array is recomputed once whenever the active palette changes and is passed by reference to both the no-dither and dither quantise functions.

### Custom palette

The user may add arbitrary colours via an `<input type="color">` control. The internal representation is identical to presets: an array of hex strings converted to LAB on first use. The custom palette is initialised to `['#000000', '#FFFFFF']` and grows incrementally via *Add Color*. *Clear Custom* resets it to the two-entry default.

A label in the sidebar tracks the current count. There is no upper bound enforced in the UI, though at very large palette sizes (> 200 entries) the linear scan will become noticeably slow on high-resolution images. A future improvement would offer a K-means initialisation path that derives a palette from the image itself rather than requiring manual colour entry.

### Palette coverage and gamut

Not all palettes cover the full sRGB gamut. The 1-bit, 2-bit, and 3-bit-gray palettes map any colour to the nearest luminance step, which produces high-contrast posterisation. The NES palette is the most complete, with careful spacing across hue, saturation, and brightness that reflects the hardware's DAC-driven colour generation. The GGost palette was selected for aesthetic cohesion rather than gamut coverage, making it suitable for illustration-style output where limited palette fidelity is the desired effect.
