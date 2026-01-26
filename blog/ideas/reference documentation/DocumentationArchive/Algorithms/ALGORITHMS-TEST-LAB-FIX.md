# Algorithms Test Lab - Fix for Non-Selectable Algorithms

**Issue**: Only Noise, Sampling, and Patterns algorithms were selectable. All other sections (Edges, Segmentation, Curves, Distance, etc.) had non-clickable headers.

## Root Cause

The `setupAlgorithmSelection()` function is called once on initialization and makes all block headers clickable by:
1. Finding the algorithm ID for each header via `findAlgorithmIdByTitle()`
2. Setting `header.dataset.algorithmId`
3. Adding click handlers

However, `findAlgorithmIdByTitle()` was only searching **the current page** (`state.selectedPageId`), not all pages.

Since the ToolBase sidebar includes ALL algorithms from ALL pages (flattened structure), algorithms from non-current pages wouldn't get their IDs assigned, making them unclickable.

## Fix Applied

**File**: `assets/js/tools/algorithms-test-lab.js`  
**Function**: `AlgorithmsTestLab.prototype.findAlgorithmIdByTitle`  
**Line**: ~3267

### Before:
```javascript
AlgorithmsTestLab.prototype.findAlgorithmIdByTitle = function(title) {
    const page = PAGES.find(p => p.id === state.selectedPageId); // ❌ Only current page
    if (!page) return null;
    
    // Search through all domains in the page
    for (const domain of page.domains) {
        const algo = domain.algorithms.find(a => a.title === title);
        if (algo) {
            return `${page.id}.${domain.id}.${algo.id}`;
        }
    }
    
    return null;
};
```

### After:
```javascript
AlgorithmsTestLab.prototype.findAlgorithmIdByTitle = function(title) {
    // Search through ALL pages, not just current page ✅
    for (const page of PAGES) {
        for (const domain of page.domains) {
            const algo = domain.algorithms.find(a => a.title === title);
            if (algo) {
                return `${page.id}.${domain.id}.${algo.id}`;
            }
        }
    }
    
    return null;
};
```

## Result

All algorithms across all 6 pages should now be selectable:

**Page 1: Noise, Sampling, Patterns** ✅
- Noise Functions (5 algorithms)
- Sampling & Distributions (10 algorithms)
- Patterns & Tiles (11 algorithms)

**Page 2: Edges, Filtering, Segmentation** ✅ FIXED
- Edge Detection (6 algorithms)
- Filtering (3 algorithms - some marked `impl: false`)
- Segmentation (3 algorithms)

**Page 3: Curves, Distance, Topology** ✅ FIXED
- Curve Geometry (4 algorithms)
- Distance Fields (5 algorithms)
- Vectorization (4 algorithms)

**Page 4: Space-Filling, TSP, Graphs** ✅ FIXED
- Space-Filling Curves (5 algorithms)
- TSP Path Optimization (4 algorithms)
- Graph Algorithms (3 algorithms)

**Page 5: Optics, Physics, PDE** ✅ FIXED
- Interference & Optics (7 algorithms)
- Physics Simulation (9 algorithms)
- Reaction-Diffusion (3 algorithms)

**Page 6: Color and Perception** ✅ FIXED
- Quantization (6 algorithms)

## Testing

1. Load http://localhost:3000 with hard refresh (Ctrl+Shift+R)
2. Navigate to "Edges, Filtering, Segmentation" page via dropdown
3. Click on different algorithm headers (Sobel, Canny, etc.)
4. Verify headers are clickable and rendering works
5. Test all 6 pages

## Known Limitations

Three algorithms marked `impl: false` (no library implementation yet):
- Gaussian Blur (filtering)
- Bilateral Filter (filtering)
- Median Filter (filtering)

These will show "N/A" when selected (correct behavior).

## Next Steps

If issues persist:
1. Check browser console for errors
2. Verify `window.Algorithms` is fully loaded
3. Check individual render functions for bugs
4. Verify controls are being generated correctly

