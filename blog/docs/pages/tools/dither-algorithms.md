# Dither Algorithms Module

Comprehensive dithering algorithm library for image quantization.

## Overview

Modular dithering system supporting multiple algorithm categories for both black/white and color quantization.

## Module Structure

```
assets/js/tools/dither/
├── index.js              # DitherRegistry (algorithm catalog)
├── algorithms.js         # Core implementations
├── app/
│   └── dither-algorithms.js
└── shared/
    ├── index.js
    ├── dither-algorithms.js
    └── ordered-dither-variants.js
```

## Algorithm Categories

### Threshold
| Algorithm | Description |
|-----------|-------------|
| Threshold | Simple binary cutoff |
| Adaptive Threshold | Local contrast-based |
| Closest Color | Nearest palette match |

### Noise-Based
| Algorithm | Description |
|-----------|-------------|
| Random | Random threshold per pixel |
| Simplex | Simplex noise threshold |

### Arithmetic
| Algorithm | Description |
|-----------|-------------|
| XOR (High/Med/Low) | XOR position threshold |
| ADD (High/Med/Low) | ADD position threshold |

### Error Diffusion
| Algorithm | Description |
|-----------|-------------|
| Floyd-Steinberg | Classic 4-pixel diffusion |
| Jarvis-Judice-Ninke | 12-pixel diffusion |
| Stucki | 12-pixel diffusion (modified) |
| Burkes | 7-pixel diffusion |
| Sierra 3 | 10-pixel diffusion |
| Sierra 2 | 7-pixel diffusion |
| Sierra 1 | 4-pixel diffusion |
| Atkinson | 6-pixel, 75% diffusion |
| Reduced Atkinson | Modified Atkinson |

### Ordered Dithering

#### Patterns
| Pattern | Sizes |
|---------|-------|
| Bayer | 2, 4, 8, 16 |
| Hatch (H/V/R/L) | 4 |
| Cross Hatch (H/V/R/L) | 4 |
| Zigzag (H/V) | 4, 8, 16 |
| Checkerboard | 2 |
| Cluster | 4 |
| Heart | 8, 16 |
| Stars | 16 |
| Smile | 8, 16 |
| Fishnet | 8 |
| Dot | 4, 8 |
| Halftone | 8 |
| Square | 2, 4, 8, 16 |

#### Variants
- Normal
- Random
- Simplex

#### Extra Types (Color)
- Stark
- Hue-Lightness
- Yliluoma-1
- Yliluoma-2

## Core Functions

### Color Space Helpers
```javascript
// Delta E 76 perceptual distance
const deltaE76 = (a, b) => {
    const dL = a.L - b.L;
    const da = a.a - b.a;
    const db = a.b - b.b;
    return Math.sqrt(dL*dL + da*da + db*db);
};
```

### Nearest Color Picker
```javascript
const pickNearest = (lab, paletteLabs) => {
    let best = 0, bestD = Infinity;
    for (let i = 0; i < paletteLabs.length; i++) {
        const d = deltaE76(lab, paletteLabs[i]);
        if (d < bestD) { bestD = d; best = i; }
    }
    return best;
};
```

### No Dither
```javascript
export function ditherNone(imageData, palette, paletteLabs, colorSpace) {
    // Map each pixel to nearest palette color
}
```

### Blue Noise (Nearest Opposite Checked)
```javascript
export function ditherBlueNoiseNearestOppositeChecked(
    imageData, palette, paletteLabs, colorSpace, blueNoise
) {
    // For each pixel:
    // 1. Find closest palette color (C)
    // 2. Find opposite color (I)
    // 3. Project target onto C-I segment
    // 4. Use blue noise threshold for mix
}
```

### Floyd-Steinberg
```javascript
export function ditherFloydSteinberg(
    imageData, palette, paletteLabs, colorSpace
) {
    // Diffuse quantization error to neighbors:
    // [   *  7/16 ]
    // [3/16 5/16 1/16]
}
```

## Usage

```javascript
import { DitherFunctions } from './dither/algorithms.js';
import { DitherRegistry } from './dither/index.js';

// Get available algorithms
const bwAlgorithms = DitherRegistry.bw;
const colorAlgorithms = DitherRegistry.color;

// Apply dithering
const result = DitherFunctions['floyd-steinberg'](
    imageData, palette, paletteLabs, colorSpace
);
```

## Exported Functions

```javascript
export const DitherFunctions = {
    none: ditherNone,
    'blue-noise': ditherBlueNoiseNearestOppositeChecked,
    'floyd-steinberg': ditherFloydSteinberg
};
```

## Dependencies

- Color space converter with `rgbToLab()` and `hexToRgb()`
- Palette array of hex colors
- Pre-computed palette LAB values
- Blue noise texture (for blue-noise algorithm)

## Source Reference

`assets/js/tools/dither/`

Based on reference: dithermark

