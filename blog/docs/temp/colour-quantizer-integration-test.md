/**
 * Test Integration — Colour Quantizer with Standard Adjustment Bundle
 * 
 * Changes Made:
 * 1. Replaced manual adjustment sliders with StandardBundle
 * 2. Wired bundle onChange to update preview
 * 3. Wired bundle onTransform to handle resize/rotate/flip
 * 4. Bundle automatically applies adjustments when image loads
 * 
 * Files Modified:
 * - assets/js/tools/processors/colour-quantizer-toolbase.js
 * 
 * What to Test:
 * 1. Load Colour Quantizer tool
 * 2. Upload an image
 * 3. Use adjustment sliders (Brightness, Contrast, Gamma, Exposure, Saturation, Hue)
 * 4. Use Levels sliders (Black/Mid/White)
 * 5. Use Transform controls (Resize, Rotate, Flip)
 * 6. Click Reset All
 * 7. Click Undo
 * 8. Process image with quantization
 * 
 * Expected Behavior:
 * - Image loads and displays in canvas
 * - Adjustment bundle appears in ADJUSTMENTS section
 * - Sliders update preview in real-time (debounced)
 * - Transforms update canvas dimensions when resizing
 * - Reset button restores all defaults
 * - Undo button reverts last change
 * - Process button works with adjusted image
 * 
 * Known Issues to Watch For:
 * - Bundle container may need CSS styling for proper placement
 * - Import paths must be correct
 * - BaseComponent import in SimpleCurveEditor needs correct path
 * - CSS file needs to be linked in HTML
 * 
 * Next Steps if Working:
 * 1. Add adjustment-bundles.css to main CSS imports
 * 2. Test on multiple browsers
 * 3. Test with large images (performance)
 * 4. Integrate into ASCII Art Generator
 * 5. Create dedicated Image Processor tool with ProfessionalBundle
 */

// No code here - this is documentation only

