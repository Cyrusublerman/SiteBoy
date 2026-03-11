# ASCII Art Generator - Fixes Completed

## 1. UI/Preview Issues ✅

### Move overlay options to INPUT tab ✅
- Moved 'ASCII Over Image', 'Show Edge Detection', 'ASCII Opacity %' to INPUT > Preview section
- Removed duplicate controls from DISPLAY tab
- Wire up showSplitView toggle to handle all three options

### Real-time preview ✅
- Updated onUpdate to trigger draw() when processOptions change
- Split view now shows:
  - Left: processed image + optional edge detection overlay
  - Right: ASCII output + optional image underlay
- All display modes now update immediately when toggling invert/edge/etc

## 2. Character/Image Spatial Mismatch ✅

### Problem
User reported: "character where nearly all of their darkness is in the white part of the image" at pixelGroup=1

### Root Cause
Default matching weights prioritized overall tone (40%) over spatial correlation (20%). This allowed characters to match based on average brightness, even if their pixels didn't align spatially with the image.

### Fix Applied
**Rebalanced default matching weights to prioritize spatial correlation:**
- Tone α: 0.4 → 0.2 (40% → 20%)
- Quadrant β: 0.2 → 0.6 (20% → 60%) ← INCREASED
- Orientation γ: 0.3 → 0.2 (30% → 20%)
- Signature δ: 0.1 (unchanged)

This ensures characters match WHERE their pixels are, not just HOW MANY pixels they have.

### Why This Works
- **Quadrant β** measures spatial correlation: dark character pixels in dark image areas
- Increasing from 20% to 60% makes spatial alignment the primary matching criterion
- Tone still contributes (20%) for overall brightness matching
- Users can still adjust weights manually via sliders if needed

## 3. All Changes Summary

### UI Changes
1. Preview options moved to INPUT tab (Split View, ASCII Over Image, Show Edge Detection, ASCII Opacity)
2. Split view properly composites all overlay modes
3. Real-time updates when toggling Invert Image, edge modes, etc

### Algorithm Changes
1. Default quadrant weight: 0.2 → 0.6 (spatial correlation now primary)
2. Default tone weight: 0.4 → 0.2 (overall brightness now secondary)
3. Default orientation weight: 0.3 → 0.2

### Expected Result
- Characters should now align pixel-by-pixel with image features
- Dark character regions in dark image regions, bright in bright
- Edge cases (sharp transitions) should show less misalignment
- "ASCII Over Image" mode should show proper visual correlation

## 4. Testing Notes

To verify the fix:
1. Upload high-contrast image (sharp edges, clear light/dark areas)
2. Enable "Split View" + "ASCII Over Image"
3. Set pixelGroup=1 for maximum accuracy
4. Observe: character shapes should align with image features
5. Try adjusting Quadrant β slider to see effect

If mismatch persists:
- Try enabling "Invert Mapping" (may be needed depending on text color vs image)
- Increase Quadrant β further (up to 0.8-0.9)
- Check that pixel group is set to 1

