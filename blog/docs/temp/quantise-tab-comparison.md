# Quantise Tab: Multifilament vs Colour Quantizer

## ✅ IMPLEMENTED (2026-01-28)

### Multifilament QUANTIZE Tab
**Location:** `_getQuantizeSidebar()` in `multifilament-print-tool.js`

**Sidebar Config:**
```
CONTROLS:
  PALETTE:
    - label: status (colour count + names)
    - palettePreview: visual swatches (read-only from grid)
    
  IMAGE:
    - file: Source Image
    - number: Print Width (mm) [50-300, default 170]
    
  RESOLUTION:
    - number: Max Detail (mm) [0.1-2, step 0.1, default 0.4]
    - button: Downscale to Detail
    - label: resolution status
    
  DITHER:
    - dropdown: Algorithm [None, Floyd-Steinberg, Bayer 4×4, Blue Noise]
    - number: Min Detail (mm) [0-2, step 0.1, default 0.8]
    
  ACTIONS:
    - button: Quantize Image
    - label: status
```

**Implemented Functions:**
- `_loadBlueNoise()` — loads 64×64 blue noise texture
- `_updatePalettePreview()` — syncs preview with grid palette
- `_downscaleAction()` — pixelates to printer resolution
- `_quantizeAction()` — full pipeline with 4 algorithms

**Algorithms Available:**
| Algorithm | Source Module | Notes |
|-----------|---------------|-------|
| None | `nearest-color.js` | LAB-based nearest colour |
| Floyd-Steinberg | `error-diffusion.js` | Classic error diffusion |
| Bayer 4×4 | `ordered.js` | Ordered dither pattern |
| Blue Noise | `blue-noise-bracketing.js` | Perceptual bracketing |

---

## Comparison with Colour Quantizer

| Feature | Multifilament | Colour Quantizer |
|---------|---------------|------------------|
| Palette source | Grid-derived (read-only) | User-selectable (35+) |
| Palette preview | ✅ Visual swatches | ✅ Visual + editable |
| Downscale | ✅ Print resolution limit | ❌ |
| Dither algorithms | 4 | 17 |
| Min detail filter | ✅ Printability filter | ❌ |
| LAB matching | ✅ | ✅ |
| Layer expansion | ✅ (for STL) | ❌ |

---

## Key Differences

**Multifilament-specific (not in ColourQuantizer):**
1. Grid-derived palette (physical filament calibration)
2. Downscale to printer resolution (Max Detail mm)
3. Min detail filter (removes unprintable features)
4. Print width physical mapping

**ColourQuantizer extras (not needed for multifilament):**
- Palette extraction from image
- Custom palette management
- Palette import/export (GPL, HEX, JSON)
- Batch processing
- Image adjustment bundle

