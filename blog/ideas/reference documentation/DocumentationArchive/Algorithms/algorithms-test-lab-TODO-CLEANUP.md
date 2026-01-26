# Algorithms Test Lab - Remaining Cleanup Tasks

## COMPLETED ✅
1. British spelling: "Randomise" (not "Randomize")
2. Backend handler updated for randomise button
3. Centralized `algorithmExists()` check function added
4. Main `renderAlgorithm()` updated to use centralized check
5. Removed synthetic domain renderers from switch statement

## CRITICAL: Manual File Cleanup Needed

### Problem
The file has **orphaned code** (lines 1077-1630) - 553 lines of synthetic renderer function bodies that need deletion.

### What Needs To Be Deleted
Delete everything between:
- **Start**: Line 1077 (blank line after "UTILITY FUNCTIONS" header)
- **End**: Line 1630 (blank line before `function renderFallback`)

This includes the entire bodies of:
- renderReactionDiffusion (orphaned)
- renderQuantization (orphaned)
- renderGraphs (orphaned)
- renderEdges (orphaned)
- renderFiltering (orphaned)
- renderSegmentation (orphaned)
- renderCurves (orphaned)
- renderVectorization (orphaned)
- renderOptics (orphaned)
- renderPhysics (orphaned)

### What Should Remain
After deletion, the file should have:
```javascript
// Line ~1074
// ═══════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function renderFallback(ctx, canvas, text) {
    // ... (keep this)
}

function renderNA(ctx, canvas, algorithmName) {
    // ... (keep this)
}

function algorithmExists(fullAlgoId) {
    // ... (keep this)
}

function paletteIndex(v) {
    // ... (keep this)
}

// Then the REAL renderer functions:
function renderNoise(algoId, ctx, canvas, values) {
    // ... (keep this - calls A.Noise.*)
}

function renderSampling(algoId, ctx, canvas, values) {
    // ... (keep this - calls A.Sampling.*)
}

function renderSpaceFilling(algoId, ctx, canvas, values) {
    // ... (keep this - calls A.SpaceFilling.*)
}

function renderTSP(algoId, ctx, canvas, values) {
    // ... (keep this - calls A.TSP.*)
}

function renderPatterns(algoId, ctx, canvas, values) {
    // ... (needs cleanup - remove synthetic gratings)
}

function renderDistance(algoId, ctx, canvas, values) {
    // ... (needs cleanup - remove synthetic SDFs)
}
```

## TODO After Manual Cleanup

### 1. Clean `renderPatterns()`
Remove synthetic code for:
- linearGrating
- radialGrating
- moire
- halftone

Keep only:
```javascript
function renderPatterns(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    if (algoId === 'truchet' && A.Patterns?.truchet) {
        const gridSize = values.gridSize || 24;
        const seed = values.seed || 42;
        A.Patterns.truchet(ctx, canvas.width, canvas.height, gridSize, seed);
    }
}
```

### 2. Clean `renderDistance()`
Remove synthetic code for:
- sdfPrimitives
- sdfBoolean
- geodesic

Keep only:
```javascript
function renderDistance(algoId, ctx, canvas, values) {
    const A = window.Algorithms;
    if (algoId === 'jfa' && A.Distance?.jumpFloodAlgorithm) {
        // ... JFA implementation
    }
}
```

### 3. Clean `renderSpaceFilling()`
Remove synthetic lSystem tree code

### 4. Add Randomise Button Layout Fix
Button currently on separate row, needs to be inline with seed input.

Options:
- Modify ToolBase to support inline button
- Create custom control renderer for this tool

### 5. Standardize All Algorithm Controls
ALL algorithms should have seed + randomise button, not just noise.

## Expected Final Line Count
- **Before**: ~2500 lines
- **After**: ~1200 lines (over 50% reduction)

## Testing After Cleanup
1. Verify centralized N/A check works
2. Test noise algorithms (should work)
3. Test sampling (should work if library exists, else N/A)
4. Test everything else (should show N/A)
5. Verify randomise button appears and works
6. Verify block headers highlight properly

## Architecture Achievement
✅ Centralized algorithm existence check  
✅ Modular design - no duplication
✅ Clear N/A for unimplemented algorithms
⏳ Clean renderer functions (only library calls)
⏳ Inline randomise button layout

