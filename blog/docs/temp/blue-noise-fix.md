# Blue Noise Dithering Fix

## Issue
Blue noise dithering was only "lightly fuzzing the edges" instead of properly dithering the entire image.

## Root Cause
The `dither-processor.js` was calling a simple `quantizeWithBlueNoise()` helper function that only:
1. Added noise to RGB values
2. Quantized to nearest color

This is NOT the proper blue noise bracketing algorithm.

## The Proper Algorithm
`ditherBlueNoiseBracketing()` in `blue-noise-bracketing.js` implements the full algorithm:
1. Determines dithering strategy per pixel (solid, bracketing, etc.)
2. Uses blue noise threshold to choose between closest colors
3. Applies perceptual color distance (LAB space) for better results
4. Handles edge cases and color transitions properly

## Fix
Changed line 60 in `dither-processor.js`:

```javascript
// ❌ BEFORE: Simple noise + quantize
return quantizeWithBlueNoise(imageData, palette, paletteLabs, blueNoiseTexture);

// ✅ AFTER: Proper blue noise bracketing algorithm
return ditherBlueNoiseBracketing(imageData, palette, paletteLabs, blueNoiseTexture, ColorSpace);
```

## Files Modified
- `assets/js/shared/workers/dither-processor.js` — Line 60: Use proper blue noise algorithm

## Result
Blue noise dithering now produces proper dithering across the entire image, not just edge fuzz.


