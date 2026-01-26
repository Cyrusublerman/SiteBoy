# Algorithms Test Lab - N/A Conversion Plan

## USER REQUIREMENTS
1. British spelling: "Randomise" not "Randomize" ✅ DONE
2. Randomise button to RIGHT of seed input (needs layout fix)
3. ALL algorithms must have identical block structure
4. NO synthetic renderers - show "N/A" if not implemented

## CURRENT STATUS (Per User Report)
- ✅ Noise functions: WORKING (4 algorithms)
- ✅ Patterns: WORKING (but likely only Truchet)
- ❌ Everything else: Shows synthetic renders (WRONG - should be N/A)

## CONVERSION STRATEGY

### Keep As-Is (Check Library, else N/A)
- **Noise** (4): simplex2D, fbm2D, domainWarp2D, multiWarp2D - Already implemented correctly
- **Patterns** (1): truchet - Has library check, add N/A for others
- **Sampling** (4): All have library checks, just need to add N/A fallbacks
- **Space-Filling** (4): All have library checks, need N/A fallbacks
- **TSP** (3): Have library checks, need N/A fallbacks  
- **Distance.jfa**: Has library check, needs N/A fallback

### Convert to N/A (Remove Synthetic Code)
- **Patterns** (4): linearGrating, radialGrating, moire, halftone → N/A
- **Edges** (6): All synthetic gradient code → N/A
- **Filtering** (3): All placeholder code → N/A
- **Segmentation** (3): All synthetic regions → N/A
- **Curves** (4): All synthetic vectors → N/A
- **Vectorization** (3): All synthetic contours → N/A
- **Distance** (3): sdfPrimitives, sdfBoolean, geodesic → N/A
- **Optics** (4): All synthetic interference → N/A
- **Physics** (4): All synthetic waves → N/A
- **Reaction-Diffusion** (4): All synthetic patterns → N/A
- **Quantization** (4): All synthetic quantization → N/A
- **Graphs** (2): All synthetic grids → N/A
- **Space-Filling.lSystem**: Remove synthetic tree → N/A

## CONTROL STANDARDIZATION

ALL algorithms should have:
```javascript
return [
    ['number', 'Seed', 0, 999, 1, { key: `${fullId}_seed`, value: 0 }],
    ['button', 'Randomise', { key: `${fullId}_randomise`, label: 'Randomise' }],
    // ...algorithm-specific controls
];
```

## LAYOUT FIX FOR INLINE BUTTON

Current: Button appears on separate row
Needed: Button to right of seed input

Options:
1. Modify ToolBase to support inline button with number input
2. Create custom control renderer for this tool
3. Use a compound control type

Recommended: Add compound control type to ToolBase: `['numberWithButton', ...]`

