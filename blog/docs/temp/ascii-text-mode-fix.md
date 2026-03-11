# ASCII Art Generator - Text Mode Fix

## The Real Issue (Finally Understood)

**User's Goal:** Minimize per-pixel luminance difference between ASCII output and original image.

**The Problem:**
- Glyph atlas renders: **white text on black** background
- User wants output: **black text on white** background
- These are OPPOSITE polarity!

**Old System (broken):**
- "Invert Mapping" toggle (confusing, user didn't understand what it did)
- Separate text color/background controls (disconnected from matching)
- Mapping and display were separate concepts

**New System (fixed):**
- **Single "Text Mode" radio:** "Black on White" vs "White on Black"
- Automatically inverts image metrics when mode = "Black on White"
- Automatically sets display colors to match mode
- One control → consistent behavior

## How It Works Now

### Text Mode: "Black on White" (default)

**Matching:**
```javascript
Image tile: density=0.9 (bright area)
→ INVERTED → density=0.1
→ Matches ' ' (space, density=0.0) ← CORRECT!

Image tile: density=0.1 (dark area)  
→ INVERTED → density=0.9
→ Matches '#' (dense char, density=0.7) ← CORRECT!
```

**Display:**
- Background: white (#FFFFFF)
- Text: black (#000000)
- Bright areas stay bright (spaces)
- Dark areas get dark characters

**Result:** Minimal luminance difference ✓

### Text Mode: "White on Black"

**Matching:**
```javascript
Image tile: density=0.9 (bright area)
→ NO INVERT → density=0.9
→ Matches '#' (dense, density=0.7) ← fills bright areas

Image tile: density=0.1 (dark area)
→ NO INVERT → density=0.1  
→ Matches ' ' (space, density=0.0) ← keeps dark areas empty
```

**Display:**
- Background: black (#000000)
- Text: white (#FFFFFF)
- Bright areas get white characters
- Dark areas stay dark (spaces)

**Result:** Artistic/inverted look

## Changes Made

### UI Changes
1. **Added:** "Text Mode" radio in INPUT tab (Black on White / White on Black)
2. **Removed:** "Invert Mapping" toggle (confusing)
3. **Removed:** Text Color picker (now automatic)
4. **Removed:** Background dropdown (now automatic)

### Code Changes
1. `textMode` value drives both matching inversion AND display colors
2. `onUpdate` triggers reprocess when textMode changes
3. `processImage` / `processImageProportional` use `textMode === 'Black on White'` to invert
4. `onDraw` sets `bgColor` and `textColor` from `textMode`
5. `drawAscii` uses `textMode` to set text color

### Benefits
- **Intuitive:** "I want black text on white" → select that mode → done
- **Consistent:** Matching and display always aligned
- **Correct:** Bright areas stay bright, dark areas stay dark (for Black on White)
- **Simple:** One control instead of three disconnected ones

## The White Area / Periods Bug

User noted: "clipped white section showing as periods/commas instead of spaces"

This should now be fixed because:
1. **Black on White mode (default)** inverts metrics
2. White area (density ~0.9) → inverted (0.1) → matches ' ' (0.0)
3. Periods (density ~0.05) and commas (density ~0.03) are worse matches than space

If still occurring, likely causes:
- Quadrant mismatch (try increasing Quadrant β to 0.8)
- Tone weight too high (try decreasing Tone α to 0.1)
- Pixel group > 1 (use pixelGroup=1 for best accuracy)

